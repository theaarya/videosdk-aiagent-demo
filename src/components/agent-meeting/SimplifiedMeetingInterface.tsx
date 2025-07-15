import React, { useState, useEffect, useCallback, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ThreeJSAvatar } from "./ThreeJSAvatar";
import { TranscriptionChat } from "./TranscriptionChat";
import { AgentAudioPlayer } from "./AgentAudioPlayer";
import { AgentSettings, REALTIME_MODEL_OPTIONS, PROMPTS } from "./types";
import { PipelineSection } from "./PipelineSection";
import { joinAgent, leaveAgent } from "./JoinAgentRequest";
import { Wifi, WifiOff } from "lucide-react";
import MicIcon from "../icons/MicIcon";
import MicWithSlash from "../icons/MicWithSlash";

interface SimplifiedMeetingInterfaceProps {
  meetingId: string;
  onDisconnect: () => void;
  agentSettings: AgentSettings;
}

export const SimplifiedMeetingInterface: React.FC<
  SimplifiedMeetingInterfaceProps
> = ({ meetingId, onDisconnect, agentSettings }) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [agentInvited, setAgentInvited] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const joinAttempted = useRef(false);
  const agentInviteAttempted = useRef(false);

  const { join, leave, end, toggleMic, participants, localParticipant } =
    useMeeting({
      onMeetingJoined: () => {
        console.log("=== MEETING JOINED ===");
        setIsJoined(true);
        setConnectionError(null);
        setRetryAttempts(0);
        joinAttempted.current = true;

        toast({
          title: "Meeting Connected",
          description: "Successfully joined the conversation",
        });
      },
      onMeetingLeft: () => {
        console.log("=== MEETING LEFT ===");
        setIsJoined(false);
        setAgentInvited(false);
        joinAttempted.current = false;
        agentInviteAttempted.current = false;
        onDisconnect();
      },
      onParticipantJoined: (participant: {
        displayName?: string;
        id: string;
      }) => {
        console.log(
          "=== PARTICIPANT JOINED ===",
          participant.displayName || participant.id
        );
        if (
          participant.displayName?.includes("Agent") ||
          participant.displayName?.includes("Haley")
        ) {
          toast({
            title: "AI Agent Connected",
            description: `${participant.displayName} is ready to speak`,
          });
        }
      },
      onParticipantLeft: (participant: {
        displayName?: string;
        id: string;
      }) => {
        console.log(
          "=== PARTICIPANT LEFT ===",
          participant.displayName || participant.id
        );
      },
      onError: (error: { message?: string }) => {
        console.error("=== MEETING ERROR ===", error);
        setConnectionError(error.message || "Connection failed");

        // Handle specific quota errors
        if (
          error.message?.includes("quota") ||
          error.message?.includes("QUOTA")
        ) {
          toast({
            title: "API Quota Exceeded",
            description:
              "Google Gemini API quota exceeded. Check your billing settings.",
            variant: "destructive",
          });
          return;
        }

        // Only retry on connection errors, not API errors
        if (retryAttempts < 2 && !error.message?.includes("quota")) {
          console.log(`Retrying connection (${retryAttempts + 1}/2)`);
          setRetryAttempts((prev) => prev + 1);
          setTimeout(() => {
            if (!isJoined) {
              join();
            }
          }, 3000);
        }
      },
    });

  // Single join attempt on mount
  useEffect(() => {
    if (!joinAttempted.current) {
      console.log("=== JOINING MEETING ===", meetingId);
      joinAttempted.current = true;
      join();
    }
  }, [join, meetingId]);

  // Auto-invite agent after successful meeting join with proper timing
  useEffect(() => {
    if (isJoined && !agentInvited && !agentInviteAttempted.current) {
      console.log("=== SCHEDULING AGENT INVITATION ===");
      agentInviteAttempted.current = true;

      // Wait 3 seconds for meeting to stabilize before inviting agent
      setTimeout(() => {
        if (isJoined) {
          // Double-check we're still joined
          inviteAgent();
        }
      }, 3000);
    }
  }, [isJoined]);

  const inviteAgent = async () => {
    console.log("=== INVITING AGENT ===");
    console.log("Meeting ID:", meetingId);
    console.log("Agent Settings:", agentSettings);

    try {
      const backendUrl = "https://aiendpoint.tryvideosdk.live";
      const data = await joinAgent(meetingId, agentSettings, backendUrl);
      console.log("=== AGENT INVITATION SUCCESS ===", data);

      setAgentInvited(true);
      toast({
        title: "AI Agent Connecting...",
        description:
          "Agent is joining the conversation and should start speaking soon",
      });
    } catch (error) {
      console.error("=== AGENT INVITATION ERROR ===", error);
      agentInviteAttempted.current = false; // Allow retry

      // Parse error message for better user feedback
      let errorMessage = "Failed to connect AI agent";
      if (error instanceof Error) {
        if (
          error.message.includes("quota") ||
          error.message.includes("QUOTA")
        ) {
          errorMessage =
            "Google Gemini API quota exceeded. Check your billing settings.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Cannot reach the AI service. Is the backend server running?";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please check server logs.";
        } else {
          errorMessage = `AI service error: ${error.message}`;
        }
      }

      toast({
        title: "Agent Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    console.log("=== DISCONNECT INITIATED ===");

    try {
      // Remove agent first if present
      if (agentInvited) {
        console.log("=== REMOVING AGENT ===");
        const backendUrl = "https://aiendpoint.tryvideosdk.live";
        await leaveAgent(meetingId, backendUrl);
        console.log("=== AGENT REMOVED ===");
      }

      // End the meeting (more reliable than leave)
      console.log("=== ENDING MEETING ===");
      end();
    } catch (error) {
      console.error("=== DISCONNECT ERROR ===", error);
      // Force disconnect even on error
      end();
    } finally {
      // Clean up state
      setIsJoined(false);
      setAgentInvited(false);
      joinAttempted.current = false;
      agentInviteAttempted.current = false;
      onDisconnect();
    }
  };

  const handleToggleMic = () => {
    toggleMic();
    setMicEnabled(!micEnabled);
  };

  const handleManualRetry = () => {
    console.log("=== MANUAL RETRY ===");
    setConnectionError(null);
    joinAttempted.current = false;
    // join();
  };

  // Find agent participant
  const agentParticipant = Object.values(participants).find(
    (p: { displayName?: string; id: string }) =>
      p.displayName?.includes("Agent") || p.displayName?.includes("Haley")
  );

  // Get agent audio stats for latency monitoring
  const { getAudioStats } = useParticipant(agentParticipant?.id || "");
  const [agentStats, setAgentStats] = useState<{
    rtt?: number;
    jitter?: number;
  }>({});

  // Monitor agent latency stats
  useEffect(() => {
    if (!agentParticipant?.id || !getAudioStats) return;

    const updateStats = async () => {
      try {
        const statsArray = await getAudioStats();
        if (statsArray && statsArray.length > 0) {
          setAgentStats(statsArray[0]);
        }
      } catch (error) {
        console.error("Error getting agent stats:", error);
      }
    };

    const interval = setInterval(updateStats, 2000);
    updateStats();

    return () => clearInterval(interval);
  }, [agentParticipant?.id, getAudioStats]);

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
              variant="outline"
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
