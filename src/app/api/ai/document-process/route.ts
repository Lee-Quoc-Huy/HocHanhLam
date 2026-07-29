import { NextResponse } from "next/server";
import { z } from "zod";
import { createChatCompletion, type ChatMessage } from "@/lib/ai/openrouter-client";

const requestSchema = z.object({
  action: z.enum([
    "ocr_extract",
    "translate",
    "extract_vocabulary",
    "generate_flashcards",
    "generate_quiz",
  ]),
  text: z.string().min(1),
  targetLanguage: z.enum(["en", "ko", "zh", "vi"]).default("vi"),
  imageDataUrl: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { action, text, targetLanguage } = parsed.data;
  const langLabel =
    targetLanguage === "vi"
      ? "Vietnamese"
      : targetLanguage === "en"
      ? "English"
      : targetLanguage === "ko"
      ? "Korean"
      : "Chinese";

  try {
    switch (action) {
      case "ocr_extract": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content:
              "You are an OCR and Document Text Normalizer. Clean and extract all readable text from the user input into clear, structured Markdown paragraph text.",
          },
          { role: "user", content: text },
        ];
        const res = await createChatCompletion({ task: "fast_completion", messages });
        return NextResponse.json({ result: res.content });
      }

      case "translate": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content: `You are a professional document translator. Translate the document into natural, elegant ${langLabel} while retaining formatting and key terminology.`,
          },
          { role: "user", content: text },
        ];
        const res = await createChatCompletion({ task: "reasoning", messages });
        return NextResponse.json({ result: res.content });
      }

      case "extract_vocabulary": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content: `Analyze the document and extract 5 to 10 key vocabulary terms.
Return ONLY valid JSON format array of objects matching this exact structure:
[
  {
    "word": "Serendipity",
    "ipa": "/ˌser.ənˈdɪp.ə.ti/",
    "vietnamese": "Sự tình cờ may mắn",
    "english_meaning": "Finding agreeable things not sought for",
    "part_of_speech": "noun",
    "example": "Meeting her was pure serendipity.",
    "difficulty": "intermediate"
  }
]`,
          },
          { role: "user", content: text },
        ];
        const res = await createChatCompletion({ task: "reasoning", messages });
        const jsonMatch = res.content.match(/\[[\s\S]*\]/);
        const vocabList = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        return NextResponse.json({ vocabulary: vocabList });
      }

      case "generate_flashcards": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content: `Analyze the document and create 5 to 8 SM-2 SRS flashcards.
Return ONLY valid JSON format array of objects matching this exact structure:
[
  {
    "front_text": "Serendipity",
    "front_subtext": "/ˌser.ənˈdɪp.ə.ti/",
    "back_text": "Sự tình cờ may mắn",
    "back_explanation": "Contextual usage and definition...",
    "tags": ["Document", "Vocabulary"]
  }
]`,
          },
          { role: "user", content: text },
        ];
        const res = await createChatCompletion({ task: "reasoning", messages });
        const jsonMatch = res.content.match(/\[[\s\S]*\]/);
        const flashcards = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        return NextResponse.json({ flashcards });
      }

      case "generate_quiz": {
        const messages: ChatMessage[] = [
          {
            role: "system",
            content: `Create 4 to 6 multiple-choice quiz questions based on the document content.
Return ONLY valid JSON format array of objects matching this exact structure:
[
  {
    "id": "q1",
    "question": "What is the primary topic of the document?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation why Option A is correct."
  }
]`,
          },
          { role: "user", content: text },
        ];
        const res = await createChatCompletion({ task: "reasoning", messages });
        const jsonMatch = res.content.match(/\[[\s\S]*\]/);
        const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        return NextResponse.json({ questions });
      }
    }
  } catch (err) {
    console.error("Document AI Process Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Document AI processing failed." },
      { status: 502 }
    );
  }
}
