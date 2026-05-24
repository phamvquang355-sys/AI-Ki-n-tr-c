import {
  GoogleGenAI,
  Modality,
  Operation,
  GenerateVideosResponse,
  Type,
  GenerateContentResponse,
} from "@google/genai";
import { AspectRatio, FileData } from "../types";
import { updateJobApiKey } from "./jobService";

// --- HELPER: Safe Environment Variable Access ---
const getEnvironmentApiKey = (): string | undefined => {
  try {
    // @ts-ignore
    if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

// --- HELPER: Parse Error Object Robustly ---
const getErrorDetails = (error: any) => {
  let status = error.status || error.response?.status;
  let message = error.message || "";

  if (error.error) {
    if (error.error.code) status = error.error.code;
    if (error.error.message) message = error.error.message;
  }

  if (error.body) {
    try {
      const body = JSON.parse(error.body);
      if (body.error) {
        status = body.error.code || status;
        message = body.error.message || message;
      }
    } catch (e) {}
  }

  if (typeof message === "string") {
    if (message.startsWith("{") || message.startsWith("[")) {
      try {
        const parsed = JSON.parse(message);
        if (parsed.error) {
          status = parsed.error.code || status;
          message = parsed.error.message || message;
        }
      } catch (e) {}
    }

    if (!status) {
      if (
        message.includes("429") ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("exhausted")
      ) {
        status = 429;
      } else if (
        message.includes("400") ||
        message.toLowerCase().includes("billing")
      ) {
        status = 400;
      } else if (
        message.includes("503") ||
        message.toLowerCase().includes("overloaded")
      ) {
        status = 503;
      }
    }
  }

  return {
    status: Number(status),
    message: String(message),
  };
};

const getAIClient = async (
  jobId?: string,
): Promise<{ ai: GoogleGenAI; key: string }> => {
  const apiKey = getEnvironmentApiKey();
  if (!apiKey) {
    throw new Error("API Key configuration is missing.");
  }

  // Since we are using env var directly, we don't need to log usage via updateJobApiKey for rotation tracking
  // But we can still log it if needed for audit, though jobId might be 'guest_job_id'

  return {
    ai: new GoogleGenAI({ apiKey: apiKey }),
    key: apiKey,
  };
};

async function withSmartRetry<T>(
  operation: (ai: GoogleGenAI, currentKey: string) => Promise<T>,
  jobId?: string,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: any;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const client = await getAIClient(jobId);
      const result = await operation(client.ai, client.key);
      return result;
    } catch (error: any) {
      const { status, message } = getErrorDetails(error);
      lastError = error;

      const isQuota =
        status === 429 ||
        message.includes("quota") ||
        message.includes("exhausted");
      const isOverloaded =
        status === 503 || message.toLowerCase().includes("overloaded");

      if (isQuota) {
        console.warn(`[GeminiService] Rate limit (429). Retrying...`);
        await new Promise((r) => setTimeout(r, 2000 * (attempts + 1)));
        attempts++;
        continue;
      }

      if (isOverloaded || status === 500) {
        attempts++;
        const delay = Math.min(2000 * Math.pow(1.5, attempts), 15000);
        console.warn(
          `[GeminiService] Server Overloaded (${status}). Retrying in ${Math.round(delay)}ms...`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw error;
    }
  }

  if (lastError) {
    const { status, message } = getErrorDetails(lastError);
    if (status === 503 || message.toLowerCase().includes("overloaded")) {
      throw new Error(
        "Hệ thống AI (Google Gemini) đang quá tải. Vui lòng thử lại sau ít phút.",
      );
    }
  }

  throw (
    lastError || new Error("Dịch vụ hiện không khả dụng. Vui lòng thử lại sau.")
  );
}

// --- GENERATION FUNCTIONS ---

// Standard "Nano Banana Flash" (gemini-2.5-flash-image)
export const generateStandardImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  numberOfImages: number = 1,
  sourceImage?: FileData | null,
  jobId?: string,
): Promise<string[]> => {
  console.log("[GeminiService] Generating Standard Image (Nano Banana Flash)");
  return withSmartRetry(async (ai) => {
    const parts: any[] = [];

    // Source Image for Edit/Variation
    if (sourceImage) {
      parts.push({
        inlineData: {
          mimeType: sourceImage.mimeType,
          data: sourceImage.base64,
        },
      });
    }

    parts.push({ text: prompt });

    const promises = Array.from({ length: numberOfImages }).map(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: { aspectRatio: aspectRatio },
        },
      });

      let imageUrl = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }

      if (!imageUrl)
        throw new Error("No image data returned from Standard Model");
      return imageUrl;
    });
    return Promise.all(promises);
  }, jobId);
};

