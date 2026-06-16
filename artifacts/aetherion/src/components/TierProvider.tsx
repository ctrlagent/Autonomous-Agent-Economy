import { createContext, useContext, type ReactNode } from "react";
import { TIER_FEATURES, TIER_NAMES, TIER_COLORS, UPGRADE_URL } from "@/lib/constants";

interface TierContextValue {
  tier: 0 | 1 | 2 | 3;
  tierName: string;
  tierColor: string;
  features: string[];
  upgradeUrl: string;
}

const TierContext = createContext<TierContextValue>({
  tier: 0,
  tierName: TIER_NAMES[0],
  tierColor: TIER_COLORS[0],
  features: TIER_FEATURES[0],
  upgradeUrl: UPGRADE_URL,
});

export function TierProvider({
  tier,
  children,
}: {
  tier: 0 | 1 | 2 | 3;
  children: ReactNode;
}) {
  const value: TierContextValue = {
    tier,
    tierName: TIER_NAMES[tier],
    tierColor: TIER_COLORS[tier],
    features: [...TIER_FEATURES[tier]],
    upgradeUrl: UPGRADE_URL,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier(): TierContextValue {
  return useContext(TierContext);
}
