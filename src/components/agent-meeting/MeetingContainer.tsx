
import React from "react";
import { Button } from "@/components/ui/button";
import { AgentSettings } from "./types";
import { RoomLayout } from "../layout/RoomLayout";

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
    >
      {/* Agent Avatar */}
      <div className="w-32 h-32 rounded-full mb-8 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700"></div>
      </div>

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
