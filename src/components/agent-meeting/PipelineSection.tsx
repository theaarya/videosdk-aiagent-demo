
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#252A34] border-[#3A3F4A] shadow-2xl overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 pointer-events-none" />
      
      <CardHeader className="pb-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl text-white font-semibold">Pipeline Configuration</CardTitle>
            <p className="text-sm text-gray-400 mt-1">Configure your AI processing pipeline and providers</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <span>Pipeline Type</span>
            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
          </Label>
          <Select value={agentSettings.pipelineType} onValueChange={value => onSettingChange("pipelineType", value)}>
            <SelectTrigger className="bg-[#252A34]/80 border-[#3A3F4A] text-white hover:bg-[#2A2F3A] transition-all duration-200 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#252A34] border-[#3A3F4A] backdrop-blur-sm z-50">
              <SelectItem value="openai" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>OpenAI</span>
                </div>
              </SelectItem>
              <SelectItem value="google" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Google</span>
                </div>
              </SelectItem>
              <SelectItem value="aws" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>AWS</span>
                </div>
              </SelectItem>
              <SelectItem value="cascading" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Cascading</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {agentSettings.pipelineType === "cascading" && (
          <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            <div className="border-t border-[#3A3F4A] pt-6">
              {/* STT and TTS side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <span>Speech-to-Text</span>
                    <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                  </Label>
                  <Select value={agentSettings.stt} onValueChange={value => onSettingChange("stt", value)}>
                    <SelectTrigger className="bg-[#252A34]/80 border-[#3A3F4A] text-white hover:bg-[#2A2F3A] transition-all duration-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252A34] border-[#3A3F4A] backdrop-blur-sm z-50">
                      <SelectItem value="google" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Google</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="openai" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>OpenAI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sarvam" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Sarvam</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="deepgram" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span>Deepgram</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                    <span>Text-to-Speech</span>
                    <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                  </Label>
                  <Select value={agentSettings.tts} onValueChange={value => onSettingChange("tts", value)}>
                    <SelectTrigger className="bg-[#252A34]/80 border-[#3A3F4A] text-white hover:bg-[#2A2F3A] transition-all duration-200 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#252A34] border-[#3A3F4A] backdrop-blur-sm z-50">
                      <SelectItem value="google" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Google</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="openai" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>OpenAI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sarvam" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span>Sarvam</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="elevenlabs" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span>ElevenLabs</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* LLM Provider below */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                  <span>LLM Provider</span>
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                </Label>
                <Select value={agentSettings.llm} onValueChange={value => onSettingChange("llm", value)}>
                  <SelectTrigger className="bg-[#252A34]/80 border-[#3A3F4A] text-white hover:bg-[#2A2F3A] transition-all duration-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252A34] border-[#3A3F4A] backdrop-blur-sm z-50">
                    <SelectItem value="google" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Google</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="openai" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>OpenAI</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sarvam" className="text-white hover:bg-[#3A3F4A] focus:bg-[#3A3F4A] cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Sarvam</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Detection Settings - Separated VAD and Turn Detection */}
            <div className="border-t border-[#3A3F4A] pt-6">
              <div className="space-y-6">
                {/* VAD Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <span>Voice Activity Detection (VAD)</span>
                        <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      </Label>
                      <p className="text-xs text-gray-500">Using SileroVAD for accurate voice activity detection</p>
                    </div>
                    <Switch 
                      checked={agentSettings.detection} 
                      onCheckedChange={checked => onSettingChange("detection", checked)} 
                      className="data-[state=checked]:bg-cyan-500" 
                    />
                  </div>
                </div>

                {/* Turn Detection Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <span>Turn Detection</span>
                        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      </Label>
                      <p className="text-xs text-gray-500">Using custom VideoSDK model for intelligent conversation turn management</p>
                    </div>
                    <Switch 
                      checked={agentSettings.detection} 
                      onCheckedChange={checked => onSettingChange("detection", checked)} 
                      className="data-[state=checked]:bg-purple-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
