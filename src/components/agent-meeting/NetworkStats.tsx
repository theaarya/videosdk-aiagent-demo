
import React, { useState, useEffect } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Activity, Clock, Package, AlertTriangle } from "lucide-react";

interface NetworkStatsProps {
  participantId: string;
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

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  participantId,
  isVisible,
}) => {
  const [audioStats, setAudioStats] = useState<AudioStats>({});
  const [isStatsAvailable, setIsStatsAvailable] = useState(false);

  const { getAudioStats } = useParticipant(participantId);

  useEffect(() => {
    if (!isVisible || !getAudioStats) return;

    const updateStats = () => {
      try {
        const stats = getAudioStats();
        console.log("Audio stats:", stats);
        
        if (stats) {
          setAudioStats(stats);
          setIsStatsAvailable(true);
        } else {
          setIsStatsAvailable(false);
        }
      } catch (error) {
        console.error("Error getting audio stats:", error);
        setIsStatsAvailable(false);
      }
    };

    // Update stats every 2 seconds
    const interval = setInterval(updateStats, 2000);
    updateStats(); // Initial call

    return () => clearInterval(interval);
  }, [isVisible, getAudioStats]);

  if (!isVisible) return null;

  const getQualityStatus = () => {
    if (!isStatsAvailable) return { status: "unknown", color: "gray" };
    
    const { rtt = 0, packetsLost = 0, totalPackets = 1 } = audioStats;
    const packetLossRate = (packetsLost / totalPackets) * 100;

    if (rtt > 300 || packetLossRate > 5) {
      return { status: "poor", color: "red" };
    } else if (rtt > 150 || packetLossRate > 2) {
      return { status: "fair", color: "yellow" };
    } else {
      return { status: "good", color: "green" };
    }
  };

  const { status, color } = getQualityStatus();

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isStatsAvailable ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          Network Stats
          <Badge 
            variant="outline" 
            className={`ml-auto ${
              color === 'green' ? 'border-green-500 text-green-500' :
              color === 'yellow' ? 'border-yellow-500 text-yellow-500' :
              color === 'red' ? 'border-red-500 text-red-500' :
              'border-gray-500 text-gray-500'
            }`}
          >
            {status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isStatsAvailable ? (
          <div className="text-center text-gray-400 py-4">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for audio stats...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-gray-400">RTT</div>
                <div className="font-mono">
                  {audioStats.rtt ? `${audioStats.rtt}ms` : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-gray-400">Jitter</div>
                <div className="font-mono">
                  {audioStats.jitter ? `${audioStats.jitter.toFixed(2)}ms` : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-gray-400">Packets</div>
                <div className="font-mono">
                  {audioStats.totalPackets || "N/A"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-gray-400">Lost</div>
                <div className="font-mono">
                  {audioStats.packetsLost || 0}
                  {audioStats.totalPackets && audioStats.packetsLost ? 
                    ` (${((audioStats.packetsLost / audioStats.totalPackets) * 100).toFixed(1)}%)` 
                    : ""
                  }
                </div>
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Bitrate: {audioStats.bitrate ? `${Math.round(audioStats.bitrate / 1000)}kbps` : "N/A"}</span>
                <span>Codec: {audioStats.codec || "N/A"}</span>
              </div>
              {audioStats.network && (
                <div className="text-xs text-gray-400 mt-1">
                  Network: {audioStats.network}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
