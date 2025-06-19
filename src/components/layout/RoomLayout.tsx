
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
    <div className="min-h-screen text-white flex flex-col">
      {/* Content Section - Responsive container */}
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-7xl flex">
          {/* Desktop Agent Configuration - Hidden on mobile/tablet */}
          <div className="hidden lg:block w-[400px] bg-[#161616]">
            <AgentConfiguration
              agentSettings={agentSettings}
              onSettingsChange={onSettingsChange}
            />
          </div>

          {/* Center Panel - Meeting Interface */}
          <div className="flex-1 flex flex-col bg-[#161616]">
            {/* Header Section */}
            <div className="flex bg-[#1F1F1F]">
              <div className="flex-1">
                <RightHeaderBar agentSettings={agentSettings} />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {children}
            </div>
          </div>

          {/* Right Panel - Transcription Chat - Always visible */}
          <div className="hidden lg:block w-[400px] bg-[#0F0F0F] border-l border-[#252A34]">
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
