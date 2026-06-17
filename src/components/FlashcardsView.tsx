import React, { useState } from "react";
import { Subject, Flashcard } from "../types";
import { 
  Plus, 
  Sparkles, 
  Check, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  HelpCircle, 
  Info, 
  GraduationCap,
  Sparkle
} from "lucide-react";

interface FlashcardsProps {
  subjects: Subject[];
  flashcards: Flashcard[];
  onSetFlashcards: (cards: Flashcard[]) => void;
  onToggleMastered: (id: string) => void;
}

export default function FlashcardsView({
  subjects,
  flashcards,
  onSetFlashcards,
  onToggleMastered,
}: FlashcardsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Custom creator states
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(false);

  // Stats
  const totalCount = flashcards.length;
  const masteredCount = flashcards.filter((f) => f.mastered).length;
  const completionPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      alert("Please input a study topic.");
      return;
    }

    setLoading(true);
    try {
      const chosenSubject = subjects.find(s => s.id === selectedSubjectId);
      const res = await fetch("/api/gemini/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          context: context || (chosenSubject ? `Subject: ${chosenSubject.name}` : ""),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger Gemini flashcard array generation.");
      }

      const cards: any[] = data.flashcards;
      if (!Array.isArray(cards)) {
        throw new Error("Invalid response format received from AI.");
      }

      // Format clean standard cards
      const formattedCards: Flashcard[] = cards.map((c, i) => ({
        id: "fc_" + Date.now() + "_" + i,
        front: c.front || "Concept Prompt",
        back: c.back || "Answer detail",
        mastered: false,
      }));

      onSetFlashcards(formattedCards);
      setActiveIdx(0);
      setIsFlipped(false);
      setTopic("");
      setContext("");
    } catch (err: any) {
      alert("Error compiling flashcards: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[activeIdx] || null;

  const navigateNext = () => {
    if (activeIdx < totalCount - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setActiveIdx((prev) => prev + 1);
      }, 100);
    }
  };

  const navigatePrev = () => {
    if (activeIdx > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setActiveIdx((prev) => prev - 1);
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Desk Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Active Recall Flashcards</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Test scientific vocabulary, timeline metrics, and exam formulas with dynamic generative query cards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Generation Form panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Sparkle className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Generate Revision Deck</h3>
          </div>

          <form onSubmit={handleGenerateCards} className="space-y-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Study Topic / Concept
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Newton's Laws of Motion"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Attach Class (Optional)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="">No Course Link</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Detailed material guidelines (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTopic("Photosynthesis Light Reactions");
                    setContext("focus on ADP vs ATP, photophosphorylation, chloroplast anatomy");
                  }}
                  className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider font-sans cursor-pointer"
                >
                  Load prompt guide
                </button>
              </div>
              <textarea
                placeholder="Type lecture guidelines, formulas, textbook segments, or focus directives to target your cards..."
                rows={3}
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
                  Generating Study Cards...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Request AI Flashcards (6)
                </>
              )}
            </button>
          </form>

          {/* Quick instructions indicator */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-500 font-sans space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500" /> Active Recall Advice
            </p>
            <p className="leading-relaxed">
              Read the concept prompt on the front, state your answer aloud, then flip to verify. Check "Mark Mastered" to exclude from active review targets.
            </p>
          </div>
        </div>

        {/* Right Hand: Active Card Studio Deck */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[460px]">
          {currentCard ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Progress counter header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                    Card {activeIdx + 1} of {totalCount}
                  </span>
                  {currentCard.mastered && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.2 py-0.5 rounded-full border border-emerald-150 uppercase">
                      ✓ Mastered
                    </span>
                  )}
                </div>
                
                <div className="text-right text-xs text-slate-400 font-sans">
                  Study Deck Mastery: <strong className="text-slate-800 font-bold">{masteredCount} of {totalCount} ({completionPercent}%)</strong>
                </div>
              </div>

              {/* Main Interactive card flip envelope */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ perspective: "1000px" }}
                className="flex-1 flex items-center justify-center py-6 cursor-pointer"
              >
                <div 
                  className={`w-full max-w-lg min-h-[220px] rounded-2xl border transition-all duration-300 transform relative ${
                    isFlipped 
                      ? "bg-slate-900 border-slate-900 text-slate-100 rotate-y-180" 
                      : "bg-gradient-to-br from-slate-50 to-white hover:border-indigo-400 border-slate-200 text-slate-800"
                  } shadow-xs flex flex-col items-center justify-center p-8 text-center select-none relative`}
                >
                  {/* Flip indicator icon helper */}
                  <div className={`absolute top-4 right-4 text-[10px] font-mono tracking-wider font-bold uppercase transition flex items-center gap-1 ${
                    isFlipped ? "text-slate-400" : "text-slate-400/80"
                  }`}>
                    <RefreshCw className="w-3.5 h-3.5" /> Tap Card to Flip
                  </div>

                  {/* Absolute front symbol */}
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold font-sans">
                        Q
                      </div>
                      <p className="text-sm md:text-base font-bold leading-relaxed tracking-tight">
                        {currentCard.front}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 rotate-y-180">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold font-sans">
                        A
                      </div>
                      <p className="text-sm md:text-base font-medium leading-relaxed tracking-tight text-slate-100">
                        {currentCard.back}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation controls & Mastered triggers */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  onClick={() => onToggleMastered(currentCard.id)}
                  type="button"
                  className={`px-3.5 py-2 font-bold text-xs rounded-lg transition-all border inline-flex items-center gap-1.5 self-start cursor-pointer font-sans ${
                    currentCard.mastered
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <CheckSquare className={`w-4 h-4 ${currentCard.mastered ? "text-emerald-600 fill-emerald-100" : "text-slate-400"}`} />
                  {currentCard.mastered ? "Mark Active Review" : "Mark Concept Mastered"}
                </button>

                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={navigatePrev}
                    disabled={activeIdx === 0}
                    className="p-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all font-sans cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-500 px-1">
                    {activeIdx + 1} / {totalCount}
                  </span>
                  <button
                    onClick={navigateNext}
                    disabled={activeIdx === totalCount - 1}
                    className="p-2 border border-slate-200 rounded-lg bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all font-sans cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-450 p-6 font-sans">
              <GraduationCap className="w-14 h-14 text-indigo-200 mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">Flashcards Stack Cleared</h4>
              <p className="text-xs max-w-md mt-1 mb-4 text-slate-400 leading-relaxed font-sans">
                Ready to review Newtonian laws or cellular photosynthesis? Input your concept on the left desk panel to trigger Gemini deck compilers.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
