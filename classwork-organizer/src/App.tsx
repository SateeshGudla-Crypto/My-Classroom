import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Timetable from "./components/Timetable";
import Assignments from "./components/Assignments";
import NotesView from "./components/NotesView";
import FlashcardsView from "./components/FlashcardsView";
import QuizView from "./components/QuizView";
import { Subject, Assignment, ScheduleItem, CourseNote, Flashcard } from "./types";
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  FileText, 
  RefreshCw, 
  HelpCircle,
  Sparkles
} from "lucide-react";

// Initial mock data to ensure the desk feels live and high-density from turn one
const DEFAULT_SUBJECTS: Subject[] = [
  { id: "sub_1", name: "CS-302 Algorithm Design", teacher: "Prof. Davis", color: "violet", room: "Hall C4" },
  { id: "sub_2", name: "ENG-210 Modern Prose", teacher: "Prof. Miller", color: "amber", room: "Room 102" },
  { id: "sub_3", name: "MATH-401 Advanced Calculus", teacher: "Dr. Chen", color: "emerald", room: "Hall B" },
];

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: "sch_1", subjectId: "sub_1", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Hall C4" },
  { id: "sch_2", subjectId: "sub_2", dayOfWeek: "Tuesday", startTime: "11:00", endTime: "12:30", room: "Room 102" },
  { id: "sch_3", subjectId: "sub_3", dayOfWeek: "Tuesday", startTime: "14:00", endTime: "15:30", room: "Hall B" },
  { id: "sch_4", subjectId: "sub_1", dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:30", room: "Hall C4" },
  { id: "sch_5", subjectId: "sub_2", dayOfWeek: "Thursday", startTime: "11:00", endTime: "12:30", room: "Room 102" },
];

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  { id: "as_1", title: "Algorithm Analysis Essay on Big O Complexity", subjectId: "sub_1", dueDate: "2026-06-25", status: "Todo", priority: "High", notes: "Review mergesort worst case parameters. Must keep output below 4 pages." },
  { id: "as_2", title: "Calculus P-Set #4 Worksheet Exercises", subjectId: "sub_3", dueDate: "2026-06-28", status: "In-Progress", priority: "Medium", notes: "Problems 12 through 19 regarding triple integral volumes." },
  { id: "as_3", title: "Weekly Modern Prose Journal Reflection", subjectId: "sub_2", dueDate: "2026-06-20", status: "Completed", priority: "Low", notes: "Write 400 words evaluating Hemingway's pacing in Short Happy Life." },
];

const DEFAULT_NOTES: CourseNote[] = [
  {
    id: "note_pre",
    subjectId: "sub_1",
    title: "Binary Tree Traversal Heuristics",
    content: `# Study Guide: Binary Tree Traversal Patterns

## Academic Overview
Tree traversal encompasses visiting every node in a tree graph structure exactly once. This study guide outlines BFS (Level-Order) and DFS (In-Order, Pre-Order, Post-Order) heuristics with spatial analysis parameters.

## Key Terms & Vocabulary Definitions
- **Depth-First Search (DFS)**: Recursive tree algorithm diving deep into subtrees first before parent backtracking.
- **In-Order (L-N-R)**: Traverses left subtree, visits node, traverses right. Prints sorted fields in BST.
- **Pre-Order (N-L-R)**: Visits current root vertex, then parses descendants. Useful for cloning hierarchies.
- **Breadth-First Search (BFS)**: Visits nodes level-by-level sequentially, utilizing linear queue queues.

## Structured Breakdown
### Big-O Traversal Complexity
1. Time complexity is standard **O(V + E)** as each vertex is analyzed once.
2. Space complexity is constrained by stack allocation depth, leading to worst-case **O(H)** height constraints.

## Practice Recall Questions
1. Why does DFS utilize standard stacks whereas BFS requires queues?
2. Write the algorithm ordering elements for L-N-R on a symmetric 3-node structure.`,
    createdAt: "Jun 16, 2026, 09:00 AM",
  }
];

