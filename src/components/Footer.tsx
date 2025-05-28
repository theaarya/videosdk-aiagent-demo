
import React from "react";
import { Github } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-[#252A34] py-4 px-6">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span>Built with</span>
          <span className="text-red-500">❤️</span>
          <span>On VideoSDK AI Agents</span>
          <a
            href="https://www.github.com/videosdk-community/ai-agent-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>View Source on Github</span>
          </a>
        </div>
        <div className="text-gray-500">
          © 2025 VideoSDK
        </div>
      </div>
    </footer>
  );
};

export default Footer;
