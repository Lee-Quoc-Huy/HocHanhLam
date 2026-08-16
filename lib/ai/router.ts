import { callGemini } from './providers/gemini';
import { callGroq } from './providers/groq';
import { callOpenRouter } from './providers/openrouter';

/**
 * Điều phối AI theo đúng tinh thần bảng phân công ban đầu của bạn:
 * mỗi loại tác vụ có 1 model "chính" (free tier tốt nhất cho việc đó) và
 * tối đa 2 lớp dự phòng — nếu model chính hết quota/lỗi, tự rơi xuống lớp
 * kế tiếp thay vì làm hỏng trải nghiệm người dùng.
 *
 * Tất cả model ID đọc từ biến môi trường để bạn cập nhật dễ dàng khi các
 * nhà cung cấp đổi danh mục model — giá trị mặc định bên dưới chỉ là gợi ý
 * tại thời điểm viết code này, hãy đối chiếu lại trước khi deploy thật.
 */
export type AITask =
  | 'tutor-explain' // Giảng viên AI — giải thích từ vựng / ngữ pháp (giải thích chi tiết)
  | 'tutor-fast' // Giảng viên AI — trả lời ngắn, hội thoại nhanh
  | 'grammar-deep' // Phân tích ngữ pháp / câu khó, cần suy luận
  | 'generate-exercise' // Tạo câu hỏi hoàn thành câu / đọc hiểu theo cấp độ
  | 'translate' // Dịch đa ngôn ngữ
  | 'classify-quick'; // Đọc sheet/ảnh, phân loại nhanh, tạo câu ví dụ

type ProviderStep = { name: string; run: () => Promise<string> };

function buildChain(task: AITask, systemPrompt: string, userPrompt: string): ProviderStep[] {
  const G = {
    flash: process.env.GEMINI_MODEL_FLASH || 'gemini-2.5-flash',
    flashLite: process.env.GEMINI_MODEL_FLASH_LITE || 'gemini-2.5-flash-lite',
    pro: process.env.GEMINI_MODEL_PRO || 'gemini-2.5-pro',
    flashExercise: process.env.GEMINI_MODEL_EXERCISE || 'gemini-2.5-flash',
  };
  const Q = {
    scout: process.env.GROQ_MODEL_SCOUT || 'meta-llama/llama-4-scout-17b-16e-instruct',
    instant: process.env.GROQ_MODEL_INSTANT || 'llama-3.1-8b-instant',
    qwen: process.env.GROQ_MODEL_QWEN || 'qwen/qwen3-32b',
  };
  const OR = {
    // Model gắn hậu tố ":free" trên OpenRouter — kiểm tra lại danh sách mới nhất
    // tại https://openrouter.ai/models?max_price=0 trước khi deploy thật.
    llama: process.env.OPENROUTER_MODEL_LLAMA || 'meta-llama/llama-3.1-8b-instruct:free',
    gemma: process.env.OPENROUTER_MODEL_GEMMA || 'google/gemma-2-9b-it:free',
    qwen: process.env.OPENROUTER_MODEL_QWEN || 'qwen/qwen-2.5-7b-instruct:free',
  };

  const chains: Record<AITask, ProviderStep[]> = {
    'tutor-explain': [
      { name: 'gemini-flash', run: () => callGemini(G.flash, systemPrompt, userPrompt) },
      { name: 'groq-scout', run: () => callGroq(Q.scout, systemPrompt, userPrompt) },
      { name: 'openrouter-llama', run: () => callOpenRouter(OR.llama, systemPrompt, userPrompt) },
    ],
    'tutor-fast': [
      { name: 'groq-instant', run: () => callGroq(Q.instant, systemPrompt, userPrompt) },
      { name: 'gemini-flash', run: () => callGemini(G.flash, systemPrompt, userPrompt) },
      { name: 'openrouter-gemma', run: () => callOpenRouter(OR.gemma, systemPrompt, userPrompt) },
    ],
    'grammar-deep': [
      { name: 'gemini-pro', run: () => callGemini(G.pro, systemPrompt, userPrompt) },
      { name: 'gemini-flash', run: () => callGemini(G.flash, systemPrompt, userPrompt) },
      { name: 'openrouter-llama', run: () => callOpenRouter(OR.llama, systemPrompt, userPrompt) },
    ],
    'generate-exercise': [
      { name: 'gemini-exercise', run: () => callGemini(G.flashExercise, systemPrompt, userPrompt) },
      { name: 'groq-scout', run: () => callGroq(Q.scout, systemPrompt, userPrompt) },
      { name: 'openrouter-llama', run: () => callOpenRouter(OR.llama, systemPrompt, userPrompt) },
    ],
    translate: [
      { name: 'groq-qwen', run: () => callGroq(Q.qwen, systemPrompt, userPrompt) },
      { name: 'gemini-flash-lite', run: () => callGemini(G.flashLite, systemPrompt, userPrompt) },
      { name: 'openrouter-qwen', run: () => callOpenRouter(OR.qwen, systemPrompt, userPrompt) },
    ],
    'classify-quick': [
      { name: 'gemini-flash-lite', run: () => callGemini(G.flashLite, systemPrompt, userPrompt) },
      { name: 'groq-instant', run: () => callGroq(Q.instant, systemPrompt, userPrompt) },
      { name: 'openrouter-gemma', run: () => callOpenRouter(OR.gemma, systemPrompt, userPrompt) },
    ],
  };

  return chains[task];
}

const OFFLINE_FALLBACK =
  'Hiện tại chưa có API key AI nào được cấu hình (hoặc tất cả đều đang gián đoạn), nên mình chưa thể trả lời chi tiết. Hãy thêm GOOGLE_AI_STUDIO_API_KEY hoặc GROQ_API_KEY vào biến môi trường để bật tính năng này.';

/**
 * Gọi AI theo chuỗi provider của 1 loại tác vụ, tự động fallback khi lỗi.
 * Trả về { text, providerUsed } để có thể hiển thị/ghi log provider nào
 * thực sự phục vụ request (hữu ích khi debug quota miễn phí).
 */
export async function runAI(
  task: AITask,
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; providerUsed: string }> {
  const chain = buildChain(task, systemPrompt, userPrompt);
  const errors: string[] = [];

  for (const step of chain) {
    try {
      const text = await step.run();
      return { text, providerUsed: step.name };
    } catch (err) {
      errors.push(`${step.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Mọi provider đều thất bại (thường vì chưa cấu hình API key trong demo/dev)
  console.error('[AI router] Tất cả provider đều lỗi:', errors.join(' | '));
  return { text: OFFLINE_FALLBACK, providerUsed: 'offline-fallback' };
}
