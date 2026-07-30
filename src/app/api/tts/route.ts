import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim();
  const lang = searchParams.get("lang")?.trim() || "en";

  if (!text) {
    return new NextResponse("Missing text parameter", { status: 400 });
  }

  const langMap: Record<string, string> = {
    en: "en",
    ko: "ko",
    zh: "zh-CN",
  };

  const targetLang = langMap[lang] || lang;

  try {
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${targetLang}&client=tw-ob`;

    const response = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch audio from TTS provider", {
        status: response.status,
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("TTS Proxy Route Error:", error);
    return new NextResponse("Internal Server Error in TTS proxy", { status: 500 });
  }
}
