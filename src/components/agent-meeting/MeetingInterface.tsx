import React, { useState, useEffect, useRef } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AgentSettings, PROMPTS } from "./types";
import { AgentAudioPlayer } from "./AgentAudioPlayer";
import { VIDEOSDK_TOKEN } from "./types";
import MicWithSlash from "../icons/MicWithSlash";
import { WaveAvatar } from "./WaveAvatar";
import { RoomLayout } from "../layout/RoomLayout";
import { joinAgent, leaveAgent as leaveAgentAPI } from "./JoinAgentRequest";

interface MeetingInterfaceProps {
  meetingId: string;
  onDisconnect: () => void;
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const MeetingInterface: React.FC<MeetingInterfaceProps> = ({
  meetingId,
  onDisconnect,
  agentSettings,
  onSettingsChange,
}) => {
  const [agentInvited, setAgentInvited] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const joinAttempted = useRef(false);
  const agentInviteAttempted = useRef(false);
  const maxRetries = 3;
  const retryDelay = 5000;

  const { join, leave, end, toggleMic, participants, localParticipant } = useMeeting(
    {
      onMeetingJoined: () => {
        console.log("Meeting joined successfully");
        setIsJoined(true);
        setConnectionError(null);
        setRetryAttempts(0);
        setIsRetrying(false);
        joinAttempted.current = true;
        
        toast({
          title: "Meeting Started",
          description: "You have joined the conversation",
        });
      },
      onMeetingLeft: () => {
        console.log("Meeting left");
        setIsJoined(false);
        setRetryAttempts(0);
        setIsRetrying(false);
        joinAttempted.current = false;
        agentInviteAttempted.current = false;
        onDisconnect();
      },
      onParticipantJoined: (participant) => {
        console.log("Participant joined:", participant.displayName);
        if (
          participant.displayName?.includes("Agent") ||
          participant.displayName?.includes("Haley")
        ) {
          toast({
            title: "AI Agent Joined",
            description: `${participant.displayName} has joined the conversation`,
          });
        }
      },
      onParticipantLeft: (participant) => {
        console.log("Participant left:", participant.displayName);
      },
      onSpeakerChanged: (activeSpeakerId) => {
        console.log("Speaker changed:", activeSpeakerId);
      },
      onError: (error) => {
        console.error("Meeting error:", error);

        if (error.message?.includes("Insufficient resources")) {
          setConnectionError(
            "Server is currently overloaded. Please try again in a few minutes."
          );

          if (retryAttempts < maxRetries && !isRetrying) {
            setIsRetrying(true);
            setTimeout(() => {
              handleRetryConnection();
            }, retryDelay);
          } else {
            toast({
              title: "Connection Failed",
              description:
                "Server is overloaded. Please try creating a new meeting.",
              variant: "destructive",
            });
          }
        } else {
          setConnectionError(error.message || "Connection failed");
          toast({
            title: "Connection Error",
            description: "Failed to connect to the meeting. Please try again.",
            variant: "destructive",
          });
        }
      },
    }
  );

  // Simplified agent invitation - no need to coordinate with transcription
  useEffect(() => {
    if (isJoined && !agentInvited && !agentInviteAttempted.current) {
      console.log("Auto-inviting agent after meeting join");
      agentInviteAttempted.current = true;
      
      // Small delay to ensure meeting is stable, but no need to wait for transcription
      setTimeout(() => {
        inviteAgent();
      }, 1000);
    }
  }, [isJoined]);

  const handleRetryConnection = () => {
    if (retryAttempts >= maxRetries) {
      setIsRetrying(false);
      setConnectionError(
        "Maximum retry attempts reached. Please try creating a new meeting."
      );
      return;
    }

    console.log(`Retry attempt ${retryAttempts + 1}/${maxRetries}`);
    setRetryAttempts((prev) => prev + 1);

    try {
      setConnectionError(null);
      joinAttempted.current = false;

      setTimeout(() => {
        if (!isJoined && !joinAttempted.current) {
          join();
          joinAttempted.current = true;
        }
        setIsRetrying(false);
      }, 1000);
    } catch (error) {
      console.error("Error during retry:", error);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!joinAttempted.current && !isRetrying) {
      console.log("Attempting to join meeting:", meetingId);

      const timer = setTimeout(() => {
        if (!isJoined && !joinAttempted.current) {
          try {
            join();
            joinAttempted.current = true;
          } catch (error) {
            console.error("Error joining meeting:", error);
            setConnectionError("Failed to join meeting");
          }
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [join, meetingId, isRetrying]);

  const handleToggleMic = () => {
    if (isJoined) {
      toggleMic();
      setMicEnabled(!micEnabled);
    } else {
      toast({
        title: "Not Connected",
        description: "Please connect to the meeting first",
        variant: "destructive",
      });
    }
  };

  const leaveAgent = async () => {
    try {
      console.log("Attempting to remove agent using backend server");
      
      // Use localhost for development, you can make this configurable
      const backendUrl = "http://localhost:8000";
      const responseData = await leaveAgentAPI(meetingId, backendUrl);
      
      console.log("Agent leave response:", responseData);
      
      if (responseData.status === "success") {
        console.log("Agent successfully removed, ending meeting");
        end();
        toast({
          title: "Agent Removed",
          description: "AI Agent has been removed from the meeting",
        });
      } else if (responseData.status === "not_found") {
        console.log("No agent session found, ending meeting anyway");
        end();
        toast({
          title: "No Agent Found",
          description: "No AI agent session was found, ending meeting",
        });
      } else {
        console.log("API response unclear, ending meeting locally");
        end();
        toast({
          title: "Warning",
          description: "Could not confirm agent removal, but ending meeting",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error calling leave-agent API:", error);
      
      console.log("Error occurred, but ending meeting locally");
      end();
      toast({
        title: "Warning",
        description: "Could not remove AI agent, but ending meeting",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      if (agentInvited) {
        await leaveAgent();
      } else {
        // If no agent is invited, just leave the meeting normally
        leave();
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
      leave();
    }
  };

  const handleManualRetry = () => {
    if (isRetrying) return;

    setRetryAttempts(0);
    setConnectionError(null);
    joinAttempted.current = false;
    handleRetryConnection();
  };

  const inviteAgent = async () => {
    try {
      console.log("Sending agent settings:", agentSettings);
      
      const backendUrl = "http://localhost:8000";
      const responseData = await joinAgent(meetingId, agentSettings, backendUrl);
      
      console.log("Agent invite successful:", responseData);
      setAgentInvited(true);
      toast({
        title: "Agent Invited",
        description: "AI Agent is joining the conversation...",
      });

    } catch (error) {
      console.error("Error inviting agent:", error);
      agentInviteAttempted.current = false;
      
      let errorMessage = "Failed to invite AI Agent.";
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error: Unable to reach the AI service.";
        } else {
          errorMessage = `AI Agent error: ${error.message}`;
        }
      }
      
      toast({
        title: "Agent Invitation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const participantsList = Array.from(participants.values());
  const agentParticipant = participantsList.find(
    (p) => p.displayName?.includes("Agent") || p.displayName?.includes("Haley")
  );

  return (
    <RoomLayout
      agentSettings={agentSettings}
      onSettingsChange={onSettingsChange}
      participants={participants}
      localParticipantId={localParticipant?.id}
      isConnected={isJoined}
    >
      <div className="flex flex-col items-center justify-between h-[50%]">
        {/* Agent Avatar with Wave Animation */}
        <WaveAvatar 
          participantId={agentParticipant?.id}
          isConnected={isJoined}
          className="mb-8"
        />

        {/* Control Panel */}
        <div className="flex items-center space-x-6">
          {/* Microphone Control */}
          <Button
            onClick={handleToggleMic}
            size="lg"
            className="w-12 h-8  bg-[#1F1F1F] hover:bg-[#1F1F1F]"
            disabled={!isJoined}
          >
            <MicWithSlash disabled={!micEnabled} />
          </Button>

          {/* Disconnect Button */}
          <Button
            onClick={handleDisconnect}
            variant="destructive"
            className="px-6 py-3 bg-[#380b0b] hover:bg-[#380b0b] text-[#a13f3f]"
          >
            Disconnect
          </Button>

          {/* Retry Button */}
          {connectionError && !isRetrying && retryAttempts < maxRetries && (
            <Button
              onClick={handleManualRetry}
              variant="outline"
              className="px-6 py-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Agent Audio Player */}
      {agentParticipant && (
        <div className="mt-8 w-full max-w-md">
          <AgentAudioPlayer participantId={agentParticipant.id} />
        </div>
      )}
    </RoomLayout>
  );
};
