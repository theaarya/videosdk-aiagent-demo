
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
import { AgentSettings } from "./types";

interface PipelineSectionProps {
  agentSettings: AgentSettings;
  onSettingChange: (field: keyof AgentSettings, value: any) => void;
}

export const PipelineSection: React.FC<PipelineSectionProps> = ({
  agentSettings,
  onSettingChange,
}) => {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white">Pipeline Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-300">Pipeline Type</Label>
          <Select
            value={agentSettings.pipelineType}
            onValueChange={(value) => onSettingChange("pipelineType", value)}
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
                onValueChange={(value) => onSettingChange("llm", value)}
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
                onValueChange={(value) => onSettingChange("stt", value)}
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
                onValueChange={(value) => onSettingChange("tts", value)}
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
  );
};
