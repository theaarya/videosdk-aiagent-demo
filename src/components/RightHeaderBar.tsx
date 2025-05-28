
import ShareIcon from "./icons/ShareIcon";
import CodeIcon from "./icons/CodeIcon";
import RocketIcon from "./icons/RocketIcon";
import { AgentSettings } from "./agent-meeting/types";

const RightHeaderBar = ({
  agentSettings,
}: {
  agentSettings: AgentSettings;
}) => {
  return (
    <div className="bg-[#1F1F1F] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b-[1px] border-[#252A34]">
      <h1 className="text-base sm:text-lg font-medium truncate flex-1 mr-4">{agentSettings.model}</h1>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Hide Share and View Code buttons on very small screens */}
        <button className="hidden sm:flex text-white text-[14px] bg-[#31353B] hover:bg-gray-800 items-center gap-2 px-3 py-2 rounded-[45px] text-sm font-medium transition-colors">
          <ShareIcon className="h-[12px]" />
          <span className="hidden md:inline">Share</span>
        </button>

        <button className="hidden sm:flex text-white bg-[#31353B] hover:bg-gray-800 items-center gap-2 px-3 py-2 rounded-[45px] text-sm font-medium transition-colors">
          <CodeIcon className="h-[12px]" />
          <span className="hidden md:inline">View Code</span>
        </button>

        <button className="bg-[#5568FE] text-[14px] hover:bg-blue-700 text-white flex items-center gap-2 px-3 py-2 rounded-[45px] text-sm font-medium transition-colors whitespace-nowrap">
          <RocketIcon className="h-[12px]" />
          <span className="hidden xs:inline">Start Building</span>
          <span className="xs:hidden">Build</span>
        </button>
      </div>
    </div>
  );
};

export default RightHeaderBar;
