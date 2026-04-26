import { useState } from "react";
import { useGetRecentActivity } from "@workspace/api-client-react";
import { ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FILTERS = ["ALL", "AGENTS", "TASKS", "STATION"];

export default function Timeline() {
  const [filter, setFilter] = useState("ALL");
  const { data: activity } = useGetRecentActivity({ limit: 50 });

  // Naive client-side filtering since API doesn't support type filtering
  const filteredActivity = activity?.filter(item => {
    if (filter === "ALL") return true;
    if (filter === "AGENTS") return item.action.toLowerCase().includes("agent");
    if (filter === "TASKS") return item.action.toLowerCase().includes("task");
    if (filter === "STATION") return item.action.toLowerCase().includes("station") || item.action.toLowerCase().includes("room");
    return true;
  }) || [];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 flex flex-col h-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">EVENT TIMELINE</h1>
          <p className="text-muted-foreground mt-2 font-mono">Chronological log of all system events.</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-mono rounded-full transition-all border",
                filter === f 
                  ? "bg-primary/10 text-primary border-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]" 
                  : "bg-transparent text-muted-foreground border-border hover:border-white/30"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-black/20 rounded-xl border border-border p-4 relative min-h-0">
        <div className="absolute left-[88px] top-4 bottom-4 w-px bg-white/5" />
        
        <div className="space-y-1 relative z-10">
          {filteredActivity.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 1) }}
              key={item.id} 
              className="flex items-start gap-6 p-3 rounded-lg hover:bg-white/5 group transition-colors"
            >
              <div className="w-16 flex-shrink-0 text-right text-xs font-mono text-muted-foreground pt-1">
                {/* Extracting just time if possible, otherwise use full string */}
                {item.timestamp.includes(":") ? item.timestamp.split(" ")[1] : item.timestamp}
              </div>
              
              <div className="relative flex flex-col items-center pt-1.5">
                <div className="w-3 h-3 rounded-full bg-background border-2 border-white/10 z-10" />
                <div className={cn("absolute top-2 w-1.5 h-1.5 rounded-full z-20", ROLE_COLORS[item.agentRole]?.split(" ")[0].replace("text-", "bg-"))} />
              </div>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{item.agentName}</span>
                  <span className="text-xs font-mono text-muted-foreground bg-white/5 px-1.5 rounded uppercase">{item.agentRole}</span>
                </div>
                <div className="text-sm mt-1 text-white/80">{item.action}</div>
                {item.details && (
                  <div className="text-xs font-mono text-muted-foreground mt-1.5 bg-black/30 p-2 rounded border border-white/5">
                    {item.details}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {filteredActivity.length === 0 && (
            <div className="p-8 text-center text-muted-foreground font-mono">No events found matching filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
