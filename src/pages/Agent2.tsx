
import React, { useState } from 'react';
import { AnimatedMicrophone } from '@/components/AnimatedMicrophone';
import { CustomButton } from '@/components/CustomButton';
import { agentApi } from '@/services/agentApi';

const Agent2: React.FC = () => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  
  // VideoSDK token
  const VIDEOSDK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2YzkwZDk3OS01NThiLTRiYjctOTUyYi1hZTE0MzZiNzJmYzIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc0ODQzMTMxMSwiZXhwIjoxNzQ5MDM2MTExfQ.DyXaaZ_ydclWZ9dWCeJ0J4LKdQ4XfZ0LOPWNu4jEKb8";
  
  const buttonVariants = [
    { text: "Give it a try!", thickBorder: true, action: "join" },
    { text: "Give it a sec...", thickBorder: false, action: "loading" },
    { text: "Just talk", thickBorder: false, action: "talking" },
    { text: "Press to stop", thickBorder: true, action: "leave" }
  ];

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
    if (isLoading) return;
    
    const currentButton = buttonVariants[currentButtonIndex];
    console.log("Button clicked, current action:", currentButton.action);
    
    try {
      setIsLoading(true);
      
      if (currentButton.action === "join") {
        // Create meeting first
        const newMeetingId = await createMeeting();
        setMeetingId(newMeetingId);
        
        console.log("Joining agent with meeting_id:", newMeetingId);
        await agentApi.joinOnClickAgent(newMeetingId, VIDEOSDK_TOKEN);
        console.log("Successfully joined agent");
        
      } else if (currentButton.action === "leave" && meetingId) {
        console.log("Leaving agent with meeting_id:", meetingId);
        await agentApi.leaveOnClickAgent(meetingId, VIDEOSDK_TOKEN);
        console.log("Successfully left agent");
        setMeetingId(null);
      }
      
      // Move to next button state
      setCurrentButtonIndex((prev) => (prev + 1) % buttonVariants.length);
      
    } catch (error) {
      console.error("Error with agent API:", error);
      // Show error but still move to next state for demo purposes
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentButtonIndex((prev) => (prev + 1) % buttonVariants.length);
    } finally {
      setIsLoading(false);
    }
  };

  const currentButton = buttonVariants[currentButtonIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12 p-8">
      <AnimatedMicrophone />
      <CustomButton 
        text={isLoading ? "Processing..." : currentButton.text} 
        thickBorder={currentButton.thickBorder}
        onClick={handleButtonClick}
      />
      {meetingId && (
        <div className="text-white text-sm">
          Meeting ID: {meetingId}
        </div>
      )}
    </div>
  );
};

export default Agent2;
