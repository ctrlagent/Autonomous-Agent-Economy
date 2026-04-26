import { useParams } from "wouter";
import { 
  useGetStation, 
  getGetStationQueryKey,
  useListRooms,
  getListRoomsQueryKey,
  useListStationAgents,
  getListStationAgentsQueryKey,
  useListAgentTasks,
  getListAgentTasksQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ROLE_COLORS, 
  STATION_STATUS_COLORS, 
  AGENT_STATUS_COLORS,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
  ROOM_ICONS 
} from "@/lib/constants";
import { motion } from "framer-motion";
import { Activity, Users, Box, CheckCircle2, ChevronRight, Cpu, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const stationId = parseInt(id || "0", 10);

  const { data: station } = useGetStation(stationId, { query: { enabled: !!stationId, queryKey: getGetStationQueryKey(stationId) } });
  const { data: rooms } = useListRooms(stationId, { query: { enabled: !!stationId, queryKey: getListRoomsQueryKey(stationId) } });
  const { data: agents } = useListStationAgents(stationId, { query: { enabled: !!stationId, queryKey: getListStationAgentsQueryKey(stationId) } });

  if (!station) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{station.name}</h1>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATION_STATUS_COLORS[station.status]}`}>
              {station.status.toUpperCase()}
            </div>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Box className="w-4 h-4" />
            {station.templateName} Template
          </p>
        </div>
        
        <Card className="w-full md:w-72 border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-bold text-primary">{station.progress}%</span>
            </div>
            <Progress value={station.progress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rooms */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-2">Facility Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms?.map((room, i) => {
              const Icon = ROOM_ICONS[room.type] || Box;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={room.id}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-md bg-background border border-border">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{room.name}</CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${room.status === 'active' || room.status === 'busy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-gray-500'}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm mt-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{room.agentCount} Agents</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{room.tasksCompleted} Tasks</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Agents */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-2">Active Crew</h2>
          <div className="space-y-3">
            {agents?.map((agent, i) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={agent.id}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded border ${ROLE_COLORS[agent.role]}`}>
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm leading-none mb-1">{agent.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="capitalize text-muted-foreground">{agent.role}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="text-muted-foreground">Lvl {agent.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1 ${AGENT_STATUS_COLORS[agent.status].split(" ")[1] || "bg-gray-500"}`} 
                           style={{ boxShadow: agent.status === 'working' ? '0 0 10px var(--color-primary)' : 'none' }} />
                    </div>
                    
                    {agent.currentTask && (
                      <div className="bg-background/50 rounded p-2 text-xs border border-border/50">
                        <p className="text-muted-foreground mb-1 truncate flex items-center gap-1">
                          <Activity className="w-3 h-3 text-primary" /> Current Directive
                        </p>
                        <p className="font-mono text-[10px] text-primary truncate">
                          {">"} {agent.currentTask}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
