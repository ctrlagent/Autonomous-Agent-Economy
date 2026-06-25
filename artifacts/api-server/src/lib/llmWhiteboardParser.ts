import { getAiConfig } from "./aiConfig";
import { logger } from "./logger";

export interface ParsedTask {
  title: string;
  description: string;
  agentRole: "research" | "strategy" | "builder" | "content" | "growth" | "analytics";
  priority: "low" | "medium" | "high" | "critical";
}

export interface ParsedMissionSpec {
  title: string;
  description: string;
  target: number;
  unit: string;
  rewardAmount: number;
  color: string;
  tasks: ParsedTask[];
}

const ROLE_COLORS: Record<string, string> = {
  research: "#4df0d8",
  strategy: "#9b6dff",
  builder: "#4d7fff",
  content: "#ffb84d",
  growth: "#4dff9b",
  analytics: "#ff4d6d",
};

const SYSTEM_PROMPT = `You are a mission architect for CTRL, an autonomous AI agent economy OS.
Given a JSON whiteboard canvas state (shapes, text, arrows, notes), extract a structured mission spec.

Available agent roles:
- research: market analysis, competitive intelligence, data gathering, reports
- strategy: planning, roadmaps, business decisions, frameworks
- builder: code, technical implementation, TypeScript, APIs, architecture
- content: copywriting, social media, blog posts, marketing copy, scripts
- growth: user acquisition, A/B testing, experiments, funnels, campaigns
- analytics: metrics, KPIs, data analysis, dashboards, reporting

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation. Use this exact structure:
{
  "title": "Short mission title (max 55 chars)",
  "description": "What this mission achieves (max 180 chars)",
  "target": 3,
  "unit": "tasks",
  "rewardAmount": 500,
  "color": "#4dff9b",
  "tasks": [
    {
      "title": "Task title (max 55 chars)",
      "description": "What this task does (max 150 chars)",
      "agentRole": "builder",
      "priority": "high"
    }
  ]
}

Rules:
- Extract mission intent from text shapes and sticky notes
- Follow arrow flows to understand task dependencies/sequence
- Generate 2-5 tasks, each assigned to the most relevant role
- color must be one of: #4df0d8 (research), #9b6dff (strategy), #4d7fff (builder), #ffb84d (content), #4dff9b (growth), #ff4d6d (analytics) — pick based on dominant role
- rewardAmount: 200-2000 based on complexity
- target equals number of tasks`;

function extractCanvasText(tldrawState: unknown): string {
  try {
    const s = tldrawState as Record<string, unknown>;
    const records = s?.["store"] as Record<string, unknown> | undefined;
    if (!records) return "No content";

    const texts: string[] = [];
    for (const record of Object.values(records)) {
      const r = record as Record<string, unknown>;
      if (r?.["type"] === "shape") {
        const props = r["props"] as Record<string, unknown> | undefined;
        if (props?.["text"] && typeof props["text"] === "string") {
          texts.push(props["text"]);
        }
        if (props?.["richText"]) {
          const rt = props["richText"] as Record<string, unknown> | undefined;
          const text = extractRichText(rt);
          if (text) texts.push(text);
        }
      }
    }
    return texts.filter(t => t.trim()).join("\n") || "Empty canvas";
  } catch {
    return "Canvas content unavailable";
  }
}

function extractRichText(node: Record<string, unknown> | undefined): string {
  if (!node) return "";
  if (typeof node["text"] === "string") return node["text"];
  const children = node["children"] as Array<Record<string, unknown>> | undefined;
  if (!children) return "";
  return children.map(c => extractRichText(c)).join(" ");
}

async function callLLM(system: string, user: string, apiKey: string, provider: string): Promise<string> {
  if (provider === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const data = await resp.json() as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text ?? "";
  }

  if (provider === "gemini") {
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    const data = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const data = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

function generateFallbackMission(canvasText: string): ParsedMissionSpec {
  const lines = canvasText.split("\n").filter(Boolean);
  const title = (lines[0] ?? "Briefing Room Mission").slice(0, 55);
  const description = lines.slice(1, 3).join(". ").slice(0, 180) || "Mission created from whiteboard briefing";

  return {
    title,
    description,
    target: 3,
    unit: "tasks",
    rewardAmount: 500,
    color: "#4dff9b",
    tasks: [
      {
        title: "Research & intelligence gathering",
        description: "Analyze the mission context and gather relevant data",
        agentRole: "research",
        priority: "high",
      },
      {
        title: "Strategic planning",
        description: "Define the execution roadmap and success metrics",
        agentRole: "strategy",
        priority: "high",
      },
      {
        title: "Implementation",
        description: "Build and deliver the primary mission objective",
        agentRole: "builder",
        priority: "medium",
      },
    ],
  };
}

export async function parseWhiteboardToMission(tldrawState: unknown): Promise<ParsedMissionSpec> {
  const canvasText = extractCanvasText(tldrawState);
  logger.info({ canvasText: canvasText.slice(0, 200) }, "Parsing whiteboard canvas");

  const config = getAiConfig();
  if (!config) {
    logger.warn("No AI config — using fallback mission generator");
    return generateFallbackMission(canvasText);
  }

  const stateStr = JSON.stringify(tldrawState);
  const userMessage = [
    "Parse this whiteboard into a mission spec.",
    "",
    "=== CANVAS TEXT CONTENT ===",
    canvasText,
    "",
    "=== RAW STATE (truncated to 4000 chars) ===",
    stateStr.slice(0, 4000),
  ].join("\n");

  try {
    const raw = await callLLM(SYSTEM_PROMPT, userMessage, config.apiKey, config.provider);
    const jsonStr = raw.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as ParsedMissionSpec;

    if (!parsed.title || !parsed.tasks?.length) throw new Error("Invalid spec shape");

    const dominantRole = parsed.tasks[0]?.agentRole ?? "growth";
    if (!parsed.color) parsed.color = ROLE_COLORS[dominantRole] ?? "#4dff9b";

    logger.info({ title: parsed.title, tasks: parsed.tasks.length }, "Whiteboard parsed successfully");
    return parsed;
  } catch (err) {
    logger.warn({ err }, "LLM parse failed — falling back to template mission");
    return generateFallbackMission(canvasText);
  }
}
