import { NextRequest, NextResponse } from "next/server";
import { generateFromPrompt } from "@/lib/ai/google-ai-client";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      certificate = "topik",
      level = "topik1_level2",
      skillMode = "all",
      libraryContext = "",
      libraryFileName = "",
    } = body;

    const certName = certificate.toUpperCase();
    const targetLang = certificate === "topik" ? "ko" : certificate === "hsk" ? "zh" : "en";
    const langName = certificate === "topik" ? "Tiếng Hàn" : certificate === "hsk" ? "Tiếng Trung" : "Tiếng Anh";

    const prompt = `Bạn là Chuyên gia Khảo thí và Biên soạn Đề thi Chứng chỉ ${certName} (${langName}) hàng đầu.
Nhiệm vụ của bạn là biên soạn một ĐỀ THI MẪU HOÀN CHỈNH bám sát 100% cấu trúc thực tế của bài thi ${certName} theo cấp độ "${level}".

Đặc biệt lưu ý:
1. Nếu có tài liệu đầu vào từ Thư viện (Tên file: "${libraryFileName}", Nội dung: "${libraryContext.slice(0, 1500)}"), hãy trích xuất từ vựng, đoạn văn, câu hội thoại thực tế từ file đó làm nguồn tài liệu biên soạn đề.
2. Tham khảo kiến thức chuẩn nhất của kỳ thi ${certName} hiện hành theo thời gian thực.
3. Bài thi bao gồm các kỹ năng theo yêu cầu: ${skillMode === "all" ? "Nghe hiểu (Listening), Đọc hiểu (Reading), Ngữ pháp & Từ vựng" : skillMode}.
4. Với câu Nghe hiểu (Listening), cung cấp audioScript chứa hội thoại/bài phát biểu gốc bằng ${langName} chuẩn ngữ điệu thi.
5. Mỗi câu hỏi phải chứa 4 lựa chọn (options A, B, C, D), index câu đúng (0-3), và LỜI GIẢI CHI TIẾT bằng Tiếng Việt giải thích tại sao đúng/sai.

BẮT BUỘC TRẢ VỀ DẠNG JSON NGUYÊN BẢN (KHÔNG CHỨA MARKDOWN \`\`\`json):
{
  "title": "Đề Thi Thử ${certName} Chuẩn - Cấp Độ ${level}",
  "certificate": "${certificate}",
  "level": "${level}",
  "language": "${targetLang}",
  "durationMinutes": 30,
  "totalPoints": 100,
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "section": "listening",
      "questionText": "Câu hỏi nghe bằng ${langName} hoặc Tiếng Việt...",
      "audioScript": "Đoạn hội thoại audio nghe bằng ${langName}...",
      "passageText": "",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswerIndex": 0,
      "explanation": "Giải thích chi tiết bằng Tiếng Việt...",
      "points": 10
    },
    {
      "id": "q2",
      "number": 2,
      "section": "reading",
      "passageText": "Đoạn văn đọc hiểu bằng ${langName}...",
      "questionText": "Câu hỏi về nội dung đoạn văn...",
      "audioScript": "",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswerIndex": 1,
      "explanation": "Giải thích chi tiết bài đọc bằng Tiếng Việt...",
      "points": 10
    },
    {
      "id": "q3",
      "number": 3,
      "section": "grammar",
      "passageText": "",
      "questionText": "Chọn từ/ngữ pháp đúng điền vào chỗ trống...",
      "audioScript": "",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswerIndex": 2,
      "explanation": "Giải thích cấu trúc ngữ pháp...",
      "points": 10
    }
  ]
}`;

    try {
      const rawResponse = await generateFromPrompt({
        prompt,
        systemInstruction: `Bạn là giám khảo biên soạn đề thi ${certName} cao cấp. Chỉ trả về JSON duy nhất.`,
        temperature: 0.3,
      });

      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsedData);
      }
    } catch (err) {
      console.warn("AI generation failed, fallbacking to template exam paper:", err);
    }

    return NextResponse.json(generateFallbackExamPaper(certificate, level, skillMode));
  } catch (error) {
    console.error("Exam generation error:", error);
    return NextResponse.json({ error: "Lỗi tạo đề thi AI" }, { status: 500 });
  }
}

