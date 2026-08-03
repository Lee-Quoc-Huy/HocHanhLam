"use client";

import { Volume2, Star, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { VocabularyItem } from "../types";
import { useSpeech } from "../hooks/use-speech";

interface VocabularyTableProps {
  items: VocabularyItem[];
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: VocabularyItem) => void;
  onOpenEdit: (item: VocabularyItem) => void;
  onOpenDelete: (item: VocabularyItem) => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Cao cấp",
  master: "Thành thạo",
};

const LANG_FLAG: Record<string, string> = { en: "🇬🇧", ko: "🇰🇷", zh: "🇨🇳" };

/**
 * Two distinct layouts sharing the same data — a classic dense multi-column
 * table for desktop (plenty of horizontal room), and a compact single-line
 * row list for mobile portrait screens, so "Bảng" mode stays genuinely
 * useful (and visually different from "Lưới") instead of being disabled or
 * forced to scroll off-screen.
 */
export function VocabularyTable({
  items,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
}: VocabularyTableProps) {
  const { speak } = useSpeech();

  return (
    <>
      {/* ---- Desktop: classic dense table ---- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-surface/80 shadow-xs backdrop-blur-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Thích</th>
                <th className="px-4 py-3">Từ Vựng & Phiên Âm</th>
                <th className="px-4 py-3">Ngôn Ngữ</th>
                <th className="px-4 py-3">Nghĩa Tiếng Việt</th>
                <th className="px-4 py-3">Từ Loại</th>
                <th className="px-4 py-3">Bộ Từ Vựng</th>
                <th className="px-4 py-3">Mức Độ</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="text-muted-foreground hover:text-amber-500"
                    >
                      <Star className={`size-4 ${item.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </td>

                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speak(item.word, item.language, item.audio_url)}
                        className="text-muted-foreground hover:text-primary"
                        title="Phát âm"
                      >
                        <Volume2 className="size-3.5" />
                      </button>
                      <div>
                        <span className="font-semibold text-sm">{item.word}</span>
                        {item.ipa && (
                          <span className="ml-2 font-mono text-xs text-primary/80">[{item.ipa}]</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-semibold uppercase text-[10px] tracking-wide">
                      {LANG_FLAG[item.language]} {item.language.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium text-foreground">{item.vietnamese}</td>

                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase">
                      {item.part_of_speech}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">{item.collection}</td>

                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onOpenDetail(item)}
                        title="Xem chi tiết"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onOpenEdit(item)}
                        title="Sửa từ"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10"
                        onClick={() => onOpenDelete(item)}
                        title="Xóa từ"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Mobile: compact single-line rows ---- */}
      <div className="md:hidden overflow-hidden rounded-xl border border-border/80 bg-surface/80 shadow-xs backdrop-blur-xs divide-y divide-border/60">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2.5 active:bg-muted/40">
            <button
              onClick={() => onToggleFavorite(item.id)}
              className="shrink-0 text-muted-foreground"
            >
              <Star className={`size-4 ${item.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>

            <button
              onClick={() => speak(item.word, item.language, item.audio_url)}
              className="shrink-0 flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground"
            >
              <Volume2 className="size-3.5" />
            </button>

            <button onClick={() => onOpenDetail(item)} className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-xs">{LANG_FLAG[item.language]}</span>
                <span className="truncate font-semibold text-sm text-foreground">{item.word}</span>
                {item.ipa && (
                  <span className="shrink-0 font-mono text-[10px] text-primary/80">[{item.ipa}]</span>
                )}
              </div>
              <div className="truncate text-xs text-muted-foreground">{item.vietnamese}</div>
            </button>

            <span className="shrink-0 rounded-full border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
              {DIFFICULTY_LABEL[item.difficulty]?.slice(0, 2) ?? item.difficulty.slice(0, 2)}
            </span>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="shrink-0 flex size-7 items-center justify-center rounded-full text-muted-foreground">
                  <MoreVertical className="size-4" />
                </button>
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
        ))}
      </div>
    </>
  );
}
