import { useState, useEffect, useRef } from "react";
import { useListStationAgents, useListStations } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Radio, Zap, ChevronRight, Key, AlertCircle } from "lucide-react";
import { AgentAvatar } from "@/components/PixelSprite";
import { Link } from "wouter";
import { getRoleColor as roleHex } from "@/lib/roleColors";

const mono = { fontFamily: "'Space Mono', monospace" };

interface Message {
  id: number;
  from: string;
  role: string;
  text: string;
  ts: number;
  type: "agent" | "commander" | "system";
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  research: [
    "Acknowledged, Commander. Running deep scan protocol now.",
    "Data analysis underway. Estimated completion in 3 cycles.",
    "Anomaly detected in sector 7. Investigating.",
    "Scan complete. Results uploaded to the databank.",
    "Research hypothesis confirmed. Proceeding to next phase.",
  ],
  strategy: [
    "Roger that. Adjusting tactical parameters.",
    "Strategic recalculation in progress. Stand by.",
    "Priority shift acknowledged. Reallocating resources.",
    "Tactical advantage updated. Success probability: 87%.",
    "Mission briefing received. Initiating countermeasures.",
  ],
  builder: [
    "Build pipeline initiated. ETA: 2.4 minutes.",
    "Deployment queued. Running pre-flight checks.",
    "Code compiled. No critical errors detected.",
    "Infrastructure scaling underway. All systems nominal.",
    "Build complete. Running integration tests.",
  ],
  content: [
    "Copy that. Content engine spinning up.",
    "Draft ready for review. Engagement score: 94.",
    "Campaign assets generated. Awaiting your approval.",
    "Content pipeline active. Output rate increased by 18%.",
    "Message received. Publishing to all channels.",
  ],
  growth: [
    "Growth loop activated. Viral coefficient rising.",
    "Lead generation protocols engaged.",
    "Traffic spike detected. Capitalizing on momentum.",
    "Conversion funnel optimized. Revenue increasing.",
    "Referral campaign launched. Early results promising.",
  ],
  analytics: [
    "Metrics updated in real-time, Commander.",
    "Predictive model recalibrated. Accuracy: 91.3%.",
    "Data pipeline flushed. Ready for next cycle.",
    "Anomaly in conversion rate. Flagging for review.",
    "Report generated. KPIs all within green thresholds.",
  ],
};

const QUICK_COMMANDS = [
  { label: "STATUS REPORT", icon: "📊", msg: "All units: report current status." },
  { label: "BOOST OUTPUT", icon: "⚡", msg: "Increase task throughput. Priority: MAXIMUM." },
  { label: "RECON SWEEP", icon: "🔍", msg: "Run a full recon sweep across all sectors." },
  { label: "STAND BY", icon: "⏸", msg: "Non-critical agents: stand by for further orders." },
];

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function getStoredAI(): { provider: string; apiKey: string } | null {
  const apiKey = localStorage.getItem("ctrl_ai_key");
  const provider = localStorage.getItem("ctrl_ai_provider") ?? "openai";
  if (!apiKey) return null;
  return { provider, apiKey };
}