// Fallback using legacy Imagen
const generateImageFallback = async (
  prompt: string,
  numberOfImages: number,
  jobId?: string,
): Promise<string[]> => {
  console.warn(`[GeminiService] Triggering Fallback`);
  return withSmartRetry(async (ai) => {
    const parts = [{ text: prompt }];
    const promises = Array.from({ length: numberOfImages }).map(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] },
      });
      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      throw new Error("No image data in fallback response");
    });
    return Promise.all(promises);
  }, jobId);
};

export const generateImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  numberOfImages: number = 1,
  jobId?: string,
): Promise<string[]> => {
  try {
    return await withSmartRetry(async (ai) => {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: prompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio,
        },
      });
      if (!response.generatedImages) throw new Error("No images generated");
      return response.generatedImages.map(
        (img) => `data:image/jpeg;base64,${img.image?.imageBytes || ""}`,
      );
    }, jobId);
  } catch (error: any) {
    return await generateImageFallback(prompt, numberOfImages, jobId);
  }
};

// --- Nano Banana Pro (Gemini 3.0 Pro) ---
export const generateHighQualityImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  sourceImage?: FileData | null,
  jobId?: string,
  referenceImages?: FileData[],
): Promise<string[]> => {
  console.log(
    "[GeminiService] Generating High Quality Image (Nano Banana Pro / Gemini 3.0)",
  );

  return withSmartRetry(async (ai) => {
    const contents: any = { parts: [] };

    if (sourceImage) {
      contents.parts.push({
        inlineData: {
          mimeType: sourceImage.mimeType,
          data: sourceImage.base64,
        },
      });
    }

    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((img) => {
        contents.parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64,
          },
        });
      });
    }

    if (sourceImage || (referenceImages && referenceImages.length > 0)) {
      contents.parts.push({
        text: `${prompt}. Maintain composition/style from provided images.`,
      });
    } else {
      contents.parts.push({ text: prompt });
    }

    const imageSize = ("Standard" === "Standard" ? "1K" : "Standard") as
      | "1K"
      | "2K"
      | "4K";

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    const images: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(
            `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          );
        }
      }
    }

    if (images.length === 0) {
      throw new Error(
        "Gemini 3.0 Pro không trả về hình ảnh. Có thể do nội dung bị chặn.",
      );
    }

    return images;
  }, jobId);
};

export const generateVideo = async (
  prompt: string,
  startImage?: FileData,
  jobId?: string,
): Promise<string> => {
  return withSmartRetry(async (ai, key) => {
    let finalPrompt = prompt;
    let imagePayload = undefined;

    if (startImage) {
      finalPrompt = `Animate the provided image: "${prompt}"`;
      imagePayload = {
        imageBytes: startImage.base64,
        mimeType: startImage.mimeType,
      };
    }

    // @ts-ignore
    let operation: Operation<GenerateVideosResponse> =
      await ai.models.generateVideos({
        model: "veo-2.0-generate-001",
        prompt: finalPrompt,
        image: imagePayload as any,
        config: { numberOfVideos: 1 },
      });

    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed: No URI returned.");

    const videoResponse = await fetch(`${videoUri}&key=${key}`);
    if (!videoResponse.ok) throw new Error("Failed to download video.");

    const blob = await videoResponse.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }, jobId);
};

// --- EDIT / TEXT FUNCTIONS ---

const generateGeminiEdit = async (
  parts: any[],
  numberOfImages: number,
  jobId?: string,
): Promise<{ imageUrl: string; text: string }[]> => {
  return withSmartRetry(async (ai) => {
    const promises = Array.from({ length: numberOfImages }).map(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] },
      });

      let imageUrl = "";
      const part = response.candidates?.[0]?.content?.parts?.[0];

      if (part?.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }

      if (!imageUrl) throw new Error("No image returned.");
      return { imageUrl, text: "" };
    });
    return Promise.all(promises);
  }, jobId);
};

export const editImage = async (
  prompt: string,
  image: FileData,
  numberOfImages: number = 1,
  jobId?: string,
) => {
  return generateGeminiEdit(
    [
      { inlineData: { data: image.base64, mimeType: image.mimeType } },
      { text: prompt },
    ],
    numberOfImages,
    jobId,
  );
};

export const editImageWithMask = async (
  prompt: string,
  image: FileData,
  mask: FileData,
  numberOfImages: number = 1,
  jobId?: string,
) => {
  return generateGeminiEdit(
    [
      { inlineData: { data: image.base64, mimeType: image.mimeType } },
      { inlineData: { data: mask.base64, mimeType: mask.mimeType } },
      { text: prompt },
    ],
    numberOfImages,
    jobId,
  );
};

export const editImageWithReference = async (
  prompt: string,
  source: FileData,
  ref: FileData,
  numberOfImages: number = 1,
  jobId?: string,
) => {
  return generateGeminiEdit(
    [
      { inlineData: { data: source.base64, mimeType: source.mimeType } },
      { inlineData: { data: ref.base64, mimeType: ref.mimeType } },
      { text: prompt },
    ],
    numberOfImages,
    jobId,
  );
};

export const editImageWithMaskAndReference = async (
  prompt: string,
  source: FileData,
  mask: FileData,
  ref: FileData,
  numberOfImages: number = 1,
  jobId?: string,
) => {
  return generateGeminiEdit(
    [
      { inlineData: { data: source.base64, mimeType: source.mimeType } },
      { inlineData: { data: mask.base64, mimeType: mask.mimeType } },
      { inlineData: { data: ref.base64, mimeType: ref.mimeType } },
      { text: prompt },
    ],
    numberOfImages,
    jobId,
  );
};

export const editImageWithMultipleReferences = async (
  prompt: string,
  source: FileData,
  refs: FileData[],
  numberOfImages: number = 1,
  jobId?: string,
) => {
  const parts: any[] = [
    { inlineData: { data: source.base64, mimeType: source.mimeType } },
  ];
  refs.forEach((r) =>
    parts.push({ inlineData: { data: r.base64, mimeType: r.mimeType } }),
  );
  parts.push({ text: prompt });
  return generateGeminiEdit(parts, numberOfImages, jobId);
};

export const editImageWithMaskAndMultipleReferences = async (
  prompt: string,
  source: FileData,
  mask: FileData,
  refs: FileData[],
  numberOfImages: number = 1,
  jobId?: string,
) => {
  const parts: any[] = [
    { inlineData: { data: source.base64, mimeType: source.mimeType } },
    { inlineData: { data: mask.base64, mimeType: mask.mimeType } },
  ];
  refs.forEach((r) =>
    parts.push({ inlineData: { data: r.base64, mimeType: r.mimeType } }),
  );
  parts.push({ text: prompt });
  return generateGeminiEdit(parts, numberOfImages, jobId);
};

export const generateStagingImage = async (
  prompt: string,
  scene: FileData,
  objects: FileData[],
  numberOfImages: number = 1,
  jobId?: string,
) => {
  const parts: any[] = [
    { inlineData: { data: scene.base64, mimeType: scene.mimeType } },
  ];
  objects.forEach((o) =>
    parts.push({ inlineData: { data: o.base64, mimeType: o.mimeType } }),
  );
  parts.push({ text: prompt });
  return generateGeminiEdit(parts, numberOfImages, jobId);
};

export const generateText = async (prompt: string): Promise<string> => {
  return withSmartRetry(async (ai) => {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
    });
    return res.text || "";
  });
};

export const generatePromptFromImageAndText = async (
  image: FileData,
  prompt: string,
): Promise<string> => {
  return withSmartRetry(async (ai) => {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: image.base64, mimeType: image.mimeType } },
          { text: `Analyze image. ${prompt}` },
        ],
      },
    });
    return res.text || "";
  });
};

export const enhancePrompt = async (
  prompt: string,
  image?: FileData | null,
): Promise<string> => {
  return withSmartRetry(async (ai) => {
    const parts: any[] = [];
    if (image)
      parts.push({
        inlineData: { data: image.base64, mimeType: image.mimeType },
      });
    parts.push({ text: `Enhance this prompt for architecture: ${prompt}` });

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
    });
    return res.text || "";
  });
};

export const generateMoodboardPromptFromScene = async (
  image: FileData,
): Promise<string> => {
  return generatePromptFromImageAndText(
    image,
    "Create a detailed moodboard prompt describing style, colors, and materials.",
  );
};

export const generatePromptSuggestions = async (
  image: FileData,
  subject: string,
  count: number,
  instruction: string,
): Promise<Record<string, string[]>> => {
  return withSmartRetry(async (ai) => {
    const prompt = `Analyze this image. Provide ${count} prompts based on "${subject}". ${instruction}. Output strictly JSON.`;
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: image.base64, mimeType: image.mimeType } },
          { text: prompt },
        ],
      },
      config: { responseMimeType: "application/json" },
    });
    try {
      return JSON.parse(res.text || "{}");
    } catch {
      return {};
    }
  });
};
