import React, { useState } from "react";
import { Subject, Assignment } from "../types";
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle, Filter, Search, Calendar, ChevronDown } from "lucide-react";

interface AssignmentsProps {
  subjects: Subject[];
  assignments: Assignment[];
  onAddAssignment: (assignment: Omit<Assignment, "id" | "status">) => void;
  onUpdateStatus: (id: string, status: Assignment["status"]) => void;
  onDeleteAssignment: (id: string) => void;
}

export default function Assignments({
  subjects,
  assignments,
  onAddAssignment,
  onUpdateStatus,
  onDeleteAssignment,
}: AssignmentsProps) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Assignment["priority"]>("Medium");
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [subjFilter, setSubjFilter] = useState("all");
  const [priFilter, setPriFilter] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectId) return;

    onAddAssignment({
      title,
      subjectId,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      priority,
      notes: notes || undefined,
    });

    setTitle("");
    setDueDate("");
    setNotes("");
    setIsAdding(false);
  };

  const filteredAssignments = React.useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubj = subjFilter === "all" || a.subjectId === subjFilter;
      const matchesPri = priFilter === "all" || a.priority === priFilter;
      return matchesSearch && matchesSubj && matchesPri;
    });
  }, [assignments, searchQuery, subjFilter, priFilter]);

  const getSubject = (subId: string) => {
    return subjects.find((s) => s.id === subId);
  };

  const getPriorityBadge = (pri: Assignment["priority"]) => {
    const styles: Record<Assignment["priority"], string> = {
      High: "bg-red-50 text-red-700 border-red-200",
      Medium: "bg-amber-50 text-amber-700 border-amber-200",
      Low: "bg-slate-50 text-slate-600 border-slate-200",
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${styles[pri]}`}>
        {pri}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Assignment Board & homework Desk</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Group by deadlines, track statuses across stages, and balance homework priorities.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (subjects.length > 0 && !subjectId) setSubjectId(subjects[0].id);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Assignment
        </button>
      </div>

      {/* Slide-out Add Assignment Desk Panel */}
      {isAdding && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">Add Work Item</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Chapters 1-4 and submit summary sheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Select Class Track
                </label>
                {subjects.length === 0 ? (
                  <p className="text-xs text-rose-500 py-1 font-semibold">Please add a course subject on the Calendar tab first.</p>
                ) : (
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-sans"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Due Calendar Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Urgency / Priority
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  {(["Low", "Medium", "High"] as const).map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setPriority(pri)}
                      className={`flex-1 text-center py-1 text-[11px] font-semibold rounded-md transition ${
                        priority === pri ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Sub-Task Notes / Prompts
                </label>
                <input
                  type="text"
                  placeholder="Form groups, attach PDF..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-md font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subjects.length === 0}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-slate-350 cursor-pointer font-sans"
              >
                Add Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Live Filtering & Searching controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 uppercase font-bold">Class:</span>
          </div>
          <select
            value={subjFilter}
            onChange={(e) => setSubjFilter(e.target.value)}
            className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-sans"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="text-[11px] text-slate-500 uppercase font-bold">Priority:</span>
          <select
            value={priFilter}
            onChange={(e) => setPriFilter(e.target.value)}
            className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none font-sans"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban styled columns for status tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Column 1: TODO */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-400 rounded-full" /> Todo Tasks
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
              {filteredAssignments.filter((a) => a.status === "Todo").length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {filteredAssignments.filter((a) => a.status === "Todo").length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-sans">
                No assignments in queue.
              </div>
            ) : (
              filteredAssignments
                .filter((a) => a.status === "Todo")
                .map((a) => (
                  <AssignmentCard 
                    key={a.id} 
                    assignment={a} 
                    subject={getSubject(a.subjectId)}
                    onUpdateStatus={onUpdateStatus}
                    onDeleteAssignment={onDeleteAssignment}
                    getPriorityBadge={getPriorityBadge}
                  />
                ))
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" /> Doing / Study Track
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
              {filteredAssignments.filter((a) => a.status === "In-Progress").length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {filteredAssignments.filter((a) => a.status === "In-Progress").length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-sans">
                Empty lane. Tap "Start Task" on items.
              </div>
            ) : (
              filteredAssignments
                .filter((a) => a.status === "In-Progress")
                .map((a) => (
                  <AssignmentCard 
                    key={a.id} 
                    assignment={a} 
                    subject={getSubject(a.subjectId)}
                    onUpdateStatus={onUpdateStatus}
                    onDeleteAssignment={onDeleteAssignment}
                    getPriorityBadge={getPriorityBadge}
                  />
                ))
            )}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Submitted
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
              {filteredAssignments.filter((a) => a.status === "Completed").length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {filteredAssignments.filter((a) => a.status === "Completed").length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-sans">
                Nothing submitted to the instructor yet.
              </div>
            ) : (
              filteredAssignments
                .filter((a) => a.status === "Completed")
                .map((a) => (
                  <AssignmentCard 
                    key={a.id} 
                    assignment={a} 
                    subject={getSubject(a.subjectId)}
                    onUpdateStatus={onUpdateStatus}
                    onDeleteAssignment={onDeleteAssignment}
                    getPriorityBadge={getPriorityBadge}
                  />
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline Sub-Component for individual items
interface CardProps {
  key?: string;
  assignment: Assignment;
  subject?: Subject;
  onUpdateStatus: (id: string, status: Assignment["status"]) => void;
  onDeleteAssignment: (id: string) => void;
  getPriorityBadge: (pri: Assignment["priority"]) => React.ReactNode;
}

function AssignmentCard({
  assignment,
  subject,
  onUpdateStatus,
  onDeleteAssignment,
  getPriorityBadge,
}: CardProps) {
  const isOverdue = assignment.status !== "Completed" && 
                    new Date(assignment.dueDate).getTime() < new Date().setHours(0,0,0,0);

  return (
    <div className={`p-4 rounded-xl border bg-white shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all ${
      isOverdue ? "border-red-200 bg-red-50/5" : "border-slate-150"
    }`}>
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-1.5">
            {subject && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                {subject.name}
              </span>
            )}
            {getPriorityBadge(assignment.priority)}
          </div>
          <h4 className={`font-semibold text-slate-900 text-xs sm:text-sm line-clamp-3 leading-snug ${
            assignment.status === "Completed" ? "line-through opacity-50" : ""
          }`}>
            {assignment.title}
          </h4>
        </div>
        <button
          onClick={() => onDeleteAssignment(assignment.id)}
          className="p-1 cursor-pointer text-slate-300 hover:text-red-500 rounded hover:bg-slate-100 transition shrink-0"
          title="Delete assignment"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {assignment.notes && (
        <p className="mt-2 text-[11px] text-slate-500 line-clamp-3 font-sans leading-relaxed bg-slate-50/75 p-1.5 rounded border border-slate-100/50">
          {assignment.notes}
        </p>
      )}

      {/* Date and Action Controls */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className={isOverdue ? "text-red-650 font-bold" : ""}>
            Due {assignment.dueDate} {isOverdue ? "(Overdue!)" : ""}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {assignment.status !== "Todo" && (
            <button
              onClick={() => onUpdateStatus(assignment.id, "Todo")}
              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition font-sans hover:cursor-pointer"
            >
              Reset
            </button>
          )}
          {assignment.status !== "In-Progress" && assignment.status !== "Completed" && (
            <button
              onClick={() => onUpdateStatus(assignment.id, "In-Progress")}
              className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-semibold px-2 py-1 rounded transition font-sans hover:cursor-pointer"
            >
              Start
            </button>
          )}
          {assignment.status !== "Completed" && (
            <button
              onClick={() => onUpdateStatus(assignment.id, "Completed")}
              className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded transition font-sans hover:cursor-pointer flex items-center gap-0.5"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
