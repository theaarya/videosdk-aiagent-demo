
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { AgentSettings } from "./types";
import { AVAILABLE_MODELS } from "./types";
import { ChevronRight } from "lucide-react";

interface AgentConfigurationProps {
  agentSettings: AgentSettings;
  onSettingsChange?: (settings: AgentSettings) => void;
}

export const AgentConfiguration: React.FC<AgentConfigurationProps> = ({
  agentSettings,
  onSettingsChange,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <div className="bg-[#161616] h-full border-r-[1px] border-[#252A34]">
      {/* Header Section - matching RightHeaderBar height */}
      <div className="flex bg-[#1F1F1F] border-b-[1px] border-[#252A34]">
        <div className="px-6 py-3">
          <div className="font-semibold text-base">Agent Configuration</div>
        </div>
      </div>

      <div className="px-4 py-6 flex flex-col gap-4">
        {/* Model Dropdown */}
        <div className="mb-4 relative h-[34px]">
          <div
            className="flex items-center justify-between cursor-pointer select-none h-[34px] text-sm"
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
            <div className="absolute left-0 mt-2 z-10 bg-[#1F1F1F] rounded-xl shadow-lg border border-[#232323] py-2 max-h-40 overflow-y-auto animate-fade-in">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model}
                  className={`px-4 py-2 text-sm cursor-pointer rounded-lg transition-colors flex items-center text-white ${
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
          )}
        </div>

        {/* Voice */}
        <div className="mb-2 flex items-center justify-between cursor-pointer select-none h-[34px] text-sm">
          <span className=" font-semibold text-white text-sm">Voice</span>
          <div className="flex items-center gap-1">
            <span className="text-white font-medium text-sm">Default</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Personality */}
        <div className="mb-6 flex items-center justify-between cursor-pointer select-none h-[34px] text-sm">
          <span className="text-sm font-semibold text-white">Personality</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-white font-medium">Default</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-2 h-[36px]">
              <span className="text-white text-sm">Temperature</span>
              <span className="bg-[#1F1F1F] h-[36px] flex items-center justify-center text-white text-xs font-semibold rounded-lg px-3 py-1 min-w-[40px] text-center border border-[#232323]">
                {agentSettings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[agentSettings.temperature]}
              onValueChange={(value) =>
                onSettingsChange?.({
                  ...agentSettings,
                  temperature: value[0],
                })
              }
              max={1}
              min={0}
              step={0.1}
              className="accent-blue-500"
            />
          </div>
          {/* Top_P */}
          <div>
            <div className="flex items-center justify-between mb-2 h-[36px]">
              <span className="text-white text-sm">Top_P</span>
              <span className="bg-[#1F1F1F] h-[36px] flex items-center justify-center text-white text-xs font-semibold rounded-lg px-3 py-1 min-w-[40px] text-center border border-[#232323]">
                {agentSettings.topP.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[agentSettings.topP]}
              onValueChange={(value) =>
                onSettingsChange?.({
                  ...agentSettings,
                  topP: value[0],
                })
              }
              max={1}
              min={0}
              step={0.1}
              className="accent-blue-500"
            />
          </div>
          {/* Top_K */}
          <div>
            <div className="flex items-center justify-between mb-2 h-[36px]">
              <span className=" text-white text-sm">Top_K</span>
              <span className="bg-[#1F1F1F] h-[36px] flex items-center justify-center border border-[#232323] text-white text-xs font-semibold rounded-lg px-3 py-1 min-w-[40px] text-center">
                {agentSettings.topK.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[agentSettings.topK]}
              onValueChange={(value) =>
                onSettingsChange?.({
                  ...agentSettings,
                  topK: value[0],
                })
              }
              max={1}
              min={0}
              step={0.1}
              className="accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
