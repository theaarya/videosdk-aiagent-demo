
import { ChartConfig } from "@/components/ui/chart";

export const networkChartConfig: ChartConfig = {
  rtt: {
    label: "Round Trip Time",
    color: "hsl(210, 100%, 60%)", // Blue
  },
  jitter: {
    label: "Jitter",
    color: "hsl(280, 100%, 70%)", // Purple
  },
  packetLoss: {
    label: "Packet Loss %",
    color: "hsl(0, 100%, 60%)", // Red
  },
  bitrate: {
    label: "Bitrate (kbps)",
    color: "hsl(120, 100%, 50%)", // Green
  },
};