const DEFAULT_FLASHCARDS: Flashcard[] = [
  { id: "fc_1", front: "What is the time complexity of a standard Binary Search lookup on a balanced tree of size N?", back: "O(log N). Because search boundaries divide in half with each step.", mastered: true },
  { id: "fc_2", front: "State the difference between In-Order and Pre-Order DFS traversal paths.", back: "In-Order visits current node *between* subtrees (L, Node, R). Pre-Order visits current node *before* child subtrees (Node, L, R).", mastered: false },
  { id: "fc_3", front: "Define standard Auxin functionality in botanical phototropism.", back: "An elongation plant hormone that gathers on the dark/shaded side of a stem, causing cells to stretch and lean the plant towards a light source.", mastered: false },
  { id: "fc_4", front: "State the mathematical formula representing Big-O worst-case comparison bounds for Merge Sort.", back: "O(N log N). It consistently partitions arrays into halves and does linear-time merge merges.", mastered: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // State arrays persisted with local storage
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("classwork_subjects");
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem("classwork_schedule");
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("classwork_assignments");
    return saved ? JSON.parse(saved) : DEFAULT_ASSIGNMENTS;
  });

  const [notes, setNotes] = useState<CourseNote[]>(() => {
    const saved = localStorage.getItem("classwork_notes");
    return saved ? JSON.parse(saved) : DEFAULT_NOTES;
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("classwork_flashcards");
    return saved ? JSON.parse(saved) : DEFAULT_FLASHCARDS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("classwork_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("classwork_schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("classwork_assignments", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("classwork_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("classwork_flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  // Handle Operations
  const handleAddSubject = (newSub: Omit<Subject, "id">) => {
    const fresh: Subject = {
      ...newSub,
      id: "sub_" + Date.now(),
    };
    setSubjects((prev) => [...prev, fresh]);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    // Cascade delete calendar items and assignments
    setSchedule((prev) => prev.filter((sc) => sc.subjectId !== id));
    setAssignments((prev) => prev.filter((a) => a.subjectId !== id));
    setNotes((prev) => prev.filter((n) => n.subjectId !== id));
  };

  const handleAddScheduleItem = (newSlot: Omit<ScheduleItem, "id">) => {
    const fresh: ScheduleItem = {
      ...newSlot,
      id: "sch_" + Date.now(),
    };
    setSchedule((prev) => [...prev, fresh]);
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddAssignment = (newAs: Omit<Assignment, "id" | "status">) => {
    const fresh: Assignment = {
      ...newAs,
      id: "as_" + Date.now(),
      status: "Todo",
    };
    setAssignments((prev) => [...prev, fresh]);
  };

  const handleQuickAddAssignment = (title: string, subjectId: string, dueDate: string) => {
    const fresh: Assignment = {
      id: "as_" + Date.now(),
      title,
      subjectId,
      dueDate,
      status: "Todo",
      priority: "Medium",
    };
    setAssignments((prev) => [...prev, fresh]);
  };

  const handleUpdateAssignmentStatus = (id: string, status: Assignment["status"]) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddNote = (newNote: CourseNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleFlashcardMastered = (id: string) => {
    setFlashcards((prev) =>
      prev.map((f) => (f.id === id ? { ...f, mastered: !f.mastered } : f))
    );
  };

  // Switch display elements
  const renderMainContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            subjects={subjects} 
            assignments={assignments} 
            schedule={schedule}
            setActiveTab={setActiveTab}
            onQuickAddAssignment={handleQuickAddAssignment}
          />
        );
      case "timetable":
        return (
          <Timetable
            subjects={subjects}
            schedule={schedule}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onAddScheduleItem={handleAddScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
          />
        );
      case "assignments":
        return (
          <Assignments
            subjects={subjects}
            assignments={assignments}
            onAddAssignment={handleAddAssignment}
            onUpdateStatus={handleUpdateAssignmentStatus}
            onDeleteAssignment={handleDeleteAssignment}
          />
        );
      case "notes":
        return (
          <NotesView
            subjects={subjects}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      case "flashcards":
        return (
          <FlashcardsView
            subjects={subjects}
            flashcards={flashcards}
            onSetFlashcards={setFlashcards}
            onToggleMastered={handleToggleFlashcardMastered}
          />
        );
      case "quiz":
        return (
          <QuizView 
            subjects={subjects} 
          />
        );
      default:
        return <div className="p-8 text-center text-slate-500 font-sans">Tab in preparation...</div>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex font-sans text-slate-850 overflow-hidden antialiased">
      
      {/* High Density Dark Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0F172A] flex-col text-slate-350 border-r border-slate-800/80 shrink-0">
        
        {/* Brand Banner */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-extrabold text-sm tracking-wide shadow-md">
            C
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight block">ClassWork.md</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase block mt-0.5">Desktop workspace</span>
          </div>
        </div>

        {/* Sidebar Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Workspaces
          </div>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-450 shrink-0" />
            Active Desktop
          </button>

          <button
            onClick={() => setActiveTab("timetable")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "timetable"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <CalendarDays className="w-4 h-4 text-indigo-450 shrink-0" />
            Class Schedule
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "assignments"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="w-4 h-4 text-indigo-450 shrink-0" />
            Homework Log
          </button>

          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-5">
            Gemini Study Aids
          </div>

          <button
            onClick={() => setActiveTab("notes")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-450 shrink-0" />
            Refine Messy Notes
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "flashcards"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <RefreshCw className="w-4 h-4 text-indigo-450 shrink-0" />
            Active Recall Deck
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "quiz"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-450 shrink-0" />
            Practice Exams
          </button>

          {/* Favorites Course Quick Labels list */}
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-5">
            Active Syllabi
          </div>
          <div className="space-y-1 font-sans text-xs px-2.5">
            {subjects.map((s) => (
              <div key={s.id} className="text-slate-400 py-1 flex items-center gap-2 truncate opacity-80">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-505" style={{ backgroundColor: s.color === "violet" ? "#8b5cf6" : s.color === "emerald" ? "#10b981" : s.color === "sky" ? "#0ea5e9" : s.color === "amber" ? "#f59e0b" : s.color === "rose" ? "#f43f5e" : "#4f46e5" }} />
                <span className="truncate">{s.name}</span>
              </div>
            ))}
            {subjects.length === 0 && (
              <p className="text-[10px] text-slate-550 italic">No course registered</p>
            )}
          </div>
        </nav>

        {/* User Card Segment */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 border border-slate-800 rounded-xl">
            <div className="w-9 h-9 bg-indigo-400 text-slate-900 rounded-full border-2 border-slate-700 font-extrabold flex items-center justify-center text-xs">
              AT
            </div>
            <div className="flex-1 overflow-hidden font-sans">
              <p className="text-xs font-bold text-white truncate">Alex Thompson</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Student Desk</p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main viewport Container */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* High Density Desktop Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-xs z-10 shrink-0">
          <div className="flex items-center gap-4">
            
            {/* Sidebar toggle or mobile label */}
            <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="md:hidden w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">C</span>
              Classwork Organizer
            </h1>

            {/* Attendance term tag */}
            <div className="hidden sm:flex items-center bg-slate-50 rounded-full px-3 py-1 gap-1.5 border border-slate-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fall Term 2026 · Week 08</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right flex flex-col justify-center font-sans pr-2 border-r border-slate-200/80">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Current cumulative GPA</p>
              <p className="text-sm md:text-base font-black text-slate-900 leading-none mt-0.5">3.84</p>
            </div>

            <button 
              onClick={() => setActiveTab("notes")}
              className="p-2 md:px-3 md:py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              + Quick Note
            </button>
          </div>
        </header>

        {/* Small Navigation bar on screens too narrow for sidebar */}
        <div className="md:hidden bg-[#0F172A] px-4 py-2 border-b border-slate-800 overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition ${
              activeTab === "dashboard" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("timetable")}
            className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition ${
              activeTab === "timetable" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Schedule
          </button>
          <button 
            onClick={() => setActiveTab("assignments")}
            className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition ${
              activeTab === "assignments" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Homework
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition ${
              activeTab === "notes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Guides
          </button>
          <button 
            onClick={() => setActiveTab("flashcards")}
            className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition ${
              activeTab === "flashcards" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Recall
          </button>
          <button 
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1 rounded text-[11px] font-bold shrink-0 transition ${
              activeTab === "quiz" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Quizzes
          </button>
        </div>

        {/* Workspace Canvas Frame */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-12">
          {renderMainContent()}
        </div>

      </main>
    </div>
  );
}
