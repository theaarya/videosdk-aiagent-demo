
import React, { useState, useEffect, useRef } from 'react';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { Mic, MicOff, Disconnect } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

const VIDEOSDK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2YzkwZDk3OS01NThiLTRiYjctOTUyYi1hZTE0MzZiNzJmYzIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczOTUwOTkxNCwiZXhwIjoxNzQwMTE0NzE0fQ.2bpdG9HJtwkrte8d1Pa8rQUYtYX-RR7YY4QkutE1wGA";

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

  const {
    join,
    leave,
    toggleMic,
    participants,
    localParticipant
  } = useMeeting({
    onMeetingJoined: () => {
      console.log("Meeting joined successfully");
      toast({
        title: "Meeting Started",
        description: "You have joined the conversation",
      });
    },
    onMeetingLeft: () => {
      console.log("Meeting left");
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
    }
  });

  useEffect(() => {
    join();
  }, [join]);

  const handleToggleMic = () => {
    toggleMic();
    setMicEnabled(!micEnabled);
  };

  const handleDisconnect = () => {
    leave();
  };

  const inviteAgent = async () => {
    try {
      const response = await fetch('http://localhost:8001/join-agent', {
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
            {agentParticipant ? (
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
            >
              {micEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            {/* Start/Invite Button */}
            {!agentInvited && (
              <Button
                onClick={inviteAgent}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Start Conversation
              </Button>
            )}

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="px-6 py-3"
            >
              <Disconnect className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>

          {/* Meeting Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Meeting ID: {meetingId}</p>
            <p>Participants: {participantsList.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentMeeting: React.FC = () => {
  const [meetingId, setMeetingId] = useState<string>("");
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    model: 'Haley',
    voice: 'Default',
    personality: 'Default',
    temperature: 0.8,
    topP: 0.8,
    topK: 0.8
  });

  const createMeeting = async () => {
    try {
      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          "Authorization": VIDEOSDK_TOKEN,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMeetingId(data.roomId);
        setIsInMeeting(true);
        console.log("Meeting created:", data.roomId);
      } else {
        throw new Error('Failed to create meeting');
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
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
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Create Meeting
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
        debugMode: true,
        joinWithoutUserInteraction: true,
      }}
      token={VIDEOSDK_TOKEN}
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
