import { Router } from "express";
import { z } from "zod";
import { setAiConfig, getAiConfig, clearAiConfig } from "../lib/aiConfig";

const router = Router();

const chatBody = z.object({
  message: z.string(),
  agentName: z.string(),
  agentRole: z.string(),
  apiKey: z.string(),
  provider: z.enum(["openai", "anthropic", "gemini"]).default("openai"),
});

const configBody = z.object({
  apiKey: z.string().min(1),
  provider: z.enum(["openai", "anthropic", "gemini"]).default("openai"),
});

async function callOpenAI(apiKey: string, agentName: string, agentRole: string, message: string): Promise<string> {
  const systemPrompt = `You are ${agentName}, an elite AI agent specializing in ${agentRole} operations aboard a space station. You are terse, professional, and mission-focused. Respond in 1-3 sentences maximum. Use brief technical language. Reference your role where relevant. Address the Commander directly.`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 120,
      temperature: 0.8,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${resp.status}`);
  }

  const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content?.trim() ?? "Acknowledged, Commander.";
}

async function callAnthropic(apiKey: string, agentName: string, agentRole: string, message: string): Promise<string> {
  const systemPrompt = `You are ${agentName}, an elite AI agent specializing in ${agentRole} operations aboard a space station. You are terse, professional, and mission-focused. Respond in 1-3 sentences maximum. Use brief technical language. Reference your role where relevant. Address the Commander directly.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-20240307",
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      max_tokens: 120,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Anthropic error ${resp.status}`);
  }

  const data = await resp.json() as { content: Array<{ text: string }> };
  return data.content[0]?.text?.trim() ?? "Acknowledged, Commander.";
}

async function callGemini(apiKey: string, agentName: string, agentRole: string, message: string): Promise<string> {
  const prompt = `You are ${agentName}, an elite AI agent specializing in ${agentRole} operations aboard a space station. You are terse, professional, and mission-focused. Respond in 1-3 sentences maximum. Use brief technical language. Reference your role where relevant. Address the Commander directly.\n\nCommander says: ${message}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 120 },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(String((err as { error?: { message?: string } }).error?.message ?? `Gemini error ${resp.status}`));
  }

  const data = await resp.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
  return data.candidates[0]?.content?.parts[0]?.text?.trim() ?? "Acknowledged, Commander.";
}

/* ── Chat endpoint (Ship Comms) ─────────────────────────────────────────── */
router.post("/chat", async (req, res) => {
  const parsed = chatBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.issues });

  const { message, agentName, agentRole, apiKey, provider } = parsed.data;

  try {
    let reply: string;
    if (provider === "anthropic") {
      reply = await callAnthropic(apiKey, agentName, agentRole, message);
    } else if (provider === "gemini") {
      reply = await callGemini(apiKey, agentName, agentRole, message);
    } else {
      reply = await callOpenAI(apiKey, agentName, agentRole, message);
    }
    return res.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(502).json({ error: msg });
  }
});

/* ── AI Config endpoints (for taskEngine use) ───────────────────────────── */
router.post("/config", (req, res) => {
  const parsed = configBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
  setAiConfig({ apiKey: parsed.data.apiKey, provider: parsed.data.provider });
  return res.json({ ok: true, provider: parsed.data.provider });
});

router.get("/config", (_req, res) => {
  const config = getAiConfig();
  return res.json({ configured: !!config, provider: config?.provider ?? null });
});

router.delete("/config", (_req, res) => {
  clearAiConfig();
  return res.json({ ok: true });
});

export default router;
