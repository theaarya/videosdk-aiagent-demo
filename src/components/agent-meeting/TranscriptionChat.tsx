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
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-[#1A1A1A] to-[#252A34] border border-[#3A3F4A] shadow-2xl max-h-screen overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none" />
      
      {/* Header - Ultra Compact */}
      <div className="flex items-center justify-between p-3 border-b border-[#3A3F4A] bg-gradient-to-r from-[#1A1A1A] to-[#252A34] flex-shrink-0 relative">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Live Transcription</h3>
          </div>
        </div>
        <Button
          onClick={handleToggleTranscription}
          size="sm"
          disabled={!isConnected}
          className={cn(
            "w-6 h-6",
            isTranscribing 
              ? "bg-[#380b0b] hover:bg-[#380b0b] text-[#a13f3f]" 
              : "bg-[#0b3820] hover:bg-[#0b3820] text-[#3fa16d]",
            !isConnected && "opacity-50 cursor-not-allowed"
          )}
        >
          {isTranscribing ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-3 space-y-3">
            {transcriptions.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-400 text-xs text-center">
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
                      "flex flex-col space-y-1",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <span className="text-[10px]">{isUser ? "You" : (isAgent ? "AI Agent" : transcription.participantName)}</span>
                      <span>•</span>
                      <span className="text-[10px]">{formatTime(transcription.timestamp)}</span>
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] p-2 rounded text-xs break-words border",
                        isUser 
                          ? "bg-gradient-to-r from-[#0b3820] to-[#0f4025] border-[#3fa16d]/30 text-white rounded-br-sm" 
                          : "bg-gradient-to-r from-[#252A34] to-[#2A2F3A] border-[#3A3F4A] text-white rounded-bl-sm",
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

      {/* Footer - Compact */}
      {transcriptions.length > 0 && (
        <div className="p-2 border-t border-[#3A3F4A] bg-gradient-to-r from-[#1A1A1A] to-[#252A34] flex-shrink-0 relative">
          <Button
            onClick={clearTranscriptions}
            size="sm"
            variant="outline"
            className="w-full text-xs h-6 bg-[#252A34]/80 border-[#3A3F4A] text-white hover:bg-[#2A2F3A]"
          >
            Clear Chat
          </Button>
        </div>
      )}
    </div>
  );
};
