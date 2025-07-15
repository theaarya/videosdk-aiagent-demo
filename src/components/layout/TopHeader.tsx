import { Github, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TopHeader = () => {
  return (
    <div className="fixed top-0 right-0 z-50 h-20 flex items-center justify-end pr-6">
      <div className="flex items-center space-x-3">
        {/* GitHub Link */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 bg-[#1A1F23] border-[#393939] text-gray-300 hover:bg-[#25252540] hover:text-white shadow-lg flex items-center mb-4"
          onClick={() => window.open("https://github.com/videosdk-live/agents", "_blank")}
        >
          <Github className="w-4 h-4 mr-2" />
          <span className="text-sm">Open Source</span>
        </Button>

        {/* ProductHunt Link */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 bg-[#1A1F23] border-[#ff6154] text-[#ff6154] hover:bg-[#ff6154]/10 hover:text-[#ff6154] shadow-lg flex items-center"
          onClick={() => window.open("https://www.producthunt.com/products/video-sdk", "_blank")}
        >
          <Trophy className="w-4 h-4 mr-2" />
          <span className="text-sm">Upvote</span>
        </Button>
      </div>
    </div>
  );
};