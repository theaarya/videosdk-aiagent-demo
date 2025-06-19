
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
}

export const TranscriptionChat: React.FC<TranscriptionChatProps> = ({
  participants,
  localParticipantId,
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

  // Auto-start transcription when component mounts
  useEffect(() => {
    const autoStartTimer = setTimeout(() => {
      if (!isTranscribing) {
        try {
          startTranscription({});
        } catch (error) {
          console.error("Error auto-starting transcription:", error);
        }
      }
    }, 2000);

    return () => clearTimeout(autoStartTimer);
  }, []);

  const handleToggleTranscription = () => {
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

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#252A34] bg-[#161616]">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <h3 className="text-sm font-medium text-white">Live Transcription</h3>
        </div>
        <Button
          onClick={handleToggleTranscription}
          size="sm"
          className={cn(
            "w-8 h-8",
            isTranscribing 
              ? "bg-[#380b0b] hover:bg-[#380b0b] text-[#a13f3f]" 
              : "bg-[#0b3820] hover:bg-[#0b3820] text-[#3fa16d]"
          )}
        >
          {isTranscribing ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {transcriptions.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                {isTranscribing ? "Listening for speech..." : "Transcription will start automatically..."}
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
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{isUser ? "You" : (isAgent ? "AI Agent" : transcription.participantName)}</span>
                      <span>•</span>
                      <span>{formatTime(transcription.timestamp)}</span>
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg text-sm",
                        isUser 
                          ? "bg-[#0b3820] text-white rounded-br-sm" 
                          : "bg-[#252A34] text-white rounded-bl-sm",
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

        {/* Footer */}
        {transcriptions.length > 0 && (
          <div className="p-4 border-t border-[#252A34] bg-[#161616]">
            <Button
              onClick={clearTranscriptions}
              size="sm"
              variant="outline"
              className="w-full text-xs"
            >
              Clear Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
