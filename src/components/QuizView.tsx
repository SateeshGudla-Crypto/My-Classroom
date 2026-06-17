import React, { useState } from "react";
import { Subject, QuizQuestion, QuizState } from "../types";
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowRight, 
  BookOpen, 
  Info,
  GraduationCap
} from "lucide-react";

interface QuizProps {
  subjects: Subject[];
}

export default function QuizView({ subjects }: QuizProps) {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz playing states
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [activeExplanations, setActiveExplanations] = useState<Record<number, boolean>>({});

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      alert("Please input a knowledge topic for the quiz.");
      return;
    }

    setLoading(true);
    setError(null);
    setQuizState(null);
    setActiveExplanations({});

    try {
      const res = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, context }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to organize custom practice test.");
      }

      const generatedQuestions: QuizQuestion[] = data.quiz;
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error("Invalid structure of practice exam received from teacher AI.");
      }

      setQuizState({
        questions: generatedQuestions,
        currentIdx: 0,
        userAnswers: Array(generatedQuestions.length).fill(-1),
        isCompleted: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to trigger mock lecture exams.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (!quizState || quizState.isCompleted) return;

    const { currentIdx, userAnswers } = quizState;
    if (userAnswers[currentIdx] !== -1) return; // Answer already locked

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = optionIdx;

    setQuizState({
      ...quizState,
      userAnswers: updatedAnswers,
    });
    
    // Reveal explanation automatic
    setActiveExplanations(prev => ({ ...prev, [currentIdx]: true }));
  };

  const handleNextQuestion = () => {
    if (!quizState) return;
    const { currentIdx, questions } = quizState;

    if (currentIdx === questions.length - 1) {
      setQuizState({
        ...quizState,
        isCompleted: true,
      });
    } else {
      setQuizState({
        ...quizState,
        currentIdx: currentIdx + 1,
      });
    }
  };

  const scoreCalculations = React.useMemo(() => {
    if (!quizState) return { correct: 0, total: 0, percentage: 0 };
    const { questions, userAnswers } = quizState;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  }, [quizState]);

  const handleResetQuiz = () => {
    setQuizState(null);
    setTopic("");
    setContext("");
    setError(null);
    setActiveExplanations({});
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Desk Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Practice Exams & Quizzes</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Test lecture mastery and curriculum readiness with automated smart practice drills.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Exam Generator Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-650" />
            <h3 className="font-bold text-slate-800 text-sm">Configure Mock Exam</h3>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Lesson/Curriculum Topic
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Mitosis Phases and Spindle Fibers"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Slide or Notes Context (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTopic("Civil War Manifest Destiny");
                    setContext("focus on Missouri Compromise 1820, Texas Annexation, Oregon Territory dispute");
                  }}
                  className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider font-sans cursor-pointer"
                >
                  Load prompt helper
                </button>
              </div>
              <textarea
                placeholder="Paste teacher notes, reading guides, definitions to pull exam questions from directly..."
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin inline-block" />
                  Compiling 5 Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Generate 5 MCQ Questions
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
              <p className="font-bold flex items-center gap-1">
                <XCircle className="w-4 h-4 shrink-0" /> Generative Error
              </p>
              <p className="font-sans leading-relaxed mt-1">{error}</p>
            </div>
          )}

          {/* Guidelines disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 font-sans space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <Info className="w-4 h-4 text-indigo-500" /> MCQ Studio Grading
            </p>
            <p className="leading-relaxed">
              Exams present 5 real-time options testing logical coherence. Responses lock immediately with supportive explanations explaining both incorrect pathways and truth arguments.
            </p>
          </div>
        </div>

        {/* Right Side: active playing exam or cleared board */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[460px] flex flex-col justify-between">
          
          {quizState ? (
            /* ACTIVE EXAMINATION STAGE */
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {!quizState.isCompleted ? (
                /* QUESTION STEP CAROUSEL */
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Header tracker */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="font-mono text-xs text-indigo-700 bg-indigo-50 border border-indigo-150 rounded px-2.5 py-0.5">
                        Question {quizState.currentIdx + 1} of {quizState.questions.length}
                      </span>
                      <span className="text-xs text-slate-400 font-sans">
                        Score potential: Normal scale
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed mt-2 p-1 bg-slate-50/50 border border-slate-100/50 rounded-lg">
                      {quizState.questions[quizState.currentIdx].question}
                    </h3>

                    {/* Options list */}
                    <div className="space-y-2 pt-2">
                      {quizState.questions[quizState.currentIdx].options.map((opt, oIdx) => {
                        const hasSelected = quizState.userAnswers[quizState.currentIdx] !== -1;
                        const isChosen = quizState.userAnswers[quizState.currentIdx] === oIdx;
                        const isCorrectAnswer = quizState.questions[quizState.currentIdx].correctAnswerIndex === oIdx;

                        let style = "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-350";
                        if (hasSelected) {
                          if (isCorrectAnswer) {
                            style = "bg-emerald-50 text-emerald-800 border-emerald-400";
                          } else if (isChosen) {
                            style = "bg-rose-50 text-rose-800 border-rose-400";
                          } else {
                            style = "opacity-60 border-slate-150 bg-slate-50/50";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectAnswer(oIdx)}
                            disabled={hasSelected}
                            className={`w-full text-left p-3 rounded-xl border transition text-xs sm:text-sm flex items-center gap-3 font-sans ${style} ${
                              !hasSelected ? "cursor-pointer" : ""
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              hasSelected && isCorrectAnswer ? "bg-emerald-100 text-emerald-800" :
                              hasSelected && isChosen ? "bg-rose-100 text-rose-800" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1 leading-normal font-medium">{opt}</span>
                            
                            {hasSelected && isCorrectAnswer && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                            {hasSelected && isChosen && !isCorrectAnswer && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Explanation Segment */}
                  {activeExplanations[quizState.currentIdx] && (
                    <div className="bg-indigo-50/60 border border-indigo-150/50 rounded-xl p-3 text-[11px] sm:text-xs text-indigo-950 font-sans mt-3 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-indigo-700" /> AI Tutor Rationale
                      </div>
                      <p className="leading-relaxed">
                        {quizState.questions[quizState.currentIdx].explanation}
                      </p>
                    </div>
                  )}

                  {/* Action footer */}
                  <div className="border-t border-slate-100 pt-3 flex justify-end mt-4">
                    <button
                      onClick={handleNextQuestion}
                      disabled={quizState.userAnswers[quizState.currentIdx] === -1}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer font-sans"
                    >
                      {quizState.currentIdx === quizState.questions.length - 1 ? "Submit Exam" : "Next Question"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* EXAM REPORT SUMMARY */
                <div className="space-y-5 text-center py-8">
                  <GraduationCap className="w-16 h-16 mx-auto text-indigo-600 animate-bounce" />
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Quiz Compilation Finalized!</h3>
                    <p className="text-xs text-slate-500 font-sans">Here are the grading results of your performance drill:</p>
                  </div>

                  {/* Score aggregates design */}
                  <div className="max-w-xs mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Acquired Score</p>
                    <div className="text-5xl font-black text-slate-900">{scoreCalculations.percentage}%</div>
                    <p className="text-xs font-semibold text-slate-600">
                      ({scoreCalculations.correct} correct out of {scoreCalculations.total} questions)
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-sans">
                    {scoreCalculations.percentage >= 80 
                      ? "Excellent performance! You demonstrate thorough mastery of these subject details. Keep tracking notes to safeguard compliance."
                      : scoreCalculations.percentage >= 60
                      ? "Modest scoring. Use the tutor's explanations to review wrong answers. Let's do another session to clear doubts!"
                      : "Needs revision. Try generating a Flashcard deck first to reinforce core vocabulary definitions!"}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                    <button
                      onClick={handleResetQuiz}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer font-sans"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Configure Another Topic
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-450 p-6 font-sans">
              <BookOpen className="w-14 h-14 text-indigo-100 mb-3 animate-pulse" />
              <h4 className="font-bold text-slate-800 text-sm">No Active Drill Session</h4>
              <p className="text-xs max-w-md mt-1 font-sans text-slate-400">
                Are your exam dates approaching? Configure a syllabus path on the left desk panel to trigger 5 customizable multiple-choice practice exams.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
