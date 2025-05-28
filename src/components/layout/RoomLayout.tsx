
import React from "react";
import { AgentSettings } from "../agent-meeting/types";
import { AgentConfiguration } from "../agent-meeting/AgentConfiguration";
import { ResponsiveAgentConfig } from "./ResponsiveAgentConfig";
import RightHeaderBar from "../RightHeaderBar";
import Footer from "../Footer";

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
    <div className="h-screen bg-black flex flex-col">
      {/* Content Section - Responsive container */}
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-7xl flex h-full">
          {/* Desktop Agent Configuration - Hidden on mobile/tablet */}
          <div className="hidden lg:block w-[400px] bg-[#161616]">
            <AgentConfiguration
              agentSettings={agentSettings}
              onSettingsChange={onSettingsChange}
            />
          </div>

          {/* Right Panel - Meeting Interface */}
          <div className="flex-1 flex flex-col bg-[#161616]">
            {/* Header Section */}
            <div className="flex bg-[#1F1F1F]">
              <div className="flex-1">
                <RightHeaderBar agentSettings={agentSettings} />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-white">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Full width */}
      <Footer />

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
