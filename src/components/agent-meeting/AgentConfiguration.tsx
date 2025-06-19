
import React, { useState } from "react";
import { AgentSettings, PERSONALITY_OPTIONS, PROMPTS, PIPELINE_TYPES, STT_OPTIONS, TTS_OPTIONS, LLM_OPTIONS } from "./types";
import { ChevronRight, ArrowLeft, Settings, Mic, RotateCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AgentConfigurationProps {
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agentSettings,
  onSettingsChange,
}) => {
  const [personalityDropdownOpen, setPersonalityDropdownOpen] = useState(false);
  const [pipelineDropdownOpen, setPipelineDropdownOpen] = useState(false);
  const [sttDropdownOpen, setSttDropdownOpen] = useState(false);
  const [ttsDropdownOpen, setTtsDropdownOpen] = useState(false);
  const [llmDropdownOpen, setLlmDropdownOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
    setPersonalityDropdownOpen(false);
    onSettingsChange?.({ ...agentSettings, personality });
  };

  const handleBackToPersonality = () => {
    setSelectedPersonality(null);
  };

  // Check if cascading pipeline is selected
  const isCascadingPipeline = agentSettings.pipelineType === "cascading";

  if (selectedPersonality) {
    return (
      <div className="bg-[#161616] h-full border-r-[1px] border-[#252A34] lg:border-r lg:border-0">
        {/* Header Section */}
        <div className="bg-[#1F1F1F] text-white px-6 py-3 flex items-center justify-between py-4 border-b-[1px] border-[#252A34]">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBackToPersonality}
              className="p-1 hover:bg-[#252A34] rounded"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-lg font-medium">{selectedPersonality} Prompt</h1>
          </div>
        </div>

        <div className="px-4 py-6 h-full overflow-y-auto">
          <div className="bg-[#1F1F1F] border border-[#232323] rounded-lg p-4">
            <pre className="text-white text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {PROMPTS[selectedPersonality as keyof typeof PROMPTS]}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161616] h-full border-r-[1px] border-[#252A34] lg:border-r lg:border-0">
      {/* Header Section - matching RightHeaderBar height exactly */}
      <div className="bg-[#1F1F1F] text-white px-6 py-3 flex items-center justify-between py-4 border-b-[1px] border-[#252A34]">
        <h1 className="text-lg font-medium">Agent Configuration</h1>
      </div>

      <div className="px-4 py-6 flex flex-col gap-4 h-full overflow-y-auto">
        {/* Pipeline Type Dropdown */}
        <div className="mb-4 relative">
          <div
            className="flex items-center justify-between cursor-pointer select-none h-[34px] text-sm w-full"
            onClick={() => setPipelineDropdownOpen((v) => !v)}
          >
            <span className="text-sm font-semibold text-white">Pipeline</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-white font-medium">
                {agentSettings.pipelineType}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-white transition-transform ${
                  pipelineDropdownOpen ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
          {pipelineDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 z-10 bg-[#1F1F1F] rounded-xl shadow-lg border border-[#232323] py-2 max-h-40 overflow-y-auto animate-fade-in">
              {PIPELINE_TYPES.map((pipelineType) => (
                <div
                  key={pipelineType}
                  className={`px-4 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center text-white ${
                    agentSettings.pipelineType === pipelineType
                      ? "bg-blue-600 text-white"
                      : "hover:bg-[#232323] text-white"
                  }`}
                  onClick={() => {
                    setPipelineDropdownOpen(false);
                    onSettingsChange?.({ ...agentSettings, pipelineType });
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{pipelineType}</span>
                    {pipelineType === "cascading" && (
                      <span className="text-xs text-gray-400 mt-1">
                        Configure TTS, STT & LLM providers
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cascading Pipeline Configuration */}
        {isCascadingPipeline && (
          <div className="mb-6 bg-[#1F1F1F] border border-[#232323] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Cascading Pipeline Configuration</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Configure the providers for each component of your conversational AI pipeline
            </p>
            
            <div className="space-y-4">
              {/* Speech-to-Text Provider */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Speech-to-Text Provider
                </label>
                <div
                  className="flex items-center justify-between cursor-pointer select-none h-[36px] bg-[#161616] border border-[#232323] rounded-lg px-3 hover:border-[#404040] transition-colors"
                  onClick={() => setSttDropdownOpen((v) => !v)}
                >
                  <span className="text-sm text-white font-medium">
                    {agentSettings.stt}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      sttDropdownOpen ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {sttDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 z-20 bg-[#1F1F1F] rounded-lg shadow-lg border border-[#232323] py-2 animate-fade-in">
                    {STT_OPTIONS.map((stt) => (
                      <div
                        key={stt}
                        className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center text-white ${
                          agentSettings.stt === stt
                            ? "bg-blue-600 text-white"
                            : "hover:bg-[#232323] text-white"
                        }`}
                        onClick={() => {
                          setSttDropdownOpen(false);
                          onSettingsChange?.({ ...agentSettings, stt });
                        }}
                      >
                        <span className="font-medium">{stt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Model Provider */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Language Model Provider
                </label>
                <div
                  className="flex items-center justify-between cursor-pointer select-none h-[36px] bg-[#161616] border border-[#232323] rounded-lg px-3 hover:border-[#404040] transition-colors"
                  onClick={() => setLlmDropdownOpen((v) => !v)}
                >
                  <span className="text-sm text-white font-medium">
                    {agentSettings.llm}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      llmDropdownOpen ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {llmDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 z-20 bg-[#1F1F1F] rounded-lg shadow-lg border border-[#232323] py-2 animate-fade-in">
                    {LLM_OPTIONS.map((llm) => (
                      <div
                        key={llm}
                        className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center text-white ${
                          agentSettings.llm === llm
                            ? "bg-blue-600 text-white"
                            : "hover:bg-[#232323] text-white"
                        }`}
                        onClick={() => {
                          setLlmDropdownOpen(false);
                          onSettingsChange?.({ ...agentSettings, llm });
                        }}
                      >
                        <span className="font-medium">{llm}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Text-to-Speech Provider */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Text-to-Speech Provider
                </label>
                <div
                  className="flex items-center justify-between cursor-pointer select-none h-[36px] bg-[#161616] border border-[#232323] rounded-lg px-3 hover:border-[#404040] transition-colors"
                  onClick={() => setTtsDropdownOpen((v) => !v)}
                >
                  <span className="text-sm text-white font-medium">
                    {agentSettings.tts}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      ttsDropdownOpen ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {ttsDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 z-20 bg-[#1F1F1F] rounded-lg shadow-lg border border-[#232323] py-2 animate-fade-in">
                    {TTS_OPTIONS.map((tts) => (
                      <div
                        key={tts}
                        className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center text-white ${
                          agentSettings.tts === tts
                            ? "bg-blue-600 text-white"
                            : "hover:bg-[#232323] text-white"
                        }`}
                        onClick={() => {
                          setTtsDropdownOpen(false);
                          onSettingsChange?.({ ...agentSettings, tts });
                        }}
                      >
                        <span className="font-medium">{tts}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detection Features Section */}
              <div className="mt-6 pt-4 border-t border-[#232323]">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-semibold text-white">Detection Features</h4>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Advanced audio processing capabilities for better conversation flow
                </p>

                {/* Voice Activity Detection */}
                <div className="mb-3 p-3 bg-[#161616] border border-[#232323] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-3 h-3 text-emerald-400" />
                      <div>
                        <span className="text-xs font-medium text-white">Voice Activity Detection</span>
                        <p className="text-xs text-gray-400 mt-1">Detects when speech is present in audio</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        agentSettings.detection 
                          ? "bg-emerald-900 text-emerald-200 border border-emerald-700" 
                          : "bg-gray-800 text-gray-400 border border-gray-600"
                      }`}>
                        {agentSettings.detection ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Turn Detection */}
                <div className="mb-4 p-3 bg-[#161616] border border-[#232323] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-3 h-3 text-blue-400" />
                      <div>
                        <span className="text-xs font-medium text-white">Turn Detection</span>
                        <p className="text-xs text-gray-400 mt-1">Identifies when to switch between speakers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        agentSettings.detection 
                          ? "bg-blue-900 text-blue-200 border border-blue-700" 
                          : "bg-gray-800 text-gray-400 border border-gray-600"
                      }`}>
                        {agentSettings.detection ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Master Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Enable Detection Features
                    </label>
                    <p className="text-xs text-gray-400">
                      Master control for VAD and Turn Detection
                    </p>
                  </div>
                  <Switch
                    checked={agentSettings.detection}
                    onCheckedChange={(checked) => {
                      onSettingsChange?.({ ...agentSettings, detection: checked });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personality Dropdown */}
        <div className="mb-6 relative">
          <div
            className="flex items-center justify-between cursor-pointer select-none h-[34px] text-sm w-full"
            onClick={() => setPersonalityDropdownOpen((v) => !v)}
          >
            <span className="text-sm font-semibold text-white">Personality</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-white font-medium">
                {agentSettings.personality}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-white transition-transform ${
                  personalityDropdownOpen ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
          {personalityDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 z-10 bg-[#1F1F1F] rounded-xl shadow-lg border border-[#232323] py-2 max-h-40 overflow-y-auto animate-fade-in">
              {PERSONALITY_OPTIONS.map((personality) => (
                <div
                  key={personality}
                  className={`px-4 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center text-white ${
                    agentSettings.personality === personality
                      ? "bg-blue-600 text-white"
                      : "hover:bg-[#232323] text-white"
                  }`}
                  onClick={() => handlePersonalitySelect(personality)}
                >
                  {personality}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
