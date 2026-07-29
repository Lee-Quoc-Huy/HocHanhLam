"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sparkles, RefreshCw, Copy, Check, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrammarItem } from "../types";

interface GrammarAiModalProps {
  item: GrammarItem | null;
  onClose: () => void;
  onGenerateAi: (item: GrammarItem) => Promise<string>;
}

export function GrammarAiModal({
  item,
  onClose,
  onGenerateAi,
}: GrammarAiModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setError(null);
      if (item.ai_explanation) {
        setExplanationText(item.ai_explanation);
      } else {
        handleTriggerGeneration();
      }
    }
  }, [item]);

  const handleTriggerGeneration = async () => {
    if (!item) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await onGenerateAi(item);
      setExplanationText(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!explanationText) return;
    navigator.clipboard.writeText(explanationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) return null;

  return (
    <Dialog.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-indigo-500/30 bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 sm:p-7 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Dialog.Title className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs">
                <Bot className="size-5" />
              </div>
              <span>AI Grammar Deep Dive · {item.title}</span>
            </Dialog.Title>

            <div className="flex items-center gap-2">
              {explanationText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  className="gap-1.5 text-xs"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Copied" : "Copy Markdown"}</span>
                </Button>
              )}
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* AI Content Area */}
          <div className="mt-5 space-y-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative flex size-12 items-center justify-center">
                  <div className="absolute size-full animate-ping rounded-full bg-indigo-500/20" />
                  <Sparkles className="size-6 text-amber-500 animate-spin" />
                </div>
                <h4 className="mt-4 font-display text-base font-semibold text-foreground">
                  Analyzing Grammar Rules & Generating AI Explanation…
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Connecting to AI Engine to break down formula, nuances, memory tricks, and real-life dialogues for &quot;{item.title}&quot;.
                </p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-3">
                <p className="text-sm font-medium text-destructive">{error}</p>
                <Button onClick={handleTriggerGeneration} className="gap-2">
                  <RefreshCw className="size-4" /> Retry AI Analysis
                </Button>
              </div>
            ) : explanationText ? (
              <div className="rounded-xl border border-border/80 bg-background/80 p-5 shadow-xs text-sm leading-relaxed text-foreground whitespace-pre-line font-sans">
                {explanationText}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={handleTriggerGeneration}
              disabled={isGenerating}
              className="gap-1.5"
            >
              <RefreshCw className={`size-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>Regenerate AI Analysis</span>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
