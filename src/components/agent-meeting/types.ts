
export interface AgentSettings {
  model: string;
  voice: string;
  personality: string;
  temperature: number;
  topP: number;
  topK: number;
}

export const VIDEOSDK_TOKEN = "your-actual-token-here";

export const AVAILABLE_MODELS = ["Haley", "Samuel", "Felicia", "Jules", "Doug"];
