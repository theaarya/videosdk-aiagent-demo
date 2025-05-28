import React from "react";

import { AgentSettings } from "../agent-meeting/types";
import { AgentConfiguration } from "../agent-meeting/AgentConfiguration";
import RightHeaderBar from "../RightHeaderBar";
interface RoomLayoutProps {
  children: React.ReactNode;
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const RoomLayout: React.FC<RoomLayoutProps> = ({
  children,
  agentSettings,
  onSettingsChange,
}) => {
  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Content Section */}
      <div className="flex flex-1">
        <div className="w-[400px] bg-[#161616]">
          <AgentConfiguration
            agentSettings={agentSettings}
            onSettingsChange={onSettingsChange}
          />
        </div>
        {/* Right Panel - Meeting Interface */}
        <div className="flex-1 flex flex-col bg-[#161616]">
          {/* Header Section */}
          <div className="flex w-full bg-[#1F1F1F]">
            <div className="flex-1">
              <RightHeaderBar agentSettings={agentSettings} />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
