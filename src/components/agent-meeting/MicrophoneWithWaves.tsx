
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
      {/* Animated Wave Rings */}
      {isConnected && (
        <>
          {/* First wave ring - innermost */}
          <div
            className={`absolute rounded-full border-2 ${
              isSpeaking ? "animate-ping" : "animate-pulse"
            }`}
            style={{
              width: "220px",
              height: "220px",
              borderColor: "#F96E8C",
              opacity: 0.6,
              animationDuration: isSpeaking ? "1s" : "2s",
              animationDelay: "0s",
            }}
          />
          
          {/* Second wave ring - middle */}
          <div
            className={`absolute rounded-full border-2 ${
              isSpeaking ? "animate-ping" : "animate-pulse"
            }`}
            style={{
              width: "280px",
              height: "280px",
              borderColor: "#DE4CE3",
              opacity: 0.4,
              animationDuration: isSpeaking ? "1.3s" : "2.6s",
              animationDelay: "0.1s",
            }}
          />
          
          {/* Third wave ring - outermost */}
          <div
            className={`absolute rounded-full border-2 ${
              isSpeaking ? "animate-ping" : "animate-pulse"
            }`}
            style={{
              width: "340px",
              height: "340px",
              borderColor: "#6A65F3",
              opacity: 0.3,
              animationDuration: isSpeaking ? "1.6s" : "3.2s",
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