export default function ShipComms() {
  const { data: stations } = useListStations();
  const stationId = stations?.[0]?.id ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agents } = useListStationAgents(stationId, { query: { enabled: !!stationId } as any });

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "SYSTEM", role: "system", text: "Ship communications online. All channels active.", ts: Date.now() - 300000, type: "system" },
    { id: 2, from: "NEXUS-1", role: "research", text: "Commander, deep scan of sector 4 complete. No threats detected.", ts: Date.now() - 180000, type: "agent" },
    { id: 3, from: "FORGE-3", role: "builder", text: "Build pipeline deployed successfully. 3 new endpoints live.", ts: Date.now() - 90000, type: "agent" },
    { id: 4, from: "GROW-4", role: "growth", text: "Viral loop coefficient at 1.34. Revenue trajectory optimal.", ts: Date.now() - 45000, type: "agent" },
  ]);

  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState(98);
  const [aiConfig, setAiConfig] = useState<{ provider: string; apiKey: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAiConfig(getStoredAI());
  }, []);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Simulate periodic incoming messages (only when no AI key, as ambient activity)
  useEffect(() => {
    if (aiConfig) return;
    const agentList = agents?.length ? agents : [
      { name: "NEXUS-1", role: "research" }, { name: "FORGE-3", role: "builder" }, { name: "GROW-4", role: "growth" },
    ];
    const interval = setInterval(() => {
      const ag = agentList[Math.floor(Math.random() * agentList.length)];
      if (!ag) return;
      const role = (ag as { role: string }).role?.toLowerCase() ?? "research";
      const responses = FALLBACK_RESPONSES[role] ?? FALLBACK_RESPONSES.research;
      const text = responses[Math.floor(Math.random() * responses.length)];
      setIsTyping((ag as { name: string }).name);
      setTimeout(() => {
        setIsTyping(null);
        setMessages(prev => [...prev.slice(-40), {
          id: Date.now(),
          from: (ag as { name: string }).name,
          role,
          text,
          ts: Date.now(),
          type: "agent",
        }]);
      }, 1400 + Math.random() * 800);
    }, 12000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, [agents, aiConfig]);

  // Signal flicker
  useEffect(() => {
    const id = setInterval(() => setSignalStrength(90 + Math.floor(Math.random() * 10)), 3000);
    return () => clearInterval(id);
  }, []);

  async function getAIResponse(message: string, responder: { name: string; role: string }): Promise<string> {
    const cfg = aiConfig ?? getStoredAI();
    if (!cfg) {
      const role = responder.role.toLowerCase();
      const pool = FALLBACK_RESPONSES[role] ?? FALLBACK_RESPONSES.research;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const resp = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        agentName: responder.name,
        agentRole: responder.role,
        apiKey: cfg.apiKey,
        provider: cfg.provider,
      }),
    });

    const data = await resp.json() as { reply?: string; error?: string };
    if (!resp.ok) throw new Error(data.error ?? "AI error");
    setAiError(null);
    return data.reply ?? "Acknowledged, Commander.";
  }

  async function sendMessage(text: string, targetAgent?: string) {
    if (!text.trim()) return;
    const msg: Message = {
      id: Date.now(), from: "COMMANDER", role: "commander",
      text: targetAgent ? `[${targetAgent}] ${text}` : text,
      ts: Date.now(), type: "commander",
    };
    setMessages(prev => [...prev.slice(-40), msg]);
    setInput("");

    const agentList = agents?.length ? agents : [{ name: "NEXUS-1", role: "research" }];
    const responder = targetAgent
      ? agentList.find((a: { name: string }) => a.name === targetAgent) ?? agentList[0]
      : agentList[Math.floor(Math.random() * agentList.length)];
    if (!responder) return;

    const rName = (responder as { name: string }).name;
    const rRole = (responder as { role: string }).role?.toLowerCase() ?? "research";
    setIsTyping(rName);

    try {
      const reply = await getAIResponse(text, { name: rName, role: rRole });
      setIsTyping(null);
      setMessages(prev => [...prev.slice(-40), {
        id: Date.now() + 1,
        from: rName,
        role: rRole,
        text: reply,
        ts: Date.now(),
        type: "agent",
      }]);
    } catch (err) {
      setIsTyping(null);
      const errMsg = err instanceof Error ? err.message : "Connection failed";
      setAiError(errMsg);
      // Fall back to static response
      const pool = FALLBACK_RESPONSES[rRole] ?? FALLBACK_RESPONSES.research;
      setMessages(prev => [...prev.slice(-40), {
        id: Date.now() + 1,
        from: rName,
        role: rRole,
        text: pool[Math.floor(Math.random() * pool.length)],
        ts: Date.now(),
        type: "agent",
      }]);
    }
  }

  function handleSend() { sendMessage(input, selectedAgent ?? undefined); }
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* LEFT: AGENT ROSTER */}
      <div style={{ width: 200, flexShrink: 0, borderRight: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ae-border)", display: "flex", alignItems: "center", gap: 8 }}>
          <Radio size={12} style={{ color: "var(--ae-cyan)" }} />
          <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>CREW CHANNELS</span>
        </div>

        {/* AI status badge */}
        <div style={{ margin: "8px 10px 0", padding: "6px 8px", border: `1px solid ${aiConfig ? "var(--ae-green)" : "var(--ae-border)"}`, background: aiConfig ? "rgba(77,255,155,0.06)" : "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 6 }}>
          <Key size={9} style={{ color: aiConfig ? "var(--ae-green)" : "var(--ae-dim)", flexShrink: 0 }} />
          <span style={{ ...mono, fontSize: 6, color: aiConfig ? "var(--ae-green)" : "var(--ae-dim)", letterSpacing: "0.08em" }}>
            {aiConfig ? `AI: ${aiConfig.provider.toUpperCase()}` : "NO AI KEY"}
          </span>
          {!aiConfig && (
            <Link href="/app/settings" style={{ ...mono, fontSize: 6, color: "var(--ae-cyan)", textDecoration: "none", marginLeft: "auto" }}>SET →</Link>
          )}
        </div>

        {aiError && (
          <div style={{ margin: "4px 10px 0", padding: "5px 8px", border: "1px solid var(--ae-red)", background: "rgba(255,77,109,0.06)", display: "flex", alignItems: "flex-start", gap: 5 }}>
            <AlertCircle size={9} style={{ color: "var(--ae-red)", flexShrink: 0, marginTop: 1 }} />
            <span style={{ ...mono, fontSize: 6, color: "var(--ae-red)", lineHeight: 1.5 }}>{aiError}</span>
          </div>
        )}

        {/* Broadcast button */}
        <button
          onClick={() => setSelectedAgent(null)}
          style={{
            margin: "8px 10px", padding: "7px 10px",
            background: selectedAgent === null ? "var(--ae-cyan-dim)" : "rgba(0,0,0,0.3)",
            border: `1px solid ${selectedAgent === null ? "var(--ae-cyan)" : "var(--ae-border)"}`,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.15s",
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ae-cyan)", boxShadow: "0 0 6px var(--ae-cyan)", animation: "pulse-dot 2s ease-in-out infinite" }} />
          <span style={{ ...mono, fontSize: 8, color: selectedAgent === null ? "var(--ae-cyan)" : "var(--ae-muted)", letterSpacing: "0.08em" }}>ALL CREW</span>
          <ChevronRight size={9} style={{ marginLeft: "auto", color: "var(--ae-muted)" }} />
        </button>

        {/* Agent list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {(agents ?? []).map((ag: { id: number; name: string; role: string; status: string }) => {
            const isOnline = ag.status !== "offline";
            const color = roleHex(ag.role);
            const isSelected = selectedAgent === ag.name;
            const isTypingThis = isTyping === ag.name;
            return (
              <button
                key={ag.id}
                onClick={() => setSelectedAgent(isSelected ? null : ag.name)}
                style={{
                  width: "100%", padding: "8px 12px", textAlign: "left",
                  background: isSelected ? `${color}15` : "transparent",
                  border: "none", borderBottom: "1px solid rgba(255,255,255,0.03)",
                  borderLeft: isSelected ? `2px solid ${color}` : "2px solid transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
                  transition: "all 0.12s",
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <AgentAvatar role={ag.role} size={28} />
                  <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 7, height: 7, borderRadius: "50%",
                    background: isOnline ? "#4dff9b" : "var(--ae-muted)",
                    boxShadow: isOnline ? "0 0 5px #4dff9b" : "none",
                    border: "1px solid var(--ae-bg)",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...mono, fontSize: 8, fontWeight: 700, color: isSelected ? color : "var(--ae-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ag.name}
                  </div>
                  <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginTop: 1 }}>
                    {isTypingThis ? (
                      <span style={{ color, animation: "pulse-dot 1s ease-in-out infinite" }}>typing...</span>
                    ) : ag.role.toUpperCase()}
                  </div>
                </div>
              </button>
            );
          })}
          {(!agents || agents.length === 0) && (
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", padding: 14, textAlign: "center" }}>LOADING CREW...</div>
          )}
        </div>

        {/* Signal strength */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--ae-border)" }}>
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 4, letterSpacing: "0.1em" }}>SIGNAL</div>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 14 }}>
            {[3, 5, 7, 9, 11, 13].map((h, i) => (
              <div key={i} style={{
                width: 4, height: h,
                background: i < Math.round(signalStrength / 17) ? "var(--ae-cyan)" : "var(--ae-border)",
                boxShadow: i < Math.round(signalStrength / 17) ? "0 0 3px var(--ae-cyan)" : "none",
                transition: "all 0.5s",
              }} />
            ))}
            <span style={{ ...mono, fontSize: 7, color: "var(--ae-cyan)", marginLeft: 6 }}>{signalStrength}%</span>
          </div>
        </div>
      </div>

      {/* CENTER: MESSAGE FEED */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Channel header */}
        <div style={{
          height: 40, flexShrink: 0,
          borderBottom: "1px solid var(--ae-border)",
          background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", padding: "0 16px", gap: 10,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4dff9b", boxShadow: "0 0 6px #4dff9b", animation: "pulse-dot 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: "var(--ae-text)", letterSpacing: "0.04em" }}>
            {selectedAgent ? `#${selectedAgent}` : "#ALL-CREW"}
          </span>
          {selectedAgent && (
            <span style={{ ...mono, fontSize: 7, color: roleHex(agents?.find((a: { name: string }) => a.name === selectedAgent)?.role ?? ""), padding: "1px 6px", border: `1px solid ${roleHex(agents?.find((a: { name: string }) => a.name === selectedAgent)?.role ?? "")}55` }}>
              {agents?.find((a: { name: string }) => a.name === selectedAgent)?.role?.toUpperCase()}
            </span>
          )}
          <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginLeft: "auto" }}>
            {aiConfig ? `🤖 AI: ${aiConfig.provider}` : "💬 FALLBACK MODE"} · {messages.length} MSG
          </span>
        </div>

        {/* Messages */}
        <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isCmd = msg.type === "commander";
              const isSys = msg.type === "system";
              const color = isSys ? "var(--ae-muted)" : isCmd ? "#ffd700" : roleHex(msg.role);

              if (isSys) return (
                <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", padding: "6px 0" }}
                >
                  <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", letterSpacing: "0.1em", padding: "2px 12px", border: "1px solid var(--ae-border)" }}>
                    ── {msg.text} ──
                  </span>
                </motion.div>
              );

              return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, x: isCmd ? 12 : -8, y: 4 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{
                    display: "flex", gap: 10, padding: "6px 0",
                    flexDirection: isCmd ? "row-reverse" : "row",
                    alignItems: "flex-start",
                  }}
                >
                  {!isCmd && (
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      <AgentAvatar role={msg.role} size={28} />
                    </div>
                  )}
                  {isCmd && (
                    <div style={{
                      width: 28, height: 28, flexShrink: 0, marginTop: 2,
                      background: "#ffd70022", border: "1px solid #ffd70066",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Zap size={12} style={{ color: "#ffd700" }} />
                    </div>
                  )}
                  <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", gap: 3, alignItems: isCmd ? "flex-end" : "flex-start" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: isCmd ? "row-reverse" : "row" }}>
                      <span style={{ ...mono, fontSize: 8, fontWeight: 700, color }}>{msg.from}</span>
                      <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>{fmtTime(msg.ts)}</span>
                    </div>
                    <div style={{
                      padding: "7px 11px",
                      background: isCmd ? "rgba(255,215,0,0.08)" : "rgba(0,0,0,0.35)",
                      border: `1px solid ${color}33`,
                      position: "relative",
                    }}>
                      <div style={{
                        position: "absolute", top: 0, [isCmd ? "right" : "left"]: 0,
                        width: 5, height: 5,
                        borderTop: `2px solid ${color}`,
                        [isCmd ? "borderRight" : "borderLeft"]: `2px solid ${color}`,
                      }} />
                      <span style={{ ...mono, fontSize: 9, color: "var(--ae-text)", lineHeight: 1.6 }}>{msg.text}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && (
              <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}
              >
                <div style={{ width: 28, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ae-cyan)", animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
                <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)" }}>{isTyping} is transmitting...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Commands */}
        <div style={{ padding: "6px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK_COMMANDS.map(cmd => (
            <button key={cmd.label} onClick={() => sendMessage(cmd.msg, selectedAgent ?? undefined)}
              style={{
                ...mono, fontSize: 7, padding: "3px 9px",
                background: "rgba(91,143,255,0.06)", border: "1px solid var(--ae-border)",
                color: "var(--ae-muted)", cursor: "pointer", letterSpacing: "0.06em",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-cyan)"; (e.currentTarget as HTMLElement).style.color = "var(--ae-cyan)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ae-border)"; (e.currentTarget as HTMLElement).style.color = "var(--ae-muted)"; }}
            >
              {cmd.icon} {cmd.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.3)", display: "flex", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", gap: 0, border: "1px solid var(--ae-border)", transition: "border-color 0.15s" }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--ae-cyan)")}
            onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--ae-border)")}
          >
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-cyan)", padding: "0 10px", display: "flex", alignItems: "center", background: "rgba(91,143,255,0.07)", borderRight: "1px solid var(--ae-border)", flexShrink: 0 }}>
              {selectedAgent ? `→ ${selectedAgent}` : "BROADCAST"}
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={aiConfig ? "Enter command or message... (AI enabled)" : "Enter command or message... (fallback mode)"}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                padding: "8px 12px", ...mono, fontSize: 9, color: "var(--ae-text)",
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="pixel-btn primary"
            style={{ fontSize: 9, padding: "0 14px", flexShrink: 0, opacity: input.trim() ? 1 : 0.4 }}
          >
            <Send size={11} />
          </button>
        </div>
      </div>

      {/* RIGHT: STATS PANEL */}
      <div style={{ width: 200, flexShrink: 0, borderLeft: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ae-border)" }}>
          <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>TRANSMISSION LOG</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "TOTAL MSG", value: String(messages.length), color: "var(--ae-cyan)" },
            { label: "AGENTS ONLINE", value: String(agents?.filter((a: { status: string }) => a.status !== "offline").length ?? 0), color: "var(--ae-green)" },
            { label: "CMD SENT", value: String(messages.filter(m => m.type === "commander").length), color: "#ffd700" },
            { label: "RESPONSES", value: String(messages.filter(m => m.type === "agent").length), color: "var(--ae-blue)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)" }}>
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.08em" }}>{s.label}</span>
              <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}

          {/* AI config status */}
          <div style={{ marginTop: 4, padding: "8px 10px", border: `1px solid ${aiConfig ? "var(--ae-green)" : "var(--ae-border)"}`, background: aiConfig ? "rgba(77,255,155,0.06)" : "rgba(0,0,0,0.2)" }}>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>AI ENGINE</div>
            {aiConfig ? (
              <>
                <div style={{ ...mono, fontSize: 8, color: "var(--ae-green)", fontWeight: 700 }}>{aiConfig.provider.toUpperCase()}</div>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", marginTop: 2 }}>ACTIVE</div>
              </>
            ) : (
              <>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", marginBottom: 6 }}>No API key set. Using fallback responses.</div>
                <Link href="/app/settings" style={{ ...mono, fontSize: 7, color: "var(--ae-cyan)", textDecoration: "none", display: "block", padding: "4px 0", letterSpacing: "0.08em" }}>
                  → CONFIGURE AI
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
