export type Role = "student" | "lecturer" | "admin";
export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
export const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export interface Slot { day: Day; start: number; end: number; room: string }
export interface Department { id: string; code: string; name: string; head: string }
export interface Course {
  id: string; code: string; title: string; description: string; credits: number;
  deptId: string; semester: number; semesterId?: string; capacity: number; lecturerId: string | null; slots: Slot[];
}
export interface Student {
  id: string; name: string; email: string; deptId: string; year: number; active: boolean; phone: string;
}
export interface Lecturer { id: string; name: string; email: string; deptId: string; title: string; active: boolean }
export interface Semester { id: string; name: string; opens: string; closes: string; status: "upcoming" | "active" | "closed" }
export type RegStatus = "approved" | "pending" | "rejected";
export interface Registration { id: string; studentId: string; courseId: string; status: RegStatus; date: string; grade?: number | null }
export interface Announcement { id: string; title: string; body: string; author: string; audience: string; date: string }
export interface Activity { id: string; text: string; date: string }
export interface Notification { id: string; userId: string; text: string; date: string; read: boolean }
export interface Settings { creditLimit: number; requireApproval: boolean; university: string }
export interface Account { username: string; email: string; password: string; role: Role; refId: string }

export const defaultSettings: Settings = { creditLimit: 18, requireApproval: false, university: "Addis Valley University" };

export const fmtTime = (h: number) => `${String(h).padStart(2, "0")}:00`;
export function slotsOverlap(a: Slot, b: Slot) { return a.day === b.day && a.start < b.end && b.start < a.end; }
export function gradeLetter(g: number) {
  if (g >= 90) return { letter: "A", points: 4 }; if (g >= 85) return { letter: "A-", points: 3.75 };
  if (g >= 80) return { letter: "B+", points: 3.5 }; if (g >= 75) return { letter: "B", points: 3 };
  if (g >= 70) return { letter: "C+", points: 2.5 }; if (g >= 60) return { letter: "C", points: 2 };
  if (g >= 50) return { letter: "D", points: 1 }; return { letter: "F", points: 0 };
}
export function checkRegistration(opts: {
  course: Course; studentId: string; registrations: Registration[]; courses: Course[]; creditLimit: number;
}): string | null {
  const { course, studentId, registrations: regs, courses: all, creditLimit } = opts;
  const mine = regs.filter((r) => r.studentId === studentId && r.status !== "rejected");
  if (mine.some((r) => r.courseId === course.id)) return `You are already registered for ${course.code}.`;
  const taken = regs.filter((r) => r.courseId === course.id && r.status !== "rejected").length;
  if (taken >= course.capacity) return `${course.code} is full.`;
  const myCourses = mine.map((r) => all.find((x) => x.id === r.courseId)).filter(Boolean) as Course[];
  const credits = myCourses.reduce((s, x) => s + x.credits, 0);
  if (credits + course.credits > creditLimit) return `Adding ${course.code} would exceed your ${creditLimit} credit-hour limit.`;
  for (const other of myCourses) for (const a of course.slots) for (const b of other.slots)
    if (slotsOverlap(a, b)) return `Timetable conflict with ${other.code} on ${a.day} ${fmtTime(Math.max(a.start, b.start))}.`;
  return null;
}
