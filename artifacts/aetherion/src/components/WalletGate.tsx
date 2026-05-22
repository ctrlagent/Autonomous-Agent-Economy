import { type ReactNode, useState } from "react";
import { useAccount } from "wagmi";
import TokenGate from "@/pages/TokenGate";

const BETA_KEY = "ctrl_beta_access";

export function WalletGate({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const [betaAccess, setBetaAccess] = useState<boolean>(() => {
    try { return sessionStorage.getItem(BETA_KEY) === "1"; } catch { return false; }
  });

  const grantBeta = () => {
    try { sessionStorage.setItem(BETA_KEY, "1"); } catch {}
    setBetaAccess(true);
  };

  if (!betaAccess && !isConnected) {
    return <TokenGate onBetaAccess={grantBeta} />;
  }

  return <>{children}</>;
}
