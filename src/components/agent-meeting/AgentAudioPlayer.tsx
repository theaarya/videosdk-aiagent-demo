
import React, { useRef, useState, useEffect } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

interface AgentAudioPlayerProps {
  participantId: string;
}

export const AgentAudioPlayer: React.FC<AgentAudioPlayerProps> = ({
  participantId,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume] = useState(1);

  const { micStream } = useParticipant(
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
      audioRef.current.play().catch(console.error);
    }
  }, [micStream, volume]);

  // Only render the hidden audio element - no UI
  return (
    <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
  );
};
