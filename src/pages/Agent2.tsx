
import React, { useState } from 'react';
import { AnimatedMicrophone } from '@/components/AnimatedMicrophone';
import { CustomButton } from '@/components/CustomButton';

const Agent2: React.FC = () => {
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  
  const buttonVariants = [
    { text: "Give it a try!", thickBorder: true },
    { text: "Give it a sec...", thickBorder: false },
    { text: "Just talk", thickBorder: false },
    { text: "Press to stop", thickBorder: true }
  ];

  const handleButtonClick = () => {
    setCurrentButtonIndex((prev) => (prev + 1) % buttonVariants.length);
  };

  const currentButton = buttonVariants[currentButtonIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-12 p-8">
      <AnimatedMicrophone />
      <CustomButton 
        text={currentButton.text} 
        thickBorder={currentButton.thickBorder}
        onClick={handleButtonClick}
      />
    </div>
  );
};

export default Agent2;
