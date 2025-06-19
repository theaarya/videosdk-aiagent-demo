
import React from "react";
import { Button } from "@/components/ui/button";
import { AgentSettings } from "./types";
import { RoomLayout } from "../layout/RoomLayout";
import { WaveAvatar } from "./WaveAvatar";

interface MeetingContainerProps {
  onConnect: () => void;
  agentSettings: AgentSettings;
  isConnecting: boolean;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const MeetingContainer: React.FC<MeetingContainerProps> = ({
  onConnect,
  agentSettings,
  isConnecting,
  onSettingsChange,
}) => {
  return (
    <RoomLayout
      agentSettings={agentSettings}
      onSettingsChange={onSettingsChange}
      participants={new Map()}
      localParticipantId={undefined}
      isConnected={false}
    >
      {/* Agent Avatar with Wave Animation */}
      <WaveAvatar 
        isConnected={false}
        className="mb-12"
      />

      {/* Control Panel */}
      <div className="flex items-center space-x-6">
        {/* Connect Button */}
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          className="px-8 py-3 bg-[#0b3820] hover:bg-[#0b3820] text-[#3fa16d]"
        >
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      </div>
    </RoomLayout>
  );
};
