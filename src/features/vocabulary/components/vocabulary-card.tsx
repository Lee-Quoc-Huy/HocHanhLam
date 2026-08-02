"use client";

import { Volume2, Star, MoreVertical, Edit, Trash2, Eye, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { VocabularyItem } from "../types";
import { useSpeech } from "../hooks/use-speech";

interface VocabularyCardProps {
  item: VocabularyItem;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: VocabularyItem) => void;
  onOpenEdit: (item: VocabularyItem) => void;
  onOpenDelete: (item: VocabularyItem) => void;
}

export function VocabularyCard({
  item,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
}: VocabularyCardProps) {
  const { speak, isPlaying } = useSpeech();

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

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-surface/70 p-5 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {/* Card Header: Badges & Action Menu */}
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

          {item.collection && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Tag className="size-2.5" />
              <span>{item.collection}</span>
            </span>
          )}
        </div>

        {/* Favorite & Dropdown Menu */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-amber-500"
            title={item.is_favorite ? "Bỏ khỏi Yêu Thích" : "Thêm vào Yêu Thích"}
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
                  <Eye className="size-3.5" /> Xem Chi Tiết
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onOpenEdit(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none hover:bg-muted"
                >
                  <Edit className="size-3.5" /> Sửa Từ
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onClick={() => onOpenDelete(item)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" /> Xoá Từ
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Word Main Info */}
      <div className="mt-3.5 flex items-start gap-3">
        {/* Optional Image Preview */}
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.word}
            className="size-14 shrink-0 rounded-lg object-cover border border-border/80 shadow-2xs"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground truncate">
              {item.word}
            </h2>

            {/* Pronunciation Audio Trigger */}
            <button
              onClick={() => speak(item.word, item.language, item.audio_url)}
              className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                isPlaying
                  ? "border-primary bg-primary text-primary-foreground animate-pulse"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
              }`}
              title="Nghe phát âm"
            >
              <Volume2 className="size-3.5" />
            </button>
          </div>

          {/* IPA / Pinyin */}
          {item.ipa && (
            <div className="text-xs font-mono text-primary/80 font-medium mt-0.5">
              [{item.ipa}]
            </div>
          )}
        </div>
      </div>

      {/* Meanings */}
      <div className="mt-3 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
            {item.part_of_speech}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {item.vietnamese}
          </span>
        </div>

        {item.english_meaning && (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {item.english_meaning}
          </p>
        )}
      </div>

      {/* Example Sentence */}
      {item.example && (
        <div className="mt-3 rounded-lg border border-border/50 bg-background/60 p-2.5 text-xs">
          <p className="font-medium text-foreground italic">&quot;{item.example}&quot;</p>
          {item.example_translation && (
            <p className="mt-1 text-muted-foreground">{item.example_translation}</p>
          )}
        </div>
      )}

      {/* Synonyms & Antonyms chips */}
      {(item.synonyms?.length > 0 || item.antonyms?.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
          {item.synonyms?.map((syn) => (
            <span
              key={syn}
              className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400"
            >
              ={syn}
            </span>
          ))}
          {item.antonyms?.map((ant) => (
            <span
              key={ant}
              className="rounded-md bg-rose-500/10 px-1.5 py-0.5 font-medium text-rose-600 dark:text-rose-400"
            >
              ≠{ant}
            </span>
          ))}
        </div>
      )}

      {/* Frequency stars */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
        <span>Mức độ thường gặp</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`size-2 rounded-full ${
                i < item.frequency
                  ? "bg-primary"
                  : "bg-muted border border-border"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
