import crypto from "node:crypto";
import { db, agentsTable, agentWalletTxTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { logger } from "./logger";

const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
export const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";

export function generateWalletAddress(agentId: number, agentName: string): string {
  const seed = `ctrl-agent-wallet-v1-${agentId}-${agentName.toLowerCase().replace(/\s+/g, "-")}`;
  const hash = crypto.createHash("sha256").update(seed).digest("hex");
  return `0x${hash.slice(0, 40)}`;
}

export function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace("0x", "");
  const hash = crypto.createHash("sha256").update(addr).digest("hex");
  let result = "0x";
  for (let i = 0; i < addr.length; i++) {
    result += parseInt(hash[i], 16) >= 8 ? addr[i].toUpperCase() : addr[i];
  }
  return result;
}

export function getBaseScanUrl(address: string): string {
  return `${BASE_SEPOLIA_EXPLORER}/address/${address}`;
}

export async function ensureAgentWallet(agentId: number, agentName: string): Promise<string> {
  const [agent] = await db
    .select({ walletAddress: agentsTable.walletAddress })
    .from(agentsTable)
    .where(eq(agentsTable.id, agentId));

  if (agent?.walletAddress) return agent.walletAddress;

  const address = generateWalletAddress(agentId, agentName);
  await db.update(agentsTable).set({ walletAddress: address }).where(eq(agentsTable.id, agentId));
  logger.info({ agentId, address }, "Agent wallet created");
  return address;
}

export async function initAllAgentWallets(): Promise<void> {
  const agents = await db
    .select({ id: agentsTable.id, name: agentsTable.name, walletAddress: agentsTable.walletAddress })
    .from(agentsTable);

  const needsWallet = agents.filter((a) => !a.walletAddress);
  if (needsWallet.length === 0) return;

  logger.info({ count: needsWallet.length }, "Initializing agent wallets...");

  for (const agent of needsWallet) {
    const address = generateWalletAddress(agent.id, agent.name);
    await db.update(agentsTable).set({ walletAddress: address }).where(eq(agentsTable.id, agent.id));
  }

  logger.info({ count: needsWallet.length }, "Agent wallets initialized");
}

export async function getWalletInfo(agentId: number) {
  const [agent] = await db
    .select({
      id: agentsTable.id,
      name: agentsTable.name,
      role: agentsTable.role,
      walletAddress: agentsTable.walletAddress,
      totalEarned: agentsTable.totalEarned,
      totalTokensUsed: agentsTable.totalTokensUsed,
    })
    .from(agentsTable)
    .where(eq(agentsTable.id, agentId));

  if (!agent) return null;

  return {
    agentId: agent.id,
    agentName: agent.name,
    agentRole: agent.role,
    address: agent.walletAddress ?? null,
    baseScanUrl: agent.walletAddress ? getBaseScanUrl(agent.walletAddress) : null,
    totalEarned: agent.totalEarned ?? 0,
    totalTokensUsed: agent.totalTokensUsed ?? 0,
    network: "Base Sepolia",
    chainId: 84532,
  };
}

export async function getWalletBalance(address: string): Promise<{ eth: string; usdc: string }> {
  try {
    const response = await fetch(BASE_SEPOLIA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
      signal: AbortSignal.timeout(5000),
    });

    const data = (await response.json()) as { result?: string };
    const balanceWei = BigInt(data.result ?? "0x0");
    const balanceEth = (Number(balanceWei) / 1e18).toFixed(6);
    return { eth: balanceEth, usdc: "0.00" };
  } catch {
    return { eth: "0.000000", usdc: "0.00" };
  }
}

export async function getWalletTransactions(agentId: number, limit = 20) {
  return db
    .select()
    .from(agentWalletTxTable)
    .where(eq(agentWalletTxTable.agentId, agentId))
    .orderBy(desc(agentWalletTxTable.timestamp))
    .limit(limit);
}

export async function recordTransaction(
  agentId: number,
  txData: {
    txHash?: string;
    amount: number;
    token?: string;
    type: string;
    missionId?: number;
  }
) {
  const [tx] = await db
    .insert(agentWalletTxTable)
    .values({
      agentId,
      txHash: txData.txHash ?? null,
      amount: txData.amount,
      token: txData.token ?? "USDC",
      type: txData.type,
      missionId: txData.missionId ?? null,
    })
    .returning();

  if (txData.type === "receive" || txData.type === "bounty") {
    const [agent] = await db
      .select({ totalEarned: agentsTable.totalEarned })
      .from(agentsTable)
      .where(eq(agentsTable.id, agentId));
    await db
      .update(agentsTable)
      .set({ totalEarned: (agent?.totalEarned ?? 0) + txData.amount })
      .where(eq(agentsTable.id, agentId));
  }

  return tx;
}
