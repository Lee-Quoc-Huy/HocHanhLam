"use client";

import { useFlashcards } from "@/features/flashcards/hooks/use-flashcards";
import { FlashcardHeader } from "@/features/flashcards/components/flashcard-header";
import { AutoGenerateFlashcardsModal } from "@/features/flashcards/components/auto-generate-flashcards-modal";
import { FlashcardAiGameAgentModal } from "@/features/flashcards/components/flashcard-ai-game-agent-modal";
import { FlashcardReviewEngine } from "@/features/flashcards/components/flashcard-review-engine";
import { FlashcardQuizEngine } from "@/features/flashcards/components/flashcard-quiz-engine";
import { FlashcardSpellingEngine } from "@/features/flashcards/components/flashcard-spelling-engine";
import { FlashcardReflexEngine } from "@/features/flashcards/components/flashcard-reflex-engine";
import { FlashcardFillBlankEngine } from "@/features/flashcards/components/flashcard-fill-blank-engine";
import { FlashcardListeningEngine } from "@/features/flashcards/components/flashcard-listening-engine";
import { FlashcardFormModal } from "@/features/flashcards/components/flashcard-form-modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import type { GameModeType } from "@/features/flashcards/types";

export default function FlashcardsPage() {
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
  const [isAiGameAgentOpen, setIsAiGameAgentOpen] = useState(false);

  // Store AI Agent generated items per game type
  const [aiQuizItems, setAiQuizItems] = useState<any[]>([]);
  const [aiListeningItems, setAiListeningItems] = useState<any[]>([]);
  const [aiSpellingItems, setAiSpellingItems] = useState<any[]>([]);
  const [aiReflexItems, setAiReflexItems] = useState<any[]>([]);
  const [aiBlankItems, setAiBlankItems] = useState<any[]>([]);

  // Per-game auto-generate target
  const [autoGenTargetGame, setAutoGenTargetGame] = useState<GameModeType | undefined>(undefined);

  const {
    cards,
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
    createGameModeTarget,
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

  // AI Agent creates game → store data + switch tab
  const handleLaunchAiGame = useCallback((gameType: string, gameData: any) => {
    const items = gameData?.items || [];

    switch (gameType) {
      case "quiz":
        setAiQuizItems(items);
        setActiveTab("quiz");
        break;
      case "listening":
        setAiListeningItems(items);
        setActiveTab("listening");
        break;
      case "spelling":
        setAiSpellingItems(items);
        setActiveTab("spelling");
        break;
      case "reflex":
        setAiReflexItems(items);
        setActiveTab("reflex");
        break;
      case "blank":
        setAiBlankItems(items);
        setActiveTab("blank");
        break;
      default:
        setActiveTab(gameType as any);
    }
  }, [setActiveTab]);

  // Per-game create card handlers
  const handleOpenCreateForGame = useCallback((gameMode: GameModeType) => {
    openCreateCardModal(gameMode);
  }, [openCreateCardModal]);

  // Per-game auto-generate handler
  const handleOpenAutoGenForGame = useCallback((gameMode: GameModeType) => {
    setAutoGenTargetGame(gameMode);
    setIsAutoGenerateOpen(true);
  }, []);

  // Cards filtered by game_mode for each engine
  const getGameCards = useCallback((mode: GameModeType) => {
    return cards.filter((c) => c.game_mode === mode || (!c.game_mode && mode === "review"));
  }, [cards]);

  const activeQueue = reviewQueue.length > 0 ? reviewQueue : cards;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <FlashcardHeader
        stats={stats}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onOpenAiGameAgent={() => setIsAiGameAgentOpen(true)}
      />

      {/* Auto Generate Modal (with optional game target) */}
      <AutoGenerateFlashcardsModal
        open={isAutoGenerateOpen}
        onClose={() => {
          setIsAutoGenerateOpen(false);
          setAutoGenTargetGame(undefined);
        }}
        onCreateCard={createCard}
        targetGameMode={autoGenTargetGame}
      />

      {/* AI Agent Game Creation Modal */}
      <FlashcardAiGameAgentModal
        open={isAiGameAgentOpen}
        onClose={() => setIsAiGameAgentOpen(false)}
        onLaunchGame={handleLaunchAiGame}
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
          queue={getGameCards("quiz").length > 0 ? getGameCards("quiz") : activeQueue}
          allCards={cards}
          aiItems={aiQuizItems}
          onOpenCreateCardForGame={() => handleOpenCreateForGame("quiz")}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("quiz")}
        />
      )}

      {/* Game 3: Spelling & Typing Engine */}
      {activeTab === "spelling" && (
        <FlashcardSpellingEngine
          queue={getGameCards("spelling").length > 0 ? getGameCards("spelling") : activeQueue}
          aiItems={aiSpellingItems}
          onOpenCreateCardForGame={() => handleOpenCreateForGame("spelling")}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("spelling")}
        />
      )}

      {/* Game 4: Speed Reflex Challenge Engine */}
      {activeTab === "reflex" && (
        <FlashcardReflexEngine
          queue={getGameCards("reflex").length > 0 ? getGameCards("reflex") : activeQueue}
          aiItems={aiReflexItems}
          onOpenCreateCardForGame={() => handleOpenCreateForGame("reflex")}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("reflex")}
        />
      )}

      {/* Game 5: Fill in the Blank Engine */}
      {activeTab === "blank" && (
        <FlashcardFillBlankEngine
          queue={getGameCards("blank").length > 0 ? getGameCards("blank") : activeQueue}
          aiItems={aiBlankItems}
          onOpenCreateCardForGame={() => handleOpenCreateForGame("blank")}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("blank")}
        />
      )}

      {/* Game 6: Listening Practice Engine */}
      {activeTab === "listening" && (
        <FlashcardListeningEngine
          queue={getGameCards("listening").length > 0 ? getGameCards("listening") : activeQueue}
          aiCustomItems={aiListeningItems}
          onOpenCreateCardForGame={() => handleOpenCreateForGame("listening")}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("listening")}
        />
      )}

      {/* Card Form Modal (with game_mode target) */}
      <FlashcardFormModal
        isOpen={isCardFormOpen}
        itemToEdit={selectedCardForEdit}
        collections={collections}
        targetGameMode={createGameModeTarget}
        onClose={closeModals}
        onSubmit={handleCardSubmit}
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
