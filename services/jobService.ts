import { GenerationJob } from "../types";

export const createJob = async (
  jobData: Partial<GenerationJob>,
): Promise<string | null> => {
  return `local_job_${Date.now()}`;
};

export const updateJobStatus = async (
  jobId: string,
  status: "pending" | "processing" | "completed" | "failed",
  resultUrl?: string,
  errorMessage?: string,
) => {
  // Dummy
};

export const updateJobApiKey = async (jobId: string, apiKey: string) => {
  // Dummy
};

export const getQueuePosition = async (jobId: string): Promise<number> => {
  return 0;
};
