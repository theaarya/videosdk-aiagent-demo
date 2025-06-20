
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AgentSettings, PROMPTS } from "./types";
import { Separator } from "@/components/ui/separator";

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

      {/* AI Personality Section */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">AI Personality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Select Personality
            </Label>
            <Select
              value={agentSettings.personality}
              onValueChange={(value) => handleSettingChange("personality", value)}
            >
              <SelectTrigger className="bg-[#252A34] border-[#3A3F4A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#252A34] border-[#3A3F4A]">
                {Object.keys(PROMPTS).map((personality) => (
                  <SelectItem
                    key={personality}
                    value={personality}
                    className="text-white hover:bg-[#3A3F4A]"
                  >
                    {personality}
                  </SelectItem>
                ))}
                <SelectItem
                  value="Custom"
                  className="text-white hover:bg-[#3A3F4A]"
                >
                  Custom
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agentSettings.personality === "Custom" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">
                Custom System Prompt
              </Label>
              <Textarea
                placeholder="Enter your custom system prompt..."
                value={agentSettings.customPrompt}
                onChange={(e) => handleSettingChange("customPrompt", e.target.value)}
                className="bg-[#252A34] border-[#3A3F4A] text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Configuration Section */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">Pipeline Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Pipeline Type</Label>
            <Select
              value={agentSettings.pipelineType}
              onValueChange={(value) => handleSettingChange("pipelineType", value)}
            >
              <SelectTrigger className="bg-[#252A34] border-[#3A3F4A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#252A34] border-[#3A3F4A]">
                <SelectItem value="openai" className="text-white hover:bg-[#3A3F4A]">
                  OpenAI
                </SelectItem>
                <SelectItem value="google" className="text-white hover:bg-[#3A3F4A]">
                  Google
                </SelectItem>
                <SelectItem value="aws" className="text-white hover:bg-[#3A3F4A]">
                  AWS
                </SelectItem>
                <SelectItem value="cascading" className="text-white hover:bg-[#3A3F4A]">
                  Cascading
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agentSettings.pipelineType === "cascading" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">LLM Provider</Label>
                <Select
                  value={agentSettings.llm}
                  onValueChange={(value) => handleSettingChange("llm", value)}
                >
                  <SelectTrigger className="bg-[#252A34] border-[#3A3F4A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252A34] border-[#3A3F4A]">
                    <SelectItem value="openai" className="text-white hover:bg-[#3A3F4A]">
                      OpenAI
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Speech-to-Text</Label>
                <Select
                  value={agentSettings.stt}
                  onValueChange={(value) => handleSettingChange("stt", value)}
                >
                  <SelectTrigger className="bg-[#252A34] border-[#3A3F4A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252A34] border-[#3A3F4A]">
                    <SelectItem value="deepgram" className="text-white hover:bg-[#3A3F4A]">
                      Deepgram
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Text-to-Speech</Label>
                <Select
                  value={agentSettings.tts}
                  onValueChange={(value) => handleSettingChange("tts", value)}
                >
                  <SelectTrigger className="bg-[#252A34] border-[#3A3F4A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252A34] border-[#3A3F4A]">
                    <SelectItem value="elevenlabs" className="text-white hover:bg-[#3A3F4A]">
                      ElevenLabs
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MCP Server Connection Section */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">MCP Server Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              MCP Server URL (Optional)
            </Label>
            <Input
              type="url"
              placeholder="wss://your-mcp-server.com/ws"
              value={agentSettings.mcpUrl}
              onChange={(e) => handleSettingChange("mcpUrl", e.target.value)}
              className="bg-[#252A34] border-[#3A3F4A] text-white placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
