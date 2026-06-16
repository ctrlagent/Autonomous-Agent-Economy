---
name: Week 3 Agent Wallet
description: How agent wallets are implemented — deterministic generation via Node.js crypto, no external CDP keys required.
---

# Week 3 Agent Wallet

## Rule
Each agent gets a deterministic Ethereum-style wallet address generated from their ID+name using Node.js built-in `crypto.createHash('sha256')`. No `@coinbase/agentkit` keys required at this stage.

**Why:** CDP AgentKit requires API keys the user hasn't provided yet. Deterministic generation gives real-looking Base Sepolia addresses (`0x` + 40 hex chars) that work for display, BaseScan links, and balance checks. Real MPC wallets can be swapped in later by replacing `generateWalletAddress()` in `agentWallet.ts`.

**How to apply:**
- `initAllAgentWallets()` runs on server startup (after seed) in `index.ts`
- Any agent without a `walletAddress` in DB gets one assigned automatically
- Wallet seed format: `ctrl-agent-wallet-v1-{id}-{name-lowercased-hyphenated}`
- New schema columns: `wallet_address TEXT`, `total_earned INTEGER DEFAULT 0`, `total_tokens_used BIGINT DEFAULT 0`
- New table: `agent_wallet_tx` — tx log per agent
- New endpoints (in agents route): `GET /api/agents/:id/wallet`, `/wallet/balance`, `/wallet/transactions`
- Balance check hits Base Sepolia public RPC (`https://sepolia.base.org`) with 5s timeout + graceful fallback
