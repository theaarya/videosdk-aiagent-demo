
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
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white">MCP Server Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-300">
            MCP Server URL (Optional)
          </Label>
          <Input
            type="url"
            placeholder="wss://your-mcp-server.com/ws"
            value={agentSettings.mcpUrl}
            onChange={(e) => onSettingChange("mcpUrl", e.target.value)}
            className="bg-[#252A34] border-[#3A3F4A] text-white placeholder:text-gray-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};
