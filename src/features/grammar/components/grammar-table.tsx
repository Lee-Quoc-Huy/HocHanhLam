"use client";

import { Star, Edit, Trash2, Eye, Sparkles, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GrammarItem } from "../types";

interface GrammarTableProps {
  items: GrammarItem[];
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: GrammarItem) => void;
  onOpenEdit: (item: GrammarItem) => void;
  onOpenDelete: (item: GrammarItem) => void;
  onOpenAiModal: (item: GrammarItem) => void;
}

const LANG_FLAG: Record<string, string> = { en: "🇬🇧", ko: "🇰🇷", zh: "🇨🇳" };

/**
 * Two distinct layouts sharing the same data — a dense table for desktop,
 * and a compact single-line row list for mobile portrait screens, so
 * "Bảng" mode stays genuinely usable there instead of overflowing off-screen.
 */
export function GrammarTable({
  items,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
  onOpenAiModal,
}: GrammarTableProps) {
  return (
    <>
      {/* ---- Desktop: classic dense table ---- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-surface/80 shadow-xs backdrop-blur-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">YT</th>
                <th className="px-4 py-3">Cấu Trúc / Tiêu Đề</th>
                <th className="px-4 py-3">Ngôn Ngữ</th>
                <th className="px-4 py-3">Tóm Tắt Ý Nghĩa</th>
                <th className="px-4 py-3">Danh Mục</th>
                <th className="px-4 py-3">Cấp Độ</th>
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

                  <td className="px-4 py-3 font-bold text-foreground text-sm">{item.title}</td>

                  <td className="px-4 py-3">
                    <span className="font-semibold uppercase text-[10px] tracking-wide">
                      {LANG_FLAG[item.language]} {item.language.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium text-foreground">{item.meaning}</td>

                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>

                  <td className="px-4 py-3 capitalize text-muted-foreground">{item.difficulty}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-indigo-600 dark:text-indigo-400"
                        onClick={() => onOpenAiModal(item)}
                        title="Phân Tích Sâu Với AI"
                      >
                        <Sparkles className="size-3.5 text-amber-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onOpenDetail(item)}
                        title="Xem Chi Tiết"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onOpenEdit(item)}
                        title="Sửa Quy Tắc"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10"
                        onClick={() => onOpenDelete(item)}
                        title="Xoá Quy Tắc"
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

            <button onClick={() => onOpenDetail(item)} className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-xs">{LANG_FLAG[item.language]}</span>
                <span className="truncate font-bold text-sm text-foreground">{item.title}</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">{item.meaning}</div>
            </button>

            <span className="shrink-0 rounded-full border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
              {item.difficulty.slice(0, 2)}
            </span>

            <button
              onClick={() => onOpenAiModal(item)}
              className="shrink-0 flex size-7 items-center justify-center rounded-full text-amber-500"
              title="Phân Tích Sâu Với AI"
            >
              <Sparkles className="size-3.5" />
            </button>

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
                    <Edit className="size-3.5" /> Sửa Quy Tắc
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    onClick={() => onOpenDelete(item)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive outline-none hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Xoá Quy Tắc
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
