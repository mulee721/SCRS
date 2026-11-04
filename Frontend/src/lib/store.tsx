import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as D from "./data";
import axios from "axios";

// ─── Backend API client ───────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
type ApiRecord = any;

function authHeaders() {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("access_token") ?? sessionStorage.getItem("access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function apiFetch<T>(path: string): Promise<T[]> {
  const r = await axios.get(`${API}${path}`, { headers: authHeaders() });
  const payload = r.data?.data ?? r.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

// ─── Shape adapters — map MongoDB _id to id expected by UI ───────────────────
function mapDept(d: ApiRecord): D.Department {
  return { id: d._id ?? d.id, code: d.code, name: d.name, head: d.head ?? "" };
}
function mapStudent(s: ApiRecord): D.Student {
  const deptId = s.departmentId?._id ?? s.departmentId ?? "";
  return { id: s._id ?? s.id, name: s.name, email: s.email, deptId, year: s.academicYear ?? s.year ?? 1, active: s.isActive ?? s.active ?? true, phone: s.phone ?? "" };
}
function mapLecturer(l: ApiRecord): D.Lecturer {
  const deptId = l.departmentId?._id ?? l.departmentId ?? "";
  return { id: l._id ?? l.id, name: l.name, email: l.email, deptId, title: l.title ?? "Lecturer", active: l.isActive ?? l.active ?? true };
}
function mapCourse(c: ApiRecord): D.Course {
  const deptId = c.departmentId?._id ?? c.departmentId ?? "";
  const lecturerId = c.lecturerId?._id ?? c.lecturerId ?? null;
  return {
    id: c._id ?? c.id,
    code: c.code,
    title: c.title,
    description: c.description ?? "",
    credits: c.credits ?? 3,
    deptId,
    semester: c.semester ?? c.semesterId?.name ?? 1,
    semesterId: c.semesterId?._id ?? c.semesterId,
    capacity: c.capacity ?? 30,
    lecturerId,
    slots: (Array.isArray(c.slots) ? c.slots : []).map((slot: ApiRecord) => {
      const item = slot as ApiRecord;
      return {
        day: item.day as D.Day,
        start: Number(item.start ?? item.startTime),
        end: Number(item.end ?? item.endTime),
        room: String(item.room ?? ""),
      };
    }),
  };
}
function mapSemester(s: ApiRecord): D.Semester {
  return { id: s._id ?? s.id, name: s.name, opens: s.opens ?? s.startDate ?? "", closes: s.closes ?? s.endDate ?? "", status: s.status ?? "upcoming" };
}
function mapReg(r: ApiRecord): D.Registration {
  const studentId = r.studentId?._id ?? r.studentId ?? "";
  const courseId  = r.courseId?._id  ?? r.courseId  ?? "";
  return { id: r._id ?? r.id, studentId, courseId, status: r.status ?? "pending", date: r.date ?? r.registrationDate?.slice(0, 10) ?? r.createdAt?.slice(0, 10) ?? "" };
}
function mapAnn(a: ApiRecord): D.Announcement {
  return { id: a._id ?? a.id, title: a.title, body: a.body, author: a.author ?? "Admin", audience: a.audience ?? "All", date: a.date ?? a.createdAt?.slice(0, 10) ?? "" };
}

// ─── State shape ─────────────────────────────────────────────────────────────
interface State {
  departments: D.Department[]; courses: D.Course[]; students: D.Student[]; lecturers: D.Lecturer[];
  semesters: D.Semester[]; registrations: D.Registration[]; announcements: D.Announcement[];
  activities: D.Activity[]; notifications: D.Notification[]; settings: D.Settings;
}
export interface Session {
  role: D.Role;
  refId: string;
  name: string;
  email: string;
  token: string;
  refreshToken?: string;
}

const EMPTY: State = {
  departments: [], courses: [], students: [], lecturers: [], semesters: [],
  registrations: [], announcements: [], activities: [], notifications: [],
  settings: D.defaultSettings,
};

const SKEY = "scrs-session";
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);

// ─── Admin API helpers (called from AdminApp.tsx) ────────────────────────────
export const adminApi = {
  // reload all data after a mutation — uses current localStorage token
  async reload(): Promise<Partial<State>> {
    const h = authHeaders();
    const [depts, lecs, crss, sems, anns, studs, regs] = await Promise.all([
      axios.get(`${API}/departments`,   { headers: h }).then(r => r.data?.data ?? []),
      axios.get(`${API}/lecturers`,     { headers: h }).then(r => r.data?.data ?? []),
      axios.get(`${API}/courses`,       { headers: h }).then(r => r.data?.data ?? []),
      axios.get(`${API}/semesters`,     { headers: h }).then(r => r.data?.data ?? []),
      axios.get(`${API}/announcements`, { headers: h }).then(r => r.data?.data ?? []),
      axios.get(`${API}/students`,      { headers: h }).then(r => r.data?.data ?? []),
      axios.get(`${API}/registrations`, { headers: h }).then(r => r.data?.data ?? []),
    ]);
    return {
      departments:   depts.map(mapDept),
      lecturers:     lecs.map(mapLecturer),
      courses:       crss.map(mapCourse),
      semesters:     sems.map(mapSemester),
      announcements: anns.map(mapAnn),
      students:      studs.map(mapStudent),
      registrations: regs.map(mapReg),
    };
  },
  post:   (path: string, body: any) => axios.post(`${API}${path}`,  body, { headers: authHeaders() }),
  patch:  (path: string, body: any) => axios.patch(`${API}${path}`, body, { headers: authHeaders() }),
  delete: (path: string)            => axios.delete(`${API}${path}`,      { headers: authHeaders() }),
};

interface Ctx extends State {
  ready: boolean;
  session: Session | null;
  login:  (id: string, pw: string, remember: boolean) => Promise<Session>;
  logout: () => Promise<void>;
  registerStudent: (s: { name: string; email: string; phone: string; deptId: string; year: number; password: string }) => Promise<void>;
  update: (fn: (s: State) => Partial<State>) => void;
  log:    (text: string) => void;
  uid:    () => string;
  reset:  () => void;
  reloadAll: () => Promise<void>;
  registerCourse: (courseId: string, semesterId: string) => Promise<void>;
  dropCourse: (registrationId: string) => Promise<void>;
  updateMyProfile: (data: { name: string; phone: string }) => Promise<void>;
}

const StoreCtx = createContext<Ctx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state,   setState]   = useState<State>(EMPTY);
  const [session, setSession] = useState<Session | null>(null);
  const [ready,   setReady]   = useState(false);

  // ── 1. Restore session from storage (client only) ──────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(SKEY) ?? sessionStorage.getItem(SKEY);
    if (raw) {
      try { setSession(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setReady(true);
  }, []);

  // Departments are public because the registration form needs them before login.
  useEffect(() => {
    apiFetch("/departments")
      .then((departments) => {
        setState((current) => ({ ...current, departments: departments.map(mapDept) }));
      })
      .catch((error) => console.error("Failed to load departments", error));
  }, []);

  // ── 2. Load authenticated data from backend whenever a session is present ──
  useEffect(() => {
    if (!session?.token) return;
    (async () => {
      const requests = [
        apiFetch("/departments"),
        apiFetch("/lecturers"),
        apiFetch("/courses"),
        apiFetch("/semesters"),
        apiFetch("/announcements"),
        session.role === "admin" ? apiFetch("/students") : apiFetch("/students/my-profile"),
        session.role === "admin" ? apiFetch("/registrations") : apiFetch("/registrations/my-registrations"),
      ];
      const results = await Promise.allSettled(requests);
      const [depts, lecturers, courses, semesters, anns, students, regs] = results.map((result) => {
        if (result.status === "fulfilled") return result.value;
        console.error("Failed to load dashboard data", result.reason);
        return [];
      });
      setState((s) => ({
        ...s,
        departments:   depts.map(mapDept),
        students:      students.map(mapStudent),
        lecturers:     lecturers.map(mapLecturer),
        courses:       courses.map(mapCourse),
        semesters:     semesters.map(mapSemester),
        registrations: regs.map(mapReg),
        announcements: anns.map(mapAnn),
      }));
    })();
  }, [session?.token]);

  const value = useMemo<Ctx>(() => {
    const update: Ctx["update"] = (fn) => setState((s) => ({ ...s, ...fn(s) }));
    const log = (text: string) =>
      update((s) => ({ activities: [{ id: uid(), text, date: today() }, ...s.activities].slice(0, 30) }));

    return {
      ...state, ready, session, update, log, uid,

      // ── LOGIN ──────────────────────────────────────────────────────────────
      login: async (identifier, password, remember) => {
        // Clear any stale tokens first so the login request goes unauthenticated
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        try {
          const res = await axios.post(`${API}/auth/login`, { identifier, password });
          const data = res.data?.data;
          if (!data?.access_token) throw new Error("No token returned");

          const sess: Session = {
            role:  (data.user?.role ?? "student") as D.Role,
            refId: data.user?.refId ?? data.user?.id ?? data.user?.email ?? identifier,
            name:  data.user?.name ?? "User",
            email: data.user?.email ?? identifier,
            token: data.access_token,
            refreshToken: data.refresh_token,
          };
          const storage = remember ? localStorage : sessionStorage;
          storage.setItem("access_token", data.access_token);
          storage.setItem(SKEY, JSON.stringify(sess));
          setSession(sess);
          log(`${sess.name} logged in`);
          return sess;
        } catch (err: any) {
          const msg = err.response?.data?.message ?? err.message ?? "Login failed";
          throw new Error(msg);
        }
      },

      // ── LOGOUT ─────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await axios.post(
            `${API}/auth/logout`,
            { refresh_token: session?.refreshToken },
            { headers: authHeaders() },
          );
        } catch (error) {
          console.error("Logout request failed", error);
        }
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        localStorage.removeItem(SKEY);
        sessionStorage.removeItem(SKEY);
        setSession(null);
        setState(EMPTY);
      },

      // ── REGISTER STUDENT ───────────────────────────────────────────────────
      registerStudent: async ({ name, email, phone, deptId, year, password }) => {
        const res = await axios.post(`${API}/auth/register`, {
          name, email, password, phone,
          departmentId: deptId, academicYear: year,
        });
        const data = res.data?.data;
        if (!data?.access_token) throw new Error("Registration failed");
        localStorage.setItem("access_token", data.access_token);
        const sess: Session = {
          role: "student", refId: data.user?.refId ?? data.user?.id ?? email,
          name: data.user?.name ?? name, email: data.user?.email ?? email,
          token: data.access_token,
          refreshToken: data.refresh_token,
        };
        localStorage.setItem(SKEY, JSON.stringify(sess));
        setSession(sess);
        log(`Student ${name} registered`);
      },

      registerCourse: async (courseId, semesterId) => {
        const res = await axios.post(
          `${API}/registrations`,
          { courseId, semesterId },
          { headers: authHeaders() },
        );
        const payload = res.data?.data ?? res.data;
        const registration = payload?.data ?? payload;
        if (!registration?._id && !registration?.id) {
          throw new Error("The registration response was invalid");
        }
        setState((current) => ({
          ...current,
          registrations: [...current.registrations, mapReg(registration)],
        }));
      },

      dropCourse: async (registrationId) => {
        await axios.delete(`${API}/registrations/${registrationId}`, {
          headers: authHeaders(),
        });
        setState((current) => ({
          ...current,
          registrations: current.registrations.filter((r) => r.id !== registrationId),
        }));
      },

      updateMyProfile: async (data) => {
        const res = await axios.patch(`${API}/students/my-profile`, data, {
          headers: authHeaders(),
        });
        const student = res.data?.data ?? res.data;
        setState((current) => ({
          ...current,
          students: current.students.map((item) =>
            item.id === session?.refId ? mapStudent(student) : item,
          ),
        }));
      },

      // ── RESET (dev helper) ─────────────────────────────────────────────────
      reset: () => setState(EMPTY),

      // ── RELOAD ALL (called by admin after mutations) ────────────────────────
      reloadAll: async () => {
        const fresh = await adminApi.reload();
        setState((s) => ({ ...s, ...fresh }));
      },
    };
  }, [state, ready, session]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
