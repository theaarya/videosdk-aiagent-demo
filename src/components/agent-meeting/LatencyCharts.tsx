
import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { networkChartConfig } from "./chartConfig";
import { Activity } from "lucide-react";

interface NetworkDataPoint {
  timestamp: string;
  rtt: number;
  jitter: number;
  packetLoss: number;
  bitrate: number;
}

interface LatencyChartsProps {
  data: NetworkDataPoint[];
  participantType: string;
}

export const LatencyCharts: React.FC<LatencyChartsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-6">
        <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Collecting latency data...</p>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-200">Latency Trends</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ChartContainer config={networkChartConfig} className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                width={40}
              />
              <Tooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `Time: ${formatTime(value)}`}
              />
              <Line 
                type="monotone" 
                dataKey="rtt" 
                stroke={networkChartConfig.rtt.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="RTT (ms)"
              />
              <Line 
                type="monotone" 
                dataKey="jitter" 
                stroke={networkChartConfig.jitter.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Jitter (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
