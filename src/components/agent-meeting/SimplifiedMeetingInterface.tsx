import React, { useState, useEffect, useCallback, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ThreeJSAvatar } from "./ThreeJSAvatar";
import { AgentSettings } from "./types";
import MicIcon from "../icons/MicIcon";
import MicWithSlash from "../icons/MicWithSlash";

interface SimplifiedMeetingInterfaceProps {
  meetingId: string;
  onDisconnect: () => void;
  agentSettings: AgentSettings;
}

export const SimplifiedMeetingInterface: React.FC<SimplifiedMeetingInterfaceProps> = ({
  meetingId,
  onDisconnect,
  agentSettings,
}) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [agentInvited, setAgentInvited] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { join, leave, end, toggleMic, participants, localParticipant } = useMeeting({
    onMeetingJoined: () => {
      console.log("Meeting joined successfully");
      setIsJoined(true);
      setConnectionError(null);
      setRetryAttempts(0);
    },
    onMeetingLeft: () => {
      console.log("Meeting left");
      setIsJoined(false);
      onDisconnect();
    },
    onParticipantJoined: (participant: any) => {
      console.log("Participant joined:", participant.id);
    },
    onParticipantLeft: (participant: any) => {
      console.log("Participant left:", participant.id);
    },
    onSpeakerChanged: (activeSpeakerId: string) => {
      console.log("Active speaker changed:", activeSpeakerId);
    },
    onError: (error: any) => {
      console.error("Meeting error:", error);
      setConnectionError(error.message || "Connection failed");
      
      if (retryAttempts < 3) {
        handleRetryConnection();
      }
    },
  });

  const handleRetryConnection = useCallback(() => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);
    
    retryTimeoutRef.current = setTimeout(() => {
      console.log(`Retrying connection (attempt ${retryAttempts + 1})`);
      join();
      setIsRetrying(false);
    }, 2000);
  }, [join, retryAttempts, isRetrying]);

  useEffect(() => {
    join();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [join]);

  // Auto-invite agent after joining
  useEffect(() => {
    if (isJoined && !agentInvited) {
      inviteAgent();
    }
  }, [isJoined, agentInvited]);

  const inviteAgent = async () => {
    if (agentInvited) return;

    setAgentInvited(true);
    console.log("Inviting agent to meeting...");

    try {
      const response = await fetch("https://api.videosdk.live/api/start-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: meetingId,
          agentSettings,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Agent invited successfully:", data);
        toast({
          title: "Agent Connected",
          description: "Your AI agent has joined the conversation",
        });
      } else {
        const errorData = await response.text();
        console.error("Failed to invite agent:", errorData);
        toast({
          title: "Agent Connection Failed",
          description: "Failed to connect the AI agent. Please try again.",
          variant: "destructive",
        });
        setAgentInvited(false);
      }
    } catch (error) {
      console.error("Error inviting agent:", error);
      toast({
        title: "Agent Connection Error",
        description: "Error connecting the AI agent. Please check your connection.",
        variant: "destructive",
      });
      setAgentInvited(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log("Disconnecting from meeting...");
      
      // Remove agent if present
      const agentParticipant = Object.values(participants).find(
        (p: any) => p.displayName?.includes("Agent") || p.displayName?.includes("Bot")
      );
      
      if (agentParticipant) {
        await leaveAgent();
      }
      
      await end();
    } catch (error) {
      console.error("Error during disconnect:", error);
      onDisconnect();
    }
  };

  const leaveAgent = async () => {
    try {
      const response = await fetch("https://api.videosdk.live/api/stop-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: meetingId,
        }),
      });

      if (response.ok) {
        console.log("Agent removed successfully");
      } else {
        console.error("Failed to remove agent");
      }
    } catch (error) {
      console.error("Error removing agent:", error);
    }
  };

  const handleToggleMic = () => {
    toggleMic();
    setMicEnabled(!micEnabled);
  };

  const handleManualRetry = () => {
    if (!isRetrying) {
      handleRetryConnection();
    }
  };

  // Find agent participant
  const agentParticipant = Object.values(participants).find(
    (p: any) => p.displayName?.includes("Agent") || p.displayName?.includes("Bot")
  ) as any;

  if (connectionError && retryAttempts >= 3) {
    return (
      <div className="min-h-screen bg-[#121619] text-white flex items-center justify-center">
        <Card className="bg-[#1A1F23] border-[#393939] p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">Connection Failed</h2>
          <p className="text-gray-300 mb-6">{connectionError}</p>
          <div className="space-y-3">
            <Button
              onClick={handleManualRetry}
              disabled={isRetrying}
              className="w-full bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white"
            >
              {isRetrying ? "Retrying..." : "Try Again"}
            </Button>
            <Button
              onClick={onDisconnect}
              variant="outline"
              className="w-full border-[#393939] text-gray-300 hover:bg-[#25252540]"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121619] text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#393939] bg-[#1A1F23] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Voice Agent Session</h1>
          <p className="text-sm text-gray-400">Connected with {agentSettings.personality} agent</p>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500/10"
        >
          End Session
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          {/* Avatar */}
          <div className="flex justify-center">
            <ThreeJSAvatar
              participantId={agentParticipant?.id}
              isConnected={!!agentParticipant}
              size="xl"
              className="drop-shadow-2xl"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {agentParticipant ? "Agent is ready to talk" : "Connecting agent..."}
            </h2>
            <p className="text-gray-400">
              {agentParticipant 
                ? "Start speaking to begin your conversation" 
                : "Please wait while we connect your AI agent"
              }
            </p>
          </div>

          {/* Microphone Control */}
          <div className="flex justify-center">
            <Button
              onClick={handleToggleMic}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                micEnabled
                  ? "bg-[#38BDF8] hover:bg-[#38BDF8]/80 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {micEnabled ? (
                <MicIcon className="w-6 h-6" />
              ) : (
                <MicWithSlash disabled={true} />
              )}
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            {micEnabled ? "Microphone is on" : "Microphone is off"}
          </p>
        </div>
      </div>
    </div>
  );
};