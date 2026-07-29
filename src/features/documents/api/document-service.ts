import { createClient } from "@/lib/supabase/client";
import type {
  DocumentItem,
  DocumentQuiz,
  CreateDocumentInput,
  DocFileType,
  DocLanguage,
  QuizQuestion,
} from "../types";
import { vocabularyService } from "@/features/vocabulary/api/vocabulary-service";
import { flashcardService } from "@/features/flashcards/api/flashcard-service";

const STORAGE_DOCUMENTS_KEY = "linguaverse_documents";
const STORAGE_QUIZZES_KEY = "linguaverse_document_quizzes";

export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    title: "IELTS Academic Reading - Climate Resilience.txt",
    file_type: "txt",
    file_size: "14.2 KB",
    extracted_text: `Climate resilience is the ability of a social or ecological system to absorb disturbances while retaining the same basic structure and ways of functioning. Building resilience requires serendipitous discoveries in sustainable agriculture, renewable energy adoption, and community engagement. Key terms include biodiversity, mitigation, and adaptation strategies.`,
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc-2",
    title: "TOPIK II Intermediate Reading Practice.pdf",
    file_type: "pdf",
    file_size: "245 KB",
    extracted_text: `한국의 전통 문화와 현대 사회의 변화. 내일 여행을 가려고 하니까 마음이 설렌다. 현대인들은 바쁜 일상 속에서도 건강과 여가를 중요하게 생각한다. 이 문서는 한국어 능력 시험 대비 읽기 đọan văn mẫu.`,
    language: "ko",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "doc-3",
    title: "HSK 5 Business Article - E-commerce.docx",
    file_type: "docx",
    file_size: "88 KB",
    extracted_text: `随着电子商务的迅速发展，越来越多的企业开始注重线上市场的拓展。只要坚持下去，就一定能取得成功。本文分析了市场趋势、消费者心理以及品牌建设的关键要素。`,
    language: "zh",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class DocumentService {
  private getLocalDocs(): DocumentItem[] {
    if (typeof window === "undefined") return SAMPLE_DOCUMENTS;
    try {
      const data = localStorage.getItem(STORAGE_DOCUMENTS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(SAMPLE_DOCUMENTS));
        return SAMPLE_DOCUMENTS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_DOCUMENTS;
    }
  }

  private setLocalDocs(docs: DocumentItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_DOCUMENTS_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error("Localstorage error saving documents:", e);
    }
  }

  private getLocalQuizzes(docId?: string): DocumentQuiz[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_QUIZZES_KEY);
      if (!data) return [];
      const all: DocumentQuiz[] = JSON.parse(data);
      return docId ? all.filter((q) => q.document_id === docId) : all;
    } catch {
      return [];
    }
  }

  private setLocalQuizzes(quizzes: DocumentQuiz[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_QUIZZES_KEY, JSON.stringify(quizzes));
    } catch (e) {
      console.error("Localstorage error saving quizzes:", e);
    }
  }

  // Fetch all documents
  async fetchDocuments(): Promise<DocumentItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalDocs();
      }

      const docs = (data as unknown) as DocumentItem[];
      this.setLocalDocs(docs);
      return docs;
    } catch {
      return this.getLocalDocs();
    }
  }

  // Create & Upload Document
  async createDocument(input: CreateDocumentInput): Promise<DocumentItem> {
    const newDoc: DocumentItem = {
      ...input,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert([(newDoc as unknown) as any])
        .select()
        .single();
      if (!error && data) newDoc.id = data.id;
    } catch {
      // Offline fallback
    }

    const docs = [newDoc, ...this.getLocalDocs()];
    this.setLocalDocs(docs);
    return newDoc;
  }

  // Delete Document
  async deleteDocument(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from("documents").delete().eq("id", id);
    } catch {
      // Offline fallback
    }

    const docs = this.getLocalDocs().filter((d) => d.id !== id);
    this.setLocalDocs(docs);
    return true;
  }

  // AI Document API Actions Call
  async runAiProcess(
    action: "ocr_extract" | "translate" | "extract_vocabulary" | "generate_flashcards" | "generate_quiz",
    text: string,
    targetLanguage: DocLanguage = "vi"
  ): Promise<any> {
    const response = await fetch("/api/ai/document-process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text, targetLanguage }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Document AI Action (${action}) failed: ${err}`);
    }

    return await response.json();
  }

  // Auto-Save mined vocabulary terms into Vocabulary Module database
  async saveExtractedVocabulary(vocabList: any[], language: "en" | "ko" | "zh"): Promise<number> {
    let savedCount = 0;
    for (const v of vocabList) {
      try {
        await vocabularyService.createWord({
          word: v.word,
          ipa: v.ipa || "",
          vietnamese: v.vietnamese || "",
          english_meaning: v.english_meaning || "",
          part_of_speech: v.part_of_speech || "noun",
          example: v.example || "",
          example_translation: v.vietnamese || "",
          audio_url: "",
          image_url: "",
          synonyms: [],
          antonyms: [],
          frequency: 4,
          difficulty: v.difficulty || "intermediate",
          is_favorite: false,
          collection: "Document Mining",
          language,
        });
        savedCount++;
      } catch (e) {
        console.error("Error auto-saving vocabulary item:", e);
      }
    }
    return savedCount;
  }

  // Auto-Save generated flashcards into Flashcards Module database
  async saveGeneratedFlashcards(cardsList: any[], language: "en" | "ko" | "zh"): Promise<number> {
    let savedCount = 0;
    for (const c of cardsList) {
      try {
        await flashcardService.createFlashcard({
          language,
          front_text: c.front_text,
          front_subtext: c.front_subtext || "",
          back_text: c.back_text,
          back_explanation: c.back_explanation || "",
          tags: c.tags || ["Document AI"],
          is_favorite: false,
        });
        savedCount++;
      } catch (e) {
        console.error("Error auto-saving flashcard item:", e);
      }
    }
    return savedCount;
  }

  // Save Quiz into Database
  async saveQuiz(documentId: string, title: string, questions: QuizQuestion[]): Promise<DocumentQuiz> {
    const newQuiz: DocumentQuiz = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `quiz-${Date.now()}`,
      document_id: documentId,
      title,
      questions,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("document_quizzes").insert([(newQuiz as unknown) as any]);
    } catch {
      // Offline fallback
    }

    const quizzes = [newQuiz, ...this.getLocalQuizzes()];
    this.setLocalQuizzes(quizzes);
    return newQuiz;
  }

  // Fetch Quizzes for Document
  async fetchQuizzes(documentId: string): Promise<DocumentQuiz[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("document_quizzes")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalQuizzes(documentId);
      }

      return (data as unknown) as DocumentQuiz[];
    } catch {
      return this.getLocalQuizzes(documentId);
    }
  }

  // Download File Helper
  downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  subscribeToRealtime(onUpdate: () => void) {
    const supabase = createClient();
    const channel = supabase
      .channel("public:documents_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, () => onUpdate())
      .on("postgres_changes", { event: "*", schema: "public", table: "document_quizzes" }, () => onUpdate())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const documentService = new DocumentService();
