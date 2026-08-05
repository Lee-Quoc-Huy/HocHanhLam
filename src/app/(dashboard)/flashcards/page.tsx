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
import { toast } from "sonner";
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
    setActiveTab,
    openCreateCardModal,
    openEditCardModal,
    openDeleteCardModal,
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

  // AI Agent creates game → Automatically save cards into Supabase under this game_mode & switch tab
  const handleLaunchAiGame = useCallback(async (gameType: GameModeType, gameData: any) => {
    const items = gameData?.items || [];
    const lang = gameData?.language || "en";

    let savedCount = 0;
    for (const item of items) {
      try {
        await createCard({
          language: lang,
          game_mode: gameType,
          front_text: item.frontText || item.fullSentence || item.missingWord || "Mặt trước AI",
          front_subtext: item.hint || item.sentenceWithBlank || "",
          back_text: item.backText || item.vietnameseTranslation || "Nghĩa tiếng Việt",
          back_explanation: item.sentenceWithBlank ? `Câu khuyết: ${item.sentenceWithBlank}\nTừ thiếu: ${item.missingWord}` : (item.hint || ""),
          audio_url: "",
          image_url: "",
          tags: [gameData?.gameTitle || "AI Agent", gameType],
          is_favorite: false,
        });
        savedCount++;
      } catch (err) {
        console.error("Failed to save AI card:", err);
      }
    }

    if (gameType === "quiz") setAiQuizItems(items);
    else if (gameType === "listening") setAiListeningItems(items);
    else if (gameType === "spelling") setAiSpellingItems(items);
    else if (gameType === "reflex") setAiReflexItems(items);
    else if (gameType === "blank") setAiBlankItems(items);

    setActiveTab(gameType);
    toast.success(`🤖 AI đã tạo & lưu ${savedCount} thẻ mới cho game "${gameType.toUpperCase()}"!`);
  }, [createCard, setActiveTab]);

  // Per-game auto-generate handler
  const handleOpenAutoGenForGame = useCallback((gameMode: GameModeType) => {
    setAutoGenTargetGame(gameMode);
    setIsAutoGenerateOpen(true);
  }, []);

  // Strict card isolation per game mode (No cross-game leaking!)
  const getGameCards = useCallback((mode: GameModeType) => {
    return cards.filter((c) => {
      if (mode === "review") {
        return !c.game_mode || c.game_mode === "review";
      }
      return c.game_mode === mode;
    });
  }, [cards]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <FlashcardHeader
        stats={stats}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onOpenAiGameAgent={() => setIsAiGameAgentOpen(true)}
      />

      {/* Auto Generate Modal (bound to target game mode) */}
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

      {/* Game 1: Daily SRS Flip Engine (Lật Thẻ SRS) */}
      {activeTab === "review" && (
        <FlashcardReviewEngine
          queue={getGameCards("review")}
          currentIndex={currentReviewIndex}
          isFlipped={isCardFlipped}
          onFlip={flipCard}
          onRate={submitReview}
          onToggleFavorite={toggleFavorite}
          onPrevCard={prevReviewCard}
          onNextCard={nextReviewCard}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("review")}
        />
      )}

      {/* Game 2: VIP Quiz Engine */}
      {activeTab === "quiz" && (
        <FlashcardQuizEngine
          queue={getGameCards("quiz")}
          allCards={cards}
          aiItems={aiQuizItems}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("quiz")}
        />
      )}

      {/* Game 3: Spelling & Typing Engine */}
      {activeTab === "spelling" && (
        <FlashcardSpellingEngine
          queue={getGameCards("spelling")}
          aiItems={aiSpellingItems}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("spelling")}
        />
      )}

      {/* Game 4: Speed Reflex Challenge Engine */}
      {activeTab === "reflex" && (
        <FlashcardReflexEngine
          queue={getGameCards("reflex")}
          aiItems={aiReflexItems}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("reflex")}
        />
      )}

      {/* Game 5: Fill in the Blank Engine */}
      {activeTab === "blank" && (
        <FlashcardFillBlankEngine
          queue={getGameCards("blank")}
          aiItems={aiBlankItems}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("blank")}
        />
      )}

      {/* Game 6: Listening Practice Engine */}
      {activeTab === "listening" && (
        <FlashcardListeningEngine
          queue={getGameCards("listening")}
          aiCustomItems={aiListeningItems}
          onOpenAutoGenForGame={() => handleOpenAutoGenForGame("listening")}
        />
      )}

      {/* Card Form Modal */}
      <FlashcardFormModal
        isOpen={isCardFormOpen}
        itemToEdit={selectedCardForEdit}
        collections={collections}
        targetGameMode={createGameModeTarget}
        onClose={closeModals}
        onSubmit={handleCardSubmit}
      />
    </div>
  );
}
