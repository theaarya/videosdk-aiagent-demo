import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentSettings } from "./types";

interface PipelineSectionProps {
  agentSettings: AgentSettings;
  onSettingChange: (field: keyof AgentSettings, value: any) => void;
}

export const PipelineSection: React.FC<PipelineSectionProps> = ({
  agentSettings,
  onSettingChange
}) => {
  return (
    <div className="space-y-6">
      {/* Speech to text */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-300">Speech to text</Label>
        <Select value={agentSettings.stt} onValueChange={value => onSettingChange("stt", value)}>
          <SelectTrigger className="bg-[#393939] border-[#38BDF8]/30 text-white rounded-lg h-12 focus:border-[#38BDF8]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#393939] border-[#38BDF8]/30 rounded-lg z-50">
            <SelectItem value="deepgram" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              Deepgram
            </SelectItem>
            <SelectItem value="openai" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              OpenAI
            </SelectItem>
            <SelectItem value="sarvam" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              Sarvam
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text to speech */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-300">Text to speech</Label>
        <Select value={agentSettings.tts} onValueChange={value => onSettingChange("tts", value)}>
          <SelectTrigger className="bg-[#393939] border-[#38BDF8]/30 text-white rounded-lg h-12 focus:border-[#38BDF8]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#393939] border-[#38BDF8]/30 rounded-lg z-50">
            <SelectItem value="openai" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              OpenAI
            </SelectItem>
            <SelectItem value="elevenlabs" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              ElevenLabs
            </SelectItem>
            <SelectItem value="sarvam" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              Sarvam
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LLM provider */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-300">LLM provider</Label>
        <Select value={agentSettings.llm} onValueChange={value => onSettingChange("llm", value)}>
          <SelectTrigger className="bg-[#393939] border-[#38BDF8]/30 text-white rounded-lg h-12 focus:border-[#38BDF8]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#393939] border-[#38BDF8]/30 rounded-lg z-50">
            <SelectItem value="google" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              Gemini
            </SelectItem>
            <SelectItem value="openai" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              OpenAI GPT
            </SelectItem>
            <SelectItem value="sarvam" className="text-white hover:bg-[#38BDF8]/20 focus:bg-[#38BDF8]/20 cursor-pointer">
              Sarvam AI
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voice activity detection (VAD) */}
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <Label className="text-sm font-medium text-white">Voice activity detection (VAD)</Label>
          <p className="text-sm text-gray-400 mt-1">Using SileroVAD for accurate voice activity detection</p>
        </div>
        <Switch 
          checked={agentSettings.detection} 
          onCheckedChange={checked => onSettingChange("detection", checked)} 
          className="data-[state=checked]:bg-cyan-500"
        />
      </div>

      {/* Turn Detection */}
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <Label className="text-sm font-medium text-white">Turn Detection</Label>
          <p className="text-sm text-gray-400 mt-1">Using custom VideoSDK model for intelligent conversation turn management</p>
        </div>
        <Switch 
          checked={agentSettings.detection} 
          onCheckedChange={checked => onSettingChange("detection", checked)} 
          className="data-[state=checked]:bg-cyan-500"
        />
      </div>
    </div>
  );
};