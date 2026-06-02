export interface AiConfig {
  provider: "openai" | "anthropic" | "gemini";
  apiKey: string;
}

let _config: AiConfig | null = null;

export function setAiConfig(config: AiConfig): void {
  _config = config;
}

export function getAiConfig(): AiConfig | null {
  return _config;
}

export function clearAiConfig(): void {
  _config = null;
}
