import { useState } from "react";
import { useListAgents, useListAgentTasks, useUpdateAgent } from "@workspace/api-client-react";
import { ROLE_COLORS, AGENT_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const FILTERS = ["ALL", "RESEARCH", "STRATEGY", "BUILDER", "CONTENT", "GROWTH", "ANALYTICS"];

export default function Crew() {
  const { data: agents } = useListAgents();
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredAgents = agents?.filter(a => filter === "ALL" || a.role.toUpperCase() === filter) || [];
  const selectedAgent = agents?.find(a => a.id === selectedId);

  const { data: tasks } = useListAgentTasks(selectedId || 0, { query: { enabled: !!selectedId } });

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-hidden">
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">CREW ROSTER</h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">Manage and assign autonomous agents</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 text-[10px] font-mono rounded-full transition-all border",
                filter === f 
                  ? "bg-primary/20 text-primary border-primary/50" 
                  : "bg-black/30 text-muted-foreground border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-[300px]">
          {filteredAgents.map((agent) => (
            <motion.button
              key={agent.id}
              onClick={() => setSelectedId(agent.id === selectedId ? null : agent.id)}
              className={cn(
                "flex flex-col p-4 rounded-xl border bg-card/40 backdrop-blur text-left transition-all",
                selectedId === agent.id ? "border-white" : "border-border hover:border-white/20",
                agent.status === "working" && "border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
              )}
              layoutId={`card-${agent.id}`}
            >
              <div className="flex gap-4 items-start w-full">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border flex-shrink-0", ROLE_COLORS[agent.role])}>
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg truncate pr-2">{agent.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/10 rounded flex-shrink-0">LVL {agent.level}</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground uppercase truncate mt-0.5">{agent.role}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", agent.status === "working" ? "bg-emerald-500" : "bg-gray-500")} />
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{agent.status}</span>
                <span className="text-[10px] font-mono text-muted-foreground ml-auto">{agent.tasksCompleted} TASKS</span>
              </div>
              {agent.currentTask && (
                <div className="mt-3 text-xs text-white/70 bg-black/30 p-2 rounded border border-white/5 truncate font-mono">
                  &gt; {agent.currentTask}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 h-[300px] bg-background/95 backdrop-blur-xl border-t border-white/20 p-6 z-30 shadow-2xl flex gap-8"
          >
            <div className="w-[300px] flex-shrink-0 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border", ROLE_COLORS[selectedAgent.role])}>
                  {selectedAgent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-2xl">{selectedAgent.name}</h2>
                  <div className="text-sm font-mono text-muted-foreground uppercase mt-1">{selectedAgent.role} • Level {selectedAgent.level}</div>
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                    <span>EXPERIENCE</span>
                    <span>{selectedAgent.experience} XP</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-border/50">
                    <div className="h-full bg-white/80" style={{ width: `${selectedAgent.experience % 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">STATUS</div>
                  <div className={cn("inline-block text-xs font-mono px-2 py-1 rounded border uppercase", AGENT_STATUS_COLORS[selectedAgent.status])}>
                    {selectedAgent.status}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-white hover:bg-white/90 text-black py-2 rounded text-xs font-mono font-bold transition-colors">
                  ASSIGN
                </button>
                <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded text-xs font-mono font-bold transition-colors">
                  UPGRADE
                </button>
              </div>
            </div>

            <div className="flex-1 border-l border-white/10 pl-8 flex flex-col min-w-0">
              <h3 className="text-xs font-mono text-muted-foreground mb-4">RECENT TASKS</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-4 scrollbar-hide">
                {tasks?.length ? tasks.map(task => (
                  <div key={task.id} className="p-3 rounded bg-white/5 border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">{task.title}</div>
                      <span className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded",
                        task.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                        task.status === "in_progress" ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-500/20 text-gray-400"
                      )}>
                        {task.status}
                      </span>
                    </div>
                    {task.status === "in_progress" && (
                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${task.progress}%` }} />
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground italic">No recent tasks.</div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedId(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
