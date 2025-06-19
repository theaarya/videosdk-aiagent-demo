
import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { networkChartConfig } from "./chartConfig";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

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

export const LatencyCharts: React.FC<LatencyChartsProps> = ({ data, participantType }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Collecting data...</p>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
  };

  const getLatestTrend = (values: number[]) => {
    if (values.length < 2) return null;
    const recent = values.slice(-2);
    return recent[1] > recent[0] ? 'up' : 'down';
  };

  const rttValues = data.map(d => d.rtt).filter(v => v > 0);
  const jitterValues = data.map(d => d.jitter).filter(v => v > 0);
  const rttTrend = getLatestTrend(rttValues);
  const jitterTrend = getLatestTrend(jitterValues);

  return (
    <div className="space-y-4">
      {/* RTT Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between text-gray-200">
            <span>Round Trip Time (ms)</span>
            {rttTrend && (
              rttTrend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-red-400" /> : 
                <TrendingDown className="w-4 h-4 text-green-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ChartContainer config={networkChartConfig} className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis hide />
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
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Jitter Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between text-gray-200">
            <span>Jitter (ms)</span>
            {jitterTrend && (
              jitterTrend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-red-400" /> : 
                <TrendingDown className="w-4 h-4 text-green-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ChartContainer config={networkChartConfig} className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Time: ${formatTime(value)}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="jitter" 
                  stroke={networkChartConfig.jitter.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Combined Packet Loss & Bitrate Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-200">Network Quality</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ChartContainer config={networkChartConfig} className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis hide />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  labelFormatter={(value) => `Time: ${formatTime(value)}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="packetLoss" 
                  stroke={networkChartConfig.packetLoss.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="bitrate" 
                  stroke={networkChartConfig.bitrate.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
