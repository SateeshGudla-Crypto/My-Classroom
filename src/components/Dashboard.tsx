import React from "react";
import { Subject, Assignment, ScheduleItem } from "../types";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Flame, 
  GraduationCap,
  Sparkles
} from "lucide-react";

interface DashboardProps {
  subjects: Subject[];
  assignments: Assignment[];
  schedule: ScheduleItem[];
  setActiveTab: (tab: string) => void;
  onQuickAddAssignment: (title: string, subjectId: string, dueDate: string) => void;
}

export default function Dashboard({
  subjects,
  assignments,
  schedule,
  setActiveTab,
  onQuickAddAssignment,
}: DashboardProps) {
  const [quickTitle, setQuickTitle] = React.useState("");
  const [quickSub, setQuickSub] = React.useState("");
  const [quickDate, setQuickDate] = React.useState("");

  // Get current day of the week
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  // Set default simulated day to Tuesday as per system metadata if it matches school week
  const currentDayIndex = new Date().getDay();
  const dayName = days[currentDayIndex];
  const schoolDayName = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(dayName) 
    ? dayName 
    : "Monday";

  // Calculate statistics
  const totalTasks = assignments.length;
  const completedTasks = assignments.filter((a) => a.status === "Completed").length;
  const inProgressTasks = assignments.filter((a) => a.status === "In-Progress").length;
  const pendingTasks = assignments.filter((a) => a.status === "Todo").length;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Urgent assignments (due in next 3 days, not completed)
  const urgentAssignments = React.useMemo(() => {
    return assignments
      .filter((a) => a.status !== "Completed")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [assignments]);

  // Today's classes
  const todaysClasses = React.useMemo(() => {
    return schedule
      .filter((s) => s.dayOfWeek === schoolDayName)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule, schoolDayName]);

  const getSubject = (subId: string) => {
    return subjects.find((s) => s.id === subId);
  };

  const getSubjectColor = (colorName: string) => {
    const map: Record<string, string> = {
      violet: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      sky: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
      amber: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      rose: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    };
    return map[colorName] || "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
  };

  const submitQuickAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle || !quickSub) return;
    const dateStr = quickDate || new Date().toISOString().split("T")[0];
    onQuickAddAssignment(quickTitle, quickSub, dateStr);
    setQuickTitle("");
    setQuickSub(quickSub); // keep subject selected for fast sequential adding
    alert("Assignment added successfully!");
  };

  return (
    <div id="school-dashboard" className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center border border-indigo-950/40 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-indigo-200 font-mono text-xs rounded-full border border-white/10 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Study Engine Ready
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Active Student Desktop</h1>
          <p className="text-slate-200 max-w-lg text-sm md:text-base font-sans">
            Organize lectures, structure notes with Gemini, generate mock practice exams, and stay on top of daily homework tasks.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 font-sans relative z-10 backdrop-blur-sm self-stretch md:self-auto">
          <Calendar className="w-10 h-10 text-indigo-300 shrink-0" />
          <div>
            <div className="text-xs text-indigo-200 font-mono uppercase tracking-wider">{dayName}</div>
            <div className="text-lg font-semibold">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            <div className="text-xs text-slate-300 mt-0.5">Academic Calendar Term</div>
          </div>
        </div>
      </div>

      {/* Stats Board & Metric Circle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Completion dial card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-500">Term Progress</div>
            <div className="text-3xl font-bold text-slate-900">{percentComplete}%</div>
            <span className="text-xs text-slate-400">Of homework done</span>
          </div>
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            {/* SVG circle gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-slate-100"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-indigo-600 transition-all duration-500"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={163}
                strokeDashoffset={163 - (163 * percentComplete) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-semibold text-indigo-700">{percentComplete}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Due/Unfinished</div>
            <div className="text-2xl font-bold text-slate-900">{totalTasks - completedTasks} Tasks</div>
            <span className="text-xs text-slate-400">Requires completion</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Subject Load</div>
            <div className="text-2xl font-bold text-slate-900">{subjects.length} Courses</div>
            <span className="text-xs text-slate-400">Active study tracks</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Completed</div>
            <div className="text-2xl font-bold text-slate-900">{completedTasks} Homework</div>
            <span className="text-xs text-emerald-600 font-medium">Clear of backlog</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Schedule Today & Urgent Work */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Schedule Segment */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-lg">Today's Class Schedule ({schoolDayName})</h3>
              </div>
              <button 
                onClick={() => setActiveTab("timetable")}
                className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800"
              >
                Full Calendar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysClasses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No classes scheduled for today. Ready for independent study notes!
              </div>
            ) : (
              <div className="space-y-3">
                {todaysClasses.map((item) => {
                  const sub = getSubject(item.subjectId);
                  if (!sub) return null;
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${getSubjectColor(sub.color)}`}>
                          {sub.name}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {sub.name} Course Session
                          </p>
                          <p className="text-xs text-slate-400">
                            With Teacher: <span className="font-medium text-slate-600">{sub.teacher}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-sm inline-flex items-center gap-1">
                          {item.startTime} - {item.endTime}
                        </span>
                        {item.room && (
                          <p className="text-[10px] text-slate-400 mt-1 font-sans">
                            Room {item.room}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Urgent Assignments Segment */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-slate-900 text-lg">Urgent Assignments</h3>
              </div>
              <button 
                onClick={() => setActiveTab("assignments")}
                className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800"
              >
                Go to Tracker <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentAssignments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No outstanding urgent tasks. All caught up!
              </div>
            ) : (
              <div className="space-y-3">
                {urgentAssignments.map((a) => {
                  const sub = getSubject(a.subjectId);
                  const isOverdue = new Date(a.dueDate).getTime() < new Date().setHours(0,0,0,0);
                  return (
                    <div 
                      key={a.id} 
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        isOverdue ? "border-red-200 bg-red-50/20" : "border-slate-150 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            a.priority === "High" ? "bg-red-100 text-red-700" : 
                            a.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-150 text-slate-600"
                          }`}>
                            {a.priority} Priority
                          </span>
                          {sub && (
                            <span className="text-xs text-slate-500 font-medium">
                              • {sub.name}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{a.title}</h4>
                      </div>
                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          isOverdue ? "bg-red-100 text-red-800 font-bold" : "bg-amber-50 text-amber-800"
                        }`}>
                          Due: {a.dueDate} {isOverdue ? "(Overdue)" : ""}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                          Status: {a.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Quick Add & AI Revision Launcher */}
        <div className="space-y-6">
          
          {/* Interactive AI Revision Shortcuts */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-indigo-100/40 rounded-bl-2xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            
            <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-1.5 mb-2">
              <GraduationCap className="w-5 h-5 text-indigo-700" /> AI Classroom Helper
            </h3>
            <p className="text-xs text-indigo-700/80 mb-4 font-sans">
              Test your mock classroom notes using server-side Gemini generation.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => setActiveTab("notes")}
                className="w-full text-left p-3 bg-white hover:bg-indigo-100/40 border border-indigo-200/60 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-indigo-900">1. Refine messy lecture notes</div>
                  <div className="text-[11px] text-slate-500">Transform raw drafts to beautiful Markdown</div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </button>

              <button
                onClick={() => setActiveTab("flashcards")}
                className="w-full text-left p-3 bg-white hover:bg-indigo-100/40 border border-indigo-200/60 rounded-xl transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-indigo-900">2. Generate Smart Interactive Cards</div>
                  <div className="text-[11px] text-slate-500">Create exactly 6 flashcards on any topic</div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </button>

              <button
                onClick={() => setActiveTab("quiz")}
                className="w-full text-left p-3 bg-white hover:bg-slate-55 flex items-center justify-between hover:bg-indigo-100/40 border border-indigo-200/60 rounded-xl transition"
              >
                <div>
                  <div className="text-xs font-bold text-indigo-900">3. Create mock multiple-choice quiz</div>
                  <div className="text-[11px] text-slate-500">Generate 5 questions with direct AI feedback</div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>

          {/* Quick Add Homework form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2 mb-1.5">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Quick Assignment
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-sans">
              Instantly create a homework assignment for any active class.
            </p>

            {subjects.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                You need to create a Subject first! Go to the Class Timetable tab.
              </p>
            ) : (
              <form onSubmit={submitQuickAssignment} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Assignment Name
                  </label>
                  <input
                    type="text"
                    required
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="e.g. Solve Chapter 4 Exercises"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Subject Track
                    </label>
                    <select
                      required
                      value={quickSub}
                      onChange={(e) => setQuickSub(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-indigo-500 font-sans"
                    >
                      <option value="">Select Class...</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-lg py-2 text-xs font-semibold hover:bg-indigo-950 transition-all font-sans"
                >
                  Create Homework Item
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
