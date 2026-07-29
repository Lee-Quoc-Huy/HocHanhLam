export type DocFileType =
  | "pdf"
  | "docx"
  | "ppt"
  | "txt"
  | "image"
  | "screenshot"
  | "book";

export type DocLanguage = "en" | "ko" | "zh" | "vi";

export interface DocumentItem {
  id: string;
  user_id?: string | null;
  title: string;
  file_type: DocFileType;
  file_url?: string | null;
  file_size: string;
  extracted_text: string;
  language: DocLanguage;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctAnswer: number; // 0, 1, 2, or 3
  explanation: string;
}

export interface DocumentQuiz {
  id: string;
  document_id: string;
  title: string;
  questions: QuizQuestion[];
  created_at: string;
}

export type CreateDocumentInput = Omit<
  DocumentItem,
  "id" | "created_at" | "updated_at"
>;

export interface DocumentFilter {
  search: string;
  fileType: DocFileType | "all";
  language: DocLanguage | "all";
}

export interface DocumentStats {
  totalDocs: number;
  pdfCount: number;
  imageCount: number;
  textCount: number;
}
