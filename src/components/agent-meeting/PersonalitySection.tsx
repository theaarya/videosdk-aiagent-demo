
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
    <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#252A34] border-[#3A3F4A] shadow-2xl overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      
      <CardHeader className="pb-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl text-white font-semibold">AI Personality</CardTitle>
            <p className="text-sm text-gray-400 mt-1">Define how your agent communicates and behaves</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <span>Select Personality</span>
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
          </Label>
          <Select
            value={agentSettings.personality}
            onValueChange={(value) => onSettingChange("personality", value)}
          >
            <SelectTrigger className="bg-[#252A34]/80 border-[#3A3F4A] text-white hover:bg-[#2A2F3A] transition-all duration-200 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#252A34] border-[#3A3F4A] backdrop-blur-sm">
              {Object.keys(PROMPTS).map((personality) => (
                <SelectItem
                  key={personality}
                  value={personality}
                  className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>{personality}</span>
                  </div>
                </SelectItem>
              ))}
              <SelectItem
                value="Custom"
                className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Custom</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {agentSettings.personality === "Custom" && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
            <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
              <span>Custom System Prompt</span>
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            </Label>
            <Textarea
              placeholder="Enter your custom system prompt... Describe how you want your agent to behave, its tone, expertise, and communication style."
              value={agentSettings.customPrompt}
              onChange={(e) => onSettingChange("customPrompt", e.target.value)}
              className="bg-[#252A34]/80 border-[#3A3F4A] text-white placeholder:text-gray-500 min-h-[120px] resize-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
