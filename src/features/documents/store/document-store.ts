import { create } from "zustand";
import {
  DocumentItem,
  DocumentFilter,
  CreateDocumentInput,
  DocumentStats,
  DocumentQuiz,
} from "../types";
import { documentService } from "../api/document-service";

interface DocumentState {
  documents: DocumentItem[];
  activeDocument: DocumentItem | null;
  selectedDocumentForDelete: DocumentItem | null;

  isLoading: boolean;
  isAiProcessing: boolean;
  aiProcessingTask: string | null;
  error: string | null;

  filter: DocumentFilter;

  // AI Active Action Result Buffers
  translatedText: string;
  minedVocabulary: any[];
  generatedFlashcards: any[];
  activeQuiz: DocumentQuiz | null;

  // Actions
  fetchDocuments: () => Promise<void>;
  createDocument: (input: CreateDocumentInput) => Promise<DocumentItem>;
  deleteDocument: (id: string) => Promise<void>;

  runAiOcr: (doc: DocumentItem) => Promise<void>;
  runAiTranslate: (doc: DocumentItem, targetLang?: any) => Promise<void>;
  runAiVocabularyExtraction: (doc: DocumentItem) => Promise<number>;
  runAiFlashcardGeneration: (doc: DocumentItem) => Promise<number>;
  runAiQuizGeneration: (doc: DocumentItem) => Promise<DocumentQuiz>;

  selectDocumentForView: (doc: DocumentItem) => void;
  openDeleteModal: (doc: DocumentItem) => void;
  closeModals: () => void;

  setFilter: (updates: Partial<DocumentFilter>) => void;
  resetFilter: () => void;
}

const initialFilter: DocumentFilter = {
  search: "",
  fileType: "all",
  language: "all",
};

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  activeDocument: null,
  selectedDocumentForDelete: null,

  isLoading: false,
  isAiProcessing: false,
  aiProcessingTask: null,
  error: null,

  filter: initialFilter,

  translatedText: "",
  minedVocabulary: [],
  generatedFlashcards: [],
  activeQuiz: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const docs = await documentService.fetchDocuments();
      set({ documents: docs, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createDocument: async (input) => {
    const newDoc = await documentService.createDocument(input);
    set((state) => ({ documents: [newDoc, ...state.documents] }));
    return newDoc;
  },

  deleteDocument: async (id) => {
    await documentService.deleteDocument(id);
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
    }));
  },

  runAiOcr: async (doc) => {
    set({ isAiProcessing: true, aiProcessingTask: "Đang nhận diện văn bản OCR...", error: null });
    try {
      const res = await documentService.runAiProcess("ocr_extract", doc.extracted_text || doc.title);
      const updatedText = res.result || doc.extracted_text;

      // Update doc extracted text
      const updatedDoc = { ...doc, extracted_text: updatedText };
      set((state) => ({
        documents: state.documents.map((d) => (d.id === doc.id ? updatedDoc : d)),
        activeDocument: updatedDoc,
        isAiProcessing: false,
        aiProcessingTask: null,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isAiProcessing: false, aiProcessingTask: null });
    }
  },

  runAiTranslate: async (doc, targetLang = "vi") => {
    set({ isAiProcessing: true, aiProcessingTask: "Đang dịch thuật văn bản...", error: null });
    try {
      const res = await documentService.runAiProcess("translate", doc.extracted_text, targetLang);
      set({ translatedText: res.result, isAiProcessing: false, aiProcessingTask: null });
    } catch (err) {
      set({ error: (err as Error).message, isAiProcessing: false, aiProcessingTask: null });
    }
  },

  runAiVocabularyExtraction: async (doc) => {
    set({ isAiProcessing: true, aiProcessingTask: "Đang trích xuất từ vựng...", error: null });
    try {
      const res = await documentService.runAiProcess("extract_vocabulary", doc.extracted_text);
      const vocabList = res.vocabulary || [];
      const targetLang = doc.language === "vi" ? "en" : doc.language;
      const count = await documentService.saveExtractedVocabulary(vocabList, targetLang as any);

      set({ minedVocabulary: vocabList, isAiProcessing: false, aiProcessingTask: null });
      return count;
    } catch (err) {
      set({ error: (err as Error).message, isAiProcessing: false, aiProcessingTask: null });
      return 0;
    }
  },

  runAiFlashcardGeneration: async (doc) => {
    set({ isAiProcessing: true, aiProcessingTask: "Đang tạo bộ thẻ ghi nhớ SRS...", error: null });
    try {
      const res = await documentService.runAiProcess("generate_flashcards", doc.extracted_text);
      const cardsList = res.flashcards || [];
      const targetLang = doc.language === "vi" ? "en" : doc.language;
      const count = await documentService.saveGeneratedFlashcards(cardsList, targetLang as any);

      set({ generatedFlashcards: cardsList, isAiProcessing: false, aiProcessingTask: null });
      return count;
    } catch (err) {
      set({ error: (err as Error).message, isAiProcessing: false, aiProcessingTask: null });
      return 0;
    }
  },

  runAiQuizGeneration: async (doc) => {
    set({ isAiProcessing: true, aiProcessingTask: "Đang soạn bộ câu hỏi trắc nghiệm Quiz...", error: null });
    try {
      const res = await documentService.runAiProcess("generate_quiz", doc.extracted_text);
      const questions = res.questions || [];
      const quiz = await documentService.saveQuiz(doc.id, `Quiz: ${doc.title}`, questions);

      set({ activeQuiz: quiz, isAiProcessing: false, aiProcessingTask: null });
      return quiz;
    } catch (err) {
      set({ error: (err as Error).message, isAiProcessing: false, aiProcessingTask: null });
      throw err;
    }
  },

  selectDocumentForView: (doc) => {
    set({
      activeDocument: doc,
      translatedText: "",
      minedVocabulary: [],
      generatedFlashcards: [],
      activeQuiz: null,
    });
  },

  openDeleteModal: (doc) => set({ selectedDocumentForDelete: doc }),

  closeModals: () =>
    set({
      activeDocument: null,
      selectedDocumentForDelete: null,
      translatedText: "",
      minedVocabulary: [],
      generatedFlashcards: [],
      activeQuiz: null,
    }),

  setFilter: (updates) => set((state) => ({ filter: { ...state.filter, ...updates } })),

  resetFilter: () => set({ filter: initialFilter }),
}));

// Selector to filter documents
export function selectFilteredDocuments(docs: DocumentItem[], filter: DocumentFilter): DocumentItem[] {
  return docs.filter((doc) => {
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchText = doc.extracted_text.toLowerCase().includes(q);
      if (!matchTitle && !matchText) return false;
    }

    if (filter.fileType !== "all" && doc.file_type !== filter.fileType) return false;
    if (filter.language !== "all" && doc.language !== filter.language) return false;

    return true;
  });
}

// Selector to calculate stats
export function selectDocumentStats(docs: DocumentItem[]): DocumentStats {
  return {
    totalDocs: docs.length,
    pdfCount: docs.filter((d) => d.file_type === "pdf" || d.file_type === "book").length,
    imageCount: docs.filter((d) => d.file_type === "image" || d.file_type === "screenshot").length,
    textCount: docs.filter((d) => d.file_type === "txt" || d.file_type === "docx" || d.file_type === "ppt").length,
  };
}
