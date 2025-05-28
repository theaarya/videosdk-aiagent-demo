
import React, { useRef, useState, useEffect } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AgentAudioPlayerProps {
  participantId: string;
}

export const AgentAudioPlayer: React.FC<AgentAudioPlayerProps> = ({
  participantId,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(1);

  const { micStream, isActiveSpeaker, displayName } = useParticipant(
    participantId,
    {
      onStreamEnabled: (stream) => {
        console.log("Agent audio stream enabled:", stream);
        if (audioRef.current && stream) {
          const mediaStream = new MediaStream([stream.track]);
          audioRef.current.srcObject = mediaStream;
          audioRef.current.play().catch(console.error);
        }
      },
      onStreamDisabled: (stream) => {
        console.log("Agent audio stream disabled:", stream);
        if (audioRef.current) {
          audioRef.current.srcObject = null;
        }
      },
    }
  );

  useEffect(() => {
    if (audioRef.current && micStream) {
      const mediaStream = new MediaStream([micStream.track]);
      audioRef.current.srcObject = mediaStream;
      audioRef.current.volume = volume;
      if (isAudioEnabled) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [micStream, isAudioEnabled, volume]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (audioRef.current) {
      if (isAudioEnabled) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isActiveSpeaker ? "bg-green-500 animate-pulse" : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm font-medium text-white">
            {displayName || "AI Agent"}
          </span>
        </div>
        <Button
          onClick={toggleAudio}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-700"
        >
          {isAudioEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <VolumeX className="w-4 h-4 text-gray-400" />
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={1}
          min={0}
          step={0.1}
          className="flex-1"
        />
        <Volume2 className="w-4 h-4 text-gray-400" />
      </div>

      <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
    </div>
  );
};
