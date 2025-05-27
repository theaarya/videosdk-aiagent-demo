
import React, { useState, useEffect, useRef } from 'react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { Mic, MicOff, PhoneOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

const VIDEOSDK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDgzNTE3NjEsImFwaWtleSI6IjUwZWY4ZDUwLWQ5YzAtNDVkNi1hYmMxLTE5MjNiNmM5NjM1MiIsInBlcm1pc3Npb25zIjpbImFsbG93X2pvaW4iXX0.T9P2PYjJUXfRFhojGtAMfEKeovOMXRjON0RRjph5KdU";

interface AgentSettings {
  model: string;
  voice: string;
  personality: string;
  temperature: number;
  topP: number;
  topK: number;
}

const MeetingContainer: React.FC<{ meetingId: string; onLeave: () => void; agentSettings: AgentSettings }> = ({ 
  meetingId, 
  onLeave, 
  agentSettings 
}) => {
  const [agentInvited, setAgentInvited] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const joinAttempted = useRef(false);
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds between retries

  const {
    join,
    leave,
    toggleMic,
    participants,
    localParticipant
  } = useMeeting({
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
      onLeave();
    },
    onParticipantJoined: (participant) => {
      console.log("Participant joined:", participant.displayName);
      if (participant.displayName?.includes("Agent") || participant.displayName?.includes("Haley")) {
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
      
      // Handle specific error types
      if (error.message?.includes("Insufficient resources")) {
        setConnectionError("Server is currently overloaded. Please try again in a few minutes.");
        
        // Stop any further connection attempts for insufficient resources
        if (retryAttempts < maxRetries && !isRetrying) {
          setIsRetrying(true);
          setTimeout(() => {
            handleRetryConnection();
          }, retryDelay);
        } else {
          toast({
            title: "Connection Failed",
            description: "Server is overloaded. Please try creating a new meeting.",
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
    }
  });

  const handleRetryConnection = () => {
    if (retryAttempts >= maxRetries) {
      setIsRetrying(false);
      setConnectionError("Maximum retry attempts reached. Please create a new meeting.");
      return;
    }

    console.log(`Retry attempt ${retryAttempts + 1}/${maxRetries}`);
    setRetryAttempts(prev => prev + 1);
    
    try {
      // Reset states before retry
      setConnectionError(null);
      joinAttempted.current = false;
      
      // Attempt to join again
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
    if (!joinAttempted.current && meetingId && !isRetrying) {
      console.log("Attempting to join meeting:", meetingId);
      
      // Add a delay to prevent immediate connection
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
      }, 2000); // Increased delay to 2 seconds

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
        description: "Please wait for the meeting to connect first",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    try {
      // Reset all states before leaving
      setRetryAttempts(0);
      setIsRetrying(false);
      setConnectionError(null);
      joinAttempted.current = false;
      
      leave();
    } catch (error) {
      console.error("Error leaving meeting:", error);
      // Force leave by calling onLeave directly
      onLeave();
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
    if (!isJoined) {
      toast({
        title: "Not Connected",
        description: "Please wait for the meeting to connect first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://d285-103-251-212-247.ngrok-free.app/join-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          token: VIDEOSDK_TOKEN
        }),
      });

      if (response.ok) {
        setAgentInvited(true);
        toast({
          title: "Agent Invited",
          description: "AI Agent is joining the conversation...",
        });
      } else {
        throw new Error('Failed to invite agent');
      }
    } catch (error) {
      console.error('Error inviting agent:', error);
      toast({
        title: "Error",
        description: "Failed to invite AI Agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const participantsList = Array.from(participants.values());
  const agentParticipant = participantsList.find(p => 
    p.displayName?.includes("Agent") || p.displayName?.includes("Haley")
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex">
        {/* Left Panel - Agent Configuration */}
        <div className="w-80 bg-[#1a1a1a] border-r border-gray-800 p-6">
          <div className="mb-8">
            <h1 className="text-xl font-semibold mb-6">Agent Configuration</h1>
            
            {/* Model Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Model</label>
              <div className="space-y-2">
                {['Haley', 'Samuel', 'Felicia', 'Jules', 'Doug'].map((model) => (
                  <div
                    key={model}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      agentSettings.model === model
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Voice & Personality */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Voice</label>
                <span className="text-sm text-gray-500">Default</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">Personality</label>
                <span className="text-sm text-gray-500">Default</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-300">Temperature</label>
                  <span className="text-sm text-gray-500">{agentSettings.temperature}</span>
                </div>
                <Slider
                  value={[agentSettings.temperature]}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-300">Top_P</label>
                  <span className="text-sm text-gray-500">{agentSettings.topP}</span>
                </div>
                <Slider
                  value={[agentSettings.topP]}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-300">Top_K</label>
                  <span className="text-sm text-gray-500">{agentSettings.topK}</span>
                </div>
                <Slider
                  value={[agentSettings.topK]}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Meeting Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">{agentSettings.model}</h2>
            <p className="text-gray-400">AI Conversation Agent</p>
          </div>

          {/* Agent Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 mb-8 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700"></div>
          </div>

          {/* Meeting Status */}
          <div className="mb-8 text-center">
            {connectionError ? (
              <div className="text-red-400 font-medium">
                {connectionError}
                {retryAttempts > 0 && (
                  <div className="text-sm text-gray-400 mt-1">
                    Retry attempt: {retryAttempts}/{maxRetries}
                  </div>
                )}
              </div>
            ) : !isJoined ? (
              <div className="text-yellow-400 font-medium">
                {isRetrying ? "Retrying connection..." : "Connecting to meeting..."}
              </div>
            ) : agentParticipant ? (
              <div className="text-green-400 font-medium">
                Agent is connected and ready
              </div>
            ) : agentInvited ? (
              <div className="text-yellow-400 font-medium">
                Agent is joining...
              </div>
            ) : (
              <div className="text-gray-400 font-medium">
                Click "Start Conversation" to begin
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="flex items-center space-x-6">
            {/* Microphone Control */}
            <Button
              onClick={handleToggleMic}
              variant={micEnabled ? "default" : "destructive"}
              size="lg"
              className="w-12 h-12 rounded-full"
              disabled={!isJoined}
            >
              {micEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            {/* Start/Invite Button */}
            {!agentInvited && isJoined && (
              <Button
                onClick={inviteAgent}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Start Conversation
              </Button>
            )}

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

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="px-6 py-3"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>

          {/* Meeting Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Meeting ID: {meetingId}</p>
            <p>Participants: {participantsList.length}</p>
            <p>Status: {isJoined ? 'Connected' : 'Connecting...'}</p>
            {retryAttempts > 0 && (
              <p>Retry attempts: {retryAttempts}/{maxRetries}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentMeeting: React.FC = () => {
  const [meetingId, setMeetingId] = useState<string>("");
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    model: 'Haley',
    voice: 'Default',
    personality: 'Default',
    temperature: 0.8,
    topP: 0.8,
    topK: 0.8
  });

  const createMeeting = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    
    try {
      console.log("Creating meeting with token:", VIDEOSDK_TOKEN);
      
      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          "Authorization": VIDEOSDK_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          region: "sg001",
          webhook: {
            endPoint: null
          }
        }),
      });

      console.log("API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Meeting created successfully:", data);
        setMeetingId(data.roomId);
        setIsInMeeting(true);
        toast({
          title: "Meeting Created",
          description: `Meeting ID: ${data.roomId}`,
        });
      } else {
        const errorData = await response.text();
        console.error("API Error:", response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLeaveMeeting = () => {
    setIsInMeeting(false);
    setMeetingId("");
  };

  if (!isInMeeting) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Card className="p-8 bg-[#1a1a1a] border-gray-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">AI Agent Meeting</h1>
            <p className="text-gray-400 mb-8">Start a conversation with an AI agent</p>
            <Button
              onClick={createMeeting}
              disabled={isCreating}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Meeting"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
      <MeetingContainer 
        meetingId={meetingId} 
        onLeave={handleLeaveMeeting}
        agentSettings={agentSettings}
      />
    </MeetingProvider>
  );
};

export default AgentMeeting;
