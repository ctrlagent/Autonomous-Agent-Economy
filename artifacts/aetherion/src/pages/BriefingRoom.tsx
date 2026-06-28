import { useRef, useState, useCallback } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ROLE_HEX as ROLE_COLORS } from "@/lib/roleColors";

const pixel = { fontFamily: "'Press Start 2P', monospace" } as const;
const mono  = { fontFamily: "'Space Mono', monospace" } as const;

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ff4d6d", high: "#ffb84d", medium: "#4dff9b", low: "#4d7fff",
};

interface ParsedTask {
  title: string;
  description: string;
  agentRole: string;
  priority: string;
}

interface MissionSpec {
  title: string;
  description: string;
  target: number;
  unit: string;
  rewardAmount: number;
  color: string;
  tasks: ParsedTask[];
}

type Phase = "idle" | "parsing" | "preview" | "creating" | "done";

export default function BriefingRoom() {
  const editorRef = useRef<Editor | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [spec, setSpec]   = useState<MissionSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [, navigate] = useLocation();

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
    editor.user.updateUserPreferences({ colorScheme: "dark" });
  }, []);

  const handleParse = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setPhase("parsing");
    setError(null);

    const snapshot = editor.store.getStoreSnapshot();

    try {
      const res = await fetch("/api/briefing/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tldrawState: snapshot }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as MissionSpec;
      setSpec(data);
      setPhase("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
      setPhase("idle");
    }
  };

  const handleCreate = async () => {
    if (!spec) return;
    setPhase("creating");
    setError(null);

    try {
      const res = await fetch("/api/briefing/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(spec),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as { mission: { id: number }; tasks: unknown[] };
      setCreatedId(data.mission.id);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
      setPhase("preview");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setSpec(null);
    setError(null);
    setCreatedId(null);
  };

  const isLoading = phase === "parsing" || phase === "creating";

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "var(--ae-bg)", overflow: "hidden",
    }}>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px",
        background: "var(--ae-surface)", borderBottom: "1px solid var(--ae-border)",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "var(--ae-cyan)", fontSize: 16 }}>◈</span>
          <span style={{ ...pixel, fontSize: 9, color: "var(--ae-cyan)", letterSpacing: "0.12em" }}>
            BRIEFING ROOM
          </span>
          <span style={{
            ...mono, fontSize: 9, color: "var(--ae-muted)",
            padding: "2px 8px", border: "1px solid var(--ae-border)",
          }}>
            WHITEBOARD → MISSION
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {error && (
            <span style={{ ...mono, fontSize: 9, color: "var(--ae-red)" }}>
              ⚠ {error}
            </span>
          )}

          {phase === "done" ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate("/app/missions")}
                style={{
                  ...pixel, fontSize: 7, padding: "8px 16px", cursor: "pointer",
                  background: "var(--ae-cyan)", color: "#0a0b0f", border: "none",
                  letterSpacing: "0.06em",
                }}
              >
                VIEW MISSIONS
              </button>
              <button
                onClick={handleReset}
                style={{
                  ...pixel, fontSize: 7, padding: "8px 16px", cursor: "pointer",
                  background: "transparent", color: "var(--ae-muted)",
                  border: "1px solid var(--ae-border)", letterSpacing: "0.06em",
                }}
              >
                NEW BRIEFING
              </button>
            </div>
          ) : phase === "preview" ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleReset}
                style={{
                  ...pixel, fontSize: 7, padding: "8px 14px", cursor: "pointer",
                  background: "transparent", color: "var(--ae-muted)",
                  border: "1px solid var(--ae-border)", letterSpacing: "0.06em",
                }}
              >
                REDRAW
              </button>
              <button
                onClick={handleCreate}
                style={{
                  ...pixel, fontSize: 7, padding: "8px 16px", cursor: "pointer",
                  background: "var(--ae-green)", color: "#0a0b0f", border: "none",
                  letterSpacing: "0.06em",
                }}
              >
                ▶ DEPLOY MISSION
              </button>
            </div>
          ) : (
            <button
              onClick={handleParse}
              disabled={isLoading}
              style={{
                ...pixel, fontSize: 7, padding: "8px 18px",
                cursor: isLoading ? "not-allowed" : "pointer",
                background: isLoading ? "var(--ae-surface-2)" : "var(--ae-cyan)",
                color: isLoading ? "var(--ae-muted)" : "#0a0b0f",
                border: isLoading ? "1px solid var(--ae-border)" : "none",
                letterSpacing: "0.06em", transition: "all 0.15s",
              }}
            >
              {phase === "parsing" ? "◌ PARSING..." : "◈ CONVERT TO MISSION"}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Canvas */}
        <div style={{
          flex: phase === "preview" || phase === "done" ? "1 1 60%" : "1 1 100%",
          position: "relative", transition: "flex 0.3s ease",
          borderRight: phase === "preview" || phase === "done" ? "1px solid var(--ae-border)" : "none",
        }}>
          {phase === "idle" && (
            <div style={{
              position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
              zIndex: 10, pointerEvents: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{
                ...mono, fontSize: 9, color: "var(--ae-muted)",
                background: "rgba(10,11,15,0.85)", padding: "8px 16px",
                border: "1px solid var(--ae-border)",
              }}>
                Draw your mission on the canvas — shapes, arrows, sticky notes
              </div>
            </div>
          )}

          {isLoading && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              background: "rgba(10,11,15,0.6)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                ...pixel, fontSize: 9, color: "var(--ae-cyan)",
                letterSpacing: "0.1em", animation: "pulse-dot 1.2s ease-in-out infinite",
              }}>
                {phase === "parsing" ? "◌ LLM PARSING CANVAS..." : "◌ DEPLOYING MISSION..."}
              </div>
            </div>
          )}

          <div style={{ position: "absolute", inset: 0 }}>
            <Tldraw onMount={handleMount} />
          </div>
        </div>

        {/* Preview / Done Panel */}
        <AnimatePresence>
          {(phase === "preview" || phase === "done" || phase === "creating") && spec && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                flex: "0 0 380px", overflowY: "auto",
                background: "var(--ae-surface)", padding: "20px",
                display: "flex", flexDirection: "column", gap: 16,
              }}
            >
              {/* Header */}
              <div>
                <div style={{
                  ...mono, fontSize: 8, color: "var(--ae-muted)",
                  letterSpacing: "0.1em", marginBottom: 8,
                }}>
                  {phase === "done" ? "✓ MISSION DEPLOYED" : "MISSION PREVIEW"}
                </div>

                {phase === "done" && (
                  <div style={{
                    ...mono, fontSize: 9, color: "var(--ae-green)",
                    padding: "8px 12px", background: "rgba(77,255,155,0.08)",
                    border: "1px solid var(--ae-green)", marginBottom: 12,
                  }}>
                    ✓ Mission #{createdId} created and agents assigned
                  </div>
                )}

                <div style={{
                  width: "100%", height: 3,
                  background: `linear-gradient(to right, ${spec.color}, ${spec.color}44)`,
                  marginBottom: 12, boxShadow: `0 0 8px ${spec.color}66`,
                }} />

                <div style={{
                  ...pixel, fontSize: 9, color: "var(--ae-text)",
                  letterSpacing: "0.04em", lineHeight: 1.8, marginBottom: 8,
                }}>
                  {spec.title}
                </div>
                <div style={{
                  ...mono, fontSize: 9, color: "var(--ae-muted)", lineHeight: 1.6,
                }}>
                  {spec.description}
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
              }}>
                {[
                  { label: "REWARD", value: `${spec.rewardAmount} USDC` },
                  { label: "TARGET", value: `${spec.target} ${spec.unit}` },
                  { label: "TASKS", value: `${spec.tasks.length}` },
                  { label: "STATUS", value: phase === "done" ? "ACTIVE" : "PREVIEW" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: "10px 12px",
                    background: "var(--ae-surface-2)",
                    border: "1px solid var(--ae-border)",
                  }}>
                    <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 4, letterSpacing: "0.08em" }}>
                      {label}
                    </div>
                    <div style={{ ...pixel, fontSize: 8, color: "var(--ae-cyan)" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              <div>
                <div style={{
                  ...mono, fontSize: 7, color: "var(--ae-muted)",
                  letterSpacing: "0.1em", marginBottom: 10,
                }}>
                  ASSIGNED TASKS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {spec.tasks.map((task, i) => {
                    const roleColor = ROLE_COLORS[task.agentRole] ?? "#4d7fff";
                    const priorityColor = PRIORITY_COLORS[task.priority] ?? "#4dff9b";
                    return (
                      <div key={i} style={{
                        padding: "10px 12px",
                        background: "var(--ae-bg)",
                        border: `1px solid ${roleColor}33`,
                        position: "relative",
                      }}>
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, height: 2,
                          background: `linear-gradient(to right, ${roleColor}, transparent)`,
                        }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <div style={{
                            ...pixel, fontSize: 7, color: "var(--ae-text)",
                            letterSpacing: "0.04em", lineHeight: 1.6, flex: 1, marginRight: 8,
                          }}>
                            {task.title}
                          </div>
                          <span style={{
                            ...mono, fontSize: 7, color: priorityColor,
                            padding: "1px 5px", border: `1px solid ${priorityColor}44`,
                            flexShrink: 0,
                          }}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", lineHeight: 1.5, marginBottom: 6 }}>
                          {task.description}
                        </div>
                        <div style={{
                          ...mono, fontSize: 7, color: roleColor,
                          padding: "2px 6px", border: `1px solid ${roleColor}33`,
                          display: "inline-block", letterSpacing: "0.06em",
                          background: `${roleColor}0d`,
                        }}>
                          ◈ {task.agentRole.toUpperCase()} AGENT
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {phase === "preview" && (
                <div style={{
                  ...mono, fontSize: 8, color: "var(--ae-dim)", lineHeight: 1.6,
                  padding: "10px 12px", background: "var(--ae-surface-2)",
                  border: "1px solid var(--ae-border)",
                }}>
                  ℹ Tasks will be assigned to available agents matching each role. Click DEPLOY MISSION to activate.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
