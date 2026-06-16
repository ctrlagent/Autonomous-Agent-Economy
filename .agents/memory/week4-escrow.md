---
name: Week 4 Escrow Service
description: How the mission escrow system works — simulated DB-backed mode by default, real on-chain mode when env vars present.
---

# Week 4 Escrow Service

## Rule
`escrowService.ts` runs in **simulated mode** unless both `ESCROW_CONTRACT_ADDRESS` and `BASE_SEPOLIA_RPC` env vars are set. In simulated mode, all escrow state is tracked in the `mission_escrow` DB table with deterministic fake txHashes.

**Why:** Foundry/Hardhat deploy requires funded wallet + RPC key. Simulation gives the full workflow (deposit → proof → approve) without blockchain, so the feature is immediately usable. When user deploys `MissionEscrow.sol` and sets env vars, service auto-switches to on-chain mode.

**How to apply:**
- New table: `mission_escrow` — tracks missionId, status, amount, token, depositor/agent addresses, txHashes
- New columns on missions: `reward_token TEXT DEFAULT 'USDC'`, `reward_amount INTEGER DEFAULT 0`, `escrow_address TEXT`
- New columns on tasks: `bounty_amount INTEGER DEFAULT 0`, `bounty_token TEXT DEFAULT 'USDC'`, `escrow_tx TEXT`, `pr_url TEXT`, `review_status TEXT DEFAULT 'none'`
- Escrow lifecycle: pending → deposited → proof_submitted → approved (or refunded)
- Contract: `contracts/src/MissionEscrow.sol` — full Solidity implementation with USDC + 2.5% fee, Ownable, ReentrancyGuard
- Routes registered at `/api/escrow`: GET /, GET /:missionId, POST /deposit, POST /proof/:missionId, POST /approve/:missionId, POST /refund/:missionId
- Missions.tsx: "FUND BOUNTY" button on each active mission card → modal with preset amounts; USDC chip shows locked amount; escrow badges (ACTIVE/PROOF PENDING/PAID OUT) in title row
