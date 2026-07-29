"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, History, Plus, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiConversation } from "../types";
import { AGENT_TEMPLATES } from "../lib/prompt-templates";

interface ConversationHistoryProps {
  isOpen: boolean;
  conversations: AiConversation[];
  activeConversationId?: string;
  onClose: () => void;
  onSelectConversation: (conv: AiConversation) => void;
  onNewChat: () => void;
}

export function ConversationHistory({
  isOpen,
  conversations,
  activeConversationId,
  onClose,
  onSelectConversation,
  onNewChat,
}: ConversationHistoryProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-border bg-surface-raised p-6 shadow-2xl animate-in slide-in-from-right flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Dialog.Title className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <History className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span>Lịch Sử Hội Thoại</span>
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>

            <Button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm text-xs"
            >
              <Plus className="size-4" /> Cuộc trò chuyện mới
            </Button>

            {/* List of past conversations */}
            <div className="mt-4 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const template = AGENT_TEMPLATES[conv.agent_type];

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center gap-3 ${
                      isActive
                        ? "border-emerald-600 bg-emerald-500/10 font-semibold"
                        : "border-border/60 bg-background/60 hover:border-emerald-500/40 hover:bg-background"
                    }`}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-foreground truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {template?.name || conv.agent_type} · {conv.target_language.toUpperCase()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
