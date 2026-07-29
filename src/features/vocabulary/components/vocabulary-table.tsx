"use client";

import { Volume2, Star, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyItem } from "../types";
import { useSpeech } from "../hooks/use-speech";

interface VocabularyTableProps {
  items: VocabularyItem[];
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: VocabularyItem) => void;
  onOpenEdit: (item: VocabularyItem) => void;
  onOpenDelete: (item: VocabularyItem) => void;
}

export function VocabularyTable({
  items,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
}: VocabularyTableProps) {
  const { speak } = useSpeech();

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/80 shadow-xs backdrop-blur-xs">
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

                {/* Word & Audio */}
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
                        <span className="ml-2 font-mono text-xs text-primary/80">
                          [{item.ipa}]
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Language */}
                <td className="px-4 py-3">
                  <span className="font-semibold uppercase text-[10px] tracking-wide">
                    {item.language === "en" ? "🇬🇧 EN" : item.language === "ko" ? "🇰🇷 KO" : "🇨🇳 ZH"}
                  </span>
                </td>

                {/* Vietnamese */}
                <td className="px-4 py-3 font-medium text-foreground">
                  {item.vietnamese}
                </td>

                {/* POS */}
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase">
                    {item.part_of_speech}
                  </span>
                </td>

                {/* Collection */}
                <td className="px-4 py-3 text-muted-foreground">
                  {item.collection}
                </td>

                {/* Difficulty */}
                <td className="px-4 py-3 capitalize text-muted-foreground">
                  {item.difficulty === "beginner" ? "Sơ cấp" : item.difficulty === "intermediate" ? "Trung cấp" : item.difficulty === "advanced" ? "Cao cấp" : "Thành thạo"}
                </td>

                {/* Actions */}
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
  );
}
