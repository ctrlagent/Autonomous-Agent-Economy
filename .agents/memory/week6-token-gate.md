---
name: Week 6 Token Gate
description: Multi-tier $CTRL token gate — TierProvider, WalletGate upgrade, tier badge in WalletChip
---

## What was built

- `artifacts/aetherion/src/lib/constants.ts` — appended CTRL_TOKEN_ADDRESS (0x000... placeholder until TGE), TIER_THRESHOLDS, TIER_NAMES, TIER_COLORS, TIER_FEATURES, UPGRADE_URL
- `artifacts/aetherion/src/components/TierProvider.tsx` — TierContext + TierProvider + useTier() hook
- `artifacts/aetherion/src/components/WalletGate.tsx` — reads $CTRL balance via wagmi useBalance (token=CTRL_TOKEN_ADDRESS, chainId=base.id), computes tier 0-3, renders TokenGate for tier 0 / TierProvider+children for tier≥1; beta bypass via sessionStorage still works
- `artifacts/aetherion/src/components/layout/AppShell.tsx` — WalletChip calls useTier(), shows tier badge (Press Start 2P, tier color, glow) inline in header button and a full tier panel in the dropdown (name, progress bar, feature list, upgrade link)

## Key decisions

**Why:** $CTRL token doesn't exist yet (address = 0x000...); balance will always be 0 → tier always 0 → everyone sees TokenGate or gets in via beta bypass. This is correct pre-TGE behavior.

**Beta bypass:** sessionStorage key `ctrl_beta_access === "1"` bypasses the gate. Console warning logged in dev. Remove/expire after TGE.

**TierProvider placement:** WalletGate wraps its children in TierProvider so the entire /app route tree can consume useTier(). WalletHeaderSync is outside this tree — it stays a pure side-effect component (returns null).

**How to apply:** When adding tier-gated features, call `useTier()` and check `tier >= N` inside any component under /app routes. WalletChip already shows the tier badge — no additional header work needed.
