import { useState } from "react";
import { useListAgents } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_COLORS, AGENT_STATUS_COLORS } from "@/lib/constants";
import { motion } from "framer-motion";
import { Cpu, Search, Activity, CheckCircle2, ShieldAlert } from "lucide-react";

export default function Agents() {
  const { data: agents } = useListAgents();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredAgents = agents?.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || agent.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Roster</h1>
          <p className="text-muted-foreground">Monitor and manage all AI agents across active stations.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card/50 backdrop-blur border border-border/50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search agents by designation..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border/50">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.keys(ROLE_COLORS).map(role => (
              <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAgents?.map((agent, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={agent.id}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg border ${ROLE_COLORS[agent.role]}`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${AGENT_STATUS_COLORS[agent.status]}`}>
                    {agent.status}
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <h3 className="font-bold text-lg font-mono tracking-tight">{agent.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`capitalize font-medium ${ROLE_COLORS[agent.role].split(" ")[0]}`}>
                      {agent.role}
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-muted-foreground">Level {agent.level}</span>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-3 space-y-3 border border-border/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> EXP
                    </span>
                    <span className="font-mono text-primary">{agent.experience}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Tasks Done
                    </span>
                    <span className="font-mono text-primary">{agent.tasksCompleted}</span>
                  </div>
                </div>

                {agent.currentTask && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-primary animate-pulse" /> Active Directive
                    </p>
                    <p className="text-xs font-mono text-primary/90 truncate bg-primary/5 p-2 rounded border border-primary/10">
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
  );
}
