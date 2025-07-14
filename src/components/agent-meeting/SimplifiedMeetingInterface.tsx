import React, { useState, useEffect, useCallback, useRef } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ThreeJSAvatar } from "./ThreeJSAvatar";
import { TranscriptionChat } from "./TranscriptionChat";
import { AgentSettings, REALTIME_MODEL_OPTIONS, PROMPTS } from "./types";
import { PipelineSection } from "./PipelineSection";
import { Wifi, WifiOff } from "lucide-react";
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
      
      // Stop all media streams by getting fresh media access and stopping them
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => {
          console.log("Stopping track:", track.kind);
          track.stop();
        });
      } catch (err) {
        console.log("No media streams to stop or access denied");
      }
      
      // Remove agent if present
      const agentParticipant = Object.values(participants).find(
        (p: any) => p.displayName?.includes("Agent") || p.displayName?.includes("Bot")
      );
      
      console.log("Agent participant found:", !!agentParticipant);
      
      if (agentParticipant) {
        console.log("Calling leaveAgent...");
        await leaveAgent();
        console.log("Agent removal completed");
      }
      
      console.log("Leaving meeting...");
      await leave();
      console.log("Meeting left successfully");
      
      onDisconnect();
    } catch (error) {
      console.error("Error during disconnect:", error);
      console.log("Disconnect error, calling onDisconnect anyway");
      onDisconnect();
    }
  };

  const leaveAgent = async () => {
    try {
      console.log("Making API call to stop agent...");
      const response = await fetch("https://api.videosdk.live/api/stop-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: meetingId,
        }),
      });

      console.log("Agent stop API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Agent removed successfully:", data);
      } else {
        const errorText = await response.text();
        console.error("Failed to remove agent:", errorText);
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

  // Get agent audio stats for latency monitoring
  const { getAudioStats } = useParticipant(agentParticipant?.id || "");
  const [agentStats, setAgentStats] = useState<any>({});

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

  const systemPrompt = agentSettings.personality === "Custom" 
    ? agentSettings.customPrompt || ""
    : PROMPTS[agentSettings.personality as keyof typeof PROMPTS] || "";

  return (
    <div className="min-h-screen bg-[#121619] text-white flex">
      {/* Left Sidebar - Agent Configuration */}
      <div className="w-80 bg-[#1A1F23] border-r border-[#393939] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#393939]">
          <h1 className="text-lg font-semibold text-white">Agent Configuration</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Use cases */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Use cases</h3>
            <p className="text-xs text-gray-500">Define how your agent communicate and behaves</p>
            
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
            <h3 className="text-sm font-medium text-gray-300">AI Agent Pipelines</h3>
            
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
              <h3 className="text-sm font-medium text-gray-300">Speech to text</h3>
              <Select value="Microsoft" disabled>
                <SelectTrigger className="bg-[#25252540] border-[#393939] text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
              </Select>

              <h3 className="text-sm font-medium text-gray-300">Text to speech</h3>
              <Select value="OpenAI" disabled>
                <SelectTrigger className="bg-[#25252540] border-[#393939] text-white h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
              </Select>

              <h3 className="text-sm font-medium text-gray-300">LLM provider</h3>
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
                <h3 className="text-sm font-medium text-gray-300">Voice activity detection (VAD)</h3>
                <p className="text-xs text-gray-500">Using SileroVAD for accurate voice activity detection</p>
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
                <h3 className="text-sm font-medium text-gray-300">Turn Detection</h3>
                <p className="text-xs text-gray-500">Using custom VideoSDK model for intelligent conversation turn management</p>
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
            <ThreeJSAvatar
              participantId={agentParticipant?.id}
              isConnected={!!agentParticipant}
              size="xl"
              className="drop-shadow-2xl"
            />
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
                {agentStats.jitter ? `${agentStats.jitter.toFixed(1)}` : "5.0"} ms
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
    </div>
  );
};