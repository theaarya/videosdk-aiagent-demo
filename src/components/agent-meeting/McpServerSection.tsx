
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
      
      <CardHeader className="pb-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl text-white font-semibold">MCP Server Connection</CardTitle>
            <p className="text-sm text-gray-400 mt-1">Connect to external MCP servers for extended capabilities</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <span>MCP Server URL</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">Optional</span>
          </Label>
          <div className="relative">
            <Input
              type="url"
              placeholder="https://your-mcp-server.com/mcp"
              value={agentSettings.mcpUrl}
              onChange={(e) => onSettingChange("mcpUrl", e.target.value)}
              className="bg-[#252A34]/80 border-[#3A3F4A] text-white placeholder:text-gray-500 pl-12 h-12 focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center space-x-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Leave empty to use default configuration</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
