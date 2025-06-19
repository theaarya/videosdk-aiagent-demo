
import React from "react";
import { AgentSettings } from "../agent-meeting/types";
import { AgentConfiguration } from "../agent-meeting/AgentConfiguration";
import { ResponsiveAgentConfig } from "./ResponsiveAgentConfig";
import RightHeaderBar from "../RightHeaderBar";
import { TranscriptionChat } from "../agent-meeting/TranscriptionChat";

interface RoomLayoutProps {
  children: React.ReactNode;
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
  participants?: Map<string, any>;
  localParticipantId?: string;
  isConnected?: boolean;
}

export const RoomLayout: React.FC<RoomLayoutProps> = ({
  children,
  agentSettings,
  onSettingsChange,
  participants = new Map(),
  localParticipantId,
  isConnected = false,
}) => {
  return (
    <div className="h-screen w-full text-white flex flex-col overflow-hidden">
      {/* Content Section - Fixed height container */}
      <div className="flex flex-1 justify-center overflow-hidden">
        <div className="w-full max-w-7xl flex h-full">
          {/* Desktop Agent Configuration - Fixed width, scrollable content */}
          <div className="hidden lg:block w-[400px] bg-[#161616] overflow-hidden">
            <div className="h-full overflow-y-auto">
              <AgentConfiguration
                agentSettings={agentSettings}
                onSettingsChange={onSettingsChange}
              />
            </div>
          </div>

          {/* Center Panel - Meeting Interface */}
          <div className="flex-1 flex flex-col bg-[#161616] overflow-hidden">
            {/* Header Section - Fixed */}
            <div className="flex bg-[#1F1F1F] flex-shrink-0">
              <div className="flex-1">
                <RightHeaderBar agentSettings={agentSettings} />
              </div>
            </div>
            {/* Main Content - Scrollable */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
              {children}
            </div>
          </div>

          {/* Right Panel - Transcription Chat - Fixed width and height */}
          <div className="hidden lg:block w-[400px] bg-[#0F0F0F] border-l border-[#252A34] overflow-hidden">
            <TranscriptionChat
              participants={participants}
              localParticipantId={localParticipantId}
              isConnected={isConnected}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Responsive Agent Configuration */}
      <div className="lg:hidden">
        <ResponsiveAgentConfig
          agentSettings={agentSettings}
          onSettingsChange={onSettingsChange}
        />
      </div>
    </div>
  );
};
