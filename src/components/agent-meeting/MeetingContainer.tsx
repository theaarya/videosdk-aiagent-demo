
import React from "react";
import { Button } from "@/components/ui/button";
import { AgentSettings } from "./types";
import { RoomLayout } from "../layout/RoomLayout";
import { WaterAnimation } from "./WaterAnimation";

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
      {/* Agent Avatar - Static State */}
      <div className="w-48 h-48 mb-8">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700"></div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex items-center space-x-6">
        {/* Connect Button */}
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isConnecting ? "Connecting..." : "Start Conversation"}
        </Button>
      </div>
    </RoomLayout>
  );
};
