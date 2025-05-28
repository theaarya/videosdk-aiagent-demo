

export interface AgentSettings {
  model: string;
  voice: string;
  personality: string;
  temperature: number;
  topP: number;
  topK: number;
}

export const VIDEOSDK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2YzkwZDk3OS01NThiLTRiYjctOTUyYi1hZTE0MzZiNzJmYzIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc0ODM1MTk1MCwiZXhwIjoxNzQ4OTU2NzUwfQ.24oJzOKwWqLf2kvgMJw12grsxTgK0bfNUCIfFugqOY0";

export const AVAILABLE_MODELS = ["Haley", "Samuel", "Felicia", "Jules", "Doug"];

