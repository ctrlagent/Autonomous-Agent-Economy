import { createConfig, WagmiProvider, http } from "wagmi";
import { base } from "viem/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";
import type { ReactNode } from "react";

export const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [
    injected(),
    coinbaseWallet({ appName: "CTRL" }),
  ],
});

export function EVMWalletProvider({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
