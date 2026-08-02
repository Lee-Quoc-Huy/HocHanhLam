"use client";

import { Star, MoreVertical, Edit, Trash2, Eye, Sparkles, AlertTriangle, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GrammarItem } from "../types";

interface GrammarCardProps {
  item: GrammarItem;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: GrammarItem) => void;
  onOpenEdit: (item: GrammarItem) => void;
  onOpenDelete: (item: GrammarItem) => void;
  onOpenAiModal: (item: GrammarItem) => void;
}

export function GrammarCard({
  item,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
  onOpenAiModal,
}: GrammarCardProps) {
  const getLanguageBadge = (lang: string) => {
    switch (lang) {
      case "en":
        return {
          label: "Tiếng Anh",
          flag: "🇬🇧",
          badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
      case "ko":
        return {
          label: "Tiếng Hàn",
          flag: "🇰🇷",
          badgeClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
        };
      case "zh":
        return {
          label: "Tiếng Trung",
          flag: "🇨🇳",
          badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        };
      default:
        return { label: lang, flag: "🌐", badgeClass: "bg-muted text-muted-foreground" };
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "intermediate":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "advanced":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "master":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const langConfig = getLanguageBadge(item.language);
  const firstExample = item.examples?.[0];
  const firstMistake = item.common_mistakes?.[0];

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-surface/70 p-5 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-md">
      {/* Top Header: Language, Difficulty, Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${langConfig.badgeClass}`}
          >
            <span>{langConfig.flag}</span>
            <span>{langConfig.label}</span>
          </span>

          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getDifficultyColor(
              item.difficulty
            )}`}
          >
            {item.difficulty}
          </span>

          {item.category && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Layers className="size-2.5" />
              <span>{item.category}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-amber-500"
            title={item.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star
              className={`size-4 ${
                item.is_favorite ? "fill-amber-400 text-amber-400" : ""
              }`}
            />
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="size-7 rounded-lg">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-36 rounded-lg border border-border bg-surface-raised p-1 shadow-lg backdrop-blur-md"
              >
                <DropdownMenu.Item
                  onClick={() => onOpenDetail(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none hover:bg-muted"
                >
                  <Eye className="size-3.5" /> View Details
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onOpenAiModal(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 outline-none hover:bg-indigo-500/10"
                >
                  <Sparkles className="size-3.5 text-amber-500" /> AI Explanation
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onOpenEdit(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none hover:bg-muted"
                >
                  <Edit className="size-3.5" /> Edit Rule
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onClick={() => onOpenDelete(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" /> Delete Rule
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Main Title & Meaning */}
      <div className="mt-3 space-y-1">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground line-clamp-1">
          {item.title}
        </h2>
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 line-clamp-1">
          {item.meaning}
        </p>
      </div>

      {/* Explanation snippet */}
      {item.explanation && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-muted/40 p-2 rounded-lg border border-border/40 font-mono">
          {item.explanation}
        </p>
      )}

      {/* Example Preview */}
      {firstExample && (
        <div className="mt-3 rounded-lg border border-border/50 bg-background/60 p-2.5 text-xs space-y-0.5">
          <p className="font-medium text-foreground italic">&quot;{firstExample.example}&quot;</p>
          {firstExample.translation && (
            <p className="text-muted-foreground text-[11px]">
              → {firstExample.translation}
            </p>
          )}
        </div>
      )}

      {/* Common Mistake badge */}
      {firstMistake && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          <AlertTriangle className="size-3 shrink-0" />
          <span className="line-clamp-1">Mistake: <s>{firstMistake.incorrect}</s></span>
        </div>
      )}

      {/* Related Grammar chips */}
      {item.related_grammar?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
          {item.related_grammar.map((rel) => (
            <span
              key={rel}
              className="rounded bg-muted px-1.5 py-0.5 font-medium text-muted-foreground"
            >
              ↔ {rel}
            </span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenAiModal(item)}
          className="h-7 gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 text-xs shadow-2xs"
        >
          <Sparkles className="size-3 text-amber-500" /> AI Deep Dive
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenDetail(item)}
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Details <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
