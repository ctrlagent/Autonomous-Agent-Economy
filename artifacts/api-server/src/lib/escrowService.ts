import { db, missionEscrowTable, missionsTable, agentWalletTxTable, agentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SIMULATION_MODE = !process.env.ESCROW_CONTRACT_ADDRESS || !process.env.BASE_SEPOLIA_RPC;

function fakeTxHash(seed: string): string {
  return "0x" + crypto.createHash("sha256").update("sim-tx-" + seed + Date.now()).digest("hex");
}

export type EscrowStatus = "none" | "pending" | "deposited" | "proof_submitted" | "approved" | "refunded";

export interface EscrowInfo {
  missionId: number;
  status: EscrowStatus;
  amount: number;
  token: string;
  depositorAddress: string | null;
  agentAddress: string | null;
  proofHash: string | null;
  txHashDeposit: string | null;
  txHashRelease: string | null;
  deadline: Date | null;
  createdAt: Date;
  completedAt: Date | null;
  simulated: boolean;
}

export async function getEscrowByMission(missionId: number): Promise<EscrowInfo | null> {
  const [row] = await db
    .select()
    .from(missionEscrowTable)
    .where(eq(missionEscrowTable.missionId, missionId))
    .orderBy(missionEscrowTable.id)
    .limit(1);

  if (!row) return null;

  return {
    missionId: row.missionId,
    status: (row.status as EscrowStatus) ?? "pending",
    amount: row.amount,
    token: row.token,
    depositorAddress: row.depositorAddress,
    agentAddress: row.agentAddress,
    proofHash: row.proofHash,
    txHashDeposit: row.txHashDeposit,
    txHashRelease: row.txHashRelease,
    deadline: row.deadline,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
    simulated: SIMULATION_MODE,
  };
}

export async function getAllEscrows(): Promise<EscrowInfo[]> {
  const rows = await db.select().from(missionEscrowTable).orderBy(missionEscrowTable.id);
  return rows.map(row => ({
    missionId: row.missionId,
    status: (row.status as EscrowStatus) ?? "pending",
    amount: row.amount,
    token: row.token,
    depositorAddress: row.depositorAddress,
    agentAddress: row.agentAddress,
    proofHash: row.proofHash,
    txHashDeposit: row.txHashDeposit,
    txHashRelease: row.txHashRelease,
    deadline: row.deadline,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
    simulated: SIMULATION_MODE,
  }));
}

export async function depositBounty(opts: {
  missionId: number;
  amount: number;
  token?: string;
  depositorAddress?: string;
  agentAddress?: string;
  deadlineDays?: number;
}): Promise<EscrowInfo> {
  const { missionId, amount, token = "USDC", depositorAddress, agentAddress, deadlineDays = 30 } = opts;

  const existing = await getEscrowByMission(missionId);
  if (existing && existing.status !== "refunded") {
    throw new Error("Escrow already exists for this mission");
  }

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + deadlineDays);

  const txHashDeposit = SIMULATION_MODE
    ? fakeTxHash(`deposit-${missionId}-${amount}`)
    : null;

  const [row] = await db
    .insert(missionEscrowTable)
    .values({
      missionId,
      amount,
      token,
      depositorAddress: depositorAddress ?? null,
      agentAddress: agentAddress ?? null,
      deadline,
      status: "deposited",
      txHashDeposit,
    })
    .returning();

  await db
    .update(missionsTable)
    .set({ rewardAmount: amount, rewardToken: token })
    .where(eq(missionsTable.id, missionId));

  return {
    missionId: row.missionId,
    status: "deposited",
    amount: row.amount,
    token: row.token,
    depositorAddress: row.depositorAddress,
    agentAddress: row.agentAddress,
    proofHash: row.proofHash,
    txHashDeposit: row.txHashDeposit,
    txHashRelease: row.txHashRelease,
    deadline: row.deadline,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
    simulated: SIMULATION_MODE,
  };
}

export async function submitProof(missionId: number, proofHash: string): Promise<EscrowInfo> {
  const existing = await getEscrowByMission(missionId);
  if (!existing) throw new Error("No escrow found for mission " + missionId);
  if (existing.status === "approved") throw new Error("Mission already approved");
  if (existing.status === "refunded") throw new Error("Mission was refunded");

  const [row] = await db
    .update(missionEscrowTable)
    .set({ proofHash, status: "proof_submitted" })
    .where(eq(missionEscrowTable.missionId, missionId))
    .returning();

  return { ...existing, proofHash, status: "proof_submitted", txHashDeposit: row.txHashDeposit };
}

export async function approveMission(missionId: number): Promise<EscrowInfo> {
  const existing = await getEscrowByMission(missionId);
  if (!existing) throw new Error("No escrow found for mission " + missionId);
  if (existing.status === "approved") throw new Error("Mission already approved");
  if (existing.status === "refunded") throw new Error("Mission was refunded");

  const txHashRelease = SIMULATION_MODE
    ? fakeTxHash(`release-${missionId}`)
    : null;

  const completedAt = new Date();

  await db
    .update(missionEscrowTable)
    .set({ status: "approved", txHashRelease, completedAt })
    .where(eq(missionEscrowTable.missionId, missionId));

  if (SIMULATION_MODE && existing.agentAddress) {
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.walletAddress, existing.agentAddress))
      .limit(1);

    if (agent) {
      await db.insert(agentWalletTxTable).values({
        agentId: agent.id,
        type: "mission_reward",
        amount: existing.amount,
        token: existing.token,
        txHash: txHashRelease!,
      });
      await db
        .update(agentsTable)
        .set({ totalEarned: (agent.totalEarned ?? 0) + existing.amount })
        .where(eq(agentsTable.id, agent.id));
    }
  }

  return { ...existing, status: "approved", txHashRelease, completedAt };
}

export async function refundMission(missionId: number): Promise<EscrowInfo> {
  const existing = await getEscrowByMission(missionId);
  if (!existing) throw new Error("No escrow found for mission " + missionId);
  if (existing.status === "approved") throw new Error("Mission already approved");
  if (existing.status === "refunded") throw new Error("Mission already refunded");

  const txHashRelease = SIMULATION_MODE
    ? fakeTxHash(`refund-${missionId}`)
    : null;

  await db
    .update(missionEscrowTable)
    .set({ status: "refunded", txHashRelease, completedAt: new Date() })
    .where(eq(missionEscrowTable.missionId, missionId));

  return { ...existing, status: "refunded", txHashRelease };
}
