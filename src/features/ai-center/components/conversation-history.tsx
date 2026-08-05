"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, History, Plus, Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiConversation } from "../types";
import { AGENT_TEMPLATES } from "../lib/prompt-templates";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ConversationHistoryProps {
  isOpen: boolean;
  conversations: AiConversation[];
  activeConversationId?: string;
  onClose: () => void;
  onSelectConversation: (conv: AiConversation) => void;
  onNewChat: () => void;
  onDeleteConversation: (convId: string) => Promise<void>;
}

export function ConversationHistory({
  isOpen,
  conversations,
  activeConversationId,
  onClose,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: ConversationHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (convId: string) => {
    if (confirmDeleteId !== convId) {
      setConfirmDeleteId(convId);
      return;
    }
    setDeletingId(convId);
    setConfirmDeleteId(null);
    await onDeleteConversation(convId);
    setDeletingId(null);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-border bg-surface-raised p-6 shadow-2xl animate-in slide-in-from-right flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <Dialog.Title className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <History className="size-5 text-emerald-600 dark:text-emerald-400" />
              <span>Lịch Sử Hội Thoại</span>
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
                {conversations.length}
              </span>
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
            className="w-full mb-4 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm text-xs"
          >
            <Plus className="size-4" /> Cuộc trò chuyện mới
          </Button>

          {/* List of past conversations */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {conversations.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-8">
                Chưa có cuộc hội thoại nào.
              </p>
            )}
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const template = AGENT_TEMPLATES[conv.agent_type];
              const isDeleting = deletingId === conv.id;
              const isConfirming = confirmDeleteId === conv.id;

              return (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl border transition-all text-xs",
                    isActive
                      ? "border-emerald-600 bg-emerald-500/10"
                      : "border-border/60 bg-background/60 hover:border-emerald-500/40 hover:bg-background"
                  )}
                >
                  <button
                    onClick={() => {
                      onSelectConversation(conv);
                      onClose();
                    }}
                    className="flex-1 text-left p-3 flex items-center gap-3 min-w-0"
                    disabled={isDeleting}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={cn("font-bold text-foreground truncate", isActive && "font-bold")}>{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {template?.name || conv.agent_type} · {conv.target_language.toUpperCase()}
                      </p>
                    </div>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(conv.id)}
                    disabled={isDeleting}
                    className={cn(
                      "shrink-0 mr-2 p-1.5 rounded-lg transition-all",
                      isConfirming
                        ? "bg-red-500/10 text-red-500 border border-red-500/30"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10"
                    )}
                    title={isConfirming ? "Bấm lần nữa để xác nhận xóa" : "Xóa cuộc trò chuyện này"}
                  >
                    {isDeleting ? (
                      <span className="text-[10px] text-muted-foreground">...</span>
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                  {isConfirming && (
                    <span className="shrink-0 text-[10px] text-red-500 mr-2 font-semibold whitespace-nowrap">
                      Xác nhận?
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground border-t border-border pt-3">
            Bấm 🗑️ hai lần để xóa cuộc trò chuyện
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
