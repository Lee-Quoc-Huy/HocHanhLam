"use client";

import { create } from "zustand";
import { AiConversation, AiMessage, AgentType, TargetLanguage } from "../types";
import { aiCenterService } from "../api/ai-center-service";

interface AiCenterState {
  conversations: AiConversation[];
  activeConversation: AiConversation | null;
  messages: AiMessage[];

  activeAgent: AgentType;
  targetLanguage: TargetLanguage;

  isStreaming: boolean;
  streamingContent: string;

  isHistoryOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (conv: AiConversation) => Promise<void>;
  createConversation: (title: string, agentType?: AgentType) => Promise<AiConversation>;

  setActiveAgent: (agent: AgentType) => void;
  setTargetLanguage: (lang: TargetLanguage) => void;
  toggleHistoryDrawer: () => void;

  sendMessage: (text: string) => Promise<void>;
  resetActiveChat: () => void;
}

export const useAiCenterStore = create<AiCenterState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],

  activeAgent: "teacher",
  targetLanguage: "en",

  isStreaming: false,
  streamingContent: "",

  isHistoryOpen: false,
  isLoading: false,
  error: null,

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

  toggleHistoryDrawer: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),

  sendMessage: async (text) => {
    const { activeConversation, activeAgent, targetLanguage, messages, createConversation } = get();
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

      const fullText = await aiCenterService.streamAgentResponse(
        activeAgent,
        targetLanguage,
        historyContext,
        (chunk) => {
          set((state) => ({ streamingContent: state.streamingContent + chunk }));
        }
      );

      // Save Assistant response
      const assistantMsg = await aiCenterService.saveMessage(currentConv.id, "assistant", fullText);

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
