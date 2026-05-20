import { type ReactNode, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import TokenGate from "@/pages/TokenGate";

const BETA_KEY = "ctrl_beta_access";

export function WalletGate({ children }: { children: ReactNode }) {
  const { connected } = useWallet();
  const [betaAccess, setBetaAccess] = useState<boolean>(() => {
    try { return sessionStorage.getItem(BETA_KEY) === "1"; } catch { return false; }
  });

  const grantBeta = () => {
    try { sessionStorage.setItem(BETA_KEY, "1"); } catch {}
    setBetaAccess(true);
  };

  // When token launches: replace betaAccess check with actual token balance check
  // For now: beta bypass OR connected wallet (future: connected + holds 100k $CTRL)
  if (!betaAccess && !connected) {
    return <TokenGate onBetaAccess={grantBeta} />;
  }

  return <>{children}</>;
}
