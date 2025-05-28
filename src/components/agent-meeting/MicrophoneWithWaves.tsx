
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
          {/* First wave ring */}
          <div
            className={`absolute rounded-full border-2 ${
              isSpeaking ? "animate-ping" : "animate-pulse"
            }`}
            style={{
              width: "280px",
              height: "280px",
              borderColor: "#F96E8C",
              opacity: 0.6,
              animationDuration: isSpeaking ? "1s" : "2s",
              animationDelay: "0s",
            }}
          />
          
          {/* Second wave ring */}
          <div
            className={`absolute rounded-full border-2 ${
              isSpeaking ? "animate-ping" : "animate-pulse"
            }`}
            style={{
              width: "320px",
              height: "320px",
              borderColor: "#DE4CE3",
              opacity: 0.4,
              animationDuration: isSpeaking ? "1.2s" : "2.4s",
              animationDelay: "0.2s",
            }}
          />
          
          {/* Third wave ring */}
          <div
            className={`absolute rounded-full border-2 ${
              isSpeaking ? "animate-ping" : "animate-pulse"
            }`}
            style={{
              width: "360px",
              height: "360px",
              borderColor: "#6A65F3",
              opacity: 0.3,
              animationDuration: isSpeaking ? "1.4s" : "2.8s",
              animationDelay: "0.4s",
            }}
          />
        </>
      )}

      {/* Microphone Icon */}
      <div className="relative z-10">
        <MicrophoneIcon />
      </div>

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full">
            Not Connected
          </div>
        </div>
      )}
    </div>
  );
};
