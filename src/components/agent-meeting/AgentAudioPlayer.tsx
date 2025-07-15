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
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely play audio
  const safePlay = async () => {
    if (!audioRef.current || !isAudioEnabled || isLoading) return;

    try {
      setIsLoading(true);
      await audioRef.current.play();
    } catch (error) {
      // Ignore AbortError as it's expected when streams change rapidly
      if (!(error instanceof Error) || !error.name.includes("AbortError")) {
        console.error("Audio play error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { micStream, isActiveSpeaker, displayName, getAudioStats } =
    useParticipant(participantId, {
      onStreamEnabled: (stream) => {
        console.log("Agent audio stream enabled:", stream);
        if (audioRef.current && stream) {
          const mediaStream = new MediaStream([stream.track]);
          audioRef.current.srcObject = mediaStream;

          // Wait for the audio to be ready before playing
          audioRef.current.onloadeddata = () => {
            safePlay();
          };
        }
      },
      onStreamDisabled: (stream) => {
        console.log("Agent audio stream disabled:", stream);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.srcObject = null;
          audioRef.current.onloadeddata = null;
        }
      },
    });

  useEffect(() => {
    if (audioRef.current && micStream) {
      const mediaStream = new MediaStream([micStream.track]);
      audioRef.current.srcObject = mediaStream;
      audioRef.current.volume = volume;

      if (isAudioEnabled) {
        // Wait for the audio to be ready before playing
        audioRef.current.onloadeddata = () => {
          safePlay();
        };
      }
    }
  }, [micStream, volume]); // Removed isAudioEnabled from dependencies to avoid unnecessary reloads

  // Handle audio enable/disable separately to avoid reloading the stream
  useEffect(() => {
    if (audioRef.current) {
      if (isAudioEnabled) {
        safePlay();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioEnabled]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg ">
      {/* <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isActiveSpeaker ? "bg-green-500 animate-pulse" : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm font-medium">
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
      </div> */}

      <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
    </div>
  );
};