function generateFallbackExamPaper(certificate: string, level: string, skillMode: string) {
  const isKorean = certificate === "topik";
  const isChinese = certificate === "hsk";

  const lang = isKorean ? "ko" : isChinese ? "zh" : "en";
  const title = `Đề Thi ${certificate.toUpperCase()} Mẫu Cấp Độ ${level.toUpperCase()}`;

  return {
    id: `exam-${Date.now()}`,
    title,
    certificate,
    level,
    language: lang,
    durationMinutes: 20,
    totalPoints: 100,
    questions: [
      {
        id: "q1",
        number: 1,
        section: "listening",
        questionText: isKorean
          ? "다음을 듣고 이어지는 말을 고르십시오. (Nghe bài nói và chọn câu nối tiếp phù hợp nhất)"
          : isChinese
          ? "请听录音，选择正确的答案。(Nghe đoạn băng và chọn đáp án đúng)"
          : "Listen to the conversation and select the correct response.",
        audioScript: isKorean
          ? "남: 한국어 공부가 재미있습니까? 여: 네, 정말 재미있습니다."
          : isChinese
          ? "男：你学汉语多久了？ 女：我已经学了两年了。"
          : "Man: Excuse me, where is the nearest post office? Woman: Turn right at the corner.",
        options: isKorean
          ? ["네, 한국어가 재미있습니다.", "아니요, 한국사람입니다.", "감사합니다.", "죄송합니다."]
          : isChinese
          ? ["两年了", "很累", "在学校", "明天去"]
          : ["Turn right at the corner", "Yes, please", "It is 5 o'clock", "No, thank you"],
        correctAnswerIndex: 0,
        explanation: "Đáp án chính xác phù hợp nhất với câu thoại trong bài nghe.",
        points: 25,
      },
      {
        id: "q2",
        number: 2,
        section: "reading",
        passageText: isKorean
          ? "저는 주말에 도서관에 갑니다. 도서관에서 책을 읽고 공부를 합니다. 도서관은 조용하고 좋습니다."
          : isChinese
          ? "我喜欢在周末去图书馆。图书馆里有很多书，环境非常安静。"
          : "I usually visit the city library on weekends. It is quiet and comfortable for studying.",
        questionText: isKorean
          ? "이 글의 내용과 같은 것을 고르십시오."
          : isChinese
          ? "根据短文内容，选择正确的选项。"
          : "According to the passage, what is true?",
        options: isKorean
          ? ["주말에 도서관에 갑니다.", "도서관이 시끄럽습니다.", "도서관에서 운동합니다.", "평일에 도서관에 갑니다."]
          : isChinese
          ? ["周末去图书馆", "图书馆很吵", "喜欢打球", "不爱读书"]
          : ["Visits library on weekends", "The library is noisy", "Never reads books", "Opens only on Monday"],
        correctAnswerIndex: 0,
        explanation: "Căn cứ vào câu đầu tiên trong bài đọc.",
        points: 25,
      },
      {
        id: "q3",
        number: 3,
        section: "grammar",
        questionText: isKorean
          ? "다음 빈칸에 들어갈 가장 알맞은 것을 고르십시오: 날씨가 춥습니다. 옷을 따뜻하게 ( ___ )."
          : isChinese
          ? "选择合适的词语填空：今天的天气很好，我们 ( ___ ) 去公园吧。"
          : "Choose the correct word to fill in the blank: She has lived here ( ___ ) 5 years.",
        options: isKorean
          ? ["입으세요", "입었습니다", "입지 마세요", "입을까요"]
          : isChinese
          ? ["一起", "已经", "但是", "因为"]
          : ["for", "since", "during", "while"],
        correctAnswerIndex: 0,
        explanation: "Cấu trúc ngữ pháp đưa ra lời khuyên/đề nghị thích hợp trong ngữ cảnh.",
        points: 25,
      },
      {
        id: "q4",
        number: 4,
        section: "reading",
        passageText: isKorean
          ? "내일 친구와 함께 영화를 보기로 했습니다. 우리는 극장 앞에서 2시에 만날 것입니다."
          : isChinese
          ? "明天我要和朋友一起去看电影。我们约好下午两点在电影院门前见面。"
          : "Tomorrow I will watch a movie with my friend. We decided to meet in front of the cinema at 2 PM.",
        questionText: isKorean
          ? "두 사람은 내일 어디에서 만납니까?"
          : isChinese
          ? "他们明天约定在哪里见面？"
          : "Where will they meet tomorrow?",
        options: isKorean
          ? ["극장 앞", "도서관 앞", "집 안", "학교 안"]
          : isChinese
          ? ["电影院门前", "学校里面", "图书馆里", "家里"]
          : ["In front of the cinema", "At school", "At home", "In the library"],
        correctAnswerIndex: 0,
        explanation: "Thông tin ghi rõ địa điểm gặp mặt ở trước rạp chiếu phim (극장 앞 / 电影院门前 / In front of cinema).",
        points: 25,
      },
    ],
  };
}
