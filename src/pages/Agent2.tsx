
import React, { useState } from 'react';
import { AnimatedMicrophone } from '@/components/AnimatedMicrophone';
import { CustomButton } from '@/components/CustomButton';
import { agentApi } from '@/services/agentApi';

const Agent2: React.FC = () => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // VideoSDK token
  const VIDEOSDK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2YzkwZDk3OS01NThiLTRiYjctOTUyYi1hZTE0MzZiNzJmYzIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc0ODQzMTMxMSwiZXhwIjoxNzQ5MDM2MTExfQ.DyXaaZ_ydclWZ9dWCeJ0J4LKdQ4XfZ0LOPWNu4jEKb8";
  
  // Generate a unique meeting ID for this session
  const MEETING_ID = `agent-meeting-${Date.now()}`;
  
  const buttonVariants = [
    { text: "Give it a try!", thickBorder: true, action: "join" },
    { text: "Give it a sec...", thickBorder: false, action: "loading" },
    { text: "Just talk", thickBorder: false, action: "talking" },
    { text: "Press to stop", thickBorder: true, action: "leave" }
  ];

  const handleButtonClick = async () => {
    if (isLoading) return;
    
    const currentButton = buttonVariants[currentButtonIndex];
    
    try {
      setIsLoading(true);
      
      if (currentButton.action === "join") {
        console.log("Joining agent with meeting_id:", MEETING_ID);
        await agentApi.joinOnClickAgent(MEETING_ID, VIDEOSDK_TOKEN);
        console.log("Successfully joined agent");
      } else if (currentButton.action === "leave") {
        console.log("Leaving agent with meeting_id:", MEETING_ID);
        await agentApi.leaveOnClickAgent(MEETING_ID, VIDEOSDK_TOKEN);
        console.log("Successfully left agent");
      }
      
      // Move to next button state
      setCurrentButtonIndex((prev) => (prev + 1) % buttonVariants.length);
      
    } catch (error) {
      console.error("Error with agent API:", error);
      // Still move to next state even on error for demo purposes
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
    </div>
  );
};

export default Agent2;
