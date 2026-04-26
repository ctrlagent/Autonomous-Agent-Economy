import { useState, useMemo } from "react";
import { 
  useListStations, 
  useListRooms, 
  useListStationAgents, 
  useGetDashboardSummary, 
  useGetRecentActivity,
  useListAgentTasks
} from "@workspace/api-client-react";
import { ROLE_COLORS, ROOM_ICONS, AGENT_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronDown, Play, Pause, Activity, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { data: stations } = useListStations();
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  
  const currentStationId = activeStationId || (stations && stations.length > 0 ? stations[0].id : null);
  const currentStation = stations?.find(s => s.id === currentStationId);

  const { data: rooms } = useListRooms(currentStationId || 0, { query: { enabled: !!currentStationId } });
  const { data: agents } = useListStationAgents(currentStationId || 0, { query: { enabled: !!currentStationId } });
  const { data: activity } = useGetRecentActivity({ limit: 20 });
  const { data: summary } = useGetDashboardSummary();

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  const { data: agentTasks } = useListAgentTasks(selectedAgentId || 0, { query: { enabled: !!selectedAgentId } });

  const selectedRoom = rooms?.find(r => r.id === selectedRoomId);
  const selectedAgent = agents?.find(a => a.id === selectedAgentId);
  const roomAgents = agents?.filter(a => a.roomId === selectedRoomId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Station Selector Strip */}
      <div className="h-10 flex-shrink-0 border-b border-border/30 bg-black/20 flex items-center px-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-sm font-bold text-white/90">
            {currentStation ? currentStation.name : "NO ACTIVE STATION"}
          </span>
          {stations && stations.length > 1 && (
            <select 
              className="bg-transparent text-xs font-mono text-muted-foreground outline-none cursor-pointer hover:text-primary"
              value={currentStationId || ""}
              onChange={(e) => setActiveStationId(Number(e.target.value))}
            >
              {stations.map(s => (
                <option key={s.id} value={s.id} className="bg-background">{s.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* LEFT: ACTIVITY LOG */}
        <div className="w-[220px] flex-shrink-0 border-r border-border/30 flex flex-col bg-black/10">
          <div className="p-3 border-b border-border/30">
            <h2 className="text-[10px] font-mono tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-3 h-3" />
              ACTIVITY LOG
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {activity?.map((item) => (
              <div key={item.id} className="flex gap-2 p-2 rounded bg-white/5 border border-white/5 text-xs font-mono">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", ROLE_COLORS[item.agentRole]?.split(" ")[0].replace("text-", "bg-"))} />
                <div>
                  <div className="text-white/80 font-bold">{item.agentName}</div>
                  <div className="text-muted-foreground leading-tight mt-0.5 line-clamp-2">{item.action}</div>
                  <div className="text-[9px] text-white/30 mt-1">{item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: ROOM GRID */}
        <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-white/90 uppercase">
              SPACE STATION <span className="text-primary">{currentStation?.name}</span>
            </h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
            {rooms?.map((room) => {
              const Icon = ROOM_ICONS[room.type] || Cpu;
              const isSelected = selectedRoomId === room.id;
              const roomAgents = agents?.filter(a => a.roomId === room.id) || [];
              const isActive = room.status === "active";
              const isBusy = room.status === "busy";

              return (
                <motion.button
                  key={room.id}
                  onClick={() => { setSelectedRoomId(room.id); setSelectedAgentId(null); }}
                  className={cn(
                    "relative flex flex-col p-4 rounded-xl border border-border bg-card/40 backdrop-blur text-left transition-all",
                    isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:bg-card/60",
                    isActive && "room-active",
                    isBusy && "room-busy"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-lg", ROLE_COLORS[room.type] || "bg-gray-500/10 text-gray-400")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1">
                        {roomAgents.map(a => (
                          <div key={a.id} className={cn("w-2 h-2 rounded-full", ROLE_COLORS[a.role]?.split(" ")[0].replace("text-", "bg-"))} />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{room.agentCount} AGENTS</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      room.status === "active" ? "bg-cyan-500" :
                      room.status === "busy" ? "bg-amber-500" : "bg-gray-500"
                    )} />
                    <span className="text-xs font-mono text-muted-foreground uppercase">{room.status}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {currentStation && (
            <div className="mt-8 pt-6 border-t border-border/30">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-muted-foreground">STATION PROGRESS</span>
                <span className="text-primary">{currentStation.progress}%</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-border/50">
                <div 
                  className="h-full bg-primary/80 transition-all duration-1000" 
                  style={{ width: `${currentStation.progress}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: DETAIL PANEL */}
        <div className="w-[280px] flex-shrink-0 border-l border-border/30 bg-black/20 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <motion.div 
                key="agent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto"
              >
                <div>
                  <button onClick={() => setSelectedAgentId(null)} className="text-xs text-muted-foreground hover:text-white mb-4 flex items-center">
                    ← BACK TO ROOM
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
                className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto"
              >
                <div>
                  <button onClick={() => setSelectedRoomId(null)} className="text-xs text-muted-foreground hover:text-white mb-4 flex items-center">
                    ← CLOSE
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
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 p-4 flex flex-col gap-6"
              >
                <div>
                  <h2 className="font-bold text-lg mb-1">STATION OVERVIEW</h2>
                  <div className="text-xs font-mono text-muted-foreground">SELECT A ROOM FOR DETAILS</div>
                </div>

                {currentStation && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-mono text-muted-foreground">STATUS</div>
                        <div className={cn("font-bold text-sm uppercase mt-1", 
                          currentStation.status === 'running' ? 'text-emerald-400' : 'text-amber-400'
                        )}>{currentStation.status}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-mono text-muted-foreground">AGENTS</div>
                        <div className="font-bold text-sm mt-1">{currentStation.activeAgents} / {currentStation.agentCount}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-mono text-muted-foreground">TASKS</div>
                        <div className="font-bold text-sm mt-1">{currentStation.tasksCompleted}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="text-[10px] font-mono text-muted-foreground">ROOMS</div>
                        <div className="font-bold text-sm mt-1">{currentStation.roomCount}</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM PANEL: SHIP COMMS & STATS */}
      <div className="h-[160px] flex-shrink-0 border-t border-border/30 bg-black/40 flex">
        <div className="flex-[2] border-r border-border/30 p-4 flex flex-col min-w-0">
          <div className="text-[10px] font-mono text-muted-foreground mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            SHIP COMMS [BROADCAST ONLY]
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide pr-2">
            {activity?.slice(0, 5).map(item => (
              <div key={item.id} className="comms-message">
                <div className={cn("w-4 h-4 rounded-full flex-shrink-0 border", ROLE_COLORS[item.agentRole])} />
                <span className="text-white/60 w-24 flex-shrink-0 truncate">[{item.agentName}]</span>
                <span className="text-white/90 truncate">{item.action}: {item.details}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center gap-4">
          <div className="flex justify-between items-end border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">STATIONS RUNNING</span>
            <span className="font-mono text-lg text-white">{summary?.activeStations || 0}</span>
          </div>
          <div className="flex justify-between items-end border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">AGENTS ACTIVE</span>
            <span className="font-mono text-lg text-cyan-400">{summary?.activeAgents || 0}</span>
          </div>
          <div className="flex justify-between items-end border-b border-white/10 pb-2">
            <span className="text-[10px] font-mono text-muted-foreground">TASKS TODAY</span>
            <span className="font-mono text-lg text-blue-400">{summary?.tasksCompletedToday || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
