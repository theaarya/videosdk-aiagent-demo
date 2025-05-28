
import React from "react";
import { AgentSettings } from "./types";
import { RoomLayout } from "../layout/RoomLayout";
import { MicrophoneWithWaves } from "./MicrophoneWithWaves";
import { CustomButton } from "./CustomButton";

interface MeetingContainerProps {
  onConnect: () => void;
  agentSettings: AgentSettings;
  isConnecting: boolean;
}

export const MeetingContainer: React.FC<MeetingContainerProps> = ({
  onConnect,
  agentSettings,
  isConnecting,
}) => {
  return (
    <RoomLayout agentSettings={agentSettings}>
      {/* Microphone with Wave Animation */}
      <MicrophoneWithWaves 
        isConnected={false}
        className="mb-12"
      />

      {/* Control Panel */}
      <div className="flex items-center space-x-6">
        {/* Connect Button */}
        <CustomButton
          text={isConnecting ? "Connecting..." : "Connect"}
          thickBorder={true}
          onClick={onConnect}
          disabled={isConnecting}
        />
      </div>
    </RoomLayout>
  );
};
