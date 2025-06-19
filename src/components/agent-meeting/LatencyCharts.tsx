
import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { networkChartConfig } from "./chartConfig";
import { Activity, Clock, Zap } from "lucide-react";

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
      <div className="text-center text-gray-400 py-8">
        <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium mb-1">Collecting latency data...</p>
        <p className="text-xs text-gray-500">Chart will appear once data is available</p>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour12: false,
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-xs mb-2 font-medium">
            {formatTime(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              {entry.dataKey === 'rtt' ? (
                <Clock className="w-3 h-3" style={{ color: entry.color }} />
              ) : (
                <Zap className="w-3 h-3" style={{ color: entry.color }} />
              )}
              <span className="text-xs text-gray-300">
                {entry.dataKey === 'rtt' ? 'Round Trip Time' : 'Network Jitter'}:
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {entry.value}ms
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-100 font-medium">
            Network Latency Over Time
          </CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-400 rounded"></div>
              <span className="text-gray-300">RTT</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-purple-400 rounded"></div>
              <span className="text-gray-300">Jitter</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <ChartContainer config={networkChartConfig} className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                width={35}
                label={{ 
                  value: 'ms', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '10px', fill: '#9CA3AF' }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#6B7280', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone" 
                dataKey="rtt" 
                stroke="#60A5FA"
                strokeWidth={2.5}
                dot={{ fill: '#60A5FA', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 4, fill: '#60A5FA', strokeWidth: 2, stroke: '#1F2937' }}
                connectNulls={false}
                name="RTT"
              />
              <Line 
                type="monotone" 
                dataKey="jitter" 
                stroke="#C084FC"
                strokeWidth={2.5}
                dot={{ fill: '#C084FC', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 4, fill: '#C084FC', strokeWidth: 2, stroke: '#1F2937' }}
                connectNulls={false}
                name="Jitter"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Performance indicators */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Latest readings:</span>
            <div className="flex gap-4">
              <span>RTT: <span className="text-blue-400 font-mono">{data[data.length - 1]?.rtt || 0}ms</span></span>
              <span>Jitter: <span className="text-purple-400 font-mono">{data[data.length - 1]?.jitter?.toFixed(1) || 0}ms</span></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
