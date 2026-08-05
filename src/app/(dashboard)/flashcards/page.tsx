"use client";

import { useFlashcards } from "@/features/flashcards/hooks/use-flashcards";
import { FlashcardHeader } from "@/features/flashcards/components/flashcard-header";
import { AutoGenerateFlashcardsModal } from "@/features/flashcards/components/auto-generate-flashcards-modal";
import { FlashcardReviewEngine } from "@/features/flashcards/components/flashcard-review-engine";
import { FlashcardQuizEngine } from "@/features/flashcards/components/flashcard-quiz-engine";
import { FlashcardSpellingEngine } from "@/features/flashcards/components/flashcard-spelling-engine";
import { FlashcardReflexEngine } from "@/features/flashcards/components/flashcard-reflex-engine";
import { FlashcardFillBlankEngine } from "@/features/flashcards/components/flashcard-fill-blank-engine";
import { FlashcardListeningEngine } from "@/features/flashcards/components/flashcard-listening-engine";
import { FlashcardDeckList } from "@/features/flashcards/components/flashcard-deck-list";
import { FlashcardFormModal } from "@/features/flashcards/components/flashcard-form-modal";
import { FolderModal } from "@/features/flashcards/components/folder-modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Edit, Trash2, Volume2, RotateCcw } from "lucide-react";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { useState } from "react";

