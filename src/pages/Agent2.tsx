
import React, { useState, useEffect, useRef } from 'react';
import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";
import { AnimatedMicrophone } from '@/components/AnimatedMicrophone';
import { CustomButton } from '@/components/CustomButton';
import { agentApi } from '@/services/agentApi';
import { AgentAudioPlayer } from '@/components/agent-meeting/AgentAudioPlayer';
import { toast } from '@/hooks/use-toast';

// VideoSDK token
const VIDEOSDK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2YzkwZDk3OS01NThiLTRiYjctOTUyYi1hZTE0MzZiNzJmYzIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc0ODQzMTMxMSwiZXhwIjoxNzQ5MDM2MTExfQ.DyXaaZ_ydclWZ9dWCeJ0J4LKdQ4XfZ0LOPWNu4jEKb8";

interface MeetingComponentProps {
  meetingId: string;
  onMeetingLeft: () => void;
  onAgentJoined: () => void;
  currentButtonIndex: number;
  setCurrentButtonIndex: (index: number) => void;
  setIsLoading: (loading: boolean) => void;
}

const MeetingComponent: React.FC<MeetingComponentProps> = ({
  meetingId,
  onMeetingLeft,
  onAgentJoined,
  currentButtonIndex,
  setCurrentButtonIndex,
  setIsLoading
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [agentInvited, setAgentInvited] = useState(false);
  const agentInviteRef = useRef(false);
  const joinRef = useRef(false);

  const { join, leave, end, participants, toggleMic, localMicOn } = useMeeting({
    onMeetingJoined: () => {
      console.log("Meeting joined successfully");
      setIsJoined(true);
      
      // Ensure microphone is enabled when joining
      if (!localMicOn) {
        toggleMic();
        console.log("Microphone enabled for human participant");
      }
      
      toast({
        title: "Meeting Started",
        description: "You have joined the conversation with microphone enabled",
      });
    },
    onMeetingLeft: () => {
      console.log("Meeting left");
      setIsJoined(false);
      setAgentInvited(false);
      agentInviteRef.current = false;
      joinRef.current = false;
      onMeetingLeft();
    },
    onParticipantJoined: (participant) => {
      console.log("Participant joined:", participant.displayName);
      if (participant.displayName?.includes("Agent") || participant.displayName?.includes("Haley") || participant.displayName?.includes("Gemini")) {
        setAgentInvited(true);
        onAgentJoined();
        toast({
          title: "AI Agent Joined",
          description: `${participant.displayName} has joined the conversation`,
        });
      }
    },
    onParticipantLeft: (participant) => {
      console.log("Participant left:", participant.displayName);
    },
    onError: (error) => {
      console.error("Meeting error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the meeting",
        variant: "destructive",
      });
    },
  });

  // Auto-join meeting once
  useEffect(() => {
    if (meetingId && !isJoined && !joinRef.current) {
      console.log("Auto-joining meeting:", meetingId);
      joinRef.current = true;
      setTimeout(() => {
        join();
      }, 1000);
    }
  }, [meetingId, join, isJoined]);

  // Auto-invite agent once after joining
  useEffect(() => {
    if (isJoined && !agentInvited && !agentInviteRef.current) {
      console.log("Auto-inviting agent after meeting join");
      agentInviteRef.current = true;
      setTimeout(() => {
        inviteAgent();
      }, 1000);
    }
  }, [isJoined, agentInvited]);

  // Ensure microphone stays enabled
  useEffect(() => {
    if (isJoined && !localMicOn) {
      toggleMic();
      console.log("Re-enabling microphone for human participant");
    }
  }, [isJoined, localMicOn, toggleMic]);

  const inviteAgent = async () => {
    if (agentInviteRef.current) return; // Prevent duplicate calls
    
    try {
      console.log("Inviting agent to meeting:", meetingId);
      setIsLoading(true);
      
      await agentApi.joinOnClickAgent(meetingId, VIDEOSDK_TOKEN);
      
      console.log("Agent invited successfully");
      toast({
        title: "Agent Invited",
        description: "AI Agent is joining the conversation...",
      });
    } catch (error) {
      console.error("Error inviting agent:", error);
      agentInviteRef.current = false; // Reset on error so it can be retried
      toast({
        title: "Error",
        description: "Failed to invite AI Agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      if (agentInvited) {
        console.log("Removing agent from meeting:", meetingId);
        setIsLoading(true);
        
        const response = await agentApi.leaveOnClickAgent(meetingId, VIDEOSDK_TOKEN);
        console.log("Leave agent API response:", response);
        
        // Check the status from API response
        if (response.status === "not_found") {
          console.log("Agent not found in meeting");
          toast({
            title: "Agent Not Found",
            description: "Agent was not found in the meeting",
          });
        } else if (response.status === "removed") {
          console.log("Agent successfully removed from meeting");
          toast({
            title: "Agent Removed",
            description: "AI Agent has left the conversation",
          });
        }
      }
      
      // End the call using VideoSDK's end method
      console.log("Ending meeting call");
      end();
      
    } catch (error) {
      console.error("Error leaving meeting:", error);
      toast({
        title: "Error",
        description: "Failed to leave meeting properly",
        variant: "destructive",
      });
      // Still try to end the call even if API fails
      end();
    } finally {
      setIsLoading(false);
    }
  };

  const buttonVariants = [
    { text: "Give it a try!", thickBorder: true, action: "join" },
    { text: "Give it a sec...", thickBorder: false, action: "loading" },
    { text: "Just talk", thickBorder: false, action: "talking" },
    { text: "Press to stop", thickBorder: true, action: "leave" }
  ];

  const currentButton = buttonVariants[currentButtonIndex];

  const handleButtonClick = () => {
    if (currentButton.action === "leave") {
      handleLeave();
    } else if (currentButton.action === "join" || currentButton.action === "talking") {
      const nextIndex = (currentButtonIndex + 1) % buttonVariants.length;
      setCurrentButtonIndex(nextIndex);
    }
  };

  const participantsList = Array.from(participants.values());
  const agentParticipant = participantsList.find(
    (p) => p.displayName?.includes("Agent") || p.displayName?.includes("Haley") || p.displayName?.includes("Gemini")
  );

  // Check if agent is speaking (this is a simplified check - you might want to use actual audio level detection)
  const isAgentSpeaking = agentParticipant && agentInvited;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12 p-8">
      {/* Always show the AnimatedMicrophone - it represents the agent */}
      <AnimatedMicrophone 
        showWaves={isJoined && agentInvited}
        isAgentSpeaking={isAgentSpeaking}
      />
      
      <CustomButton 
        text={currentButton.text} 
        thickBorder={currentButton.thickBorder}
        onClick={handleButtonClick}
      />
      
      {meetingId && (
        <div className="text-white text-sm">
          Meeting ID: {meetingId}
        </div>
      )}

      {isJoined && (
        <div className="text-white text-sm">
          Status: {agentInvited ? "Agent Connected" : "Waiting for agent..."} | 
          Mic: {localMicOn ? "On" : "Off"}
        </div>
      )}

      {/* Hidden audio player - no UI, just audio functionality */}
      {agentParticipant && (
        <AgentAudioPlayer participantId={agentParticipant.id} />
      )}
    </div>
  );
};

