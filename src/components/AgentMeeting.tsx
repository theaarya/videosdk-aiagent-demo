
import React, { useState } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { toast } from "@/hooks/use-toast";
import { AgentSettings, VIDEOSDK_TOKEN } from "./agent-meeting/types";
import { MeetingInterface } from "./agent-meeting/MeetingInterface";
import { MeetingContainer } from "./agent-meeting/MeetingContainer";

const AgentMeeting: React.FC = () => {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    model: "gemini-2.0-flash-live-001",
    voice: "Puck",
    personality: "Tutor", // Default personality selected
    temperature: 0.8,
    topP: 0.8,
    topK: 0.8,
  });

  const createMeeting = async () => {
    try {
      console.log("Creating meeting with token:", VIDEOSDK_TOKEN);

      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: VIDEOSDK_TOKEN,
          "Content-Type": "application/json",
        },
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Meeting created successfully:", data);
        setMeetingId(data.roomId);
        toast({
          title: "Meeting Created",
          description: `Meeting ID: ${data.roomId}`,
        });
        return data.roomId;
      } else {
        const errorData = await response.text();
        console.error("API Error:", response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleConnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);

    try {
      const roomId = await createMeeting();
      setIsConnected(true);
    } catch (error) {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsConnecting(false);
    setMeetingId(null);
  };

  const handleSettingsChange = (newSettings: AgentSettings) => {
    setAgentSettings(newSettings);
  };

  // Render different components based on connection state
  if (meetingId && isConnected) {
    return (
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: false,
          name: "User",
          debugMode: false,
          multiStream: false,
        }}
        token={VIDEOSDK_TOKEN}
        reinitialiseMeetingOnConfigChange={false}
        joinWithoutUserInteraction={false}
      >
        <MeetingInterface
          meetingId={meetingId}
          onDisconnect={handleDisconnect}
          agentSettings={agentSettings}
          onSettingsChange={handleSettingsChange}
        />
      </MeetingProvider>
    );
  }

  return (
    <MeetingContainer
      onConnect={handleConnect}
      agentSettings={agentSettings}
      isConnecting={isConnecting}
      onSettingsChange={handleSettingsChange}
    />
  );
};

export default AgentMeeting;
