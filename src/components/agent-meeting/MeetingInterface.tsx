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

  useEffect(() => {
    if (isJoined && !agentInvited && !agentInviteAttempted.current) {
      console.log("Auto-inviting agent after meeting join");
      agentInviteAttempted.current = true;
      inviteAgent();
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
      console.log("Attempting to remove agent with CORS handling");
      
      const requestBody = {
        meeting_id: meetingId,
      };

      console.log("Leave agent request body:", requestBody);

      // Try with HTTPS first (with CORS handling)
      try {
        const httpsResponse = await fetch(
          "https://aiendpoint.tryvideosdk.live/leave-agent",
          {
            method: "POST",
            mode: "no-cors", // Bypass CORS restrictions
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        // With no-cors mode, we can't read the response, but if no error is thrown,
        // the request was sent successfully
        console.log("HTTPS leave-agent request sent successfully (no-cors mode)");
        
        // Wait a moment and then end the meeting regardless
        setTimeout(() => {
          console.log("Ending meeting after agent leave attempt");
          end(); // Call the end method from useMeeting hook
          toast({
            title: "Agent Removed",
            description: "AI Agent removal requested, ending meeting",
          });
        }, 1000);

        return; // Exit if HTTPS request was sent successfully

      } catch (httpsError) {
        console.log("HTTPS leave-agent request failed, trying HTTP fallback:", httpsError);
        
        // Fallback to HTTP with normal CORS handling
        const httpResponse = await fetch(
          "http://aiendpoint.tryvideosdk.live/leave-agent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        console.log("HTTP leave-agent response status:", httpResponse.status);
        console.log("HTTP leave-agent response ok:", httpResponse.ok);

        if (httpResponse.ok) {
          const responseData = await httpResponse.json();
          console.log("Agent leave successful via HTTP:", responseData);
          
          if (responseData.status === "removed") {
            console.log("Agent successfully removed, ending meeting");
            end(); // Call the end method from useMeeting hook
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
          }
        } else {
          const errorText = await httpResponse.text();
          console.error("HTTP leave-agent failed:", httpResponse.status, errorText);
          
          // Even if the API call fails, end the meeting locally
          console.log("API failed, but ending meeting locally");
          end();
          toast({
            title: "Warning",
            description: "Could not confirm agent removal, but ending meeting",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      console.error("Error calling leave-agent API:", error);
      
      // Even if there's an error, end the meeting locally
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
      
      // Get the system prompt for the selected personality
      const systemPrompt = PROMPTS[agentSettings.personality as keyof typeof PROMPTS];
      
      // Create request body using the new agentSettings structure
      const requestBody = {
        meeting_id: meetingId,
        token: VIDEOSDK_TOKEN,
        pipeline_type: agentSettings.pipelineType,
        stt: agentSettings.stt,
        tts: agentSettings.tts,
        llm: agentSettings.llm,
        personality: agentSettings.personality,
        system_prompt: systemPrompt,
        detection: agentSettings.detection
      };

      console.log("Attempting to invite agent with updated request body");
      console.log("Request body:", requestBody);

      // Try with HTTPS first using no-cors mode to bypass CORS restrictions
      try {
        console.log("Sending HTTPS request with no-cors mode...");
        
        await fetch("https://aiendpoint.tryvideosdk.live/join-agent", {
          method: "POST",
          mode: "no-cors", // Bypass CORS restrictions
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // With no-cors mode, we can't read the response, but if no error is thrown,
        // the request was sent successfully
        console.log("HTTPS request sent successfully (no-cors mode)");
        
        // Mark as invited and show success message
        setAgentInvited(true);
        toast({
          title: "Agent Invitation Sent",
          description: "AI Agent should be joining shortly... (Request sent via HTTPS)",
        });

        return; // Exit if HTTPS request was sent successfully

      } catch (httpsError) {
        console.log("HTTPS request failed, trying HTTP fallback:", httpsError);
        
        // Fallback to HTTP with normal CORS handling
        try {
          console.log("Sending HTTP request...");
          
          const httpResponse = await fetch("http://aiendpoint.tryvideosdk.live/join-agent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          console.log("HTTP response status:", httpResponse.status);
          console.log("HTTP response ok:", httpResponse.ok);

          if (httpResponse.ok) {
            const responseData = await httpResponse.json();
            console.log("Agent invite successful via HTTP:", responseData);
            setAgentInvited(true);
            toast({
              title: "Agent Invited",
              description: "AI Agent is joining the conversation... (Connected via HTTP)",
            });
          } else {
            const errorText = await httpResponse.text();
            console.error("HTTP agent invite failed:", httpResponse.status, errorText);
            throw new Error(`HTTP request failed: ${httpResponse.status} - ${errorText}`);
          }

        } catch (httpError) {
          console.error("HTTP fallback also failed:", httpError);
          throw new Error("Both HTTPS and HTTP requests failed");
        }
      }

    } catch (error) {
      console.error("Error inviting agent:", error);
      agentInviteAttempted.current = false;
      
      // Provide detailed error information
      let errorMessage = "Failed to invite AI Agent. This is likely due to CORS restrictions.";
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error: Unable to reach the AI service. This could be due to CORS policy or server availability.";
        } else if (error.message.includes("Both HTTPS and HTTP requests failed")) {
          errorMessage = "Connection failed: Both secure and fallback connections were blocked. This is likely a CORS policy issue.";
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
