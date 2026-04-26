import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { 
  useListRooms, 
  useListStationAgents,
  useListAgentTasks 
} from "@workspace/api-client-react";
import { ROLE_COLORS, ROOM_ICONS, AGENT_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pause, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// This is a standalone page for mobile view of a room,
// reusing the detail panel logic from Dashboard
export default function RoomDetail() {
  const params = useParams();
  const roomId = Number(params.id);
  const [, setLocation] = useLocation();

  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // We don't know the stationId from just roomId without a specific endpoint,
  // For a real app we might fetch the room first, then its station agents.
  // Assuming a generic stationId=1 for demo since API shape requires stationId for agents.
  const stationId = 1; 

  const { data: rooms } = useListRooms(stationId);
  const { data: agents } = useListStationAgents(stationId);

  const selectedRoom = rooms?.find(r => r.id === roomId);
  const roomAgents = agents?.filter(a => a.roomId === roomId);
  const selectedAgent = agents?.find(a => a.id === selectedAgentId);

  return (
    <div className="flex flex-col h-full bg-black/20 p-4 overflow-y-auto">
      <AnimatePresence mode="wait">
        {selectedAgent ? (
          <motion.div 
            key="agent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col gap-6"
          >
            <div>
              <button onClick={() => setSelectedAgentId(null)} className="text-xs text-muted-foreground hover:text-white mb-4 flex items-center">
                <ArrowLeft className="w-3 h-3 mr-1" /> BACK TO ROOM
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border", ROLE_COLORS[selectedAgent.role])}>
                  {selectedAgent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">{selectedAgent.name}</h2>
                  <span className="text-xs font-mono text-muted-foreground uppercase">{selectedAgent.role} LVL {selectedAgent.level}</span>
                </div>
              </div>
              <div className={cn("text-xs font-mono py-1 px-2 rounded-md inline-block uppercase mt-2", AGENT_STATUS_COLORS[selectedAgent.status])}>
                {selectedAgent.status}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-muted-foreground">EXPERIENCE</div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-border/50">
                <div className="h-full bg-emerald-500/80" style={{ width: `${selectedAgent.experience % 100}%` }} />
              </div>
            </div>

            {selectedAgent.currentTask && (
              <div>
                <div className="text-xs font-mono text-muted-foreground mb-2">CURRENT TASK</div>
                <div className="p-3 rounded bg-white/5 border border-white/10 text-sm">
                  {selectedAgent.currentTask}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded text-xs font-mono font-bold transition-colors">
                UPGRADE
              </button>
              <button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary py-2 rounded text-xs font-mono font-bold transition-colors border border-primary/30">
                ASSIGN
              </button>
            </div>
          </motion.div>
        ) : selectedRoom ? (
          <motion.div 
            key="room"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col gap-6"
          >
            <div>
              <button onClick={() => setLocation("/")} className="text-xs text-muted-foreground hover:text-white mb-4 flex items-center">
                <ArrowLeft className="w-3 h-3 mr-1" /> BACK TO STATION
              </button>
              <h2 className="font-bold text-xl uppercase">{selectedRoom.name}</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-xs font-mono py-1 px-2 rounded bg-white/10 uppercase">{selectedRoom.type}</span>
                <span className={cn("text-xs font-mono py-1 px-2 rounded uppercase", 
                  selectedRoom.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'
                )}>{selectedRoom.status}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-mono text-muted-foreground mb-3">CREW ({roomAgents?.length || 0})</div>
              <div className="space-y-2">
                {roomAgents?.map(a => (
                  <button 
                    key={a.id} 
                    onClick={() => setSelectedAgentId(a.id)}
                    className="w-full flex items-center gap-3 p-2 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors text-left"
                  >
                    <div className={cn("w-2 h-2 rounded-full", ROLE_COLORS[a.role]?.split(" ")[0].replace("text-", "bg-"))} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{a.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase">{a.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex gap-2">
              <button className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 py-2 rounded text-xs font-mono font-bold transition-colors border border-amber-500/30 flex justify-center items-center gap-2">
                <Pause className="w-3 h-3" /> PAUSE
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono">
            LOADING ROOM DATA...
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
