
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AgentSettings, PROMPTS } from "./types";

interface PersonalitySectionProps {
  agentSettings: AgentSettings;
  onSettingChange: (field: keyof AgentSettings, value: any) => void;
}

export const PersonalitySection: React.FC<PersonalitySectionProps> = ({
  agentSettings,
  onSettingChange,
}) => {
  return (
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
            onValueChange={(value) => onSettingChange("personality", value)}
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
              onChange={(e) => onSettingChange("customPrompt", e.target.value)}
              className="bg-[#252A34] border-[#3A3F4A] text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
