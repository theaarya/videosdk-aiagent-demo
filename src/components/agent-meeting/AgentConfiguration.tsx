
import React from "react";
import { AgentSettings } from "./types";
import { PersonalitySection } from "./PersonalitySection";
import { PipelineSection } from "./PipelineSection";
import { McpServerSection } from "./McpServerSection";

interface AgentConfigurationProps {
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agentSettings,
  onSettingsChange,
}) => {
  const handleSettingChange = (field: keyof AgentSettings, value: any) => {
    if (onSettingsChange) {
      onSettingsChange({
        ...agentSettings,
        [field]: value,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#161616] text-white">
      <div className="p-6 space-y-6 max-h-full overflow-y-auto">
        {/* Compact Header */}
        <div className="space-y-2 text-center pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Agent Configuration
          </h1>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-5">
          <PersonalitySection 
            agentSettings={agentSettings}
            onSettingChange={handleSettingChange}
          />

          <PipelineSection 
            agentSettings={agentSettings}
            onSettingChange={handleSettingChange}
          />

          <McpServerSection 
            agentSettings={agentSettings}
            onSettingChange={handleSettingChange}
          />
        </div>

        {/* Compact Footer */}
        <div className="pt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Configuration ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
