import { type ReactNode, useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { base } from "viem/chains";
import { formatUnits } from "viem";
import TokenGate from "@/pages/TokenGate";
import { TierProvider } from "@/components/TierProvider";
import { CTRL_TOKEN_ADDRESS, CTRL_TOKEN_DECIMALS, TIER_THRESHOLDS } from "@/lib/constants";

const BETA_KEY = "ctrl_beta_access";

function computeTier(formattedBalance: string | undefined): 0 | 1 | 2 | 3 {
  if (!formattedBalance) return 0;
  const value = parseFloat(formattedBalance);
  if (value >= TIER_THRESHOLDS.fleetAdmiral) return 3;
  if (value >= TIER_THRESHOLDS.admiral)      return 2;
  if (value >= TIER_THRESHOLDS.commander)    return 1;
  return 0;
}

export function WalletGate({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [betaAccess, setBetaAccess] = useState<boolean>(() => {
    try { return sessionStorage.getItem(BETA_KEY) === "1"; } catch { return false; }
  });

  const { data: rawBalance } = useReadContract({
    address: CTRL_TOKEN_ADDRESS as `0x${string}`,
    abi: [{ name: "balanceOf", type: "function", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" }] as const,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId: base.id,
    query: { enabled: !!address },
  });

  const formattedBalance = rawBalance != null
    ? formatUnits(rawBalance as bigint, CTRL_TOKEN_DECIMALS)
    : undefined;

  const tier = useMemo(() => computeTier(formattedBalance), [formattedBalance]);

  const grantBeta = () => {
    try { sessionStorage.setItem(BETA_KEY, "1"); } catch {}
    setBetaAccess(true);
    if (process.env.NODE_ENV === "development") {
      console.warn("[WalletGate] Beta bypass used — token gate will be enforced after TGE");
    }
  };

  const hasAccess = betaAccess || isConnected;

  if (!hasAccess) {
    return <TokenGate onBetaAccess={grantBeta} />;
  }

  return (
    <TierProvider tier={tier}>
      {children}
    </TierProvider>
  );
}
