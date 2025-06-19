
import { ChartConfig } from "@/components/ui/chart";

export const networkChartConfig: ChartConfig = {
  rtt: {
    label: "Round Trip Time (RTT)",
    color: "#60A5FA", // Brighter blue for better visibility
  },
  jitter: {
    label: "Network Jitter",
    color: "#C084FC", // Brighter purple for better contrast
  },
  packetLoss: {
    label: "Packet Loss %",
    color: "#F87171", // Bright red for alerts
  },
  bitrate: {
    label: "Bitrate (kbps)",
    color: "#34D399", // Bright green for positive metrics
  },
};
