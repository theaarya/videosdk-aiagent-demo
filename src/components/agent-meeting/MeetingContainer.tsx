
import React from "react";
import { Button } from "@/components/ui/button";
import { AgentSettings } from "./types";
import { RoomLayout } from "../layout/RoomLayout";
import { WaveAvatar } from "./WaveAvatar";
import { AgentConfiguration } from "./AgentConfiguration";

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
    <AgentConfiguration
      agentSettings={agentSettings}
      onSettingsChange={onSettingsChange}
      onConnect={onConnect}
      isConnecting={isConnecting}
    />
  );
};
