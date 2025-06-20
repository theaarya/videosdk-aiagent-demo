
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
    <div className="p-6 space-y-6 bg-[#0F0F0F] text-white max-h-full overflow-y-auto">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Agent Configuration</h2>
        <p className="text-sm text-gray-400">
          Configure your AI agent's behavior and capabilities
        </p>
      </div>

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
  );
};