export default function FlashcardsPage() {
  const { speak } = useSpeech();
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
  const {
    cards,
    filteredCards,
    collections,
    folders,
    stats,
    activeTab,
    filter,
    reviewQueue,
    currentReviewIndex,
    isCardFlipped,
    isCardFormOpen,
    selectedCardForEdit,
    selectedCardForDelete,
    isFolderModalOpen,
    isDeckModalOpen,
    createCard,
    updateCard,
    deleteCard,
    toggleFavorite,
    submitReview,
    flipCard,
    nextReviewCard,
    prevReviewCard,
    startReviewSession,
    createFolder,
    createCollection,
    setActiveTab,
    setFilter,
    resetFilter,
    openCreateCardModal,
    openEditCardModal,
    openDeleteCardModal,
    openFolderModal,
    openDeckModal,
    closeModals,
  } = useFlashcards();

  const handleCardSubmit = async (input: any) => {
    if (selectedCardForEdit) {
      await updateCard(selectedCardForEdit.id, input);
    } else {
      await createCard(input);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedCardForDelete) {
      await deleteCard(selectedCardForDelete.id);
      closeModals();
    }
  };

  const handleStartDeckStudy = (deckId: string) => {
    const deckCards = cards.filter((c) => c.collection_id === deckId);
    startReviewSession(deckCards);
  };

  const activeQueue = reviewQueue.length > 0 ? reviewQueue : cards;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <FlashcardHeader
        stats={stats}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onOpenCreateCard={openCreateCardModal}
        onOpenCreateDeck={openDeckModal}
        onOpenCreateFolder={openFolderModal}
        onOpenAutoGenerate={() => setIsAutoGenerateOpen(true)}
      />

      {/* Auto Generate Modal */}
      <AutoGenerateFlashcardsModal
        open={isAutoGenerateOpen}
        onClose={() => setIsAutoGenerateOpen(false)}
        onCreateCard={createCard}
      />

      {/* Game 1: Daily SRS Flip Engine */}
      {activeTab === "review" && (
        <FlashcardReviewEngine
          queue={reviewQueue}
          currentIndex={currentReviewIndex}
          isFlipped={isCardFlipped}
          onFlip={flipCard}
          onRate={submitReview}
          onToggleFavorite={toggleFavorite}
          onPrevCard={prevReviewCard}
          onNextCard={nextReviewCard}
        />
      )}

      {/* Game 2: VIP Quiz Engine */}
      {activeTab === "quiz" && (
        <FlashcardQuizEngine
          queue={activeQueue}
          allCards={cards}
        />
      )}

      {/* Game 3: Spelling & Typing Engine */}
      {activeTab === "spelling" && (
        <FlashcardSpellingEngine
          queue={activeQueue}
        />
      )}

      {/* Game 4: Speed Reflex Challenge Engine */}
      {activeTab === "reflex" && (
        <FlashcardReflexEngine
          queue={activeQueue}
        />
      )}

      {/* Game 5: Fill in the Blank Engine */}
      {activeTab === "blank" && (
        <FlashcardFillBlankEngine
          queue={activeQueue}
        />
      )}

      {/* Game 6: Listening Practice Engine */}
      {activeTab === "listening" && (
        <FlashcardListeningEngine
          queue={activeQueue}
        />
      )}

      {/* Decks & Folders Tree */}
      {activeTab === "decks" && (
        <FlashcardDeckList
          folders={folders}
          collections={collections}
          cards={cards}
          onStartStudyDeck={handleStartDeckStudy}
          onOpenCreateDeck={openDeckModal}
          onOpenCreateFolder={openFolderModal}
        />
      )}

      {/* Browse & Search All Cards Table */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-border/80 bg-surface/80 p-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Tìm kiếm từ vựng, phiên âm, nghĩa tiếng Việt, thẻ..."
                className="pl-9 bg-background/80"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filter.language}
                onChange={(e) => setFilter({ language: e.target.value as any })}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground outline-none"
              >
                <option value="all">Tất Cả Ngôn Ngữ</option>
                <option value="en">🇬🇧 Tiếng Anh</option>
                <option value="ko">🇰🇷 Tiếng Hàn</option>
                <option value="zh">🇨🇳 Tiếng Trung</option>
              </select>

              <Button
                variant={filter.onlyFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter({ onlyFavorites: !filter.onlyFavorites })}
                className="gap-1.5"
              >
                <Star className={`size-4 ${filter.onlyFavorites ? "fill-amber-400 text-amber-400" : "text-amber-500"}`} />
                Yêu Thích
              </Button>

              {(filter.search || filter.language !== "all" || filter.onlyFavorites) && (
                <Button variant="ghost" size="sm" onClick={resetFilter} className="gap-1 text-xs">
                  <RotateCcw className="size-3" /> Đặt Lại
                </Button>
              )}
            </div>
          </div>

          {/* Cards Data Table */}
          <div className="overflow-hidden rounded-xl border border-border/80 bg-surface/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/50 font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Thích</th>
                    <th className="px-4 py-3">Mặt Trước (Từ/Câu Hỏi)</th>
                    <th className="px-4 py-3">Mặt Sau (Nghĩa/Đáp Án)</th>
                    <th className="px-4 py-3">Ngôn Ngữ</th>
                    <th className="px-4 py-3">Chu Kỳ SRS</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                    <th className="px-4 py-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleFavorite(card.id)} className="text-muted-foreground hover:text-amber-500">
                          <Star className={`size-4 ${card.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => speak(card.front_text, card.language, card.audio_url)} className="text-muted-foreground hover:text-emerald-600">
                            <Volume2 className="size-3.5" />
                          </button>
                          <div>
                            <span>{card.front_text}</span>
                            {card.front_subtext && <span className="ml-2 font-mono text-xs text-emerald-600 dark:text-emerald-400">[{card.front_subtext}]</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{card.back_text}</td>
                      <td className="px-4 py-3 uppercase font-semibold text-[10px]">{card.language}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{card.interval} ngày (EF: {card.ease_factor})</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          card.status === "mastered" ? "bg-emerald-500/10 text-emerald-600" : card.status === "learning" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {card.status === "mastered" ? "Đã Thuộc" : card.status === "learning" ? "Đang Học" : "Mới"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => openEditCardModal(card)} title="Sửa Thẻ">
                            <Edit className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10" onClick={() => openDeleteCardModal(card)} title="Xóa Thẻ">
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
        </div>
      )}

      {/* Card Form Modal */}
      <FlashcardFormModal
        isOpen={isCardFormOpen}
        itemToEdit={selectedCardForEdit}
        collections={collections}
        onClose={closeModals}
        onSubmit={handleCardSubmit}
      />

      {/* Folder / Deck Modal */}
      <FolderModal
        isOpen={isFolderModalOpen || isDeckModalOpen}
        type={isFolderModalOpen ? "folder" : "deck"}
        folders={folders}
        onClose={closeModals}
        onCreateFolder={createFolder}
        onCreateDeck={createCollection}
      />

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={!!selectedCardForDelete} onOpenChange={(open) => !open && closeModals()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-xl animate-in zoom-in-95">
            <Dialog.Title className="font-display text-lg font-bold text-foreground">
              Xác Nhận Xóa Thẻ
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa thẻ &quot;{selectedCardForDelete?.front_text}&quot; không? Thao tác này không thể hoàn tác.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModals}>Hủy Bỏ</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Xóa Thẻ</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
