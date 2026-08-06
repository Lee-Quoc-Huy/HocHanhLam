use client;

import { useState } from 'react';
import { useLibrary } from '@/features/library/hooks/use-library';
import { ExamSelector } from '@/app/(dashboard)/exam-prep/components/ExamSelector';
import { PracticeSession } from '@/app/(dashboard)/exam-prep/components/PracticeSession';
import { ResultModal } from '@/app/(dashboard)/exam-prep/components/ResultModal';

export default function ExamPrepPage() {
  const { getFilesByTag } = useLibrary();
  const [exam, setExam] = useState<'TOPIK' | 'TOEIC' | 'HSK'>('TOPIK');
  const [level, setLevel] = useState<string>('I');
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startPractice = async () => {
    const tags = [exam, level];
    const files = await getFilesByTag(tags);
    const fileUrls = files.map((f: any) => f.file_url).filter(Boolean);
    const response = await fetch('/api/generate-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam, level, fileUrls }),
    });
    const data = await response.json();
    setQuestions(data.questions);
    setSessionId(data.sessionId);
    setShowResult(false);
  };

  const finishPractice = (score: number) => {
    setShowResult(true);
    // optionally send score to backend
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ôn {exam} - Cấp {level}</h1>
      <ExamSelector exam={exam} level={level} setExam={setExam} setLevel={setLevel} />
      <button
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        onClick={startPractice}
      >
        Tạo Bài Ôn
      </button>
      {questions.length > 0 && (
        <PracticeSession questions={questions} onFinish={finishPractice} />
      )}
      {showResult && sessionId && (
        <ResultModal sessionId={sessionId} onClose={() => setShowResult(false)} />
      )}
    </div>
  );
}
