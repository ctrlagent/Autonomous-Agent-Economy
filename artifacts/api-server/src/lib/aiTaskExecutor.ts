import { getAiConfig } from "./aiConfig";
import { logger } from "./logger";

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  research: `You are an elite AI research analyst operating inside an autonomous agent economy. Given a task, produce a comprehensive research report in markdown. Structure it with:
## Executive Summary
(2-3 sentence overview)
## Key Findings
- bullet points with specific data points and insights
## Analysis
(deeper exploration with metrics, patterns, signals)
## Recommendation
(clear, actionable next step)
Be specific, data-driven, and reference relevant market dynamics. 300-450 words.`,

  strategy: `You are a senior business strategist inside an autonomous agent economy. Given a task, produce a strategic document in markdown. Structure it with:
## Objective
(clear goal statement)
## Strategic Tactics
- numbered list of concrete tactics with rationale
## KPI Targets
| Metric | Current | Target | Timeline |
(table with realistic numbers)
## Risk Assessment
(brief risk analysis)
## Next Actions
(3 immediate steps)
Be concrete, execution-focused, and include specific numbers. 300-450 words.`,

  builder: `You are a senior software engineer and architect. Given a task, produce a technical implementation document in markdown. Structure it with:
## Technical Approach
(architecture and design decisions)
## Implementation
\`\`\`
(relevant code snippet or pseudocode)
\`\`\`
## Components & Modules
- list of key components
## Testing Strategy
(how to validate the implementation)
## Deployment Notes
(considerations for shipping)
Be precise, use technical language, and include actual code where relevant. 300-450 words.`,

  content: `You are a content strategist and copywriter. Given a task, produce a content package in markdown. Structure it with:
## Content Brief
(objective and target audience)
## Twitter/X Post
(ready-to-publish tweet, max 280 chars, with hashtags)
## LinkedIn Post
(professional post, 150-200 words)
## Key Messages
- 3-4 core messages to amplify
## Distribution Schedule
(when and where to post)
Write actual ready-to-publish content. Be engaging and platform-appropriate. 300-450 words.`,

  growth: `You are a growth hacker and experimentation expert. Given a task, produce a growth experiment document in markdown. Structure it with:
## Hypothesis
(clear if-then statement)
## Experiment Design
| | Control | Variant |
(table showing test vs control)
## Expected Impact
(projected metrics with numbers)
## Implementation Steps
- numbered implementation steps
## Success Criteria
(specific measurable outcomes)
## Rollout Plan
(how to scale if it wins)
Be data-driven with specific conversion rates and uplift projections. 300-450 words.`,

  analytics: `You are a data analyst and business intelligence expert. Given a task, produce an analytics report in markdown. Structure it with:
## Summary
(key takeaway in 2-3 sentences)
## Metrics Dashboard
| Metric | Value | Change | Status |
(table with realistic fabricated numbers)
## Trend Analysis
(what the data shows over time)
## Cohort Insights
(segment-level findings)
## Recommendations
- numbered list of data-driven actions
Use specific numbers throughout. Be analytical and actionable. 300-450 words.`,
};

async function callOpenAI(apiKey: string, system: string, user: string): Promise<string> {
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
  const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content?.trim() ?? "";
}

async function callAnthropic(apiKey: string, system: string, user: string): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
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
  const data = await resp.json() as { content: Array<{ text: string }> };
  return data.content[0]?.text?.trim() ?? "";
}

async function callGemini(apiKey: string, system: string, user: string): Promise<string> {
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
  const data = await resp.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
  return data.candidates[0]?.content?.parts[0]?.text?.trim() ?? "";
}

export interface AiTaskResult {
  type: "ai_report";
  title: string;
  content: string;
}

export async function executeAiTask(
  role: string,
  taskTitle: string,
  taskDescription: string,
  agentName: string,
): Promise<AiTaskResult | null> {
  const config = getAiConfig();
  if (!config || !config.apiKey) return null;

  const systemPrompt = ROLE_SYSTEM_PROMPTS[role] ?? ROLE_SYSTEM_PROMPTS.research;

  const isAutoGenerated = !taskDescription || taskDescription.startsWith("Auto-generated task for");
  const userMessage = isAutoGenerated
    ? `Complete the following task as ${agentName}, a ${role} specialist: "${taskTitle}"`
    : `Complete the following task as ${agentName}, a ${role} specialist:\n\nTask: ${taskTitle}\n\nContext provided by Commander: ${taskDescription}`;

  let markdown: string;
  try {
    if (config.provider === "anthropic") {
      markdown = await callAnthropic(config.apiKey, systemPrompt, userMessage);
    } else if (config.provider === "gemini") {
      markdown = await callGemini(config.apiKey, systemPrompt, userMessage);
    } else {
      markdown = await callOpenAI(config.apiKey, systemPrompt, userMessage);
    }
  } catch (err) {
    logger.warn({ err }, `AI task execution failed for ${agentName} — falling back to template`);
    return null;
  }

  const model =
    config.provider === "openai" ? "gpt-4o-mini" :
    config.provider === "anthropic" ? "claude-haiku" : "gemini-1.5-flash";

  return {
    type: "ai_report",
    title: taskTitle,
    content: JSON.stringify({ markdown, provider: config.provider, model, agentName, role }),
  };
}
