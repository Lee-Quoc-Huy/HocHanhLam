"use client";

import { BookOpen, Folder, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardCollection, FlashcardFolder, Flashcard } from "../types";

interface FlashcardDeckListProps {
  folders: FlashcardFolder[];
  collections: FlashcardCollection[];
  cards: Flashcard[];
  onStartStudyDeck: (deckId: string) => void;
  onOpenCreateDeck: () => void;
  onOpenCreateFolder: () => void;
}

export function FlashcardDeckList({
  folders,
  collections,
  cards,
  onStartStudyDeck,
  onOpenCreateDeck,
  onOpenCreateFolder,
}: FlashcardDeckListProps) {
  const getDeckCardCount = (deckId: string) => {
    return cards.filter((c) => c.collection_id === deckId).length;
  };

  const getDeckDueCount = (deckId: string) => {
    const now = new Date().toISOString();
    return cards.filter(
      (c) => c.collection_id === deckId && (c.due_date <= now || c.status === "new")
    ).length;
  };

  return (
    <div className="space-y-8">
      {/* Quick Action Bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="size-5 text-emerald-600 dark:text-emerald-400" />
          <span>Danh Sách Thư Mục & Bộ Thẻ</span>
        </h2>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onOpenCreateFolder} className="gap-1.5 text-xs">
            <Folder className="size-3.5 text-amber-500" /> + Thư Mục Mới
          </Button>
          <Button onClick={onOpenCreateDeck} size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="size-3.5" /> + Bộ Thẻ Mới
          </Button>
        </div>
      </div>

      {/* Folders Section */}
      <div className="space-y-4">
        {folders.map((folder) => {
          const folderDecks = collections.filter((col) => col.folder_id === folder.id);

          return (
            <div
              key={folder.id}
              className="rounded-2xl border border-border/80 bg-surface/60 p-5 backdrop-blur-xs space-y-4"
            >
              {/* Folder Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Folder className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{folder.description}</p>
                  </div>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {folderDecks.length} Bộ Thẻ
                </span>
              </div>

              {/* Decks in Folder Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {folderDecks.map((deck) => {
                  const totalCount = getDeckCardCount(deck.id);
                  const dueCount = getDeckDueCount(deck.id);

                  return (
                    <div
                      key={deck.id}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-background p-4 shadow-2xs transition-all hover:border-emerald-500/40 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            {deck.language === "en"
                              ? "🇬🇧 Tiếng Anh"
                              : deck.language === "ko"
                              ? "🇰🇷 Tiếng Hàn"
                              : deck.language === "zh"
                              ? "🇨🇳 Tiếng Trung"
                              : "🌐 Đa Ngôn Ngữ"}
                          </span>

                          {dueCount > 0 && (
                            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              {dueCount} Cần Ôn
                            </span>
                          )}
                        </div>

                        <h4 className="mt-2.5 font-display text-base font-bold text-foreground">
                          {deck.name}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {deck.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          {totalCount} Thẻ
                        </span>

                        <Button
                          size="sm"
                          onClick={() => onStartStudyDeck(deck.id)}
                          className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Play className="size-3" /> Học Bộ Này
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
