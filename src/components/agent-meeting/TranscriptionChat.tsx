import React, { useState, useEffect, useRef } from "react";
import { useTranscription } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TranscriptionData {
  id: string;
  text: string;
  participantId: string;
  participantName: string;
  timestamp: Date;
  isPartial: boolean;
}

interface TranscriptionChatProps {
  participants: Map<string, any>;
  localParticipantId?: string;
  isConnected?: boolean;
}

export const TranscriptionChat: React.FC<TranscriptionChatProps> = ({
  participants,
  localParticipantId,
  isConnected = false,
}) => {
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { startTranscription, stopTranscription } = useTranscription({
    onTranscriptionStateChanged: ({ status }) => {
      console.log("Transcription status changed:", status);
      setIsTranscribing(status === "TRANSCRIPTION_STARTED");
      
      if (status === "TRANSCRIPTION_STARTED") {
        toast({
          title: "Transcription Started",
          description: "Real-time transcription is now active",
        });
      } else if (status === "TRANSCRIPTION_STOPPED") {
        toast({
          title: "Transcription Stopped",
          description: "Real-time transcription has been disabled",
        });
      }
    },
    onTranscriptionText: ({ participantId, participantName, text, type }) => {
      console.log("Transcription received:", { participantId, participantName, text, type });
      
      const isPartial = type === "realtime";
      const timestamp = new Date();
      
      setTranscriptions(prev => {
        // If this is a partial transcription, replace the last partial message from the same participant
        if (isPartial) {
          const filtered = prev.filter(t => 
            !(t.participantId === participantId && t.isPartial)
          );
          return [...filtered, {
            id: `${participantId}-${timestamp.getTime()}`,
            text,
            participantId,
            participantName: participantName || "Unknown",
            timestamp,
            isPartial: true,
          }];
        } else {
          // For final transcriptions, remove any partial messages from this participant and add the final one
          const filtered = prev.filter(t => 
            !(t.participantId === participantId && t.isPartial)
          );
          return [...filtered, {
            id: `${participantId}-${timestamp.getTime()}`,
            text,
            participantId,
            participantName: participantName || "Unknown",
            timestamp,
            isPartial: false,
          }];
        }
      });
    },
  });

  // Auto-scroll to bottom when new transcriptions arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [transcriptions]);

  // Start transcription immediately when connected (reduced delay)
  useEffect(() => {
    if (isConnected && !isTranscribing) {
      const autoStartTimer = setTimeout(() => {
        try {
          console.log("Auto-starting transcription early to capture initial sentences");
          startTranscription({});
        } catch (error) {
          console.error("Error auto-starting transcription:", error);
        }
      }, 500); // Reduced from 2000ms to 500ms

      return () => clearTimeout(autoStartTimer);
    }
  }, [isConnected, isTranscribing]);

  const handleToggleTranscription = () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to the meeting first to enable transcription",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isTranscribing) {
        stopTranscription();
      } else {
        startTranscription({});
      }
    } catch (error) {
      console.error("Error toggling transcription:", error);
      toast({
        title: "Transcription Error",
        description: "Failed to toggle transcription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearTranscriptions = () => {
    setTranscriptions([]);
    toast({
      title: "Transcriptions Cleared",
      description: "All transcription messages have been removed",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConnectionStatus = () => {
    if (!isConnected) {
      return "Not connected to meeting";
    }
    if (isTranscribing) {
      return "Listening for speech...";
    }
    return "Transcription ready";
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#121619] border border-[#393939] max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#393939] bg-[#1A1F23] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-5 h-5 text-[#38BDF8]" />
          <h3 className="text-sm font-medium text-white">Live Transcription</h3>
        </div>
        <Button
          onClick={handleToggleTranscription}
          size="sm"
          disabled={!isConnected}
          variant="outline"
          className={cn(
            "h-8 w-8 border-2 transition-all",
            isTranscribing 
              ? "border-red-400 text-red-400 hover:bg-red-400/10" 
              : "border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10",
            !isConnected && "opacity-50 cursor-not-allowed"
          )}
        >
          {isTranscribing ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-6 space-y-4">
            {transcriptions.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm text-center">
                {getConnectionStatus()}
              </div>
            ) : (
              transcriptions.map((transcription) => {
                const isUser = transcription.participantId === localParticipantId;
                const isAgent = transcription.participantName?.includes("Agent") || transcription.participantName?.includes("Haley");
                
                return (
                  <div
                    key={transcription.id}
                    className={cn(
                      "flex flex-col space-y-2",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{isUser ? "You" : (isAgent ? "AI Agent" : transcription.participantName)}</span>
                      <span>•</span>
                      <span>{formatTime(transcription.timestamp)}</span>
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg text-sm break-words border",
                        isUser 
                          ? "bg-[#25252540] border-[#38BDF8]/30 text-white" 
                          : "bg-[#1A1F23] border-[#393939] text-white",
                        transcription.isPartial && "opacity-70 italic"
                      )}
                    >
                      {transcription.text}
                      {transcription.isPartial && " ..."}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      {transcriptions.length > 0 && (
        <div className="p-6 border-t border-[#393939] flex-shrink-0">
          <Button
            onClick={clearTranscriptions}
            size="sm"
            variant="outline"
            className="w-full h-10 bg-[#25252540] border-[#38BDF8]/30 text-gray-300 hover:bg-[#25252540]"
          >
            Clear Chat
          </Button>
        </div>
      )}
    </div>
  );
};
