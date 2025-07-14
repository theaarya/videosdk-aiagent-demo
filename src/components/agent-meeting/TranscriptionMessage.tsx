
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
      "flex flex-col space-y-1 p-3 rounded-lg border",
      isUser 
        ? "bg-gray-800/50 border-cyan-500/30" 
        : "bg-gray-800/30 border-gray-600/50"
    )}>
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xs font-medium",
          isUser ? "text-cyan-400" : "text-gray-300"
        )}>
          {participantName}
        </span>
        <span className="text-xs text-gray-500">
          {formatTime(timestamp)}
        </span>
      </div>
      <p className={cn(
        "text-sm text-gray-100",
        isPartial && "opacity-70 italic"
      )}>
        {message}
        {isPartial && " ..."}
      </p>
    </div>
  );
};
