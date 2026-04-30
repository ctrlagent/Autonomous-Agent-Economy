import { useGetDashboardSummary, useGetAgentPerformance } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, Target } from "lucide-react";

export default function Missions() {
  const { data: summary } = useGetDashboardSummary();
  const { data: performance } = useGetAgentPerformance();

  const avgPerformance =
    performance && performance.length > 0
      ? Math.round(performance.reduce((acc, p) => acc + p.avgProgress, 0) / performance.length)
      : 0;

  const missions = [
    {
      id: 1,
      title: "Launch Your First Station",
      desc: "Create and deploy your first operational space station.",
      target: 1,
      current: summary?.totalStations ?? 0,
      xp: "500 XP",
      reward: "Template Unlock",
      color: "var(--ae-cyan)",
    },
    {
      id: 2,
      title: "Deploy 6 Agents",
      desc: "Recruit and assign a full crew of 6 agents.",
      target: 6,
      current: summary?.totalAgents ?? 0,
      xp: "1000 XP",
      reward: "Advanced Roles",
      color: "var(--ae-blue)",
    },
    {
      id: 3,
      title: "Complete 10 Tasks",
      desc: "Successfully execute 10 automated tasks across any station.",
      target: 10,
      current: summary?.tasksCompletedToday ?? 0,
      xp: "1500 XP",
      reward: "Module Upgrade",
      locked: (summary?.totalAgents ?? 0) < 1,
      color: "var(--ae-violet)",
    },
    {
      id: 4,
      title: "Run 3 Active Stations",
      desc: "Manage multiple operations simultaneously.",
      target: 3,
      current: summary?.activeStations ?? 0,
      xp: "3000 XP",
      reward: "Command Center Style",
      locked: (summary?.totalStations ?? 0) < 1,
      color: "var(--ae-amber)",
    },
    {
      id: 5,
      title: "Reach 90% Agent Performance",
      desc: "Optimize workflows to achieve maximum efficiency.",
      target: 90,
      current: avgPerformance,
      xp: "5000 XP",
      reward: "Elite Badge",
      locked: (summary?.tasksCompletedToday ?? 0) < 5,
      color: "var(--ae-green)",
    },
  ];

  const mono = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <Target size={20} color="var(--ae-cyan)" />
        <div>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "var(--ae-text)", letterSpacing: "0.04em", lineHeight: 1.8 }}>
            MISSION LOG
          </h1>
          <p style={{ ...mono, fontSize: 10, color: "var(--ae-muted)", marginTop: 4 }}>
            Complete objectives to unlock upgrades and earn experience.
          </p>
        </div>
      </div>

      {/* Mission Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 780 }}>
        {missions.map((mission, i) => {
          const isComplete = mission.current >= mission.target;
          const isLocked = mission.locked;
          const progress = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                background: isComplete ? `${mission.color}10` : "var(--ae-surface)",
                border: `1px solid ${isComplete ? mission.color + "50" : isLocked ? "var(--ae-border)" : "var(--ae-border)"}`,
                padding: "18px 20px",
                opacity: isLocked ? 0.45 : 1,
                position: "relative",
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              {/* Corner accents */}
              <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${isComplete ? mission.color : "var(--ae-border-bright)"}`, borderLeft: `2px solid ${isComplete ? mission.color : "var(--ae-border-bright)"}` }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${isComplete ? mission.color : "var(--ae-border-bright)"}`, borderRight: `2px solid ${isComplete ? mission.color : "var(--ae-border-bright)"}` }} />

              {/* Status icon */}
              <div style={{ flexShrink: 0 }}>
                {isComplete ? (
                  <CheckCircle2 size={20} color={mission.color} />
                ) : isLocked ? (
                  <Lock size={18} color="var(--ae-muted)" />
                ) : (
                  <Circle size={18} color="var(--ae-muted)" />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...mono, fontWeight: 700, fontSize: 12, color: isComplete ? mission.color : "var(--ae-text)", marginBottom: 4 }}>
                  {mission.title}
                </div>
                <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", marginBottom: 10 }}>
                  {mission.desc}
                </div>
                {!isLocked && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 5 }}>
                      <span>PROGRESS</span>
                      <span style={{ color: "var(--ae-text)" }}>{mission.current} / {mission.target}</span>
                    </div>
                    <div className="pixel-progress">
                      <div
                        className="pixel-progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: isComplete ? mission.color : "var(--ae-blue)",
                          boxShadow: isComplete ? `0 0 6px ${mission.color}80` : "none",
                        }}
                      />
                    </div>
                  </>
                )}
                {isLocked && (
                  <div style={{ ...mono, fontSize: 9, color: "var(--ae-dim)", letterSpacing: "0.08em" }}>
                    [ LOCKED — COMPLETE PREVIOUS MISSION ]
                  </div>
                )}
              </div>

              {/* Reward */}
              <div style={{
                flexShrink: 0,
                width: 150,
                borderLeft: "1px solid var(--ae-border)",
                paddingLeft: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
              }}>
                <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>REWARD</span>
                <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: "var(--ae-gold)", textAlign: "right" }}>
                  {mission.xp}
                </span>
                <span style={{ ...mono, fontSize: 9, color: "var(--ae-violet)", textAlign: "right" }}>
                  + {mission.reward}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
