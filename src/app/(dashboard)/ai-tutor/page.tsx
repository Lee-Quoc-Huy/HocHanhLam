"use client";

import { useAiCenter } from "@/features/ai-center/hooks/use-ai-center";
import { AgentSelector } from "@/features/ai-center/components/agent-selector";
import { ChatInterface } from "@/features/ai-center/components/chat-interface";
import { ConversationHistory } from "@/features/ai-center/components/conversation-history";
import { Sparkles } from "lucide-react";

export default function AiTutorPage() {
  const {
    conversations,
    activeConversation,
    messages,
    activeAgent,
    targetLanguage,
    isStreaming,
    streamingContent,
    isHistoryOpen,
    selectConversation,
    setActiveAgent,
    setTargetLanguage,
    toggleHistoryDrawer,
    sendMessage,
    resetActiveChat,
  } = useAiCenter();

  const handleSelectPresetPrompt = async (prompt: string) => {
    await sendMessage(prompt);
  };

  const handleNewChat = () => {
    resetActiveChat();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20">
            <Sparkles className="size-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
              <span>AI Center & Agent Hub</span>
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              8 Chuyên gia AI Subagents · English · Korean · Chinese
            </p>
          </div>
        </div>
      </div>

      {/* Subagent Selector */}
      <AgentSelector
        activeAgent={activeAgent}
        onSelectAgent={setActiveAgent}
        onSelectPresetPrompt={handleSelectPresetPrompt}
      />

      {/* Realtime Streaming Chat Interface */}
      <ChatInterface
        activeAgent={activeAgent}
        targetLanguage={targetLanguage}
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        onSendMessage={sendMessage}
        onSetTargetLanguage={setTargetLanguage}
        onToggleHistoryDrawer={toggleHistoryDrawer}
        onNewChat={handleNewChat}
      />

      {/* Conversation History Drawer */}
      <ConversationHistory
        isOpen={isHistoryOpen}
        conversations={conversations}
        activeConversationId={activeConversation?.id}
        onClose={toggleHistoryDrawer}
        onSelectConversation={selectConversation}
        onNewChat={handleNewChat}
      />
    </div>
  );
}
