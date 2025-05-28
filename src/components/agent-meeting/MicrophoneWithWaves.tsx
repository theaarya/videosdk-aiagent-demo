
import React from "react";
import { MicrophoneIcon } from "../icons/MicrophoneIcon";

interface MicrophoneWithWavesProps {
  isConnected: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export const MicrophoneWithWaves: React.FC<MicrophoneWithWavesProps> = ({
  isConnected,
  isSpeaking = false,
  className = "",
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Animated Wave Rings - Only when agent is speaking */}
      {isConnected && isSpeaking && (
        <>
          {/* First wave ring - innermost, just 2px larger than mic */}
          <div
            className="absolute rounded-full border-2 animate-ping"
            style={{
              width: "200px",
              height: "200px",
              borderColor: "#F96E8C",
              opacity: 0.8,
              animationDuration: "0.8s",
              animationDelay: "0s",
            }}
          />
          
          {/* Second wave ring - 2px larger */}
          <div
            className="absolute rounded-full border-2 animate-ping"
            style={{
              width: "202px",
              height: "202px",
              borderColor: "#DE4CE3",
              opacity: 0.6,
              animationDuration: "1s",
              animationDelay: "0.1s",
            }}
          />
          
          {/* Third wave ring - 3px larger */}
          <div
            className="absolute rounded-full border-2 animate-ping"
            style={{
              width: "205px",
              height: "205px",
              borderColor: "#6A65F3",
              opacity: 0.4,
              animationDuration: "1.2s",
              animationDelay: "0.2s",
            }}
          />
        </>
      )}

      {/* Microphone Icon */}
      <div className="relative z-10">
        <MicrophoneIcon />
      </div>
    </div>
  );
};
