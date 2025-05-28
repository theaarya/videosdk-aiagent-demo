export interface AgentSettings {
  model: string;
  voice: string;
  personality: string;
  temperature: number;
  topP: number;
  topK: number;
}

export const VIDEOSDK_TOKEN = import.meta.env.VITE_VIDEOSDK_TOKEN;

export const AVAILABLE_MODELS = ["Haley", "Samuel", "Felicia", "Jules", "Doug"];
