"use client";

import { create } from "zustand";
import { AiConversation, AiMessage, AgentType, TargetLanguage, ResponseMode } from "../types";
import { aiCenterService } from "../api/ai-center-service";

interface AiCenterState {
  conversations: AiConversation[];
  activeConversation: AiConversation | null;
  messages: AiMessage[];

  activeAgent: AgentType;
  targetLanguage: TargetLanguage;
  responseMode: ResponseMode;

  isStreaming: boolean;
  streamingContent: string;

  isHistoryOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (conv: AiConversation) => Promise<void>;
  createConversation: (title: string, agentType?: AgentType) => Promise<AiConversation>;
  deleteConversation: (convId: string) => Promise<void>;

  setActiveAgent: (agent: AgentType) => void;
  setTargetLanguage: (lang: TargetLanguage) => void;
  setResponseMode: (mode: ResponseMode) => void;
  toggleHistoryDrawer: () => void;

  sendMessage: (text: string) => Promise<void>;
  sendAttachment: (file: File) => Promise<void>;
  useWebSearch: boolean;
  toggleWebSearch: () => void;
  resetActiveChat: () => void;
}

export const useAiCenterStore = create<AiCenterState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],

  activeAgent: "teacher",
  targetLanguage: "en",
  responseMode: "short",

  isStreaming: false,
  streamingContent: "",

  isHistoryOpen: false,
  isLoading: false,
  error: null,
  useWebSearch: false,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const convs = await aiCenterService.fetchConversations();
      set({ conversations: convs, isLoading: false });

      if (convs.length > 0 && !get().activeConversation) {
        const first = convs[0];
        if (first) {
          const msgs = await aiCenterService.fetchMessages(first.id);
          set({
            activeConversation: first,
            messages: msgs,
            activeAgent: first.agent_type,
            targetLanguage: first.target_language,
          });
        }
      }
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  selectConversation: async (conv) => {
    set({
      activeConversation: conv,
      activeAgent: conv.agent_type,
      targetLanguage: conv.target_language,
      isLoading: true,
      streamingContent: "",
    });
    const msgs = await aiCenterService.fetchMessages(conv.id);
    set({ messages: msgs, isLoading: false });
  },

  createConversation: async (title, agentType) => {
    const targetAgent = agentType || get().activeAgent;
    const targetLang = get().targetLanguage;

    const newConv = await aiCenterService.createConversation(title, targetAgent, targetLang);
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversation: newConv,
      messages: [],
      activeAgent: targetAgent,
      streamingContent: "",
    }));
    return newConv;
  },

  setActiveAgent: (agent) => set({ activeAgent: agent }),

  setTargetLanguage: (lang) => set({ targetLanguage: lang }),

  setResponseMode: (mode) => set({ responseMode: mode }),

  toggleHistoryDrawer: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),

  deleteConversation: async (convId) => {
    await aiCenterService.deleteConversation(convId);
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== convId);
      const isActive = state.activeConversation?.id === convId;
      return {
        conversations,
        ...(isActive
          ? { activeConversation: conversations[0] ?? null, messages: [], streamingContent: "" }
          : {}),
      };
    });
    // Reload messages for the next active conv if any
    const next = useAiCenterStore.getState().activeConversation;
    if (next) {
      const msgs = await aiCenterService.fetchMessages(next.id);
      useAiCenterStore.setState({ messages: msgs });
    }
  },

  sendMessage: async (text) => {
    const { activeConversation, activeAgent, targetLanguage, messages, createConversation, useWebSearch } = get();
    let currentConv = activeConversation;

    if (!currentConv) {
      currentConv = await createConversation(text.slice(0, 30) || "Cuộc trò chuyện mới", activeAgent);
    }

    // Save User message
    const userMsg = await aiCenterService.saveMessage(currentConv.id, "user", text);

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingContent: "",
    }));

    try {
      const historyContext = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let rawStreamText = "";
      let actionTagSeen = false;
      const fullText = await aiCenterService.streamAgentResponse(
        activeAgent,
        targetLanguage,
        historyContext,
        (chunk) => {
          rawStreamText += chunk;
          if (actionTagSeen) return;
          const tagStart = rawStreamText.indexOf("<ACTION_JSON>");
          if (tagStart !== -1) {
            actionTagSeen = true;
            set({ streamingContent: rawStreamText.slice(0, tagStart).trim() });
          } else {
            set({ streamingContent: rawStreamText });
          }
        },
        useWebSearch,
        get().responseMode,
      );

      // If the model proposed vocabulary/grammar/flashcards via the
      // ACTION_JSON protocol (triggered by plain-text requests like "tạo
      // giúp tôi 1 flashcard..."), pull that block out of the visible reply
      // and attach it as metadata so it renders as a confirm-to-save card —
      // nothing is written to Supabase until the person clicks "Lưu".
      const actionMatch = fullText.match(/<ACTION_JSON>([\s\S]*?)<\/ACTION_JSON>/);
      let displayText = fullText;
      let extraction: { vocabulary: any[]; grammar: any[]; flashcards: any[] } | undefined;

      if (actionMatch) {
        displayText = fullText.replace(actionMatch[0], "").trim();
        try {
          const parsed = JSON.parse(actionMatch[1].trim());
          const vocabulary = Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [];
          const grammar = Array.isArray(parsed.grammar) ? parsed.grammar : [];
          const flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
          if (vocabulary.length || grammar.length || flashcards.length) {
            extraction = { vocabulary, grammar, flashcards };
          }
        } catch {
          // Malformed JSON from the model — just show the plain text reply.
        }
      }

      // Save Assistant response
      const assistantMsg = await aiCenterService.saveMessage(
        currentConv.id,
        "assistant",
        displayText,
        extraction ? { extraction } : undefined
      );

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isStreaming: false,
        streamingContent: "",
      }));
    } catch (err) {
      set({ error: (err as Error).message, isStreaming: false, streamingContent: "" });
    }
  },

  toggleWebSearch: () => set((state) => ({ useWebSearch: !state.useWebSearch })),

  sendAttachment: async (file) => {
    const { activeConversation, activeAgent, targetLanguage, createConversation } = get();
    let currentConv = activeConversation;

    if (!currentConv) {
      currentConv = await createConversation(`Đính kèm: ${file.name}`.slice(0, 40), activeAgent);
    }

    const isImage = file.type.startsWith("image/");

    set({ isStreaming: true, streamingContent: "" });

    try {
      let imageDataUrl: string | undefined;
      let text: string | undefined;

      if (isImage) {
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Không thể đọc ảnh."));
          reader.readAsDataURL(file);
        });
      } else {
        text = await file.text();
      }

      // Save the user's message — image previews render straight from
      // metadata.imageDataUrl in the chat bubble.
      const userMsg = await aiCenterService.saveMessage(
        currentConv.id,
        "user",
        isImage ? `📎 Đã gửi ảnh: ${file.name}` : `📎 Đã gửi tài liệu: ${file.name}`,
        isImage ? { imageDataUrl } : { attachedFileName: file.name }
      );

      set((state) => ({ messages: [...state.messages, userMsg] }));

      const result = await aiCenterService.analyzeAttachment({
        imageDataUrl,
        text,
        targetLanguage,
      });

      const hasCandidates =
        result.vocabulary.length > 0 || result.grammar.length > 0 || result.flashcards.length > 0;

      const assistantContent =
        result.summary ||
        (hasCandidates
          ? "Mình đã tìm thấy một số nội dung có thể lưu lại — bạn xem và chọn bên dưới nhé."
          : "Mình không tìm thấy nội dung từ vựng/ngữ pháp rõ ràng trong tệp này.");

      const assistantMsg = await aiCenterService.saveMessage(
        currentConv.id,
        "assistant",
        assistantContent,
        hasCandidates ? { extraction: result } : undefined
      );

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isStreaming: false,
        streamingContent: "",
      }));
    } catch (err) {
      set({ error: (err as Error).message, isStreaming: false, streamingContent: "" });
    }
  },

  resetActiveChat: () => {
    set({
      activeConversation: null,
      messages: [],
      streamingContent: "",
    });
  },
}));
