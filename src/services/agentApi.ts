
const API_BASE_URL = "https://ccc3-103-251-212-247.ngrok-free.app";

interface AgentApiRequest {
  meeting_id: string;
  token: string;
}

export const agentApi = {
  async joinOnClickAgent(meetingId: string, token: string): Promise<any> {
    try {
      console.log('Attempting to join agent with:', { meetingId, token });
      
      const response = await fetch(`${API_BASE_URL}/join-oneclick-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          token: token,
        }),
      });

      console.log('Join agent response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Join agent error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Join agent success:', result);
      return result;
    } catch (error) {
      console.error('Error joining agent:', error);
      throw error;
    }
  },

  async leaveOnClickAgent(meetingId: string, token: string): Promise<any> {
    try {
      console.log('Attempting to leave agent with meetingId:', meetingId);
      
      const response = await fetch(`${API_BASE_URL}/leave-oneclick-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
        }),
      });

      console.log('Leave agent response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Leave agent error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Leave agent success:', result);
      return result;
    } catch (error) {
      console.error('Error leaving agent:', error);
      throw error;
    }
  },
};
