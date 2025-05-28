
import React, { useEffect, useState } from "react";
import { useMeeting, useParticipant } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { AgentSettings } from "./types";
import { AgentAudioPlayer } from "./AgentAudioPlayer";
import { RoomLayout } from "../layout/RoomLayout";
import { WaterAnimation } from "./WaterAnimation";

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
  const [isMicOn, setIsMicOn] = useState(true);
  const [agentParticipantId, setAgentParticipantId] = useState<string | null>(null);
  const [agentAudioStream, setAgentAudioStream] = useState<MediaStream | null>(null);

  const { participants, localMicOn, unmuteMic, muteMic, leave } = useMeeting({
    onMeetingJoined: () => {
      console.log("Meeting joined successfully");
    },
    onParticipantJoined: (participant) => {
      console.log("Participant joined:", participant);
      if (participant.displayName?.toLowerCase().includes('agent') || participant.displayName?.toLowerCase().includes('bot')) {
        setAgentParticipantId(participant.id);
      }
    },
    onParticipantLeft: (participant) => {
      console.log("Participant left:", participant);
      if (participant.id === agentParticipantId) {
        setAgentParticipantId(null);
        setAgentAudioStream(null);
      }
    },
  });

  // Get agent participant data
  const agentParticipant = agentParticipantId ? useParticipant(agentParticipantId, {
    onStreamEnabled: (stream) => {
      if (stream.kind === 'audio') {
        console.log("Agent audio stream enabled");
        const mediaStream = new MediaStream([stream.track]);
        setAgentAudioStream(mediaStream);
      }
    },
    onStreamDisabled: (stream) => {
      if (stream.kind === 'audio') {
        console.log("Agent audio stream disabled");
        setAgentAudioStream(null);
      }
    },
  }) : null;

  const toggleMic = () => {
    if (localMicOn) {
      muteMic();
      setIsMicOn(false);
    } else {
      unmuteMic();
      setIsMicOn(true);
    }
  };

  const handleLeave = () => {
    leave();
    onDisconnect();
  };

  const isAgentSpeaking = agentParticipant?.isActiveSpeaker || false;

  useEffect(() => {
    console.log("Agent speaking status:", isAgentSpeaking);
    console.log("Agent audio stream:", agentAudioStream);
  }, [isAgentSpeaking, agentAudioStream]);

  return (
    <RoomLayout
      agentSettings={agentSettings}
      onSettingsChange={onSettingsChange}
    >
      {/* Agent Avatar with Water Animation */}
      <div className="w-48 h-48 mb-8">
        <WaterAnimation 
          isActive={isAgentSpeaking || !!agentAudioStream} 
          audioStream={agentAudioStream || undefined}
        />
      </div>

      {/* Meeting Info */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Meeting Active</h2>
        <p className="text-gray-400">Meeting ID: {meetingId}</p>
        <p className="text-sm text-gray-500 mt-2">
          Participants: {Object.keys(participants).length}
        </p>
        {agentParticipantId && (
          <p className="text-sm text-green-400 mt-1">
            Agent Connected {isAgentSpeaking ? "🎤 Speaking" : ""}
          </p>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex items-center space-x-6">
        <Button
          onClick={toggleMic}
          variant={isMicOn ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        <Button
          onClick={handleLeave}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>

      {/* Hidden Audio Player for Agent */}
      {agentParticipantId && (
        <AgentAudioPlayer participantId={agentParticipantId} />
      )}
    </RoomLayout>
  );
};
