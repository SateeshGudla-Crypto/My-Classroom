export interface Subject {
  id: string;
  name: string;
  teacher: string;
  color: string; // Tailwind color class names like 'emerald', 'sky', etc.
  room?: string;
}

export interface ScheduleItem {
  id: string;
  subjectId: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  room?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  status: "Todo" | "In-Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  notes?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIdx: number;
  userAnswers: number[]; // chosen indices, -1 for unanswered
  isCompleted: boolean;
}

export interface CourseNote {
  id: string;
  subjectId: string;
  title: string;
  content: string; // Markdown supported
  createdAt: string;
}
