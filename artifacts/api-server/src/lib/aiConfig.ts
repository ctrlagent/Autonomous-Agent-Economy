import { db, serverConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AiConfig {
  provider: "openai" | "anthropic" | "gemini";
  apiKey: string;
}

const AI_CONFIG_KEY = "ai_config";

let _config: AiConfig | null = null;

export async function loadAiConfigFromDb(): Promise<void> {
  try {
    const [row] = await db.select().from(serverConfigTable).where(eq(serverConfigTable.key, AI_CONFIG_KEY));
    if (row?.value) {
      _config = JSON.parse(row.value) as AiConfig;
    }
  } catch {
    // Table not ready yet or parse error — start with null
  }
}

export function setAiConfig(config: AiConfig): void {
  _config = config;
  db.insert(serverConfigTable)
    .values({ key: AI_CONFIG_KEY, value: JSON.stringify(config), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: serverConfigTable.key,
      set: { value: JSON.stringify(config), updatedAt: new Date() },
    })
    .catch(() => {});
}

export function getAiConfig(): AiConfig | null {
  return _config;
}

export function clearAiConfig(): void {
  _config = null;
  db.delete(serverConfigTable).where(eq(serverConfigTable.key, AI_CONFIG_KEY)).catch(() => {});
}
