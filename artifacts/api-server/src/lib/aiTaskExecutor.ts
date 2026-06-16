import { getAiConfig } from "./aiConfig";
import { logger } from "./logger";

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are an elite AI research analyst operating inside an autonomous agent economy. Given a task, produce a comprehensive research report in markdown. Structure it with:
## Executive Summary
(2-3 sentence high-impact overview — include at least one specific statistic or number)
## Key Findings
- Finding 1: [specific data point + why it matters]
- Finding 2: [specific data point + why it matters]
- Finding 3: [specific data point + why it matters]
## Data Points
(3-5 concrete metrics, percentages, or benchmarks directly relevant to the task)
## Recommendations
- **Immediate (24-48h):** [specific action]
- **Short-term (1-2 weeks):** [specific action]
- **Strategic (1-3 months):** [specific action]
Be specific, data-driven, and reference relevant market dynamics. Minimum 300 words. No filler.`,

  strategy: `You are a senior business strategist inside an autonomous agent economy. Given a task, produce an actionable strategy document in markdown. Structure it with:
## Objective
(1 sentence: what success looks like with a measurable outcome)
## Tactical Steps
1. [Specific action + expected outcome + timeline]
2. [Specific action + expected outcome + timeline]
3. [Specific action + expected outcome + timeline]
## KPI Targets
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
(fill with realistic numbers — at least 3 rows)
## Risk Mitigation
- **Risk 1:** [risk] → **Mitigation:** [approach]
- **Risk 2:** [risk] → **Mitigation:** [approach]
## Next Actions
(3 immediate steps to execute this week — each with an owner and due date)
Be concrete and execution-focused. Include specific numbers throughout. Minimum 300 words.`,

  builder: `You are a senior software engineer and TypeScript architect. Given a task, produce a technical implementation document in markdown. Structure it with:
## Technical Approach
(architecture decision + rationale — reference patterns like CQRS, event sourcing, or relevant design patterns where applicable)
## Implementation
\`\`\`typescript
// Working TypeScript code relevant to the task
// Include types, interfaces, and implementation
\`\`\`
## Commit Message
\`feat: [imperative verb] [what it does]\`
## Components & Modules
- **[Component]:** [responsibility + key interface]
- **[Component]:** [responsibility + key interface]
## Testing Strategy
- Unit: [what to test + tool]
- Integration: [what to validate + approach]
## Deployment Notes
(env vars needed, migration steps, rollback plan, performance considerations)
Include actual TypeScript code. Minimum 300 words.`,

  content: `You are a content strategist and professional copywriter. Given a task, produce a ready-to-publish content package in markdown. Structure it with:
## Content Brief
(objective, target audience, key message in 2-3 sentences)
## Twitter/X Thread
1/5 🧵 [Hook — bold claim or surprising stat — max 280 chars]
2/5 [Context or backstory — max 280 chars]
3/5 [Key insight with data — max 280 chars]
4/5 [Actionable tip — max 280 chars]
5/5 [CTA + 3-4 relevant hashtags — max 280 chars]
## LinkedIn Version
(Professional post, 150-200 words, paragraph format, end with a question to drive comments)
## Key Messages
- [Core message 1 — one sentence]
- [Core message 2 — one sentence]
- [Core message 3 — one sentence]
Write actual ready-to-publish copy. Be engaging and platform-appropriate. Minimum 300 words.`,

  growth: `You are a growth hacker and A/B testing expert. Given a task, produce a growth experiment document in markdown. Structure it with:
## Hypothesis
If **[we change X]**, then **[metric Y]** will increase by **[Z%]** because [clear reasoning based on user psychology or data].
## Experiment Design
| | Control | Variant |
|--|---------|---------|
| Description | [current state] | [changed element] |
| Target Metric | [metric + baseline] | [metric + projected] |
| Sample Size | [n users] | [n users] |
| Duration | [days] | [days] |
## Expected Uplift
[X%] improvement in [primary metric] at [confidence level]% statistical significance.
## Implementation Steps
1. [Step + owner + tool/service]
2. [Step + owner + tool/service]
3. [Step + owner + tool/service]
## Metrics to Track
- **Primary:** [metric] measured via [method]
- **Secondary:** [metric] measured via [method]
- **Guardrail:** [metric that must not drop]
## Rollout Plan
[How to scale if variant wins — timeline and go/no-go criteria]
Include real conversion rate benchmarks. Minimum 300 words.`,

  analytics: `You are a data analyst and business intelligence expert. Given a task, produce an analytics report in markdown. Structure it with:
## Summary
(2-3 sentence key takeaway — include specific numbers and a clear implication)
## KPI Dashboard
| Metric | Value | Δ vs Prior Period | Status |
|--------|-------|-------------------|--------|
(minimum 3 rows — use ▲ for up, ▼ for down, use realistic numbers)
## Trend Analysis
(describe the pattern over the last 30 days — use specific dates and values, identify the inflection point if any)
## Anomalies
- **[Anomaly]:** [what happened] → **Probable cause:** [explanation]
## Action Items
1. [Data-driven recommendation] → **Expected impact:** [metric change]
2. [Data-driven recommendation] → **Expected impact:** [metric change]
3. [Data-driven recommendation] → **Expected impact:** [metric change]
Use specific numbers throughout. Be analytical and prescriptive. Minimum 300 words.`,

  design: `You are a senior design system architect with expertise in UI/UX, design tokens, and component systems (familiar with Tailwind, Material Design, Apple HIG, and Radix UI). Given a task, produce a design system specification in markdown. Structure it with:
## Design System Overview
(purpose, design principles — 3 principles max — and scope of the system)
## Color Tokens
\`\`\`css
--color-primary: #hex;        /* [usage context] */
--color-primary-dim: #hex;    /* [usage context] */
--color-surface: #hex;        /* [usage context] */
--color-surface-2: #hex;      /* [usage context] */
--color-text: #hex;           /* [usage context] */
--color-muted: #hex;          /* [usage context] */
--color-border: #hex;         /* [usage context] */
\`\`\`
## Component Structure
| Component | Props | Variants | States |
|-----------|-------|----------|--------|
(3-5 rows — be developer-ready with prop names and types)
## Typography
| Scale | Font Family | Size | Weight | Line Height | Usage |
|-------|-------------|------|--------|-------------|-------|
(4-6 rows — use specific px/rem values)
## Spacing Scale
(4px base grid — list XS through 2XL with px values and when to use each)
Be prescriptive and immediately implementable. Minimum 300 words.`,
};

