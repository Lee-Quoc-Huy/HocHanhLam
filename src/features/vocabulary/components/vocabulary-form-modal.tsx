"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Volume2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  VocabularyItem,
  CreateVocabularyInput,
  VocabularyLanguage,
  DifficultyLevel,
} from "../types";
import { useSpeech } from "../hooks/use-speech";

interface VocabularyFormModalProps {
  isOpen: boolean;
  itemToEdit: VocabularyItem | null;
  availableCollections: string[];
  onClose: () => void;
  onSubmit: (input: CreateVocabularyInput) => Promise<void>;
}

export function VocabularyFormModal({
  isOpen,
  itemToEdit,
  availableCollections,
  onClose,
  onSubmit,
}: VocabularyFormModalProps) {
  const { speak } = useSpeech();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [language, setLanguage] = useState<VocabularyLanguage>("en");
  const [word, setWord] = useState("");
  const [ipa, setIpa] = useState("");
  const [vietnamese, setVietnamese] = useState("");
  const [englishMeaning, setEnglishMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("noun");
  const [example, setExample] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [synonymsInput, setSynonymsInput] = useState("");
  const [antonymsInput, setAntonymsInput] = useState("");
  const [frequency, setFrequency] = useState(3);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [isFavorite, setIsFavorite] = useState(false);
  const [collection, setCollection] = useState("General");
  const [customCollection, setCustomCollection] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setLanguage(itemToEdit.language);
      setWord(itemToEdit.word);
      setIpa(itemToEdit.ipa || "");
      setVietnamese(itemToEdit.vietnamese || "");
      setEnglishMeaning(itemToEdit.english_meaning || "");
      setPartOfSpeech(itemToEdit.part_of_speech || "noun");
      setExample(itemToEdit.example || "");
      setExampleTranslation(itemToEdit.example_translation || "");
      setAudioUrl(itemToEdit.audio_url || "");
      setImageUrl(itemToEdit.image_url || "");
      setSynonymsInput(itemToEdit.synonyms?.join(", ") || "");
      setAntonymsInput(itemToEdit.antonyms?.join(", ") || "");
      setFrequency(itemToEdit.frequency || 3);
      setDifficulty(itemToEdit.difficulty || "intermediate");
      setIsFavorite(itemToEdit.is_favorite || false);
      setCollection(itemToEdit.collection || "General");
    } else {
      // Reset form defaults
      setLanguage("en");
      setWord("");
      setIpa("");
      setVietnamese("");
      setEnglishMeaning("");
      setPartOfSpeech("noun");
      setExample("");
      setExampleTranslation("");
      setAudioUrl("");
      setImageUrl("");
      setSynonymsInput("");
      setAntonymsInput("");
      setFrequency(3);
      setDifficulty("intermediate");
      setIsFavorite(false);
      setCollection("General");
      setCustomCollection("");
    }
  }, [itemToEdit, isOpen]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !vietnamese.trim()) return;

    setIsSubmitting(true);
    try {
      const finalCollection =
        collection === "NEW" ? customCollection.trim() || "General" : collection;

      const parseCsv = (str: string) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const inputData: CreateVocabularyInput = {
        language,
        word: word.trim(),
        ipa: ipa.trim(),
        vietnamese: vietnamese.trim(),
        english_meaning: englishMeaning.trim(),
        part_of_speech: partOfSpeech,
        example: example.trim(),
        example_translation: exampleTranslation.trim(),
        audio_url: audioUrl.trim(),
        image_url: imageUrl.trim(),
        synonyms: parseCsv(synonymsInput),
        antonyms: parseCsv(antonymsInput),
        frequency,
        difficulty,
        is_favorite: isFavorite,
        collection: finalCollection,
      };

      await onSubmit(inputData);
      onClose();
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 sm:p-7 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Dialog.Title className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span>{itemToEdit ? "Sửa Từ Vựng" : "Thêm Từ Vựng Mới"}</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="mt-5 space-y-4 text-xs sm:text-sm">
            {/* Language Selector */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Ngôn Ngữ Đích</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "en", label: "Tiếng Anh", flag: "🇬🇧" },
                  { id: "ko", label: "Tiếng Hàn", flag: "🇰🇷" },
                  { id: "zh", label: "Tiếng Trung", flag: "🇨🇳" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id as VocabularyLanguage)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-medium transition-all ${
                      language === lang.id
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Word & IPA / Pinyin */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="word" className="font-semibold">
                  Từ Vựng <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="word"
                    required
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder={
                      language === "en"
                        ? "e.g., Ephemeral"
                        : language === "ko"
                        ? "e.g., 설레다"
                        : "e.g., 坚持"
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => speak(word, language, audioUrl)}
                    title="Nghe thử phát âm"
                    disabled={!word.trim()}
                  >
                    <Volume2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ipa" className="font-semibold">
                  Phiên Âm (IPA / Pinyin)
                </Label>
                <Input
                  id="ipa"
                  value={ipa}
                  onChange={(e) => setIpa(e.target.value)}
                  placeholder={
                    language === "en"
                      ? "e.g., /ɪˈfem.ər.əl/"
                      : language === "ko"
                      ? "e.g., seol-le-da"
                      : "e.g., jiān chí"
                  }
                />
              </div>
            </div>

            {/* Vietnamese & English Meanings */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="vietnamese" className="font-semibold">
                  Nghĩa Tiếng Việt <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vietnamese"
                  required
                  value={vietnamese}
                  onChange={(e) => setVietnamese(e.target.value)}
                  placeholder="e.g., Phù du, chóng tàn"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="englishMeaning" className="font-semibold">
                  Giải Nghĩa Tiếng Anh
                </Label>
                <Input
                  id="englishMeaning"
                  value={englishMeaning}
                  onChange={(e) => setEnglishMeaning(e.target.value)}
                  placeholder="Ví dụ: Lasting for a very short time"
                />
              </div>
            </div>

            {/* Part of Speech, Difficulty & Collection */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="pos" className="font-semibold">
                  Từ Loại
                </Label>
                <select
                  id="pos"
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="noun">Danh từ</option>
                  <option value="verb">Động từ</option>
                  <option value="adjective">Tính từ</option>
                  <option value="adverb">Phó từ</option>
                  <option value="phrase">Cụm từ</option>
                  <option value="idiom">Thành ngữ</option>
                  <option value="particle">Trợ từ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diff" className="font-semibold">
                  Cấp Độ
                </Label>
                <select
                  id="diff"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="beginner">Sơ cấp (A1-A2)</option>
                  <option value="intermediate">Trung cấp (B1-B2)</option>
                  <option value="advanced">Nâng cao (C1-C2)</option>
                  <option value="master">Bậc thầy</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="collection" className="font-semibold">
                  Bộ Sưu Tập
                </Label>
                <select
                  id="collection"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="General">Chung</option>
                  <option value="IELTS Academic">IELTS Academic</option>
                  <option value="TOPIK II">TOPIK II</option>
                  <option value="HSK 4">HSK 4</option>
                  <option value="Daily Communication">Daily Communication</option>
                  {availableCollections
                    .filter(
                      (c) =>
                        ![
                          "General",
                          "IELTS Academic",
                          "TOPIK II",
                          "HSK 4",
                          "Daily Communication",
                        ].includes(c)
                    )
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  <option value="NEW">+ Tạo Bộ Sưu Tập Mới</option>
                </select>
              </div>
            </div>

            {/* Custom Collection Name if NEW selected */}
            {collection === "NEW" && (
              <div className="space-y-1.5 animate-in fade-in">
                <Label htmlFor="customCollection" className="font-semibold">
                  Tên Bộ Sưu Tập Mới
                </Label>
                <Input
                  id="customCollection"
                  value={customCollection}
                  onChange={(e) => setCustomCollection(e.target.value)}
                  placeholder="Ví dụ: Tiếng Anh Thương Mại, Từ Vựng Phim"
                />
              </div>
            )}

            {/* Example Sentence & Example Translation */}
            <div className="space-y-1.5">
              <Label htmlFor="example" className="font-semibold">
                Câu Ví Dụ
              </Label>
              <Input
                id="example"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Câu ví dụ bằng ngôn ngữ đích…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exampleTrans" className="font-semibold">
                Dịch Câu Ví Dụ (Tiếng Việt)
              </Label>
              <Input
                id="exampleTrans"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="Dịch nghĩa câu ví dụ sang Tiếng Việt…"
              />
            </div>

            {/* Synonyms & Antonyms */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="synonyms" className="font-semibold">
                  Synonyms (Từ đồng nghĩa - cách nhau bởi dấu phẩy)
                </Label>
                <Input
                  id="synonyms"
                  value={synonymsInput}
                  onChange={(e) => setSynonymsInput(e.target.value)}
                  placeholder="e.g., fleeting, transient"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="antonyms" className="font-semibold">
                  Antonyms (Từ trái nghĩa - cách nhau bởi dấu phẩy)
                </Label>
                <Input
                  id="antonyms"
                  value={antonymsInput}
                  onChange={(e) => setAntonymsInput(e.target.value)}
                  placeholder="e.g., permanent, eternal"
                />
              </div>
            </div>

            {/* Image URL & Audio URL */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl" className="font-semibold flex items-center gap-1.5">
                  <ImageIcon className="size-3.5" /> Link Hình Ảnh (Tuỳ chọn)
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="audioUrl" className="font-semibold flex items-center gap-1.5">
                  <Volume2 className="size-3.5" /> Link Âm Thanh Tuỳ Chỉnh (Tuỳ chọn)
                </Label>
                <Input
                  id="audioUrl"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
            </div>

            {/* Frequency (1 to 5) & Favorite Checkbox */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-3">
              <div className="flex items-center gap-3">
                <Label className="font-semibold">Mức Độ Thường Gặp:</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFrequency(star)}
                      className={`size-6 rounded-full font-bold text-xs transition-all ${
                        frequency >= star
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Thêm vào Yêu Thích</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-indigo-600 font-medium text-white shadow-md"
              >
                {isSubmitting
                  ? "Đang lưu…"
                  : itemToEdit
                  ? "Cập Nhật Từ"
                  : "Tạo Từ Mới"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
