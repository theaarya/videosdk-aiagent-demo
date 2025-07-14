
import { AgentSettings, PROMPTS, VIDEOSDK_TOKEN } from "./types";

export const joinAgent = async (meetingId: string, agentSettings: AgentSettings, backendUrl: string = "http://localhost:8000") => {
  try {
    // Determine the system prompt based on personality
    let systemPrompt = "";
    if (agentSettings.personality === "Custom" && agentSettings.customPrompt) {
      systemPrompt = agentSettings.customPrompt;
    } else {
      systemPrompt = PROMPTS[agentSettings.personality as keyof typeof PROMPTS] || "";
    }

    // Create base request body matching backend MeetingReqConfig
    // Map frontend pipeline types to server expected types
    const serverPipelineType = agentSettings.pipelineType === "openai" ? "realtime" : agentSettings.pipelineType;
    
    const requestBody: any = {
      meeting_id: meetingId,
      token: VIDEOSDK_TOKEN,
      pipeline_type: serverPipelineType,
      personality: agentSettings.personality,
      system_prompt: systemPrompt,
      detection: agentSettings.detection || true,
      avatar: agentSettings.agentType === 'avatar', // Convert agentType to avatar boolean
      ...(agentSettings.mcpUrl && { mcp_url: agentSettings.mcpUrl })
    };

    // Add model for real-time pipeline (openai -> realtime)
    if (agentSettings.pipelineType === "openai" && agentSettings.realtimeModel) {
      requestBody.model = agentSettings.realtimeModel;
    }

    // Only include stt, tts, and llm parameters if pipeline_type is "cascading"
    if (agentSettings.pipelineType === "cascading") {
      requestBody.stt = agentSettings.stt;
      requestBody.tts = agentSettings.tts;
      requestBody.llm = agentSettings.llm;
    }

    console.log("Joining agent with request:", requestBody);

    const response = await fetch(`${backendUrl}/join-agent`, {
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

export const leaveAgent = async (meetingId: string, backendUrl: string = "http://localhost:8000") => {
  try {
    const requestBody = {
      meeting_id: meetingId
    };

    console.log("Leaving agent with request:", requestBody);

    const response = await fetch(`${backendUrl}/leave-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Agent left successfully:", data);
      return data;
    } else {
      const errorData = await response.text();
      console.error("Error leaving agent:", response.status, errorData);
      throw new Error(`Failed to leave agent: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error("Error in leaveAgent:", error);
    throw error;
  }
};
