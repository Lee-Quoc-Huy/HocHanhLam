import "server-only";

import { AI_MODEL_ROUTES, OPENROUTER_CONFIG, type AiTaskType } from "@/config/ai-models";

export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatContentPart[];
}

export interface CompletionParams {
  task: AiTaskType;
  messages: ChatMessage[];
  temperature?: number;
  stream?: boolean;
  /** Overrides the routed model — used e.g. to append OpenRouter's `:online`
   *  suffix for web-grounded answers without adding a whole new task type. */
  modelOverride?: string;
}

export interface CompletionResult {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

async function tryModel(
  model: string,
  params: CompletionParams,
  apiKey: string,
  maxTokens: number,
): Promise<CompletionResult | null> {
  try {
    const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...OPENROUTER_CONFIG.siteHeaders,
      },
      body: JSON.stringify({
        model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    // OpenRouter may return an error object with status 200
    if (data.error) return null;

    const content: string = data.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) return null;

    return mapResponse(data, model);
  } catch {
    return null;
  }
}

export async function createChatCompletion(params: CompletionParams): Promise<CompletionResult> {
  const route = AI_MODEL_ROUTES[params.task];
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  // Build the full ordered list of models to try: primary → fallbackModels → fallbackModel
  const modelsToTry: string[] = [
    params.modelOverride ?? route.model,
    ...(route.fallbackModels ?? []),
    ...(route.fallbackModel ? [route.fallbackModel] : []),
  ];

  let lastError = "";
  for (const model of modelsToTry) {
    const result = await tryModel(model, params, apiKey, route.maxOutputTokens);
    if (result) {
      if (model !== modelsToTry[0]) {
        console.info(`[AI] Primary model unavailable. Using fallback: ${model}`);
      }
      return result;
    }
    lastError = model;
  }

  throw new Error(
    `All AI models failed for task "${params.task}". Last tried: ${lastError}. Check OPENROUTER_API_KEY and model availability.`,
  );
}


/**
 * Creates a Server-Sent Events stream for real-time AI token generation.
 */
export async function createChatStream(params: CompletionParams): Promise<Response> {
  const route = AI_MODEL_ROUTES[params.task];
  const model = params.modelOverride ?? route.model;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...OPENROUTER_CONFIG.siteHeaders,
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: route.maxOutputTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter stream failed (${response.status}): ${errorText}`);
  }

  return response;
}

function mapResponse(data: any, model: string): CompletionResult {
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}
