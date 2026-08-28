// app/dashboard/student/courses/[id]/quizzes/[quizId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/app/lib/api';
import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
} from 'lucide-react';

export default function StudentQuizPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params?.id as string;
  const quizId = params?.quizId as string;

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const isNumeric = !isNaN(Number(quizId));
        const query = isNumeric
          ? `/quizzes?filters[$or][0][id][$eq]=${quizId}&filters[$or][1][documentId][$eq]=${quizId}`
          : `/quizzes?filters[documentId][$eq]=${quizId}`;

        const res = await fetchApi(query, authHeader);
        const found = Array.isArray(res?.data) ? res.data[0] : res?.data || res;

        if (found) {
          const item = found.attributes ? { id: found.id, ...found.attributes } : found;
          setQuiz(item);

          let qData = item.questions;
          if (typeof qData === 'string') {
            try {
              qData = JSON.parse(qData);
            } catch {
              qData = [];
            }
          }
          setQuestions(Array.isArray(qData) ? qData : []);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) loadQuiz();
  }, [quizId]);

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optIdx,
    });
  };

    const handleSubmitQuiz = async () => {
        if (Object.keys(selectedAnswers).length === 0) {
        alert('Please answer at least one question before submitting.');
        return;
        }

        let correctCount = 0;
        questions.forEach((q, idx) => {
        const correctOpt = q.correctAnswer ?? q.correct ?? 0;
        if (selectedAnswers[idx] === Number(correctOpt)) {
            correctCount++;
        }
        });

        setScore(correctCount);
        setSubmitted(true);

        // 🚀 ব্যাকএন্ডে রেজাল্ট সেভ করার কোড
        try {
        const token = localStorage.getItem('token');
        const cleanToken = token ? token.replace(/^Bearer\s+/i, '').trim() : '';
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (cleanToken) {
            headers['Authorization'] = `Bearer ${cleanToken}`;
        }

        // বর্তমান ইউজারের আইডি বের করা
        const me = await fetchApi('/users/me', { headers }).catch(() => null);

        const targetQuizDocId = quiz.documentId || quizId;

        // Strapi-তে QuizResult সেভ করার রিকোয়েস্ট
        await fetchApi('/quiz-results', {
            method: 'POST',
            headers,
            body: JSON.stringify({
            data: {
                score: correctCount,
                total_questions: questions.length,
                quiz: targetQuizDocId,
                user: me?.id || null,
            },
            }),
        });

        console.log('Quiz result saved successfully to backend!');
        } catch (err: any) {
        console.error('Failed to save quiz result to backend:', err);
        // নোট: যদি ব্যাকএন্ডে quiz-results কালেকশন টাইপের পারমিশন (create) অন করা না থাকে, তবে 403 এরর দিতে পারে। 
        }
    };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs">Loading quiz assessment...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 max-w-xl mx-auto">
        <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">Quiz Not Found</h2>
        <Link
          href={`/dashboard/student/courses`}
          className="inline-block px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const isRetakeAllowed = quiz.allowRetake ?? quiz.retake_allowed ?? false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <Link
          href={`/dashboard/student/courses`}
          className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </Link>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Course Assessment
        </span>
      </div>

      {/* Quiz Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-2 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{quiz.title}</h1>
        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
          <p>
            Total Questions: <span className="text-white font-semibold">{questions.length}</span>
          </p>
          <span>•</span>
          <p>
            Retake Permission:{' '}
            <span className={isRetakeAllowed ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {isRetakeAllowed ? 'Allowed' : 'Not Allowed'}
            </span>
          </p>
        </div>
      </div>

      {/* Result Card (After Submit) */}
      {submitted && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quiz Completed!</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Your Score: <span className="text-emerald-400 font-bold text-base">{score}</span> out of {questions.length}
              </p>
            </div>
          </div>

          {isRetakeAllowed ? (
            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedAnswers({});
              }}
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          ) : (
            <div className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-500 text-xs rounded-xl">
              Retake is not permitted by instructor
            </div>
          )}
        </div>
      )}

      {/* Questions List with Radio Buttons */}
      <div className="space-y-6">
        {questions.length > 0 ? (
          questions.map((q: any, qIdx: number) => {
            const userChoice = selectedAnswers[qIdx];
            const correctOpt = q.correctAnswer ?? q.correct ?? 0;
            const isCorrect = submitted && userChoice === Number(correctOpt);

            return (
              <div
                key={qIdx}
                className={`bg-slate-900 border rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl transition ${
                  submitted
                    ? isCorrect
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-red-500/40 bg-red-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {q.question || q.title || 'Question text missing'}
                  </h3>
                </div>

                {/* Radio Options List */}
                <div className="space-y-2.5 pl-10">
                  {Array.isArray(q.options) &&
                    q.options.map((opt: string, optIdx: number) => {
                      const isSelected = userChoice === optIdx;
                      const isThisCorrect = optIdx === Number(correctOpt);

                      let labelStyle = 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50';

                      if (submitted) {
                        if (isThisCorrect) {
                          labelStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold';
                        } else if (isSelected && !isThisCorrect) {
                          labelStyle = 'bg-red-500/20 border-red-500/50 text-red-300 font-semibold';
                        }
                      } else if (isSelected) {
                        labelStyle = 'bg-emerald-600/20 border-emerald-500 text-white font-semibold shadow-md';
                      }

                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center justify-between p-3.5 border rounded-2xl text-xs sm:text-sm cursor-pointer transition ${labelStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              checked={isSelected}
                              disabled={submitted}
                              onChange={() => handleOptionSelect(qIdx, optIdx)}
                              className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span>{opt}</span>
                          </div>

                          {submitted && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {submitted && isSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                        </label>
                      );
                    })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
            <p className="text-xs">No questions available for this quiz yet.</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {!submitted && questions.length > 0 && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmitQuiz}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Submit Quiz Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}