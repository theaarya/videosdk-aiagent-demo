import React, { useState, useEffect } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi, WifiOff, Activity, Clock, Package, AlertTriangle, User, Bot, BarChart3 } from "lucide-react";
import { LatencyCharts } from "./LatencyCharts";

interface NetworkStatsProps {
  participantId: string;
  agentParticipantId?: string;
  isVisible: boolean;
}

interface AudioStats {
  jitter?: number;
  bitrate?: number;
  totalPackets?: number;
  packetsLost?: number;
  rtt?: number;
  codec?: string;
  network?: string;
}

interface NetworkDataPoint {
  timestamp: string;
  rtt: number;
  jitter: number;
  packetLoss: number;
  bitrate: number;
}

interface ParticipantStats {
  stats: AudioStats;
  isAvailable: boolean;
  historicalData: NetworkDataPoint[];
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  participantId,
  agentParticipantId,
  isVisible,
}) => {
  const [userStats, setUserStats] = useState<ParticipantStats>({
    stats: {},
    isAvailable: false,
    historicalData: [],
  });
  const [agentStats, setAgentStats] = useState<ParticipantStats>({
    stats: {},
    isAvailable: false,
    historicalData: [],
  });
  const [activeView, setActiveView] = useState<'metrics' | 'charts'>('metrics');

  const { getAudioStats: getUserAudioStats } = useParticipant(participantId);
  const { getAudioStats: getAgentAudioStats } = useParticipant(agentParticipantId || "");

  const MAX_DATA_POINTS = 30; // Keep last 30 data points (1 minute of data at 2s intervals)

  const updateParticipantStats = async (
    getStatsFunction: any,
    setStatsFunction: React.Dispatch<React.SetStateAction<ParticipantStats>>,
    participantType: string
  ) => {
    if (!getStatsFunction) {
      setStatsFunction(prev => ({ ...prev, stats: {}, isAvailable: false }));
      return;
    }

    try {
      const statsPromise = getStatsFunction();
      console.log(`${participantType} stats promise:`, statsPromise);
      
      const statsArray = await statsPromise;
      console.log(`${participantType} stats array:`, statsArray);
      
      if (statsArray && statsArray.length > 0) {
        const stats = statsArray[0];
        const newStats = {
          jitter: stats.jitter,
          bitrate: stats.bitrate,
          totalPackets: stats.totalPackets,
          packetsLost: stats.packetsLost,
          rtt: stats.rtt,
          codec: stats.codec,
          network: stats.network
        };

        // Create new data point for historical tracking
        const timestamp = new Date().toISOString();
        const packetLossRate = stats.totalPackets && stats.packetsLost 
          ? (stats.packetsLost / stats.totalPackets) * 100 
          : 0;
        
        const newDataPoint: NetworkDataPoint = {
          timestamp,
          rtt: stats.rtt || 0,
          jitter: stats.jitter || 0,
          packetLoss: packetLossRate,
          bitrate: stats.bitrate ? Math.round(stats.bitrate / 1000) : 0, // Convert to kbps
        };

        setStatsFunction(prev => ({
          stats: newStats,
          isAvailable: true,
          historicalData: [...prev.historicalData, newDataPoint].slice(-MAX_DATA_POINTS)
        }));
      } else {
        setStatsFunction(prev => ({ ...prev, stats: {}, isAvailable: false }));
      }
    } catch (error) {
      console.error(`Error getting ${participantType} stats:`, error);
      setStatsFunction(prev => ({ ...prev, stats: {}, isAvailable: false }));
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = async () => {
      // Update user stats
      await updateParticipantStats(getUserAudioStats, setUserStats, "User");
      
      // Update agent stats if agent participant exists
      if (agentParticipantId && getAgentAudioStats) {
        await updateParticipantStats(getAgentAudioStats, setAgentStats, "Agent");
      }
    };

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Initial call

    return () => clearInterval(interval);
  }, [isVisible, getUserAudioStats, getAgentAudioStats, agentParticipantId]);

  if (!isVisible) return null;

  const getQualityStatus = (stats: AudioStats, isAvailable: boolean) => {
    if (!isAvailable) return { status: "unknown", color: "gray" };
    
    const { rtt = 0, packetsLost = 0, totalPackets = 1 } = stats;
    const packetLossRate = (packetsLost / totalPackets) * 100;

    if (rtt > 300 || packetLossRate > 5) {
      return { status: "poor", color: "red" };
    } else if (rtt > 150 || packetLossRate > 2) {
      return { status: "fair", color: "yellow" };
    } else {
      return { status: "good", color: "green" };
    }
  };

  const renderStatsContent = (participantStats: ParticipantStats, participantType: string) => {
    const { stats, isAvailable } = participantStats;
    const { status, color } = getQualityStatus(stats, isAvailable);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-400">{participantType} Connection</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              color === 'green' ? 'border-green-500 text-green-500' :
              color === 'yellow' ? 'border-yellow-500 text-yellow-500' :
              color === 'red' ? 'border-red-500 text-red-500' :
              'border-gray-500 text-gray-500'
            }`}
          >
            {status.toUpperCase()}
          </Badge>
        </div>

        {!isAvailable ? (
          <div className="text-center text-gray-400 py-4">
            <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for audio stats...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-gray-400">RTT</div>
                <div className="font-mono">
                  {stats.rtt ? `${stats.rtt}ms` : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-gray-400">Jitter</div>
                <div className="font-mono">
                  {stats.jitter ? `${stats.jitter.toFixed(2)}ms` : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-gray-400">Packets</div>
                <div className="font-mono">
                  {stats.totalPackets || "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-gray-400">Lost</div>
                <div className="font-mono">
                  {stats.packetsLost || 0}
                  {stats.totalPackets && stats.packetsLost ? 
                    ` (${((stats.packetsLost / stats.totalPackets) * 100).toFixed(1)}%)` 
                    : ""
                  }
                </div>
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Bitrate: {stats.bitrate ? `${Math.round(stats.bitrate / 1000)}kbps` : "N/A"}</span>
                <span>Codec: {stats.codec || "N/A"}</span>
              </div>
              {stats.network && (
                <div className="text-xs text-gray-400 mt-1">
                  Network: {stats.network}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChartsContent = (participantStats: ParticipantStats, participantType: string) => {
    return (
      <LatencyCharts 
        data={participantStats.historicalData} 
        participantType={participantType}
      />
    );
  };

  const hasAgentStats = agentParticipantId && agentStats.isAvailable;

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Network Stats
          </CardTitle>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveView('metrics')}
              className={`p-1.5 rounded text-xs transition-colors ${
                activeView === 'metrics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('charts')}
              className={`p-1.5 rounded text-xs transition-colors ${
                activeView === 'charts' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasAgentStats ? (
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-4">
              <TabsTrigger value="user" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
                <User className="w-4 h-4" />
                Your Stats
              </TabsTrigger>
              <TabsTrigger value="agent" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
                <Bot className="w-4 h-4" />
                Agent Stats
              </TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="mt-0">
              {activeView === 'metrics' 
                ? renderStatsContent(userStats, "User")
                : renderChartsContent(userStats, "User")
              }
            </TabsContent>
            <TabsContent value="agent" className="mt-0">
              {activeView === 'metrics' 
                ? renderStatsContent(agentStats, "Agent")
                : renderChartsContent(agentStats, "Agent")
              }
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            {activeView === 'metrics' 
              ? renderStatsContent(userStats, "User")
              : renderChartsContent(userStats, "User")
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};
