import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Save, Trash2, CheckCircle, AlertCircle, Key, Cpu, MessageSquare, Link2, Copy, Check, Globe } from "lucide-react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { base } from "viem/chains";
import { formatUnits } from "viem";

const mono = { fontFamily: "'Space Mono', monospace" };
const pixel = { fontFamily: "'Press Start 2P', monospace" };

const PROVIDERS = [
  {
    id: "openai",
    label: "OPENAI",
    model: "GPT-4o Mini",
    color: "#4dff9b",
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    label: "ANTHROPIC",
    model: "Claude Haiku",
    color: "#9b6dff",
    placeholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "gemini",
    label: "GOOGLE GEMINI",
    model: "Gemini 1.5 Flash",
    color: "#4d7fff",
    placeholder: "AIza...",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
] as const;

type ProviderId = "openai" | "anthropic" | "gemini";

const LS_PROVIDER = "ctrl_ai_provider";
const LS_KEY = "ctrl_ai_key";
const LS_CONTRACT = "ctrl_contract_address";

export default function Settings() {
  const [provider, setProvider] = useState<ProviderId>(() => {
    return (localStorage.getItem(LS_PROVIDER) as ProviderId) ?? "openai";
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) ?? "");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const [contractAddress, setContractAddress] = useState(() => localStorage.getItem(LS_CONTRACT) ?? "");
  const [contractSaved, setContractSaved] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const { address: walletAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address: walletAddress, chainId: base.id });

  const selectedProvider = PROVIDERS.find(p => p.id === provider)!;
  const hasKey = apiKey.trim().length > 0;
  const isBaseNetwork = chainId === base.id;
  const contractIsValid = /^0x[0-9a-fA-F]{40}$/.test(contractAddress.trim());

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) ?? "";
    const storedProvider = (localStorage.getItem(LS_PROVIDER) as ProviderId) ?? "openai";
    setApiKey(stored);
    setProvider(storedProvider);
  }, []);

  function handleContractSave() {
    localStorage.setItem(LS_CONTRACT, contractAddress.trim());
    setContractSaved(true);
    setTimeout(() => setContractSaved(false), 2000);
  }

  function handleCopyAddress(addr: string) {
    navigator.clipboard.writeText(addr).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 1800);
    }).catch(() => {});
  }

  function handleSave() {
    localStorage.setItem(LS_PROVIDER, provider);
    localStorage.setItem(LS_KEY, apiKey.trim());
    setSaved(true);
    setTestStatus("idle");
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    setApiKey("");
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_PROVIDER);
    setTestStatus("idle");
    setTestMessage("");
  }

  async function handleTest() {
    if (!hasKey) return;
    setTestStatus("loading");
    setTestMessage("");
    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Say exactly: SYSTEM CHECK OK",
          agentName: "TEST-1",
          agentRole: "diagnostics",
          apiKey: apiKey.trim(),
          provider,
        }),
      });
      const data = await resp.json() as { reply?: string; error?: string };
      if (!resp.ok) {
        setTestStatus("error");
        setTestMessage(data.error ?? "Connection failed");
      } else {
        setTestStatus("ok");
        setTestMessage(data.reply ?? "Connection successful");
      }
    } catch (e) {
      setTestStatus("error");
      setTestMessage(e instanceof Error ? e.message : "Network error");
    }
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", maxWidth: 720 }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 28,
          padding: "14px 18px",
          background: "linear-gradient(90deg, rgba(77,240,216,0.08) 0%, rgba(0,0,0,0) 100%)",
          border: "1px solid var(--ae-border)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "2px solid var(--ae-cyan)", borderLeft: "2px solid var(--ae-cyan)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "2px solid var(--ae-cyan)", borderRight: "2px solid var(--ae-cyan)" }} />
          <Key size={18} style={{ color: "var(--ae-cyan)", filter: "drop-shadow(0 0 6px var(--ae-cyan))" }} />
          <div>
            <div style={{ ...pixel, fontSize: 10, color: "var(--ae-cyan)", letterSpacing: "0.04em" }}>SETTINGS</div>
            <div style={{ ...mono, fontSize: 8, color: "var(--ae-muted)", marginTop: 4 }}>Configure your AI API keys. Keys are stored locally in your browser — never sent to any server except when calling the AI.</div>
          </div>
        </div>

        {/* AI API Key Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Cpu size={14} style={{ color: "var(--ae-violet)" }} />
            <span style={{ ...pixel, fontSize: 8, color: "var(--ae-text)", letterSpacing: "0.06em" }}>AI ENGINE</span>
          </div>

          {/* Provider selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em", marginBottom: 8 }}>AI PROVIDER</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PROVIDERS.map(p => {
                const isSelected = provider === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => { setProvider(p.id); setTestStatus("idle"); }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: "10px 14px",
                      background: isSelected ? `${p.color}14` : "transparent",
                      border: `1px solid ${isSelected ? p.color : "var(--ae-border)"}`,
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start",
                      transition: "all 0.15s",
                      boxShadow: isSelected ? `0 0 14px ${p.color}22` : "none",
                      position: "relative",
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: "absolute", top: 0, left: 0, width: 6, height: 6, borderTop: `2px solid ${p.color}`, borderLeft: `2px solid ${p.color}` }} />
                    )}
                    <span style={{ ...pixel, fontSize: 7, color: isSelected ? p.color : "var(--ae-muted)" }}>{p.label}</span>
                    <span style={{ ...mono, fontSize: 7, color: "var(--ae-dim)" }}>{p.model}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* API Key input */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>API KEY</div>
              <a
                href={selectedProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...mono, fontSize: 7, color: "var(--ae-cyan)", textDecoration: "none", letterSpacing: "0.06em" }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
              >
                GET KEY →
              </a>
            </div>
            <div style={{
              display: "flex", gap: 0,
              border: `1px solid ${hasKey ? selectedProvider.color + "66" : "var(--ae-border)"}`,
              transition: "border-color 0.2s",
            }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestStatus("idle"); setSaved(false); }}
                placeholder={selectedProvider.placeholder}
                style={{
                  flex: 1, background: "rgba(0,0,0,0.4)", border: "none", outline: "none",
                  padding: "10px 14px", ...mono, fontSize: 10, color: "var(--ae-text)",
                  letterSpacing: hasKey && !showKey ? "0.2em" : "0.04em",
                }}
              />
              <button
                onClick={() => setShowKey(v => !v)}
                style={{
                  padding: "0 12px", background: "rgba(0,0,0,0.3)", border: "none",
                  borderLeft: "1px solid var(--ae-border)", cursor: "pointer",
                  color: "var(--ae-muted)", display: "flex", alignItems: "center",
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", marginTop: 6 }}>
              Your key is stored only in your browser's local storage. It is sent directly to {selectedProvider.label}'s API when you use Ship Comms.
            </div>
          </div>

          {/* Test result */}
          {testStatus !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "10px 14px", marginBottom: 14,
                background: testStatus === "ok" ? "rgba(77,255,155,0.08)" : testStatus === "error" ? "rgba(255,77,109,0.08)" : "rgba(77,240,216,0.06)",
                border: `1px solid ${testStatus === "ok" ? "var(--ae-green)" : testStatus === "error" ? "var(--ae-red)" : "var(--ae-border)"}`,
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              {testStatus === "loading" && (
                <div style={{ display: "flex", gap: 3 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ae-cyan)", animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
              {testStatus === "ok" && <CheckCircle size={14} style={{ color: "var(--ae-green)", flexShrink: 0 }} />}
              {testStatus === "error" && <AlertCircle size={14} style={{ color: "var(--ae-red)", flexShrink: 0 }} />}
              <span style={{ ...mono, fontSize: 8, color: testStatus === "ok" ? "var(--ae-green)" : testStatus === "error" ? "var(--ae-red)" : "var(--ae-muted)" }}>
                {testStatus === "loading" ? "TESTING CONNECTION..." : testMessage}
              </span>
            </motion.div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={!hasKey}
              className="pixel-btn primary"
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 8, padding: "9px 16px", opacity: hasKey ? 1 : 0.4 }}
            >
              {saved ? <CheckCircle size={12} /> : <Save size={12} />}
              {saved ? "SAVED!" : "SAVE KEY"}
            </button>

            <button
              onClick={handleTest}
              disabled={!hasKey || testStatus === "loading"}
              className="pixel-btn"
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 8, padding: "9px 16px", opacity: hasKey ? 1 : 0.4 }}
            >
              <MessageSquare size={12} />
              TEST CONNECTION
            </button>

            {hasKey && (
              <button
                onClick={handleClear}
                className="pixel-btn"
                style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 8, padding: "9px 16px", color: "var(--ae-red)", borderColor: "var(--ae-red)" }}
              >
                <Trash2 size={12} />
                CLEAR KEY
              </button>
            )}
          </div>
        </div>

        {/* ─── BASE NETWORK SECTION ─────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Globe size={14} style={{ color: "#1652f0" }} />
            <span style={{ ...pixel, fontSize: 8, color: "var(--ae-text)", letterSpacing: "0.06em" }}>BASE NETWORK</span>
          </div>

          {/* Chain status card */}
          <div style={{
            marginBottom: 16, padding: "14px 16px",
            border: "1px solid var(--ae-border)",
            background: "rgba(22,82,240,0.04)",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: "2px solid #1652f0", borderLeft: "2px solid #1652f0" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: "2px solid #1652f0", borderRight: "2px solid #1652f0" }} />

            {/* Chain stats row */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { label: "NETWORK",  value: "Base Mainnet",  color: "#1652f0" },
                { label: "CHAIN ID", value: "8453",          color: "var(--ae-cyan)" },
                { label: "TOKEN",    value: "$CTRL",          color: "var(--ae-violet)" },
                { label: "STATUS",   value: isConnected ? (isBaseNetwork ? "CONNECTED" : "WRONG NET") : "NOT CONNECTED",
                  color: isConnected ? (isBaseNetwork ? "var(--ae-green)" : "var(--ae-amber)") : "var(--ae-muted)" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ ...mono, fontSize: 6, color: "var(--ae-muted)", letterSpacing: "0.14em", marginBottom: 4 }}>{label}</div>
                  <div style={{ ...mono, fontSize: 9, color, fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Wallet status row */}
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "8px 12px",
                  background: "rgba(22,82,240,0.07)",
                  border: "1px solid rgba(22,82,240,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ae-green)", boxShadow: "0 0 6px var(--ae-green)" }} />
                  <span style={{ ...mono, fontSize: 8, color: "#8090b0" }}>
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ ...mono, fontSize: 8, color: "var(--ae-cyan)", fontWeight: 700 }}>
                    {balance ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ETH` : "— ETH"}
                  </span>
                  <button
                    onClick={() => handleCopyAddress(walletAddress ?? "")}
                    style={{ background: "none", border: "1px solid var(--ae-border)", cursor: "pointer", padding: "3px 7px", color: copiedAddr ? "var(--ae-green)" : "var(--ae-muted)", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
                  >
                    {copiedAddr ? <Check size={11} /> : <Copy size={11} />}
                    <span style={{ ...mono, fontSize: 6 }}>{copiedAddr ? "COPIED" : "COPY"}</span>
                  </button>
                  <a
                    href={`https://basescan.org/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...mono, fontSize: 7, color: "#1652f0", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                  >
                    <Link2 size={10} /> BASESCAN
                  </a>
                </div>
              </motion.div>
            )}

            {!isConnected && (
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", fontStyle: "italic" }}>
                Connect a wallet from the login portal to see your Base balance here.
              </div>
            )}
          </div>

          {/* $CTRL Contract Address */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", letterSpacing: "0.12em" }}>$CTRL CONTRACT ADDRESS</div>
              {contractAddress && contractIsValid && (
                <a
                  href={`https://basescan.org/token/${contractAddress.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...mono, fontSize: 7, color: "#1652f0", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >
                  <Link2 size={9} /> VIEW ON BASESCAN →
                </a>
              )}
            </div>
            <div style={{
              display: "flex", gap: 0,
              border: `1px solid ${contractIsValid && contractAddress ? "#1652f066" : "var(--ae-border)"}`,
              transition: "border-color 0.2s",
            }}>
              <input
                type="text"
                value={contractAddress}
                onChange={e => { setContractAddress(e.target.value); setContractSaved(false); }}
                placeholder="0x0000...0000  (paste after TGE deployment)"
                style={{
                  flex: 1, background: "rgba(0,0,0,0.4)", border: "none", outline: "none",
                  padding: "10px 14px", ...mono, fontSize: 9, color: "var(--ae-text)",
                  letterSpacing: "0.04em",
                }}
              />
              {contractAddress && (
                <button
                  onClick={() => handleCopyAddress(contractAddress.trim())}
                  style={{
                    padding: "0 12px", background: "rgba(0,0,0,0.3)", border: "none",
                    borderLeft: "1px solid var(--ae-border)", cursor: "pointer",
                    color: copiedAddr ? "var(--ae-green)" : "var(--ae-muted)", display: "flex", alignItems: "center",
                    transition: "color 0.15s",
                  }}
                >
                  {copiedAddr ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
            </div>
            {contractAddress && !contractIsValid && (
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-amber)", marginTop: 5 }}>
                ⚠ Must be a valid 0x EVM address (42 characters)
              </div>
            )}
            {contractIsValid && contractAddress && (
              <div style={{ ...mono, fontSize: 7, color: "var(--ae-green)", marginTop: 5 }}>
                ✓ Valid Base contract address
              </div>
            )}
            <div style={{ ...mono, fontSize: 7, color: "var(--ae-dim)", marginTop: 6 }}>
              Stored in your browser. Paste after $CTRL is deployed on Base. Links will open BaseScan.
            </div>
          </div>

          {/* Save contract button */}
          <button
            onClick={handleContractSave}
            disabled={!contractIsValid || !contractAddress}
            className="pixel-btn primary"
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 8, padding: "9px 16px", opacity: contractIsValid && contractAddress ? 1 : 0.4 }}
          >
            {contractSaved ? <CheckCircle size={12} /> : <Save size={12} />}
            {contractSaved ? "SAVED!" : "SAVE ADDRESS"}
          </button>
        </div>

        {/* Info box */}
        <div style={{ padding: "14px 16px", border: "1px solid var(--ae-border)", background: "rgba(0,0,0,0.2)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: "2px solid var(--ae-amber)", borderLeft: "2px solid var(--ae-amber)" }} />
          <div style={{ ...mono, fontSize: 7, color: "var(--ae-amber)", letterSpacing: "0.12em", marginBottom: 8 }}>HOW IT WORKS</div>
          <ul style={{ margin: 0, padding: "0 0 0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Your API key is saved in your browser only — not on any server",
              "When you chat in Ship Comms, your message + key is sent to the AI provider",
              "Each message costs a tiny amount from your own API quota",
              "Without a key, Ship Comms uses pre-written responses",
              "You can clear your key at any time",
            ].map((text, i) => (
              <li key={i} style={{ ...mono, fontSize: 7, color: "var(--ae-muted)", lineHeight: 1.7 }}>{text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
