import React, { useState, useEffect, useRef } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Badge, MicIcon, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AgentSettings, PROMPTS } from "./types";
import { AgentAudioPlayer } from "./AgentAudioPlayer";
import { VIDEOSDK_TOKEN } from "./types";
import MicWithSlash from "../icons/MicWithSlash";
import { WaveAvatar } from "./WaveAvatar";
import { RoomLayout } from "../layout/RoomLayout";
import { joinAgent, leaveAgent as leaveAgentAPI } from "./JoinAgentRequest";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineSection } from "./PipelineSection";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { ThreeJSAvatar } from "./ThreeJSAvatar";
import { TranscriptionChat } from "./TranscriptionChat";

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

  const { join, leave, end, toggleMic, participants, localParticipant } =
    useMeeting({
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
    });

  const [agentStats, setAgentStats] = useState<{
    rtt?: number;
    jitter?: number;
  }>({});

  const getLatencyStatus = () => {
    const rtt = agentStats.rtt || 0;
    if (rtt > 150) return { status: "Poor", color: "text-red-400" };
    if (rtt > 75) return { status: "Fair", color: "text-yellow-400" };
    return { status: "Good", color: "text-green-400" };
  };

  const systemPrompt =
    agentSettings.personality === "Custom"
      ? agentSettings.customPrompt || ""
      : PROMPTS[agentSettings.personality as keyof typeof PROMPTS] || "";

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
      console.log("=== LEAVE AGENT START ===");
      console.log("Meeting ID:", meetingId);
      console.log("Agent invited status:", agentInvited);

      // Use localhost for development, you can make this configurable
      const backendUrl = "https://aiendpoint.tryvideosdk.live";
      console.log(
        "Calling leave-agent API with URL:",
        `${backendUrl}/leave-agent`
      );

      const responseData = await leaveAgentAPI(meetingId, backendUrl);
      console.log("=== LEAVE AGENT API RESPONSE ===", responseData);

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
      console.error("=== LEAVE AGENT ERROR ===", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : String(error)
      );

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

      const backendUrl = "https://aiendpoint.tryvideosdk.live";
      const responseData = await joinAgent(
        meetingId,
        agentSettings,
        backendUrl
      );

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
    <div className="min-h-screen bg-[#121619] text-white flex">
      {/* Left Sidebar - Agent Configuration */}
      <div className="w-80 bg-[#1A1F23] border-r border-[#393939] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#393939]">
          <h1 className="text-lg font-semibold text-white">
            Agent Configuration
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Use cases */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Use cases</h3>
            <p className="text-xs text-gray-500">
              Define how your agent communicate and behaves
            </p>

            <div className="grid grid-cols-2 gap-2">
              {["Custom", "Recruiter", "Doctor", "Tutor"].map((personality) => (
                <Button
                  key={personality}
                  variant="outline"
                  className={`h-9 text-xs border transition-all ${
                    agentSettings.personality === personality
                      ? "border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/10"
                      : "border-[#393939] text-gray-300 bg-transparent hover:border-[#38BDF8]/50"
                  }`}
                  disabled={true} // Read-only during meeting
                >
                  {personality}
                </Button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">System Prompt</h3>
            <Textarea
              value={systemPrompt}
              placeholder="You're a health bot"
              className="min-h-[80px] bg-[#25252540] border-[#393939] text-white placeholder:text-gray-500 resize-none text-xs"
              disabled={true} // Read-only during meeting
            />
          </div>

          {/* AI Agent Pipelines */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              AI Agent Pipelines
            </h3>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className={`h-9 text-xs border transition-all ${
                  agentSettings.pipelineType === "openai"
                    ? "border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/10"
                    : "border-[#393939] text-gray-300 bg-transparent"
                }`}
                disabled={true}
              >
                Real Time
              </Button>
              <Button
                variant="outline"
                className={`h-9 text-xs border transition-all ${
                  agentSettings.pipelineType === "cascading"
                    ? "border-[#38BDF8] text-[#38BDF8] bg-[#38BDF8]/10"
                    : "border-[#393939] text-gray-300 bg-transparent"
                }`}
                disabled={true}
              >
                Cascading
              </Button>
            </div>
          </div>

          {/* Pipeline Options */}
          {agentSettings.pipelineType === "openai" ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">
                Speech to text
              </h3>
              <Select value="Microsoft" disabled>
                <SelectTrigger className="bg-[#25252540] border-[#393939] text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
              </Select>

              <h3 className="text-sm font-medium text-gray-300">
                Text to speech
              </h3>
              <Select value="OpenAI" disabled>
                <SelectTrigger className="bg-[#25252540] border-[#393939] text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
              </Select>

              <h3 className="text-sm font-medium text-gray-300">
                LLM provider
              </h3>
              <Select value="Gemini" disabled>
                <SelectTrigger className="bg-[#25252540] border-[#393939] text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
              </Select>
            </div>
          ) : (
            <div className="space-y-4">
              <PipelineSection
                agentSettings={agentSettings}
                onSettingChange={() => {}} // Read-only
              />
            </div>
          )}

          {/* Voice Activity Detection Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-300">
                  Voice activity detection (VAD)
                </h3>
                <p className="text-xs text-gray-500">
                  Using SileroVAD for accurate voice activity detection
                </p>
              </div>
              <div className="w-10 h-6 bg-[#38BDF8] rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
            </div>
          </div>

          {/* Turn Detection Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-300">
                  Turn Detection
                </h3>
                <p className="text-xs text-gray-500">
                  Using custom VideoSDK model for intelligent conversation turn
                  management
                </p>
              </div>
              <div className="w-10 h-6 bg-[#38BDF8] rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
            </div>
          </div>

          {/* MCP Server */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">MCP Server</h3>
            <Input
              type="url"
              placeholder="https://your-mcp-server.com/mcp"
              value={agentSettings.mcpUrl || ""}
              className="bg-[#25252540] border-[#393939] text-white placeholder:text-gray-500 h-9 text-xs"
              disabled={true} // Read-only during meeting
            />
          </div>
        </div>
      </div>

      {/* Center Section - Avatar */}
      <div className="flex-1 flex flex-col items-center justify-start pt-32 bg-[#121619] relative">
        <div className="flex flex-col items-center gap-8">
          {/* Avatar */}
          <div>
            {agentSettings.agentType === "avatar" ? (
              <div className="w-[200px] h-[200px] rounded-full overflow-hidden relative drop-shadow-2xl">
                <img
                  src="/lovable-uploads/e489886e-34c3-40eb-99bc-32a381273eb5.png"
                  alt="AI Avatar"
                  className="w-full h-full object-cover"
                />
                {/* Voice activity indicator overlay for avatar */}
                {agentParticipant && (
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent transition-all duration-300"
                    style={{
                      borderColor: "rgba(56, 189, 248, 0.5)",
                      boxShadow: "0 0 30px rgba(56, 189, 248, 0.3)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            ) : (
              <ThreeJSAvatar
                participantId={agentParticipant?.id}
                isConnected={!!agentParticipant}
                size="xl"
                className="drop-shadow-2xl"
              />
            )}
          </div>

          {/* Control Icons */}
          <div className="flex gap-6 items-center">
            {/* Mic Button */}
            <Button
              onClick={handleToggleMic}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                micEnabled
                  ? "bg-[#1e3a52] hover:bg-[#1e3a52]/80 text-[#38BDF8] border border-[#38BDF8]/30"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {micEnabled ? (
                <MicIcon className="w-6 h-6" />
              ) : (
                <MicWithSlash disabled={true} />
              )}
            </Button>

            {/* End Call Button */}
            <Button
              onClick={handleDisconnect}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Latency & Transcript */}
      <div className="w-80 bg-[#1A1F23] border-l border-[#393939] flex flex-col">
        {/* Agent Latency Header */}
        <div className="px-6 py-4 border-b border-[#393939] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Agent Latency</h2>
          <div className="flex items-center gap-2">
            {agentParticipant ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <Badge
              // variant="outline"
              className={`text-xs ${getLatencyStatus().color} border-current`}
            >
              {getLatencyStatus().status}
            </Badge>
          </div>
        </div>

        {/* Latency Metrics */}
        <div className="p-6 border-b border-[#393939]">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#25252540] border-[#38BDF8]/30 p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">STT</div>
              <div className="text-lg font-mono text-white">
                {agentStats.rtt ? `${Math.round(agentStats.rtt)}` : "33"} ms
              </div>
            </Card>
            <Card className="bg-[#25252540] border-[#38BDF8]/30 p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">jitter</div>
              <div className="text-lg font-mono text-white">
                {agentStats.jitter ? `${agentStats.jitter.toFixed(1)}` : "5.0"}{" "}
                ms
              </div>
            </Card>
          </div>
        </div>

        {/* Transcript Header */}
        <div className="px-6 py-3 border-b border-[#393939]">
          <h3 className="text-sm font-semibold text-white">Transcript</h3>
        </div>

        {/* Transcript Content */}
        <div className="flex-1 overflow-hidden">
          <TranscriptionChat
            participants={new Map(Object.entries(participants))}
            localParticipantId={localParticipant?.id}
            isConnected={isJoined}
          />
        </div>
      </div>

      {/* Agent Audio Player - Hidden but essential for audio playback */}
      {agentParticipant && (
        <div className="hidden">
          <AgentAudioPlayer participantId={agentParticipant.id} />
        </div>
      )}
    </div>
  );
};
