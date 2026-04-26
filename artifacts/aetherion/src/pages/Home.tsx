import { useGetDashboardSummary, useGetRecentActivity, useGetAgentPerformance } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_COLORS } from "@/lib/constants";
import { Activity, Users, Box, CheckCircle2, TrendingUp, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const { data: summary } = useGetDashboardSummary();
  const { data: activity } = useGetRecentActivity({ limit: 10 });
  const { data: performance } = useGetAgentPerformance();

  if (!summary) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Active Stations" 
          value={`${summary.activeStations}/${summary.totalStations}`}
          icon={Box}
          trend="+2 online"
          delay={0.1}
        />
        <StatsCard 
          title="Active Agents" 
          value={`${summary.activeAgents}/${summary.totalAgents}`}
          icon={Users}
          trend="98% utilization"
          delay={0.2}
        />
        <StatsCard 
          title="Tasks Completed" 
          value={summary.tasksCompletedToday.toString()}
          icon={CheckCircle2}
          trend="Today"
          delay={0.3}
        />
        <StatsCard 
          title="System Progress" 
          value={`${summary.overallProgress.toFixed(1)}%`}
          icon={TrendingUp}
          trend="Avg completion"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.id}
                  className="flex items-start gap-4 p-3 rounded-lg border border-border/50 bg-background/50"
                >
                  <div className={`p-2 rounded-md ${ROLE_COLORS[item.agentRole] || "bg-gray-800"}`}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        <span className="text-primary">{item.agentName}</span>
                        <span className="text-muted-foreground mx-2">@</span>
                        <span className="text-secondary-foreground">{item.stationName}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.action}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performance?.map((perf, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={perf.role}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${ROLE_COLORS[perf.role]?.split(" ")[0].replace("text-", "bg-") || "bg-gray-500"}`} />
                      <span className="capitalize text-foreground/90">{perf.role}</span>
                    </div>
                    <span className="text-muted-foreground">{perf.avgProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={perf.avgProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-right">
                    {perf.tasksCompleted} tasks by {perf.agentCount} agents
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{trend}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
