

import { AgentSettings } from "./agent-meeting/types";

const RightHeaderBar = ({
  agentSettings,
}: {
  agentSettings: AgentSettings;
}) => {
  return (
    <div className="bg-[#1F1F1F] text-white px-6 py-3 flex items-center justify-center border-b-[1px] border-[#252A34]">
      <h1 className="text-lg font-medium">{agentSettings.personality}</h1>
    </div>
  );
};

export default RightHeaderBar;

