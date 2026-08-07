import "server-only";

import {
  AI_MODEL_ROUTES,
  OPENROUTER_CONFIG,
  callGoogleAIDirect,
  type AiTaskType,
} from "@/config/ai-models";

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
  maxTokens: number
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

  // Engine 1: Try Google AI Direct (Gemini 3.5 Flash / 2.5 Pro) first if available
  const googleApiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;
  if (route?.preferDirect && googleApiKey) {
    try {
      const userPrompt = params.messages
        .map((m) => {
          const body = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
          return `${m.role.toUpperCase()}: ${body}`;
        })
        .join("\n\n");

      const googleResult = await callGoogleAIDirect(userPrompt, {
        temperature: params.temperature,
        maxOutputTokens: route.maxOutputTokens,
      });

      if (googleResult?.text) {
        return {
          content: googleResult.text,
          model: googleResult.model,
        };
      }
    } catch {
      // Fall through to Engine 2 (OpenRouter)
    }
  }

  // Engine 2: OpenRouter Gateway Fallback Chain
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const modelsToTry: string[] = [
    params.modelOverride ?? route.model,
    ...(route.fallbackModels ?? []),
  ];

  let lastError = "";
  for (const model of modelsToTry) {
    const result = await tryModel(model, params, apiKey, route.maxOutputTokens);
    if (result) {
      if (model !== modelsToTry[0]) {
        console.info(`[AI Dual Engine] Primary model unavailable. Used fallback: ${model}`);
      }
      return result;
    }
    lastError = model;
  }

  throw new Error(
    `All AI models failed for task "${params.task}". Last tried: ${lastError}. Check API keys.`
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