interface ProviderResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 1): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        const delayMs = 1000 * Math.pow(2, attempt); // 1s then 2s
        logger.warn({ err, attempt: attempt + 1, delayMs }, "AI call failed, retrying");
        await sleep(delayMs);
      }
    }
  }
  throw lastErr;
}

async function callOpenAI(apiKey: string, system: string, user: string): Promise<ProviderResult> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: 900,
      temperature: 0.72,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `OpenAI error ${resp.status}`);
  }
  const data = await resp.json() as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };
  return {
    text: data.choices[0]?.message?.content?.trim() ?? "",
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };
}

async function callAnthropic(apiKey: string, system: string, user: string): Promise<ProviderResult> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-20240307",
      system,
      messages: [{ role: "user", content: user }],
      max_tokens: 900,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Anthropic error ${resp.status}`);
  }
  const data = await resp.json() as {
    content: Array<{ text: string }>;
    usage?: { input_tokens: number; output_tokens: number };
  };
  return {
    text: data.content[0]?.text?.trim() ?? "",
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
  };
}

async function callGemini(apiKey: string, system: string, user: string): Promise<ProviderResult> {
  const prompt = `${system}\n\nTask: ${user}`;
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 900 },
      }),
    }
  );
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(String(err.error?.message ?? `Gemini error ${resp.status}`));
  }
  const data = await resp.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
  };
  return {
    text: data.candidates[0]?.content?.parts[0]?.text?.trim() ?? "",
    inputTokens: data.usageMetadata?.promptTokenCount ?? Math.ceil(prompt.length / 4),
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 225,
  };
}

const PRICING: Record<string, { input: number; output: number }> = {
  openai:    { input: 0.15,  output: 0.60 },   // gpt-4o-mini per M tokens
  anthropic: { input: 0.25,  output: 1.25 },   // claude-haiku per M tokens
  gemini:    { input: 0.075, output: 0.30 },   // gemini-1.5-flash per M tokens
};

function calcCost(provider: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[provider] ?? PRICING["openai"];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

export interface AiTaskResult {
  type: "ai_report";
  title: string;
  content: string;   // JSON string: { markdown, provider, model, agentName, role, tokensUsed, costUsd }
  provider: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
}

export async function executeAiTask(
  role: string,
  taskTitle: string,
  taskDescription: string,
  agentName: string,
): Promise<AiTaskResult | null> {
  const config = getAiConfig();
  if (!config || !config.apiKey) return null;

  const systemPrompt = ROLE_SYSTEM_PROMPTS[role] ?? ROLE_SYSTEM_PROMPTS["research"];

  const isAutoGenerated = !taskDescription || taskDescription.startsWith("Auto-generated task for");
  const userMessage = isAutoGenerated
    ? `Complete the following task as ${agentName}, a ${role} specialist: "${taskTitle}"`
    : `Complete the following task as ${agentName}, a ${role} specialist:\n\nTask: ${taskTitle}\n\nContext provided by Commander: ${taskDescription}`;

  let result: ProviderResult;
  try {
    if (config.provider === "anthropic") {
      result = await withRetry(() => callAnthropic(config.apiKey, systemPrompt, userMessage));
    } else if (config.provider === "gemini") {
      result = await withRetry(() => callGemini(config.apiKey, systemPrompt, userMessage));
    } else {
      result = await withRetry(() => callOpenAI(config.apiKey, systemPrompt, userMessage));
    }
  } catch (err) {
    logger.warn({ err }, `AI task execution failed for ${agentName} — falling back to template`);
    return null;
  }

  const model =
    config.provider === "openai"    ? "gpt-4o-mini" :
    config.provider === "anthropic" ? "claude-haiku-20240307" :
                                      "gemini-1.5-flash";

  const tokensUsed = result.inputTokens + result.outputTokens;
  const costUsd    = calcCost(config.provider, result.inputTokens, result.outputTokens);

  return {
    type:     "ai_report",
    title:    taskTitle,
    content:  JSON.stringify({
      markdown: result.text,
      provider: config.provider,
      model,
      agentName,
      role,
      tokensUsed,
      costUsd,
    }),
    provider:   config.provider,
    model,
    tokensUsed,
    costUsd,
  };
}
