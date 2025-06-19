
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EndpointToggleProps {
  useTestEndpoint: boolean;
  onToggle: (useTest: boolean) => void;
}

export const EndpointToggle: React.FC<EndpointToggleProps> = ({
  useTestEndpoint,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-gray-50">
      <div className="space-y-1">
        <Label htmlFor="endpoint-toggle" className="text-sm font-medium">
          API Endpoint
        </Label>
        <p className="text-xs text-gray-600">
          {useTestEndpoint 
            ? "Using test endpoint (ngrok)" 
            : "Using production endpoint"
          }
        </p>
      </div>
      <Switch
        id="endpoint-toggle"
        checked={useTestEndpoint}
        onCheckedChange={onToggle}
      />
    </div>
  );
};
