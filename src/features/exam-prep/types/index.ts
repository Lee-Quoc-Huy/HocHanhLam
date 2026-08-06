export type ExamCertificate = "topik" | "toeic" | "hsk" | "ielts";

export type ExamSkillMode = "all" | "listening" | "reading" | "grammar" | "mock_test";

export interface ExamLevelOption {
  id: string;
  name: string;
  description: string;
  certificate: ExamCertificate;
  targetScore: string;
}

export interface ExamQuestionOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  section: "listening" | "reading" | "grammar" | "writing";
  questionText: string;
  passageText?: string;
  audioScript?: string;
  audioUrl?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  certificate: ExamCertificate;
  level: string;
  language: "ko" | "en" | "zh";
  durationMinutes: number;
  totalPoints: number;
  sourceFileTitle?: string;
  questions: ExamQuestion[];
  createdAt: string;
}

export interface ExamResult {
  paperId: string;
  paperTitle: string;
  certificate: ExamCertificate;
  level: string;
  userAnswers: Record<number, number>; // question number -> selected option index
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  aiEvaluation: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string;
  };
}

export interface LibraryFileRef {
  id: string;
  title: string;
  fileType: string;
  url: string;
  tags?: string[];
}
