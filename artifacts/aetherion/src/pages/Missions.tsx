import { useGetDashboardSummary, useGetAgentPerformance } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, Target } from "lucide-react";

export default function Missions() {
  const { data: summary } = useGetDashboardSummary();
  const { data: performance } = useGetAgentPerformance();

  const missions = [
    {
      id: 1,
      title: "Launch Your First Station",
      desc: "Create and deploy your first operational space station.",
      target: 1,
      current: summary?.totalStations || 0,
      reward: "500 XP + Template Unlock",
      locked: false,
    },
    {
      id: 2,
      title: "Deploy 6 Agents",
      desc: "Recruit and assign a full crew of 6 agents.",
      target: 6,
      current: summary?.totalAgents || 0,
      reward: "1000 XP + Advanced Roles",
      locked: false,
    },
    {
      id: 3,
      title: "Complete 10 Tasks",
      desc: "Successfully execute 10 automated tasks across any station.",
      target: 10,
      current: summary?.tasksCompletedToday || 0, // Using today as proxy since API doesn't expose all-time total easily
      reward: "1500 XP + Module Upgrade",
      locked: (summary?.totalAgents || 0) < 1,
    },
    {
      id: 4,
      title: "Run 3 Active Stations",
      desc: "Manage multiple operations simultaneously.",
      target: 3,
      current: summary?.activeStations || 0,
      reward: "3000 XP + Command Center Style",
      locked: (summary?.totalStations || 0) < 1,
    },
    {
      id: 5,
      title: "Reach 90% Agent Performance",
      desc: "Optimize workflows to achieve maximum efficiency.",
      target: 90,
      current: performance && performance.length > 0 ? Math.round(performance.reduce((acc, p) => acc + p.avgProgress, 0) / performance.length) : 0,
      reward: "5000 XP + Elite Badge",
      locked: (summary?.tasksCompletedToday || 0) < 5,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          MISSION LOG
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">Complete objectives to unlock upgrades and earn experience.</p>
      </div>

      <div className="space-y-6">
        {missions.map(mission => {
          const isComplete = mission.current >= mission.target;
          const progress = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div 
              key={mission.id}
              className={cn(
                "p-6 rounded-xl border relative overflow-hidden transition-all",
                isComplete ? "bg-emerald-950/20 border-emerald-500/30" :
                mission.locked ? "bg-black/40 border-border/50 opacity-50" :
                "bg-card border-border hover:border-white/20"
              )}
            >
              {isComplete && (
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
              )}
              
              <div className="flex flex-col md:flex-row gap-6 md:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : mission.locked ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-primary" />
                    )}
                    <h2 className={cn("text-xl font-bold", isComplete ? "text-emerald-400" : "text-white")}>
                      {mission.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 pl-8">{mission.desc}</p>
                  
                  {!mission.locked && (
                    <div className="pl-8">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-white/60">PROGRESS</span>
                        <span className="text-white">{mission.current} / {mission.target}</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className={cn("h-full transition-all duration-1000", isComplete ? "bg-emerald-500" : "bg-primary")} 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:w-48 flex-shrink-0 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <span className="text-[10px] font-mono text-muted-foreground mb-1">REWARD</span>
                  <span className={cn("text-sm font-bold text-right", isComplete ? "text-emerald-400" : "text-amber-400")}>
                    {mission.reward}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
