
import React, { useState } from "react";
import { AgentSettings, AVAILABLE_MODELS, PERSONALITY_OPTIONS, PROMPTS } from "./types";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface AgentConfigurationProps {
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agentSettings,
  onSettingsChange,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [personalityDropdownOpen, setPersonalityDropdownOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
    setPersonalityDropdownOpen(false);
    onSettingsChange?.({ ...agentSettings, personality });
  };

  const handleBackToPersonality = () => {
    setSelectedPersonality(null);
  };

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
        {/* Model Dropdown - Full Width */}
        <div className="mb-4 relative">
          <div
            className="flex items-center justify-between cursor-pointer select-none h-[34px] text-sm w-full"
            onClick={() => setModelDropdownOpen((v) => !v)}
          >
            <span className="text-sm font-semibold text-white">Model</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-white font-medium">
                {agentSettings.model}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-white transition-transform ${
                  modelDropdownOpen ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
          {modelDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 z-10 bg-[#1F1F1F] rounded-xl shadow-lg border border-[#232323] py-2 max-h-40 overflow-y-auto animate-fade-in">
              {Object.entries(AVAILABLE_MODELS).map(([category, models]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {category}
                  </div>
                  {models.map((model) => (
                    <div
                      key={model}
                      className={`px-4 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center text-white ml-2 ${
                        agentSettings.model === model
                          ? "bg-blue-600 text-white"
                          : "hover:bg-[#232323] text-white"
                      }`}
                      onClick={() => {
                        setModelDropdownOpen(false);
                        onSettingsChange?.({ ...agentSettings, model });
                      }}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personality Dropdown - Full Width */}
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
