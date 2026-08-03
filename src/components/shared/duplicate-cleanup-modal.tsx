"use client";

import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Copy, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { findDuplicateGroups, type DuplicateGroup } from "@/lib/utils/duplicate-detector";

interface DuplicateCleanupModalProps<T extends { id: string; created_at: string }> {
  open: boolean;
  onClose: () => void;
  items: T[];
  /** Text used to compare items for duplicates (e.g. the word, or the grammar title). */
  getCompareText: (item: T) => string;
  getLanguage: (item: T) => string;
  /** Short label shown per item, e.g. the word + Vietnamese meaning. */
  renderLabel: (item: T) => { title: string; subtitle: string };
  onDelete: (id: string) => Promise<unknown>;
  onDone: () => void;
  entityLabel: string; // "từ vựng" | "cấu trúc ngữ pháp"
}

export function DuplicateCleanupModal<T extends { id: string; created_at: string }>({
  open,
  onClose,
  items,
  getCompareText,
  getLanguage,
  renderLabel,
  onDelete,
  onDone,
  entityLabel,
}: DuplicateCleanupModalProps<T>) {
  const groups = useMemo(
    () => (open ? findDuplicateGroups(items, getCompareText, getLanguage) : []),
    [open, items, getCompareText, getLanguage]
  );

  // Which items are marked for deletion — per item id, freely toggleable.
  // Defaults to "keep the oldest, delete the rest" per group, but the
  // person can check/uncheck any combination (keep all, delete all, keep
  // several...), not forced to keep exactly one.
  const [markedForDeletion, setMarkedForDeletion] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [done, setDone] = useState(false);

  function isMarked(group: DuplicateGroup<T>, item: T): boolean {
    if (item.id in markedForDeletion) return markedForDeletion[item.id];
    const oldestId = [...group.items].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0].id;
    return item.id !== oldestId; // default: everything except the oldest is marked
  }

  function toggleMark(id: string, current: boolean) {
    setMarkedForDeletion((prev) => ({ ...prev, [id]: !current }));
  }

  const totalToDelete = groups.reduce(
    (sum, g) => sum + g.items.filter((item) => isMarked(g, item)).length,
    0
  );

  async function handleCleanup() {
    setIsDeleting(true);
    let deletedCount = 0;
    try {
      for (const group of groups) {
        for (const item of group.items) {
          if (!isMarked(group, item)) continue;
          await onDelete(item.id);
          deletedCount++;
        }
      }
      toast.success(`Đã dọn ${deletedCount} ${entityLabel} trùng lặp.`);
      setDone(true);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể dọn dẹp trùng lặp.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleClose() {
    setDone(false);
    setMarkedForDeletion({});
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-5 shadow-2xl animate-in zoom-in-95 fade-in max-h-[85vh] overflow-y-auto">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Copy className="size-4" />
              </div>
              <div>
                <Dialog.Title className="font-display text-base font-bold text-foreground">
                  Dọn {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} Trùng Lặp
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  Tự động phát hiện các mục trùng hoặc rất giống nhau (kể cả gõ khác cách viết hoa, thừa khoảng trắng, sai chính tả nhẹ).
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="size-10 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">Đã dọn dẹp xong!</p>
              <Button variant="outline" onClick={handleClose} className="mt-2">
                Đóng
              </Button>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="size-10 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">
                Không tìm thấy {entityLabel} trùng lặp nào — dữ liệu của bạn đang sạch!
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">
                Tìm thấy <span className="font-semibold text-foreground">{groups.length}</span> nhóm trùng lặp. Tick
                chọn (các) mục bạn muốn <span className="font-semibold text-destructive">xoá</span> trong mỗi nhóm —
                có thể chọn bao nhiêu mục tuỳ ý, kể cả giữ lại tất cả hoặc xoá hết. Mặc định đã tick sẵn mọi bản trừ
                bản tạo sớm nhất.
              </p>

              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.key} className="rounded-lg border border-border/80 bg-background p-3">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          group.matchType === "exact"
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {group.matchType === "exact" ? "Trùng chính xác" : "Gần giống (nghi sai chính tả)"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{group.items.length} bản</span>
                    </div>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const { title, subtitle } = renderLabel(item);
                        const marked = isMarked(group, item);
                        return (
                          <label
                            key={item.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                              marked ? "bg-destructive/10 ring-1 ring-destructive/30" : "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={marked}
                              onChange={() => toggleMark(item.id, marked)}
                              className="accent-destructive"
                            />
                            <span className="flex-1">
                              <span className="font-semibold text-foreground">{title}</span>
                              <span className="text-muted-foreground"> — {subtitle}</span>
                            </span>
                            {marked ? (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-destructive">
                                <Trash2 className="size-3" /> Sẽ xoá
                              </span>
                            ) : (
                              <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Giữ lại
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleCleanup}
                disabled={isDeleting || totalToDelete === 0}
                className="mt-4 w-full gap-2 bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang dọn dẹp…
                  </>
                ) : totalToDelete === 0 ? (
                  "Chưa chọn mục nào để xoá"
                ) : (
                  <>
                    <Trash2 className="size-4" /> Xoá {totalToDelete} Mục Đã Chọn
                  </>
                )}
              </Button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
