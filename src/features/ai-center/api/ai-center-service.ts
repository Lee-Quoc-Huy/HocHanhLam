import { createClient } from "@/lib/supabase/client";
import type { AiConversation, AiMessage, AgentType, TargetLanguage } from "../types";

const STORAGE_CONVERSATIONS_KEY = "linguaverse_ai_conversations";
const STORAGE_MESSAGES_KEY = "linguaverse_ai_messages";

export const INITIAL_CONVERSATION: AiConversation = {
  id: "conv-initial-1",
  title: "Chào mừng đến với AI Center!",
  agent_type: "teacher",
  target_language: "en",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_MESSAGES: AiMessage[] = [
  {
    id: "msg-initial-1",
    conversation_id: "conv-initial-1",
    role: "assistant",
    content: "Xin chào! Tôi là Giáo Viên AI của bạn tại LinguaVerse AI. Tôi có thể giúp bạn luyện nói, giải thích từ vựng, ngữ pháp hay lên lộ trình học Tiếng Anh, Hàn, Trung hôm nay?",
    created_at: new Date().toISOString(),
  },
];

class AiCenterService {
  private getLocalConversations(): AiConversation[] {
    if (typeof window === "undefined") return [INITIAL_CONVERSATION];
    try {
      const data = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify([INITIAL_CONVERSATION]));
        return [INITIAL_CONVERSATION];
      }
      return JSON.parse(data);
    } catch {
      return [INITIAL_CONVERSATION];
    }
  }

  private setLocalConversations(convs: AiConversation[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(convs));
    } catch (e) {
      console.error("Localstorage error saving conversations:", e);
    }
  }

  private getLocalMessages(convId?: string): AiMessage[] {
    if (typeof window === "undefined") return INITIAL_MESSAGES;
    try {
      const data = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
        return INITIAL_MESSAGES;
      }
      const all: AiMessage[] = JSON.parse(data);
      return convId ? all.filter((m) => m.conversation_id === convId) : all;
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  private setLocalMessages(msgs: AiMessage[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(msgs));
    } catch (e) {
      console.error("Localstorage error saving messages:", e);
    }
  }

  // Fetch all conversations
  async fetchConversations(): Promise<AiConversation[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalConversations();
      }

      const convs = (data as unknown) as AiConversation[];
      this.setLocalConversations(convs);
      return convs;
    } catch {
      return this.getLocalConversations();
    }
  }

  // Create new conversation
  async createConversation(
    title: string,
    agentType: AgentType,
    targetLanguage: TargetLanguage = "en"
  ): Promise<AiConversation> {
    const newConv: AiConversation = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`,
      title,
      agent_type: agentType,
      target_language: targetLanguage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert([(newConv as unknown) as any])
        .select()
        .single();
      if (!error && data) newConv.id = data.id;
    } catch {
      // Offline fallback
    }

    const convs = [newConv, ...this.getLocalConversations()];
    this.setLocalConversations(convs);
    return newConv;
  }

  // Fetch messages for a conversation
  async fetchMessages(conversationId: string): Promise<AiMessage[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        return this.getLocalMessages(conversationId);
      }

      return (data as unknown) as AiMessage[];
    } catch {
      return this.getLocalMessages(conversationId);
    }
  }

  // Save message
  async saveMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<AiMessage> {
    const newMsg: AiMessage = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}`,
      conversation_id: conversationId,
      role,
      content,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("ai_messages").insert([(newMsg as unknown) as any]);
      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } catch {
      // Offline fallback
    }

    const allMsgs = [...this.getLocalMessages(), newMsg];
    this.setLocalMessages(allMsgs);
    return newMsg;
  }

  // Stream Tokens from /api/ai/agent-stream
  async streamAgentResponse(
    agentType: AgentType,
    targetLanguage: TargetLanguage,
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const response = await fetch("/api/ai/agent-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentType, targetLanguage, messages }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI Stream Error (${response.status}): ${err}`);
    }

    if (!response.body) throw new Error("No response stream body returned.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      const lines = raw.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
          } catch {
            // Ignore parse errors on partial SSE frames
          }
        }
      }
    }

    return fullText;
  }

  subscribeToRealtime(onUpdate: () => void) {
    const supabase = createClient();
    const channel = supabase
      .channel("public:ai_center_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_conversations" }, () => onUpdate())
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_messages" }, () => onUpdate())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const aiCenterService = new AiCenterService();
