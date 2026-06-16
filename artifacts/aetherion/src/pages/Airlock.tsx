import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle, XCircle, RefreshCw, AlertTriangle, ChevronDown, Filter, Eye, EyeOff, GitPullRequest, GitMerge, ExternalLink } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  research:  "#4df0d8",
  strategy:  "#9b6dff",
  builder:   "#4d7fff",
  content:   "#ffb84d",
  growth:    "#4dff9b",
  analytics: "#ff4d6d",
  design:    "#c084fc",
};

const STATUS_COLORS: Record<string, string> = {
  pending:           "#ffb84d",
  approved:          "#4dff9b",
  rejected:          "#ff4d6d",
  changes_requested: "#9b6dff",
};

const STATUS_LABELS: Record<string, string> = {
  pending:           "PENDING",
  approved:          "APPROVED",
  rejected:          "REJECTED",
  changes_requested: "CHANGES",
};

interface AirlockEntry {
  id: number;
  taskId: number;
  agentId: number;
  agentName: string;
  agentRole: string;
  taskTitle: string;
  outputId: number | null;
  outputType: string | null;
  outputData: string | null;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  reviewerNotes: string | null;
  bonusXp: number;
  bonusRevenue: number;
  stationId: number;
  createdAt: string;
  reviewedAt: string | null;
  prUrl: string | null;
  branchName: string | null;
  taskReviewStatus: string;
}

interface AirlockStats {
  pending: number;
  approved: number;
  rejected: number;
  changes_requested: number;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

async function fetchEntries(statusFilter: string): Promise<AirlockEntry[]> {
  const resp = await fetch(`/api/airlock?status=${statusFilter}`);
  if (!resp.ok) throw new Error("Failed to fetch airlock entries");
  return resp.json() as Promise<AirlockEntry[]>;
}

async function fetchStats(): Promise<AirlockStats> {
  const resp = await fetch("/api/airlock/stats");
  if (!resp.ok) throw new Error("Failed to fetch airlock stats");
  return resp.json() as Promise<AirlockStats>;
}

async function reviewEntry(id: number, action: "approve" | "reject" | "changes", notes?: string): Promise<AirlockEntry | null> {
  const endpoint = `/api/airlock/${id}/${action === "approve" ? "approve" : action === "reject" ? "reject" : "changes"}`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  if (resp.status === 400) return null;
  if (!resp.ok) throw new Error("Review action failed");
  return resp.json() as Promise<AirlockEntry>;
}

function OutputPreview({ entry, expanded }: { entry: AirlockEntry; expanded: boolean }) {
  const mono = { fontFamily: "'Space Mono', monospace" };
  if (!entry.outputData && !entry.outputType) {
    return (
      <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)", padding: "8px 0", letterSpacing: "0.06em" }}>
        NO OUTPUT DATA
      </div>
    );
  }

  let parsed: Record<string, unknown> | null = null;
  try {
    if (entry.outputData) parsed = JSON.parse(entry.outputData) as Record<string, unknown>;
  } catch {}

  const roleColor = ROLE_COLORS[entry.agentRole] ?? "#4df0d8";

