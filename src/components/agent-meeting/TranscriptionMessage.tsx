
import React from "react";
import { cn } from "@/lib/utils";

interface TranscriptionMessageProps {
  message: string;
  participantName: string;
  timestamp: Date;
  isUser: boolean;
  isPartial?: boolean;
}

export const TranscriptionMessage: React.FC<TranscriptionMessageProps> = ({
  message,
  participantName,
  timestamp,
  isUser,
  isPartial = false,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "flex flex-col space-y-1 p-3 rounded-lg",
      isUser 
        ? "bg-[#0b3820] border-l-4 border-[#3fa16d]" 
        : "bg-[#380b0b] border-l-4 border-[#a13f3f]"
    )}>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xs font-medium",
          isUser ? "text-[#3fa16d]" : "text-[#a13f3f]"
        )}>
          {participantName}
        </span>
        <span className="text-xs text-gray-400">
          {formatTime(timestamp)}
        </span>
      </div>
      <p className={cn(
        "text-sm text-white",
        isPartial && "opacity-70 italic"
      )}>
        {message}
        {isPartial && " ..."}
      </p>
    </div>
  );
};