const Agent2: React.FC = () => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const createMeetingRef = useRef(false);

  const createMeeting = async (): Promise<string> => {
    try {
      console.log("Creating VideoSDK meeting...");
      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: VIDEOSDK_TOKEN,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("VideoSDK API Error:", response.status, errorData);
        throw new Error(`Failed to create meeting: ${response.status}`);
      }

      const data = await response.json();
      console.log("Meeting created successfully:", data);
      return data.roomId;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  };

  const handleButtonClick = async () => {
    if (isLoading || createMeetingRef.current) return;
    
    const buttonVariants = [
      { text: "Give it a try!", thickBorder: true, action: "join" },
      { text: "Give it a sec...", thickBorder: false, action: "loading" },
      { text: "Just talk", thickBorder: false, action: "talking" },
      { text: "Press to stop", thickBorder: true, action: "leave" }
    ];
    
    const currentButton = buttonVariants[currentButtonIndex];
    console.log("Button clicked, current action:", currentButton.action);
    
    if (currentButton.action === "join") {
      try {
        setIsLoading(true);
        createMeetingRef.current = true;
        const newMeetingId = await createMeeting();
        setMeetingId(newMeetingId);
        setCurrentButtonIndex(1); // Move to "Give it a sec..." state
      } catch (error) {
        console.error("Error creating meeting:", error);
        createMeetingRef.current = false;
        toast({
          title: "Error",
          description: "Failed to create meeting",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMeetingLeft = () => {
    setMeetingId(null);
    setCurrentButtonIndex(0);
    createMeetingRef.current = false;
  };

  const handleAgentJoined = () => {
    setCurrentButtonIndex(2); // Move to "Just talk" state
  };

  const buttonVariants = [
    { text: "Give it a try!", thickBorder: true, action: "join" },
    { text: "Give it a sec...", thickBorder: false, action: "loading" },
    { text: "Just talk", thickBorder: false, action: "talking" },
    { text: "Press to stop", thickBorder: true, action: "leave" }
  ];

  const currentButton = buttonVariants[currentButtonIndex];

  if (!meetingId) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12 p-8">
        <AnimatedMicrophone />
        <CustomButton 
          text={isLoading ? "Creating meeting..." : currentButton.text} 
          thickBorder={currentButton.thickBorder}
          onClick={handleButtonClick}
        />
      </div>
    );
  }

  return (
    <MeetingProvider
      key={meetingId} // Force re-render when meetingId changes
      config={{
        meetingId,
        micEnabled: true, // Ensure microphone is enabled by default
        webcamEnabled: false,
        name: "User",
        debugMode: false,
      }}
      token={VIDEOSDK_TOKEN}
      reinitialiseMeetingOnConfigChange={false}
      joinWithoutUserInteraction={false}
    >
      <MeetingComponent
        meetingId={meetingId}
        onMeetingLeft={handleMeetingLeft}
        onAgentJoined={handleAgentJoined}
        currentButtonIndex={currentButtonIndex}
        setCurrentButtonIndex={setCurrentButtonIndex}
        setIsLoading={setIsLoading}
      />
    </MeetingProvider>
  );
};

export default Agent2;
