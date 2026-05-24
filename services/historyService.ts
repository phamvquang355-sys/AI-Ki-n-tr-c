import { HistoryItem, Tool } from "../types";
import localforage from "localforage";

// Initialize localforage
localforage.config({
  name: "OpzenAI",
  storeName: "history_assets",
});

const HISTORY_KEY = "user_history";

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const data = await localforage.getItem<HistoryItem[]>(HISTORY_KEY);
    return data || [];
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

export const addToHistory = async (item: {
  tool: Tool;
  prompt: string;
  sourceImageURL?: string;
  resultImageURL?: string;
  resultVideoURL?: string;
}) => {
  try {
    const mediaType = item.resultVideoURL ? "video" : "image";
    const resultData = item.resultVideoURL || item.resultImageURL;
    if (!resultData) return;

    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      user_id: "local",
      tool: item.tool,
      prompt: item.prompt,
      media_url: resultData,
      source_url: item.sourceImageURL,
      media_type: mediaType,
      created_at: new Date().toISOString(),
      resultImageURL: item.resultImageURL,
      resultVideoURL: item.resultVideoURL,
      sourceImageURL: item.sourceImageURL,
      timestamp: Date.now(),
    };

    const currentHistory = await getHistory();
    currentHistory.unshift(newItem); // Add new item to the beginning

    // Keep only the most recent 50 items to avoid ballooning storage
    if (currentHistory.length > 50) {
      currentHistory.pop();
    }

    await localforage.setItem(HISTORY_KEY, currentHistory);
  } catch (error) {
    console.error("Failed to add item to history:", error);
  }
};

export const clearHistory = async () => {
  try {
    await localforage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};

export const deleteHistoryItem = async (id: string) => {
  try {
    let currentHistory = await getHistory();
    currentHistory = currentHistory.filter((item) => item.id !== id);
    await localforage.setItem(HISTORY_KEY, currentHistory);
  } catch (error) {
    console.error("Error deleting history item:", error);
  }
};
