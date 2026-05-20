import { type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocation } from "wouter";
import ConnectWallet from "@/pages/ConnectWallet";

export function WalletGate({ children }: { children: ReactNode }) {
  const { connected } = useWallet();
  const [location] = useLocation();

  if (!connected) {
    return <ConnectWallet />;
  }

  return <>{children}</>;
}
