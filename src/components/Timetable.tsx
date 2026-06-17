import React, { useState } from "react";
import { Subject, ScheduleItem } from "../types";
import { Plus, Trash2, Calendar, BookOpen, Clock, MapPin, User, Tag } from "lucide-react";

interface TimetableProps {
  subjects: Subject[];
  schedule: ScheduleItem[];
  onAddSubject: (subj: Omit<Subject, "id">) => void;
  onDeleteSubject: (id: string) => void;
  onAddScheduleItem: (item: Omit<ScheduleItem, "id">) => void;
  onDeleteScheduleItem: (id: string) => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export default function Timetable({
  subjects,
  schedule,
  onAddSubject,
  onDeleteSubject,
  onAddScheduleItem,
  onDeleteScheduleItem,
}: TimetableProps) {
  const [activeDay, setActiveDay] = useState<typeof DAYS_OF_WEEK[number]>("Monday");

  // State to add a subject
  const [newSubjName, setNewSubjName] = useState("");
  const [newSubjTeacher, setNewSubjTeacher] = useState("");
  const [newSubjColor, setNewSubjColor] = useState("violet");
  const [newSubjRoom, setNewSubjRoom] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);

  // State to add a schedule slot
  const [schedSubject, setSchedSubject] = useState("");
  const [schedDay, setSchedDay] = useState<typeof DAYS_OF_WEEK[number]>("Monday");
  const [schedStart, setSchedStart] = useState("09:00");
  const [schedEnd, setSchedEnd] = useState("10:30");
  const [schedRoom, setSchedRoom] = useState("");
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  const getSubjectColor = (colorName: string) => {
    const map: Record<string, { bg: string; text: string; border: string; accent: string }> = {
      violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", accent: "bg-violet-600" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "bg-emerald-600" },
      sky: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", accent: "bg-sky-600" },
      amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "bg-amber-600" },
      rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", accent: "bg-rose-600" },
      indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", accent: "bg-indigo-600" },
    };
    return map[colorName] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", accent: "bg-slate-600" };
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName || !newSubjTeacher) return;
    onAddSubject({
      name: newSubjName,
      teacher: newSubjTeacher,
      color: newSubjColor,
      room: newSubjRoom,
    });
    setNewSubjName("");
    setNewSubjTeacher("");
    setNewSubjRoom("");
    setIsAddingSubject(false);
  };

  const handleCreateScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedSubject) {
      alert("Please select a valid subject");
      return;
    }
    onAddScheduleItem({
      subjectId: schedSubject,
      dayOfWeek: schedDay,
      startTime: schedStart,
      endTime: schedEnd,
      room: schedRoom || undefined,
    });
    setSchedRoom("");
    setIsAddingSchedule(false);
  };

  const getSubjectForId = (id: string) => {
    return subjects.find((s) => s.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Class Timetable & Schedule</h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Build course matrices, track professors, and structure daily lecture frequencies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Course Setup
          </button>
          <button
            onClick={() => {
              setIsAddingSchedule(!isAddingSchedule);
              if (subjects.length > 0 && !schedSubject) {
                setSchedSubject(subjects[0].id);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-indigo-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>
      </div>

      {/* Double Drawer Add Containers when toggled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isAddingSubject && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> New Subject Course Track
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Chemistry"
                    value={newSubjName}
                    onChange={(e) => setNewSubjName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Davis"
                    value={newSubjTeacher}
                    onChange={(e) => setNewSubjTeacher(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Optional Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hall C4"
                    value={newSubjRoom}
                    onChange={(e) => setNewSubjRoom(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Color Badge Symbol
                  </label>
                  <select
                    value={newSubjColor}
                    onChange={(e) => setNewSubjColor(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-sans"
                  >
                    <option value="violet">Violet Accent</option>
                    <option value="emerald">Emerald Accent</option>
                    <option value="sky">Sky Blue Accent</option>
                    <option value="amber">Amber Yellow Accent</option>
                    <option value="rose">Rose Red Accent</option>
                    <option value="indigo">Indigo Accent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-sans"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        )}

        {isAddingSchedule && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> New Lectures Schedule Block
            </h3>
            {subjects.length === 0 ? (
              <p className="text-xs text-rose-500 py-4">You must configure at least one Subject Track first before setting schedule slots!</p>
            ) : (
              <form onSubmit={handleCreateScheduleItem} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Choose Subject
                    </label>
                    <select
                      value={schedSubject}
                      onChange={(e) => setSchedSubject(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-sans"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Day of the Week
                    </label>
                    <select
                      value={schedDay}
                      onChange={(e) => setSchedDay(e.target.value as any)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-sans"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="09:00"
                      value={schedStart}
                      onChange={(e) => setSchedStart(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-center focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10:30"
                      value={schedEnd}
                      onChange={(e) => setSchedEnd(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-center focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Classroom Lab
                    </label>
                    <input
                      type="text"
                      placeholder="Room 102"
                      value={schedRoom}
                      onChange={(e) => setSchedRoom(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingSchedule(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-sans"
                  >
                    Confirm Day Slot
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Main Timetable Visual Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Course subjects master side tracker */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-150">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-sm text-slate-800">Course Tracks ({subjects.length})</span>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-sans">
              No subjects established yet. Run "Course Setup" to register a class track.
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((sub) => {
                const styles = getSubjectColor(sub.color);
                return (
                  <div
                    key={sub.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${styles.bg} ${styles.border}`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <p className={`font-semibold text-xs truncate uppercase tracking-wider ${styles.text}`}>{sub.name}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate font-sans">
                        <User className="w-2.5 h-2.5 inline" /> {sub.teacher}
                      </p>
                      {sub.room && (
                        <p className="text-[9px] text-slate-400 flex items-center gap-1 font-sans">
                          <MapPin className="w-2.5 h-2.5 inline" /> Classroom {sub.room}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete subject "${sub.name}"? This removes its timetable and tasks.`)) {
                          onDeleteSubject(sub.id);
                        }
                      }}
                      className="p-1 cursor-pointer text-slate-400 hover:text-red-600 hover:bg-white/90 rounded transition"
                      title="Remove subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly matrix viewer */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Day Selector headers */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {DAYS_OF_WEEK.map((day) => {
              const active = activeDay === day;
              // Check class counts for the day
              const classCount = schedule.filter((s) => s.dayOfWeek === day).length;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-1 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer relative ${
                    active 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.substring(0, 3)}</span>
                  {classCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                      {classCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active schedule blocks listing */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> lectures grid on {activeDay}
            </h3>

            {schedule.filter((s) => s.dayOfWeek === activeDay).length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center text-sm text-slate-400 font-sans">
                Day clear. No lectures or sessions configured on {activeDay}.
              </div>
            ) : (
              <div className="space-y-3">
                {schedule
                  .filter((s) => s.dayOfWeek === activeDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((item) => {
                    const sub = getSubjectForId(item.subjectId);
                    if (!sub) return null;
                    const styles = getSubjectColor(sub.color);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition hover:shadow-2xs ${styles.bg} ${styles.border}`}
                      >
                        {/* Accent border bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.accent}`} />
                        
                        <div className="pl-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded ${styles.bg} border ${styles.border} ${styles.text}`}>
                              {sub.name}
                            </span>
                            {item.room && (
                              <span className="text-xs text-slate-500 font-sans font-medium">
                                • Hall {item.room}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm md:text-base">
                            {sub.name} revision lecture
                          </h4>
                          <p className="text-xs text-slate-500 font-sans">
                            Conducted by Professor {sub.teacher}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/40">
                          <div className="text-left sm:text-right font-sans">
                            <span className="font-mono text-xs font-semibold bg-white/70 text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 inline text-indigo-550" /> {item.startTime} - {item.endTime}
                            </span>
                          </div>
                          <button
                            onClick={() => onDeleteScheduleItem(item.id)}
                            className="p-1.5 cursor-pointer text-slate-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-slate-100 transition"
                            title="Remove period slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
