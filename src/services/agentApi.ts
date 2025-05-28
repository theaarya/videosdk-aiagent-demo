
const API_BASE_URL = "https://ccc3-103-251-212-247.ngrok-free.app";

interface AgentApiRequest {
  meeting_id: string;
  token: string;
}

export const agentApi = {
  async joinOnClickAgent(meetingId: string, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/join-oneclick-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          token: token,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining agent:', error);
      throw error;
    }
  },

  async leaveOnClickAgent(meetingId: string, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/leave-oneclick-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error leaving agent:', error);
      throw error;
    }
  },
};
