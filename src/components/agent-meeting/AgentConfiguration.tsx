
import React from "react";
import { AgentSettings, PROMPTS, PERSONALITY_OPTIONS } from "./types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineSection } from "./PipelineSection";

interface AgentConfigurationProps {
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
  onConnect?: () => void;
  isConnecting?: boolean;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agentSettings,
  onSettingsChange,
  onConnect,
  isConnecting = false,
}) => {
  const handleSettingChange = (field: keyof AgentSettings, value: any) => {
    if (onSettingsChange) {
      onSettingsChange({
        ...agentSettings,
        [field]: value,
      });
    }
  };

  const systemPrompt = agentSettings.personality === "Custom" 
    ? agentSettings.customPrompt || ""
    : PROMPTS[agentSettings.personality as keyof typeof PROMPTS] || "";

  return (
    <div className="min-h-screen bg-[#121619] text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#252A34] bg-[#1A1F23]">
        <h1 className="text-xl font-semibold text-white">Agent Configuration</h1>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Configuration */}
        <div className="w-96 p-6 space-y-6 overflow-y-auto">
          {/* Use cases */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Use cases</h3>
            <p className="text-xs text-gray-500">Define how your agent communicate and behaves</p>
            
            <div className="grid grid-cols-2 gap-3">
              {["Custom", "Recruiter", "Doctor", "Tutor"].map((personality) => (
                <Button
                  key={personality}
                  variant="outline"
                  className={`h-10 text-sm bg-transparent border-2 transition-all ${
                    agentSettings.personality === personality
                      ? "border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]"
                      : "border-[#25252540] text-gray-300 hover:bg-[#25252540] hover:border-[#38BDF8]/30 hover:text-gray-300"
                  }`}
                  onClick={() => handleSettingChange("personality", personality)}
                >
                  {personality}
                </Button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">System Prompt</h3>
            <Textarea
              value={systemPrompt}
              onChange={(e) => {
                if (agentSettings.personality === "Custom") {
                  handleSettingChange("customPrompt", e.target.value);
                }
              }}
              placeholder="You're a health bot"
              className="min-h-[100px] bg-[#25252540] border-[#38BDF8]/30 text-white placeholder:text-gray-500 resize-none focus:border-[#38BDF8]"
              disabled={agentSettings.personality !== "Custom"}
            />
          </div>

          {/* AI Agent Pipelines */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">AI Agent Pipelines</h3>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`h-10 text-sm bg-transparent border-2 transition-all ${
                  agentSettings.pipelineType === "openai"
                    ? "border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]"
                    : "border-[#25252540] text-gray-300 hover:bg-[#25252540] hover:border-[#38BDF8]/30 hover:text-gray-300"
                }`}
                onClick={() => handleSettingChange("pipelineType", "openai")}
              >
                Real Time
              </Button>
              <Button
                variant="outline"
                className={`h-10 text-sm bg-transparent border-2 transition-all ${
                  agentSettings.pipelineType === "cascading"
                    ? "border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]"
                    : "border-[#25252540] text-gray-300 hover:bg-[#25252540] hover:border-[#38BDF8]/30 hover:text-gray-300"
                }`}
                onClick={() => handleSettingChange("pipelineType", "cascading")}
              >
                Cascading
              </Button>
            </div>
          </div>

          {/* Select Real Time Models - Only show when Real Time is selected */}
          {agentSettings.pipelineType === "openai" && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Select Real Time Models</h3>
               <Select value="gpt-4o-realtime-preview-2024-10-01" onValueChange={() => {}}>
                <SelectTrigger className="bg-[#25252540] border-[#38BDF8]/30 text-white h-10 focus:border-[#38BDF8]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#25252540] border-[#38BDF8]/30">
                  <SelectItem value="gpt-4o-realtime-preview-2024-10-01" className="text-white hover:bg-[#38BDF8]/20">
                    gpt-4o-realtime-preview-2024-10-01
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cascading Pipeline Options - Only show when Cascading is selected */}
          {agentSettings.pipelineType === "cascading" && (
            <div className="space-y-6">
              <PipelineSection 
                agentSettings={agentSettings}
                onSettingChange={handleSettingChange}
              />
            </div>
          )}

          {/* MCP Server */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">MCP Server</h3>
            <Input
              type="url"
              placeholder="https://your-mcp-server.com/mcp"
              value={agentSettings.mcpUrl || ""}
              onChange={(e) => handleSettingChange("mcpUrl", e.target.value)}
              className="bg-[#25252540] border-[#38BDF8]/30 text-white placeholder:text-gray-500 h-10 focus:border-[#38BDF8]"
            />
          </div>
        </div>

        {/* Right Panel - Avatar Selection */}
        <div className="flex-1 p-6 border-l border-[#38BDF8]/30 flex flex-col items-center justify-center">
          <div className="text-center space-y-8">
            <h3 className="text-sm font-medium text-gray-300">Select Avatar Or Voice Agent</h3>
            
            <div className="flex gap-[31px] items-center">
              {/* Voice Agent */}
              <div 
                className={`flex flex-col items-center space-y-3 cursor-pointer p-4 rounded-lg transition-all ${
                  agentSettings.agentType === 'voice' 
                    ? 'border-2 border-[#38BDF8]' 
                    : 'border-2 border-transparent hover:border-[#38BDF8]/30'
                }`}
                onClick={() => handleSettingChange('agentType', 'voice')}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#38BDF8]/70 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#38BDF8]/80 to-[#38BDF8]/50"></div>
                </div>
                <span className="text-sm text-gray-300">Voice Agent</span>
              </div>

              {/* Avatar */}
              <div 
                className={`flex flex-col items-center space-y-3 cursor-pointer p-4 rounded-lg transition-all ${
                  agentSettings.agentType === 'avatar' 
                    ? 'border-2 border-[#38BDF8]' 
                    : 'border-2 border-transparent hover:border-[#38BDF8]/30'
                }`}
                onClick={() => handleSettingChange('agentType', 'avatar')}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-300">Avatar</span>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-32 h-12 bg-transparent border-2 border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/10 rounded-full text-sm font-medium transition-all mt-4"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </div>
    </div>
  );
};