  return (
    <div style={{
      marginTop: 8,
      background: "rgba(0,0,0,0.3)",
      border: `1px solid ${roleColor}22`,
      padding: "8px 10px",
      maxHeight: expanded ? 280 : 0,
      overflow: "hidden",
      transition: "max-height 0.3s ease",
    }}>
      {entry.outputType && (
        <div style={{ ...mono, fontSize: 7, color: roleColor, letterSpacing: "0.12em", marginBottom: 6 }}>
          OUTPUT TYPE: {entry.outputType.toUpperCase()}
        </div>
      )}
      {parsed ? (
        <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {typeof parsed.content === "string"
            ? parsed.content.slice(0, 600) + (parsed.content.length > 600 ? "…" : "")
            : JSON.stringify(parsed, null, 2).slice(0, 600)}
        </div>
      ) : (
        <div style={{ ...mono, fontSize: 8, color: "var(--ae-text)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {entry.outputData?.slice(0, 600) ?? ""}
        </div>
      )}
    </div>
  );
}

function AirlockCard({
  entry,
  onReview,
}: {
  entry: AirlockEntry;
  onReview: (id: number, action: "approve" | "reject" | "changes", notes?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionPending, setActionPending] = useState<string | null>(null);
  const mono = { fontFamily: "'Space Mono', monospace" };
  const roleColor = ROLE_COLORS[entry.agentRole] ?? "#4df0d8";
  const statusColor = STATUS_COLORS[entry.status] ?? "#ffb84d";
  const isPending = entry.status === "pending" || entry.status === "changes_requested";

  const handleAction = async (action: "approve" | "reject" | "changes") => {
    setActionPending(action);
    try {
      await onReview(entry.id, action, notes || undefined);
    } catch {
      // silently ignore — entry may have already been reviewed
    } finally {
      setActionPending(null);
      setNotesOpen(false);
      setNotes("");
    }
  };

  const timeAgo = (() => {
    const diff = Date.now() - new Date(entry.createdAt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      layout
      style={{
        background: "linear-gradient(135deg, rgba(15,17,24,0.97) 0%, rgba(10,11,15,0.99) 100%)",
        border: `1px solid ${isPending ? roleColor + "44" : statusColor + "44"}`,
        padding: "14px 16px",
        position: "relative",
        boxShadow: isPending ? `0 0 18px ${roleColor}11` : "none",
      }}
    >
      {/* Corner accents */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `2px solid ${roleColor}`, borderLeft: `2px solid ${roleColor}` }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderBottom: `2px solid ${statusColor}`, borderRight: `2px solid ${statusColor}` }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Role icon block */}
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          background: `${roleColor}15`, border: `1px solid ${roleColor}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: roleColor, textShadow: `0 0 8px ${roleColor}`,
        }}>
          {entry.agentRole.slice(0, 3).toUpperCase()}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ ...mono, fontWeight: 700, fontSize: 11, color: "var(--ae-text)" }}>
              {entry.agentName}
            </span>
            <span style={{ ...mono, fontSize: 7, color: roleColor, padding: "1px 5px", border: `1px solid ${roleColor}44`, background: `${roleColor}10` }}>
              {entry.agentRole.toUpperCase()}
            </span>
            <span style={{ ...mono, fontSize: 7, color: statusColor, padding: "1px 5px", border: `1px solid ${statusColor}44`, background: `${statusColor}10` }}>
              {STATUS_LABELS[entry.status]}
            </span>
          </div>
          <div style={{ ...mono, fontSize: 9, color: "var(--ae-muted)", marginBottom: 2, letterSpacing: "0.04em" }}>
            {entry.taskTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>{timeAgo}</span>
            {entry.outputType && (
              <span style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.06em" }}>
                · {entry.outputType.toUpperCase()}
              </span>
            )}
            <span style={{ ...mono, fontSize: 7, color: "#ffd700" }}>+{entry.bonusXp}XP</span>
            {entry.bonusRevenue > 0 && (
              <span style={{ ...mono, fontSize: 7, color: "#4dff9b" }}>+${entry.bonusRevenue}</span>
            )}
          </div>

          {/* PR Badge for builder agents */}
          {entry.prUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
              {entry.taskReviewStatus === "merged" ? (
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  ...mono, fontSize: 7, color: "#c084fc", padding: "2px 7px",
                  border: "1px solid #c084fc44", background: "#c084fc10",
                  letterSpacing: "0.06em",
                }}>
                  <GitMerge size={8} />
                  PR MERGED
                </span>
              ) : (
                <span style={{
                  display: "flex", alignItems: "center", gap: 4,
                  ...mono, fontSize: 7, color: "#4d7fff", padding: "2px 7px",
                  border: "1px solid #4d7fff44", background: "#4d7fff10",
                  letterSpacing: "0.06em",
                }}>
                  <GitPullRequest size={8} />
                  PR OPEN
                </span>
              )}
              {entry.branchName && (
                <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", letterSpacing: "0.04em" }}>
                  {entry.branchName.slice(0, 28)}{entry.branchName.length > 28 ? "…" : ""}
                </span>
              )}
              <a
                href={entry.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  ...mono, fontSize: 7, color: "#4d7fff", textDecoration: "none",
                  padding: "1px 5px", border: "1px solid #4d7fff33",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#4d7fff88"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#4d7fff33"; }}
              >
                <ExternalLink size={7} />
                VIEW
              </a>
            </div>
          )}
        </div>

        {/* Preview toggle */}
        {(entry.outputData || entry.outputType) && (
          <button
            onClick={() => setExpanded(v => !v)}
            title={expanded ? "Hide output" : "Show output"}
            style={{
              background: "none", border: "1px solid var(--ae-border)", cursor: "pointer",
              color: expanded ? roleColor : "var(--ae-muted)", padding: "4px 6px",
              display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = roleColor; (e.currentTarget as HTMLButtonElement).style.color = roleColor; }}
            onMouseLeave={e => { if (!expanded) { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ae-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--ae-muted)"; } }}
          >
            {expanded ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        )}
      </div>

      {/* Output preview */}
      <OutputPreview entry={entry} expanded={expanded} />

      {/* Reviewer notes display */}
      {!isPending && entry.reviewerNotes && (
        <div style={{
          marginTop: 8, padding: "6px 10px",
          background: "rgba(0,0,0,0.2)", border: `1px solid ${statusColor}22`,
        }}>
          <div style={{ ...mono, fontSize: 7, color: statusColor, letterSpacing: "0.1em", marginBottom: 3 }}>COMMANDER NOTES</div>
          <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", lineHeight: 1.7 }}>{entry.reviewerNotes}</div>
        </div>
      )}

      {/* Action buttons (only for pending/changes_requested) */}
      {isPending && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {notesOpen && (
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes for agent..."
                rows={2}
                style={{
                  width: "100%", resize: "vertical", background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--ae-border)", color: "var(--ae-text)", padding: "6px 8px",
                  fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.04em",
                  outline: "none", boxSizing: "border-box", marginBottom: 6,
                }}
              />
            )}
          </div>

          <button
            onClick={() => setNotesOpen(v => !v)}
            style={{
              ...mono, fontSize: 7, padding: "5px 10px", cursor: "pointer", letterSpacing: "0.06em",
              background: notesOpen ? "rgba(91,143,255,0.1)" : "none",
              border: "1px solid var(--ae-border)", color: "var(--ae-muted)", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <ChevronDown size={9} style={{ transform: notesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            NOTES
          </button>

          <button
            disabled={actionPending !== null}
            onClick={() => handleAction("changes")}
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 6, padding: "5px 10px",
              cursor: actionPending ? "not-allowed" : "pointer", letterSpacing: "0.04em",
              background: actionPending === "changes" ? "rgba(155,109,255,0.2)" : "rgba(155,109,255,0.08)",
              border: "1px solid #9b6dff", color: "#9b6dff",
              opacity: actionPending && actionPending !== "changes" ? 0.5 : 1, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <AlertTriangle size={9} />
            {actionPending === "changes" ? "…" : "CHANGES"}
          </button>

          <button
            disabled={actionPending !== null}
            onClick={() => handleAction("reject")}
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 6, padding: "5px 10px",
              cursor: actionPending ? "not-allowed" : "pointer", letterSpacing: "0.04em",
              background: actionPending === "reject" ? "rgba(255,77,109,0.2)" : "rgba(255,77,109,0.08)",
              border: "1px solid #ff4d6d", color: "#ff4d6d",
              opacity: actionPending && actionPending !== "reject" ? 0.5 : 1, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <XCircle size={9} />
            {actionPending === "reject" ? "…" : "REJECT"}
          </button>

          <button
            disabled={actionPending !== null}
            onClick={() => handleAction("approve")}
            style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 6, padding: "5px 12px",
              cursor: actionPending ? "not-allowed" : "pointer", letterSpacing: "0.04em",
              background: actionPending === "approve" ? "rgba(77,255,155,0.2)" : "rgba(77,255,155,0.08)",
              border: "1px solid #4dff9b", color: "#4dff9b",
              opacity: actionPending && actionPending !== "approve" ? 0.5 : 1, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 4,
              boxShadow: actionPending === "approve" ? "0 0 12px rgba(77,255,155,0.3)" : "none",
            }}
          >
            <CheckCircle size={9} />
            {actionPending === "approve" ? "…" : "APPROVE"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function Airlock() {
  const [entries, setEntries] = useState<AirlockEntry[]>([]);
  const [stats, setStats] = useState<AirlockStats>({ pending: 0, approved: 0, rejected: 0, changes_requested: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [approvingRole, setApprovingRole] = useState<string | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);
  const [mobileQuickOpen, setMobileQuickOpen] = useState(false);
  const isMobile = useIsMobile();
  const mono = { fontFamily: "'Space Mono', monospace" };

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [e, s] = await Promise.all([fetchEntries(statusFilter), fetchStats()]);
      setEntries(e);
      setStats(s);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(), 12000);
    return () => clearInterval(id);
  }, [load]);

  const handleReview = useCallback(async (id: number, action: "approve" | "reject" | "changes", notes?: string) => {
    await reviewEntry(id, action, notes);
    await load(false);
  }, [load]);

  const handleApproveByRole = useCallback(async (role: string) => {
    setApprovingRole(role);
    try {
      const pending = entries.filter(e => e.agentRole === role && (e.status === "pending" || e.status === "changes_requested"));
      for (const e of pending) {
        await reviewEntry(e.id, "approve");
      }
      await load(false);
    } finally {
      setApprovingRole(null);
    }
  }, [entries, load]);

  const handleApproveAll = useCallback(async () => {
    setApprovingAll(true);
    try {
      const pending = entries.filter(e => e.status === "pending" || e.status === "changes_requested");
      for (const e of pending) {
        await reviewEntry(e.id, "approve");
      }
      await load(false);
    } finally {
      setApprovingAll(false);
    }
  }, [entries, load]);

  const filtered = entries.filter(e => roleFilter === "all" || e.agentRole === roleFilter);
  const roles = Array.from(new Set(entries.map(e => e.agentRole)));

  const pendingEntries = entries.filter(e => e.status === "pending" || e.status === "changes_requested");
  const roleGroups: { role: string; count: number; color: string }[] = Object.entries(
    pendingEntries.reduce<Record<string, number>>((acc, e) => {
      acc[e.agentRole] = (acc[e.agentRole] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([role, count]) => ({ role, count, color: ROLE_COLORS[role] ?? "#4df0d8" }))
    .sort((a, b) => b.count - a.count);

  const FILTER_TABS = [
    { key: "pending",           label: "PENDING",  color: "#ffb84d" },
    { key: "changes_requested", label: "CHANGES",  color: "#9b6dff" },
    { key: "approved",          label: "APPROVED", color: "#4dff9b" },
    { key: "rejected",          label: "REJECTED", color: "#ff4d6d" },
    { key: "all",               label: "ALL",      color: "var(--ae-muted)" },
  ];

  const totalPending = stats.pending + stats.changes_requested;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: isMobile ? "column" : "row" }}>
      {/* LEFT: MAIN PANEL */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px 14px" : "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(90deg, rgba(77,240,216,0.08) 0%, rgba(77,127,255,0.05) 60%, rgba(0,0,0,0) 100%)",
          border: "1px solid var(--ae-cyan)",
          padding: isMobile ? "10px 12px" : "13px 18px",
          marginBottom: isMobile ? 12 : 18,
          position: "relative",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 0 24px rgba(77,240,216,0.12), inset 0 0 40px rgba(77,240,216,0.03)",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--ae-cyan)", borderLeft: "2px solid var(--ae-cyan)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--ae-cyan)", borderRight: "2px solid var(--ae-cyan)" }} />
          <Shield size={isMobile ? 14 : 18} style={{ color: "var(--ae-cyan)", filter: "drop-shadow(0 0 6px var(--ae-cyan))", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: isMobile ? 8 : 10, color: "var(--ae-cyan)", letterSpacing: "0.04em", textShadow: "0 0 14px rgba(77,240,216,0.7)" }}>
              SECURITY AIRLOCK
            </span>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", marginTop: 3, letterSpacing: "0.08em" }}>
              {totalPending > 0 ? `${totalPending} PENDING REVIEW` : "NO PENDING REVIEWS"} · {stats.approved} APPROVED TOTAL
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ae-muted)", padding: 4, display: "flex" }}
          >
            <RefreshCw size={11} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 12, overflowX: "auto" }}>
          {FILTER_TABS.map(tab => {
            const count = tab.key === "all"
              ? Object.values(stats).reduce((a, b) => a + b, 0)
              : tab.key === "pending" ? stats.pending
              : tab.key === "changes_requested" ? stats.changes_requested
              : tab.key === "approved" ? stats.approved
              : stats.rejected;
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  ...mono, fontSize: 7, padding: "6px 12px", cursor: "pointer",
                  letterSpacing: "0.08em", border: "1px solid var(--ae-border)",
                  borderRight: "none",
                  background: isActive ? `${tab.color}18` : "transparent",
                  color: isActive ? tab.color : "var(--ae-muted)",
                  borderColor: isActive ? tab.color + "88" : "var(--ae-border)",
                  transition: "all 0.15s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    fontSize: 7, padding: "0 4px", borderRadius: 2,
                    background: isActive ? tab.color + "22" : "rgba(255,255,255,0.06)",
                    color: isActive ? tab.color : "var(--ae-dim)",
                    border: `1px solid ${isActive ? tab.color + "44" : "var(--ae-border)"}`,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
          <button
            style={{ flex: 1, border: "1px solid var(--ae-border)", background: "none", cursor: "default" }}
          />
        </div>

        {/* Mobile quick-approve by role strip */}
        {isMobile && roleGroups.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => setMobileQuickOpen(v => !v)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 10px", background: "rgba(77,255,155,0.06)", border: "1px solid rgba(77,255,155,0.3)",
                cursor: "pointer", ...mono, fontSize: 7, color: "#4dff9b", letterSpacing: "0.08em",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={10} />
                QUICK APPROVE BY ROLE
              </span>
              <span style={{ fontSize: 9, transition: "transform 0.2s", display: "inline-block", transform: mobileQuickOpen ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
            {mobileQuickOpen && (
              <div style={{ border: "1px solid rgba(77,255,155,0.2)", borderTop: "none", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, background: "rgba(0,0,0,0.3)" }}>
                {roleGroups.map(({ role, count, color }) => (
                  <div key={role} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
                    <span style={{ ...mono, fontSize: 8, color, flex: 1, letterSpacing: "0.06em" }}>{role.toUpperCase()}</span>
                    <span style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", minWidth: 20, textAlign: "right" }}>{count}</span>
                    <button
                      disabled={approvingRole === role}
                      onClick={() => handleApproveByRole(role)}
                      style={{
                        ...mono, fontSize: 7, padding: "3px 8px", cursor: approvingRole === role ? "not-allowed" : "pointer",
                        background: `${color}12`, border: `1px solid ${color}66`, color,
                        letterSpacing: "0.06em", opacity: approvingRole && approvingRole !== role ? 0.5 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      {approvingRole === role ? "…" : "APPROVE"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Role filter */}
        {roles.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <Filter size={10} style={{ color: "var(--ae-muted)", flexShrink: 0 }} />
            {["all", ...roles].map(role => {
              const isActive = roleFilter === role;
              const color = role === "all" ? "var(--ae-muted)" : (ROLE_COLORS[role] ?? "var(--ae-muted)");
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  style={{
                    ...mono, fontSize: 7, padding: "3px 8px", cursor: "pointer",
                    background: isActive ? `${color}15` : "transparent",
                    border: `1px solid ${isActive ? color : "var(--ae-border)"}`,
                    color: isActive ? color : "var(--ae-muted)",
                    letterSpacing: "0.08em", transition: "all 0.15s",
                  }}
                >
                  {role.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Entry list */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: 8, padding: 40 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-cyan)", animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Shield size={32} style={{ color: "var(--ae-border)", margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: "var(--ae-dim)", marginBottom: 8 }}>
              {statusFilter === "pending" ? "AIRLOCK CLEAR" : "NO ENTRIES"}
            </div>
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-dim)" }}>
              {statusFilter === "pending" ? "All outputs have been reviewed" : `No ${statusFilter} entries`}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(entry => (
                <AirlockCard key={entry.id} entry={entry} onReview={handleReview} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* RIGHT: STATS PANEL */}
      {!isMobile && (
        <div style={{
          width: 220, flexShrink: 0,
          borderLeft: "1px solid var(--ae-border)",
          background: "rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--ae-border)", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em" }}>
              STATS
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Stat blocks */}
            {[
              { label: "PENDING",  value: stats.pending,           color: "#ffb84d" },
              { label: "CHANGES",  value: stats.changes_requested, color: "#9b6dff" },
              { label: "APPROVED", value: stats.approved,          color: "#4dff9b" },
              { label: "REJECTED", value: stats.rejected,          color: "#ff4d6d" },
            ].map(s => (
              <div key={s.label} style={{ padding: "10px 12px", background: `${s.color}08`, border: `1px solid ${s.color}33`, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 6, height: 6, borderTop: `2px solid ${s.color}`, borderLeft: `2px solid ${s.color}` }} />
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 18, color: s.color, textShadow: `0 0 12px ${s.color}66` }}>{s.value}</div>
              </div>
            ))}

            {/* Total reviewed */}
            <div style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)", marginTop: 4 }}>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>TOTAL REVIEWED</div>
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: "var(--ae-text)" }}>
                {stats.approved + stats.rejected + stats.changes_requested}
              </div>
            </div>

            {/* Approval rate */}
            {(stats.approved + stats.rejected) > 0 && (
              <div style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--ae-border)" }}>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>APPROVAL RATE</div>
                <div style={{ height: 6, background: "var(--ae-border)", marginBottom: 4 }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.round((stats.approved / (stats.approved + stats.rejected)) * 100)}%`,
                    background: "linear-gradient(to right, #4d7fff, #4dff9b)",
                    boxShadow: "0 0 6px rgba(77,255,155,0.4)",
                    transition: "width 1s",
                  }} />
                </div>
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: "#4dff9b" }}>
                  {Math.round((stats.approved / (stats.approved + stats.rejected)) * 100)}%
                </div>
              </div>
            )}

            {/* By-role breakdown */}
            {roleGroups.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.1em", marginBottom: 8, paddingTop: 4, borderTop: "1px solid var(--ae-border)" }}>
                  BY ROLE
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {roleGroups.map(({ role, count, color }) => (
                    <div key={role} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
                      <span style={{ ...mono, fontSize: 7, color, flex: 1, letterSpacing: "0.05em", textTransform: "uppercase" }}>{role}</span>
                      <span style={{ ...mono, fontSize: 8, fontWeight: 700, color, minWidth: 18, textAlign: "right" }}>{count}</span>
                      <button
                        title={`Approve all ${role} outputs`}
                        disabled={approvingRole !== null || approvingAll}
                        onClick={() => handleApproveByRole(role)}
                        style={{
                          fontFamily: "'Press Start 2P', monospace", fontSize: 5,
                          padding: "3px 5px", cursor: (approvingRole !== null || approvingAll) ? "not-allowed" : "pointer",
                          background: approvingRole === role ? `${color}22` : `${color}0e`,
                          border: `1px solid ${color}55`, color,
                          opacity: (approvingRole !== null && approvingRole !== role) || approvingAll ? 0.4 : 1,
                          transition: "all 0.15s", letterSpacing: "0.04em", lineHeight: 1.4,
                          minWidth: 42, textAlign: "center",
                        }}
                        onMouseEnter={e => { if (!approvingRole && !approvingAll) { (e.currentTarget as HTMLButtonElement).style.background = `${color}22`; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 8px ${color}44`; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}0e`; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                      >
                        {approvingRole === role ? "…" : `OK ×${count}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick-approve all button */}
          {(stats.pending > 0 || stats.changes_requested > 0) && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--ae-border)", flexShrink: 0 }}>
              <button
                disabled={approvingAll || approvingRole !== null}
                onClick={handleApproveAll}
                style={{
                  width: "100%", fontFamily: "'Press Start 2P',monospace", fontSize: 6,
                  padding: "8px 12px", cursor: (approvingAll || approvingRole !== null) ? "not-allowed" : "pointer",
                  letterSpacing: "0.06em",
                  background: approvingAll ? "rgba(77,255,155,0.16)" : "rgba(77,255,155,0.08)",
                  border: "1px solid #4dff9b", color: "#4dff9b",
                  opacity: approvingRole !== null ? 0.5 : 1,
                  transition: "all 0.15s", lineHeight: 1.6,
                  boxShadow: approvingAll ? "0 0 16px rgba(77,255,155,0.3)" : "none",
                }}
                onMouseEnter={e => { if (!approvingAll && !approvingRole) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(77,255,155,0.16)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(77,255,155,0.25)"; } }}
                onMouseLeave={e => { if (!approvingAll) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(77,255,155,0.08)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; } }}
              >
                {approvingAll ? "APPROVING…" : "APPROVE ALL"}<br />
                <span style={{ fontSize: 5, color: "rgba(77,255,155,0.65)" }}>
                  ({(stats.pending + stats.changes_requested)} PENDING)
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
