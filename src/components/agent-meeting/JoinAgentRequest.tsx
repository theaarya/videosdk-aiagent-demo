
import { AgentSettings, PROMPTS } from "./types";

export const joinAgent = async (meetingId: string, agentSettings: AgentSettings) => {
  try {
    // Determine the system prompt based on personality
    let systemPrompt = "";
    if (agentSettings.personality === "Custom" && agentSettings.customPrompt) {
      systemPrompt = agentSettings.customPrompt;
    } else {
      systemPrompt = PROMPTS[agentSettings.personality as keyof typeof PROMPTS] || "";
    }

    // Create base request body
    const requestBody: any = {
      meeting_id: meetingId,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI1MGVmOGQ1MC1kOWMwLTQ1ZDYtYWJjMS0xOTIzYjZjOTYzNTIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc1MDMzMTY2NSwiZXhwIjoxNzUwOTM2NDY1fQ.3Uy8ok0-9Nc3AuftDB_9iWKQCkVbEdK1h5Sta_yn1p0",
      pipeline_type: agentSettings.pipelineType,
      personality: agentSettings.personality,
      system_prompt: systemPrompt,
      detection: agentSettings.detection,
      ...(agentSettings.mcpUrl && { mcp_url: agentSettings.mcpUrl })
    };

    // Only include stt, tts, and llm parameters if pipeline_type is "cascading"
    if (agentSettings.pipelineType === "cascading") {
      requestBody.stt = agentSettings.stt;
      requestBody.tts = agentSettings.tts;
      requestBody.llm = agentSettings.llm;
    }

    console.log("Joining agent with request:", requestBody);

    const response = await fetch("https://aiendpoint.tryvideosdk.live/join-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Agent joined successfully:", data);
      return data;
    } else {
      const errorData = await response.text();
      console.error("Error joining agent:", response.status, errorData);
      throw new Error(`Failed to join agent: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error("Error in joinAgent:", error);
    throw error;
  }
};
