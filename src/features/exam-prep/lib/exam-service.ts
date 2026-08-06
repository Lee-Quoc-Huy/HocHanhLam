import { ExamCertificate, ExamLevelOption, ExamPaper, ExamResult } from "../types";

export const EXAM_LEVELS: Record<ExamCertificate, ExamLevelOption[]> = {
  topik: [
    { id: "topik1_level1", name: "TOPIK I - Cấp 1 (Sơ cấp 1)", description: "Dành cho người bắt đầu, từ vựng & hội thoại cơ bản hàng ngày", certificate: "topik", targetScore: "80/200 điểm" },
    { id: "topik1_level2", name: "TOPIK I - Cấp 2 (Sơ cấp 2)", description: "Hội thoại sinh hoạt, mua sắm, giao tiếp thông thường", certificate: "topik", targetScore: "140/200 điểm" },
    { id: "topik2_level3", name: "TOPIK II - Cấp 3 (Trung cấp 1)", description: "Duy trì sinh hoạt xã hội, sử dụng cơ quan công cộng", certificate: "topik", targetScore: "120/300 điểm" },
    { id: "topik2_level4", name: "TOPIK II - Cấp 4 (Trung cấp 2)", description: "Đọc báo chí, hiểu văn hóa xã hội Hàn Quốc", certificate: "topik", targetScore: "150/300 điểm" },
    { id: "topik2_level5", name: "TOPIK II - Cấp 5 (Cao cấp 1)", description: "Nghiên cứu, làm việc chuyên môn trong doanh nghiệp Hàn", certificate: "topik", targetScore: "190/300 điểm" },
    { id: "topik2_level6", name: "TOPIK II - Cấp 6 (Cao cấp 2)", description: "Thành thạo như người bản xứ trong mọi lĩnh vực chuyên môn", certificate: "topik", targetScore: "230/300 điểm" },
  ],
  toeic: [
    { id: "toeic_300", name: "TOEIC 300 - 450 (Cơ Bản)", description: "Hiểu thông điệp tiếng Anh ngắn, đơn giản", certificate: "toeic", targetScore: "350+ điểm" },
    { id: "toeic_500", name: "TOEIC 500 - 700 (Trung Cấp)", description: "Giao tiếp công sở, email công việc, phỏng vấn", certificate: "toeic", targetScore: "600+ điểm" },
    { id: "toeic_750", name: "TOEIC 750 - 900 (Thành Thạo)", description: "Thành thạo đàm phán thương mại & hội họp quốc tế", certificate: "toeic", targetScore: "800+ điểm" },
    { id: "toeic_900", name: "TOEIC 900+ (Xuất Sắc)", description: "Trình độ tiệm cận người bản xứ trong công việc", certificate: "toeic", targetScore: "900+ điểm" },
  ],
  hsk: [
    { id: "hsk1", name: "HSK 1 (Sơ Cấp 1)", description: "150 từ vựng, hiểu cụm từ tiếng Trung đơn giản nhất", certificate: "hsk", targetScore: "120/200 điểm" },
    { id: "hsk2", name: "HSK 2 (Sơ Cấp 2)", description: "300 từ vựng, giao tiếp trực tiếp các chủ đề quen thuộc", certificate: "hsk", targetScore: "120/200 điểm" },
    { id: "hsk3", name: "HSK 3 (Trung Cấp 1)", description: "600 từ vựng, hoàn thành công việc & sinh hoạt tại Trung Quốc", certificate: "hsk", targetScore: "180/300 điểm" },
    { id: "hsk4", name: "HSK 4 (Trung Cấp 2)", description: "1200 từ vựng, thảo luận các chủ đề rộng bằng tiếng Trung", certificate: "hsk", targetScore: "180/300 điểm" },
    { id: "hsk5", name: "HSK 5 (Cao Cấp 1)", description: "2500 từ vựng, đọc báo, xem phim & thuyết trình tiếng Trung", certificate: "hsk", targetScore: "180/300 điểm" },
    { id: "hsk6", name: "HSK 6 (Cao Cấp 2)", description: "5000+ từ vựng, diễn đạt tự nhiên bằng tiếng Trung", certificate: "hsk", targetScore: "180/300 điểm" },
  ],
  ielts: [
    { id: "ielts_5", name: "IELTS Band 5.0 - 5.5", description: "Sử dụng tiếng Anh partial, nắm ý chính bài đọc/nghe", certificate: "ielts", targetScore: "5.5 Overall" },
    { id: "ielts_6", name: "IELTS Band 6.0 - 6.5", description: "Sử dụng hiệu quả tiếng Anh trong các tình huống quen thuộc", certificate: "ielts", targetScore: "6.5 Overall" },
    { id: "ielts_7", name: "IELTS Band 7.0 - 7.5+", description: "Sử dụng thành thạo, tư duy phản biện & luận văn", certificate: "ielts", targetScore: "7.5+ Overall" },
  ],
};

const STORAGE_RESULTS_KEY = "linguaverse_exam_results_v1";

export function getExamHistory(): ExamResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamResult(result: ExamResult): void {
  if (typeof window === "undefined") return;
  try {
    const history = getExamHistory();
    const updated = [result, ...history].slice(0, 50); // Keep last 50 results
    localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save exam result:", err);
  }
}

export function calculateExamResult(
  paper: ExamPaper,
  userAnswers: Record<number, number>,
  timeSpentSeconds: number
): ExamResult {
  let score = 0;
  let maxScore = 0;

  paper.questions.forEach((q) => {
    maxScore += q.points || 10;
    if (userAnswers[q.number] === q.correctAnswerIndex) {
      score += q.points || 10;
    }
  });

  const percentage = Math.round((score / Math.max(1, maxScore)) * 100);
  const passed = percentage >= 60;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (percentage >= 80) {
    strengths.push("Nắm vững từ vựng và ngữ pháp trọng tâm của bài thi.");
    strengths.push("Phản xạ làm bài tốt, tốc độ xử lý câu hỏi chuẩn xác.");
  } else if (percentage >= 60) {
    strengths.push("Đạt mức điểm đỗ tiêu chuẩn.");
    weaknesses.push("Cần củng cố thêm các câu hỏi đọc hiểu dài và từ vựng nâng cao.");
  } else {
    weaknesses.push("Chưa nắm chắc phần lớn từ vựng và cấu trúc ngữ pháp.");
    weaknesses.push("Kỹ năng làm bài nghe và chọn đáp án cần được cải thiện.");
  }

  const recommendations =
    percentage >= 80
      ? "Bạn đã sẵn sàng cho kỳ thi thật! Hãy tiếp tục duy trì luyện tập bộ đề nâng cao hơn."
      : percentage >= 60
      ? "Ôn tập lại các câu làm sai và thực hành thêm các bài tập trong Thư viện để tăng mức điểm."
      : "Nên học lại từ vựng nền tảng và kết hợp tính năng Ôn tập Flashcard trước khi thử sức lại.";

  return {
    paperId: paper.id,
    paperTitle: paper.title,
    certificate: paper.certificate,
    level: paper.level,
    userAnswers,
    score,
    maxScore,
    percentage,
    passed,
    timeSpentSeconds,
    completedAt: new Date().toISOString(),
    aiEvaluation: {
      strengths,
      weaknesses,
      recommendations,
    },
  };
}
