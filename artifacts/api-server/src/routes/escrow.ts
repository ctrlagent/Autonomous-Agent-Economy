import { Router } from "express";
import { z } from "zod";
import {
  getEscrowByMission,
  getAllEscrows,
  depositBounty,
  submitProof,
  approveMission,
  refundMission,
} from "../lib/escrowService";

const router = Router();

const depositBody = z.object({
  missionId: z.number().int().positive(),
  amount: z.number().int().positive(),
  token: z.string().optional(),
  depositorAddress: z.string().optional(),
  agentAddress: z.string().optional(),
  deadlineDays: z.number().int().min(1).max(365).optional(),
});

const proofBody = z.object({
  proofHash: z.string().min(1),
});

router.get("/", async (_req, res) => {
  try {
    const escrows = await getAllEscrows();
    return res.json(escrows);
  } catch (err: unknown) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.get("/:missionId", async (req, res) => {
  const missionId = parseInt(req.params.missionId);
  if (isNaN(missionId)) return res.status(400).json({ error: "Invalid missionId" });
  try {
    const info = await getEscrowByMission(missionId);
    if (!info) return res.json({ missionId, status: "none", amount: 0, token: "USDC", simulated: true });
    return res.json(info);
  } catch (err: unknown) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.post("/deposit", async (req, res) => {
  const parsed = depositBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
  try {
    const result = await depositBounty(parsed.data);
    return res.json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/proof/:missionId", async (req, res) => {
  const missionId = parseInt(req.params.missionId);
  if (isNaN(missionId)) return res.status(400).json({ error: "Invalid missionId" });
  const parsed = proofBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
  try {
    const result = await submitProof(missionId, parsed.data.proofHash);
    return res.json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/approve/:missionId", async (req, res) => {
  const missionId = parseInt(req.params.missionId);
  if (isNaN(missionId)) return res.status(400).json({ error: "Invalid missionId" });
  try {
    const result = await approveMission(missionId);
    return res.json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/refund/:missionId", async (req, res) => {
  const missionId = parseInt(req.params.missionId);
  if (isNaN(missionId)) return res.status(400).json({ error: "Invalid missionId" });
  try {
    const result = await refundMission(missionId);
    return res.json(result);
  } catch (err: unknown) {
    return res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
