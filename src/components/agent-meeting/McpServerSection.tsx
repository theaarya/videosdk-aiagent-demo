
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AgentSettings } from "./types";

interface McpServerSectionProps {
  agentSettings: AgentSettings;
  onSettingChange: (field: keyof AgentSettings, value: any) => void;
}

export const McpServerSection: React.FC<McpServerSectionProps> = ({
  agentSettings,
  onSettingChange,
}) => {
  return (
    <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#252A34] border-[#3A3F4A] shadow-2xl overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-sm text-white font-semibold">MCP Server</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 relative">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-300 flex items-center space-x-1">
            <span>Server URL</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-[10px]">Optional</span>
          </Label>
          <div className="relative">
            <Input
              type="url"
              placeholder="https://your-mcp-server.com/mcp"
              value={agentSettings.mcpUrl}
              onChange={(e) => onSettingChange("mcpUrl", e.target.value)}
              className="bg-[#252A34]/80 border-[#3A3F4A] text-white placeholder:text-gray-500 pl-8 h-8 text-xs focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
            />
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
