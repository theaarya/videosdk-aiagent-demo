
import { Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentSettings } from "./agent-meeting/types";

const RightHeaderBar = ({
  agentSettings,
}: {
  agentSettings: AgentSettings;
}) => {
  return (
    <div className="bg-[#1F1F1F] text-white px-6 py-3 flex items-center justify-between border-b-[1px] border-[#252A34]">
      <h1 className="text-lg font-medium">{agentSettings.personality}</h1>
      
      <div className="flex items-center space-x-3">
        {/* GitHub Link */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 bg-transparent border-[#393939] text-gray-300 hover:bg-[#25252540] hover:text-white"
          onClick={() => window.open("https://github.com/videosdk-live/agents", "_blank")}
        >
          <Github className="w-4 h-4 mr-2" />
          <span className="text-xs">Open Source</span>
        </Button>

        {/* ProductHunt Link */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 bg-transparent border-[#393939] text-gray-300 hover:bg-[#25252540] hover:text-white"
          onClick={() => window.open("https://www.producthunt.com/products/video-sdk", "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          <span className="text-xs">Upvote</span>
        </Button>
      </div>
    </div>
  );
};

export default RightHeaderBar;

