import React, { useState } from "react";
import { Subject, CourseNote } from "../types";
import { Plus, Sparkles, Copy, Check, Trash2, BookOpen, AlertCircle, FileText, Search } from "lucide-react";

interface NotesProps {
  subjects: Subject[];
  notes: CourseNote[];
  onAddNote: (note: CourseNote) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesView({
  subjects,
  notes,
  onAddNote,
  onDeleteNote,
}: NotesProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [activeTab, setActiveTab] = useState<"view" | "create">("view");

  // Form states
  const [noteTitle, setNoteTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAISimplify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText || !noteTitle || !subjectId) {
      alert("Please fill in the title, subject, and paste your messy notes.");
      return;
    }

    setLoading(true);
    try {
      const selectedSub = subjects.find(s => s.id === subjectId);
      const res = await fetch("/api/gemini/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawNotes: rawText,
          subject: selectedSub?.name || "General Study Lecture",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger Gemini structuring.");
      }

      const formattedMarkdown = data.markdown;
      const newNote: CourseNote = {
        id: "note_" + Date.now(),
        subjectId,
        title: noteTitle,
        content: formattedMarkdown || "### Empty output generated.",
        createdAt: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      onAddNote(newNote);
      setSelectedNoteId(newNote.id);
      setActiveTab("view");
      
      // Reset form
      setNoteTitle("");
      setRawText("");
    } catch (err: any) {
      alert("Error organizing notes with AI: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0] || null;

  const filteredNotes = React.useMemo(() => {
    return notes.filter((n) => {
      const matchText = n.title.toLowerCase().includes(search.toLowerCase()) || 
                        n.content.toLowerCase().includes(search.toLowerCase());
      return matchText;
    });
  }, [notes, search]);

  const getSubject = (subId: string) => {
    return subjects.find((s) => s.id === subId);
  };

  return (
    <div className="space-y-6">
      
      {/* Top visual desk header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Lecture Notes Desk</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Format messy lecture transcripts and slides into structured academic study syllabi instantly.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("view")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeTab === "view" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            My Saved Guides ({notes.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("create");
              if (subjects.length > 0 && !subjectId) setSubjectId(subjects[0].id);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1 ${
              activeTab === "create" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Transcribe / Format
          </button>
        </div>
      </div>

      {activeTab === "create" ? (
        /* FORM COMPONENT FOR GEMINI NOTE STRUCTURING */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Gemini Lecture Organizer</h3>
              <p className="text-xs text-slate-500 font-sans">
                Paste raw lectures, slide bulletpoints, or messy notes. Gemini will structure them perfectly.
              </p>
            </div>
          </div>

          <form onSubmit={handleAISimplify} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Revision Title / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Krebs Cycle in Cellular Respiration"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Attach to Course Track
                </label>
                {subjects.length === 0 ? (
                  <p className="text-xs text-red-500 font-semibold py-1">Please add a course subject on the Calendar tab first.</p>
                ) : (
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-sans focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Messy draft content / Transcribed bulletpoints
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(
                      `What is phototropism? auxin hormone, collects on shady side. elongates cells. makes plant bend towards light source. helpful for photosynthesis. positive vs negative phototropism.`
                    );
                    setNoteTitle("Phototropism Auxin Regulation Note");
                  }}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold font-sans uppercase tracking-wide cursor-pointer"
                >
                  Load Mock Transcript
                </button>
              </div>
              <textarea
                required
                rows={10}
                placeholder="Type or paste messy slide text, lecture files copy-paste, formulas, disorganized annotations..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-sans focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-sans">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Requires GEMINI_API_KEY</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("view");
                    setRawText("");
                  }}
                  className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-md font-semibold font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || subjects.length === 0}
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 rounded-lg transition-all cursor-pointer font-sans"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-white rounded-full animate-spin inline-block" />
                      Formatting Guide...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Refine messy notes with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* SAVED NOTES MULTI-PANEL INDEX VIEWER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Notes sidebar catalog */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter saved guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-sans border border-dashed border-slate-150 rounded-xl">
                No guides match your search, or notes index is clear.
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto">
                {filteredNotes.map((note) => {
                  const isActive = note.id === selectedNoteId;
                  const itemSub = getSubject(note.subjectId);
                  return (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isActive 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50/50 hover:bg-slate-50 border-slate-150 text-slate-705"
                      }`}
                    >
                      <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? "text-indigo-300" : "text-slate-400"}`} />
                      <div className="space-y-0.5 overflow-hidden flex-1">
                        <h4 className="font-semibold text-xs truncate leading-snug">
                          {note.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] opacity-75">
                          <span>{itemSub?.name || "General Study"}</span>
                          <span>{note.createdAt.split(",")[0]}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active note reading canvas */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[500px] flex flex-col justify-between">
            {activeNote ? (
              <div className="space-y-5 flex-1">
                {/* Header operations bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                        {getSubject(activeNote.subjectId)?.name || "Study Deck Topic"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeNote.createdAt}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg md:text-xl">{activeNote.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto uppercase">
                    <button
                      onClick={() => handleCopy(activeNote.content)}
                      className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition inline-flex items-center gap-1 text-[11px] font-bold font-sans cursor-pointer"
                      title="Copy raw Markdown"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy MD
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete study guide "${activeNote.title}"?`)) {
                          onDeleteNote(activeNote.id);
                        }
                      }}
                      className="p-1.5 border border-red-200/50 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 transition inline-flex items-center gap-1 text-[11px] font-bold font-sans cursor-pointer"
                      title="Remove Note Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Markdown Display Panel */}
                <div className="prose prose-sm prose-slate max-w-none text-slate-700 font-sans space-y-4 leading-relaxed outline-none">
                  <StyleMarkdown content={activeNote.content} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 p-6">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No Study Guides Active</h4>
                <p className="text-xs max-w-md mt-1 font-sans">
                  Tap the 'Transcribe / Format' button in the top right to paste raw lecture drafts and organize them into structured revision guides with Gemini.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Simple and highly effective parser tool for formatted Classwork Guide Markdowns
function StyleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  
  return (
    <div className="font-sans text-xs sm:text-sm text-slate-850 space-y-3 pt-2">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("# ")) {
          return <h1 key={idx} className="text-xl font-bold text-slate-900 border-b border-indigo-100 pb-2 mt-4">{line.replace("# ", "")}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={idx} className="text-base font-extrabold text-slate-900 mt-5 mb-2 hover:text-indigo-750 flex items-center gap-1.5"><span className="w-2 h-4 bg-indigo-500 rounded-sm"></span>{line.replace("## ", "")}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-1.5">{line.replace("### ", "")}</h3>;
        }
        // Horizontal Rule
        if (line.trim() === "---") {
          return <hr key={idx} className="border-t border-slate-150 my-4" />;
        }
        // Bold parsed terms
        let formattedLine: React.ReactNode = line;
        
        // Match lists formatted like * **term**: definition or - **term**: ...
        const boldMatch = line.match(/^(\s*[-*]\s*)\*\*(.*?)\*\*:(.*)/);
        if (boldMatch) {
          const [, bullet, term, desc] = boldMatch;
          return (
            <div key={idx} className="pl-4 py-0.5 flex items-start gap-1 font-sans">
              <span className="text-indigo-400 text-sm mt-0.5">•</span>
              <p className="text-slate-750">
                <strong className="text-slate-900 font-bold">{term}</strong>: {desc}
              </p>
            </div>
          );
        }

        // Standard bullet items
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const rawItem = line.replace(/^\s*[-*]\s*/, "");
          return (
            <div key={idx} className="pl-4 py-0.5 flex items-start gap-1 font-sans">
              <span className="text-indigo-400 text-sm mt-0.5">•</span>
              <p className="text-slate-750">{rawItem}</p>
            </div>
          );
        }

        // Ordered/numbered items
        const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const [, num, textStr] = numMatch;
          return (
            <div key={idx} className="pl-4 py-1 flex items-start gap-2 font-sans">
              <span className="font-bold text-indigo-700 text-xs bg-indigo-50 border border-indigo-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{num}</span>
              <p className="text-slate-750">{textStr}</p>
            </div>
          );
        }

        // Empty lines
        if (line.trim() === "") {
          return <div key={idx} className="h-2" />;
        }

        // Default styled paragraph block with mild bold parses
        const hasEmbedBolds = line.includes("**");
        if (hasEmbedBolds) {
          const parts = line.split("**");
          return (
            <p key={idx} className="leading-relaxed">
              {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="text-slate-900 font-bold">{p}</strong> : p)}
            </p>
          );
        }

        return <p key={idx} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
}
