import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  query: z.string().min(1),
});

const POPULAR_SUGGESTIONS = [
  "Serendipity",
  "Used to vs Be used to",
  "설레다",
  "坚持 jiān chí",
  "IELTS Academic Vocabulary",
  "TOPIK II Grammar Patterns",
  "HSK 5 Business Words",
  "Climate Resilience Reading",
];

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }

  const q = parsed.data.query.toLowerCase();
  const suggestions = POPULAR_SUGGESTIONS.filter((item) =>
    item.toLowerCase().includes(q)
  );

  return NextResponse.json({ suggestions: suggestions.slice(0, 5) });
}
