"use client";

import { Star, Edit, Trash2, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrammarItem } from "../types";

interface GrammarTableProps {
  items: GrammarItem[];
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: GrammarItem) => void;
  onOpenEdit: (item: GrammarItem) => void;
  onOpenDelete: (item: GrammarItem) => void;
  onOpenAiModal: (item: GrammarItem) => void;
}

export function GrammarTable({
  items,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
  onOpenAiModal,
}: GrammarTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/80 shadow-xs backdrop-blur-xs">
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
              <tr
                key={item.id}
                className="transition-colors hover:bg-muted/30"
              >
                {/* Favorite */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="text-muted-foreground hover:text-amber-500"
                  >
                    <Star
                      className={`size-4 ${
                        item.is_favorite ? "fill-amber-400 text-amber-400" : ""
                      }`}
                    />
                  </button>
                </td>

                {/* Title */}
                <td className="px-4 py-3 font-bold text-foreground text-sm">
                  {item.title}
                </td>

                {/* Language */}
                <td className="px-4 py-3">
                  <span className="font-semibold uppercase text-[10px] tracking-wide">
                    {item.language === "en" ? "🇬🇧 EN" : item.language === "ko" ? "🇰🇷 KO" : "🇨🇳 ZH"}
                  </span>
                </td>

                {/* Meaning */}
                <td className="px-4 py-3 font-medium text-foreground">
                  {item.meaning}
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-muted-foreground">
                  {item.category}
                </td>

                {/* Difficulty */}
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {item.difficulty}
                </td>

                {/* Actions */}
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
  );
}
