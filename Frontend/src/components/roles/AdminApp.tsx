import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity, BarChart3, BookOpen, Building2, CalendarRange,
  ClipboardList, Download, GraduationCap, LayoutDashboard,
  Loader2, Megaphone, Pencil, Plus, Settings, Trash2, UserCog, Users, Eye,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DAYS, type Course, type Day, type Lecturer, type Semester, type Student, type Department } from "@/lib/data";
import { useStore, adminApi } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { Avatar, Badge, Card, CardHead, Confirm, DataTable, Field, NativeSelect, PageHeader, SearchInput, StatCard } from "@/components/app/kit";
import { AnnouncementList, SettingsPage } from "@/components/app/shared";

export const adminNav: NavItem[] = [
  { section: "overview",       label: "Overview",              icon: LayoutDashboard },
  { section: "students",       label: "Students",              icon: Users },
  { section: "lecturers",      label: "Lecturers",             icon: UserCog },
  { section: "courses",        label: "Courses",               icon: BookOpen },
  { section: "departments",    label: "Departments",           icon: Building2 },
  { section: "semesters",      label: "Semesters",             icon: CalendarRange },
  { section: "registrations",  label: "Registrations",         icon: ClipboardList },
  { section: "reports",        label: "Reports & Analytics",   icon: BarChart3 },
  { section: "announcements",  label: "Announcements",         icon: Megaphone },
  { section: "settings",       label: "System Settings",       icon: Settings },
];

const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 } };
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const today = () => new Date().toISOString().slice(0, 10);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// ── Shared dialog ─────────────────────────────────────────────────────────────
function FormDialog({ open, onOpenChange, title, children, onSave, saving }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  title: string; children: ReactNode;
  onSave: () => void; saving?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  const st = useStore();
  const activeRegs = st.registrations.filter((r) => r.status === "approved").length;
  const byDept = st.departments.map((d) => ({
    name: d.code,
    value: st.registrations.filter((r) => st.courses.find((c) => c.id === r.courseId)?.deptId === d.id).length,
  }));
  const trend = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    registrations: Math.round(st.registrations.length * (0.2 + i * 0.11) + (i % 2) * 6),
  }));
  return (
    <>
      <PageHeader title="Administrator Overview" desc="System at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students"     value={st.students.length}   icon={Users}        hint={`${st.students.filter((s) => s.active).length} active`} />
        <StatCard label="Total lecturers"    value={st.lecturers.length}  icon={UserCog}      tone="navy" />
        <StatCard label="Total courses"      value={st.courses.length}    icon={BookOpen}     tone="warning" />
        <StatCard label="Active registrations" value={activeRegs}         icon={ClipboardList} tone="success" hint={`${st.registrations.filter((r) => r.status === "pending").length} pending`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHead title="Registration trend" desc="Cumulative registrations per week" />
          <div className="h-64 p-4">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.3} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip {...tip} />
                <Area dataKey="registrations" stroke="var(--chart-1)" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHead title="Enrollment by department" />
          <div className="h-64 p-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byDept} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {byDept.map((_, i) => <Cell key={i} fill={COLORS[i % 5]} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 px-4 pb-4 text-xs">
            {byDept.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: COLORS[i % 5] }} />{d.name} ({d.value})
              </span>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <CardHead title="Recent system activity" />
          <ul className="divide-y">
            {st.activities.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <Activity className="size-4 text-primary" />
                <span className="flex-1">{a.text}</span>
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </li>
            ))}
            {st.activities.length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground text-center">No activity yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}

// ── Students ──────────────────────────────────────────────────────────────────
function StudentsMgmt() {
  const st = useStore();
  const [q, setQ] = useState(""); const [dep, setDep] = useState("all"); const [status, setStatus] = useState("all");
  const blank: Student = { id: "", name: "", email: "", deptId: st.departments[0]?.id ?? "", year: 1, active: true, phone: "" };
  const [edit, setEdit]   = useState<Student | null>(null);
  const [view, setView]   = useState<Student | null>(null);
  const [deact, setDeact] = useState<Student | null>(null);
  const [err,   setErr]   = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() =>
    st.students.filter((s) =>
      (q === "" || `${s.name} ${s.id} ${s.email}`.toLowerCase().includes(q.toLowerCase())) &&
      (dep    === "all" || s.deptId === dep) &&
      (status === "all" || (status === "active") === s.active)),
    [st.students, q, dep, status]);

  const dept = (id: string) => st.departments.find((d) => d.id === id)?.name ?? "—";

  const save = async () => {
    if (!edit || !edit.id) return; // add is blocked, only edit
    const e: Record<string, string> = {};
    if (edit.name.trim().length < 3) e.name = "Enter the full name.";
    if (!isEmail(edit.email)) e.email = "Enter a valid email.";
    setErr(e); if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await adminApi.patch(`/students/${edit.id}`, {
        name: edit.name, phone: edit.phone,
        departmentId: edit.deptId, academicYear: edit.year,
      });
      st.log(`Admin updated student ${edit.name}`);
      await st.reloadAll();
      toast.success("Student updated");
      setEdit(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to update student");
    } finally { setSaving(false); }
  };

  const toggleActive = async (s: Student, active: boolean) => {
    try {
      if (active) {
        await adminApi.patch(`/students/${s.id}`, { isActive: true });
      } else {
        await adminApi.delete(`/students/${s.id}`);
      }
      st.log(`Student ${s.name} ${active ? "reactivated" : "deactivated"}`);
      await st.reloadAll();
      toast.success(`${s.name} ${active ? "reactivated" : "deactivated"}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to update status");
    }
    setDeact(null);
  };

  return (
    <>
      <PageHeader title="Student Management" desc={`${st.students.length} students`} />
      <DataTable rows={rows}
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search students…" className="sm:w-72" />
          <div className="flex gap-2 sm:ml-auto">
            <NativeSelect value={dep} onChange={setDep}>
              <option value="all">All departments</option>
              {st.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </NativeSelect>
            <NativeSelect value={status} onChange={setStatus}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </NativeSelect>
          </div>
        </>}
        columns={[
          { key: "n",  header: "Student",    cell: (s) => <div className="flex items-center gap-3"><Avatar name={s.name} /><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div></div> },
          { key: "id", header: "Reg. No",    cell: (s) => s.id },
          { key: "d",  header: "Department", cell: (s) => dept(s.deptId) },
          { key: "y",  header: "Year",       cell: (s) => `Year ${s.year}` },
          { key: "s",  header: "Status",     cell: (s) => <Badge>{s.active ? "Active" : "Inactive"}</Badge> },
          { key: "a",  header: "", className: "text-right", cell: (s) => (
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" className="size-8" onClick={() => setView(s)}><Eye className="size-4" /></Button>
              <Button size="icon" variant="ghost" className="size-8" onClick={() => { setErr({}); setEdit({ ...s }); }}><Pencil className="size-4" /></Button>
              <Button size="sm" variant="ghost" className={s.active ? "text-destructive" : "text-success"}
                onClick={() => s.active ? setDeact(s) : toggleActive(s, true)}>
                {s.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          )},
        ]}
      />

      {/* Edit dialog */}
      <FormDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title="Edit student" onSave={save} saving={saving}>
        {edit && <>
          <div className="sm:col-span-2"><Field label="Full name" error={err.name}><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Email (read-only)"><Input value={edit.email} readOnly className="opacity-60" /></Field></div>
          <Field label="Department">
            <NativeSelect value={edit.deptId} onChange={(v) => setEdit({ ...edit, deptId: v })} className="w-full">
              {st.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Academic year">
            <NativeSelect value={String(edit.year)} onChange={(v) => setEdit({ ...edit, year: Number(v) })} className="w-full">
              {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </NativeSelect>
          </Field>
          <div className="sm:col-span-2"><Field label="Phone"><Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field></div>
        </>}
      </FormDialog>

      {/* View dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.name}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              {[["Reg. No", view.id], ["Email", view.email], ["Department", dept(view.deptId)], ["Year", `Year ${view.year}`], ["Phone", view.phone || "—"], ["Status", view.active ? "Active" : "Inactive"]]
                .map(([k, v]) => <div key={String(k)} className="flex justify-between border-b pb-2"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}
              <p className="pt-2 font-semibold">Registered courses</p>
              {st.registrations.filter((r) => r.studentId === view.id).map((r) => (
                <div key={r.id} className="flex justify-between">
                  <span>{st.courses.find((c) => c.id === r.courseId)?.code}</span>
                  <Badge>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Confirm open={!!deact} onOpenChange={(o) => !o && setDeact(null)} destructive
        title={`Deactivate ${deact?.name}?`}
        desc="They will no longer be able to sign in or register for courses."
        confirmLabel="Deactivate"
        onConfirm={() => deact && toggleActive(deact, false)}
      />
    </>
  );
}

// ── Lecturers ─────────────────────────────────────────────────────────────────
function LecturersMgmt() {
  const st = useStore();
  const [q, setQ] = useState("");
  const blankL = { id: "", name: "", email: "", deptId: st.departments[0]?.id ?? "", title: "Lecturer", active: true };
  const [edit,   setEdit]   = useState<Lecturer | null>(null);
  const [isNew,  setIsNew]  = useState(false);
  const [assign, setAssign] = useState<Lecturer | null>(null);
  const [sel,    setSel]    = useState<string[]>([]);
  const [deact,  setDeact]  = useState<Lecturer | null>(null);
  const [err,    setErr]    = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [phone,  setPhone]  = useState("");
  const [qual,   setQual]   = useState("");
  const [password, setPassword] = useState("");

  const rows = st.lecturers.filter((l) => `${l.name} ${l.email}`.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!edit) return;
    const e: Record<string, string> = {};
    if (edit.name.trim().length < 2) e.name = "Enter the full name.";
    if (!isEmail(edit.email)) e.email = "Enter a valid email.";
    if (isNew && !phone.trim()) e.phone = "Phone is required.";
    if (isNew && password.length < 8) e.password = "Password must be at least 8 characters.";
    setErr(e); if (Object.keys(e).length) return;
    setSaving(true);
    try {
      if (isNew) {
        await adminApi.post("/lecturers", {
          name: edit.name, email: edit.email, phone,
          departmentId: edit.deptId, title: edit.title,
          password,
          qualification: qual || undefined,
        });
        toast.success("Lecturer account created");
      } else {
        await adminApi.patch(`/lecturers/${edit.id}`, {
          name: edit.name, title: edit.title, departmentId: edit.deptId,
          ...(phone ? { phone } : {}),
          ...(qual  ? { qualification: qual } : {}),
        });
        toast.success("Lecturer updated");
      }
      st.log(`Lecturer ${edit.name} ${isNew ? "created" : "updated"}`);
      await st.reloadAll();
      setEdit(null);
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message ?? "Failed to save lecturer";
      setFormError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
    try {
      if (active) await adminApi.patch(`/lecturers/${l.id}`, { isActive: true });
      else        await adminApi.delete(`/lecturers/${l.id}`);
      st.log(`Lecturer ${l.name} ${active ? "reactivated" : "deactivated"}`);
      await st.reloadAll();
      toast.success(`${l.name} ${active ? "reactivated" : "deactivated"}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to update status");
    }
    setDeact(null);
  };

  const saveAssign = async () => {
    if (!assign) return;
    setSaving(true);
    try {
      // For each course: if selected → assign this lecturer; if was theirs and deselected → remove
      const prev = st.courses.filter((c) => c.lecturerId === assign.id).map((c) => c.id);
      const toAssign   = sel.filter((id) => !prev.includes(id));
      const toUnassign = prev.filter((id) => !sel.includes(id));
      await Promise.all([
        ...toAssign.map((id)   => adminApi.patch(`/courses/${id}/lecturer`, { lecturerId: assign.id })),
        ...toUnassign.map((id) => adminApi.patch(`/courses/${id}/lecturer`, { lecturerId: null })),
      ]);
      st.log(`Courses reassigned for ${assign.name}`);
      await st.reloadAll();
      toast.success("Course assignments saved");
      setAssign(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to save assignments");
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title="Lecturer Management"
        actions={<Button onClick={() => { setErr({}); setFormError(""); setPhone(""); setQual(""); setPassword(""); setIsNew(true); setEdit({ ...blankL }); }}><Plus className="size-4" />Add lecturer</Button>}
      />
      <DataTable rows={rows}
        toolbar={<SearchInput value={q} onChange={setQ} placeholder="Search lecturers…" className="sm:w-72" />}
        columns={[
          { key: "n", header: "Lecturer",   cell: (l) => <div className="flex items-center gap-3"><Avatar name={l.name} /><div><p className="font-medium">{l.name}</p><p className="text-xs text-muted-foreground">{l.email}</p></div></div> },
          { key: "t", header: "Title",      cell: (l) => l.title },
          { key: "d", header: "Department", cell: (l) => st.departments.find((d) => d.id === l.deptId)?.name ?? "—" },
          { key: "c", header: "Courses",    cell: (l) => st.courses.filter((c) => c.lecturerId === l.id).map((c) => c.code).join(", ") || "—" },
          { key: "s", header: "Status",     cell: (l) => <Badge>{l.active ? "Active" : "Inactive"}</Badge> },
          { key: "a", header: "", className: "text-right", cell: (l) => (
            <div className="flex justify-end gap-1">
              <Button size="sm" variant="outline" onClick={() => { setAssign(l); setSel(st.courses.filter((c) => c.lecturerId === l.id).map((c) => c.id)); }}>Assign</Button>
              <Button size="icon" variant="ghost" className="size-8" onClick={() => { setErr({}); setFormError(""); setPhone(""); setQual(""); setPassword(""); setIsNew(false); setEdit({ ...l }); }}><Pencil className="size-4" /></Button>
              <Button size="sm" variant="ghost" className={l.active ? "text-destructive" : "text-success"}
                onClick={() => l.active ? setDeact(l) : toggleActive(l, true)}>
                {l.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          )},
        ]}
      />

      <FormDialog open={!!edit} onOpenChange={(o) => { if (!o) { setEdit(null); setFormError(""); } }} title={isNew ? "Add lecturer" : "Edit lecturer"} onSave={save} saving={saving}>
        {edit && <>
          {formError && <div className="sm:col-span-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>}
          <div className="sm:col-span-2"><Field label="Full name" error={err.name}><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Email" error={err.email}><Input value={edit.email} readOnly={!isNew} className={!isNew ? "opacity-60" : ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field></div>
          {isNew && <div className="sm:col-span-2"><Field label="Phone" error={err.phone}><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9XX XXX XXX" /></Field></div>}
          {isNew && <div className="sm:col-span-2"><Field label="Initial password" error={err.password}><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" /></Field></div>}
          <Field label="Title"><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
          <Field label="Department">
            <NativeSelect value={edit.deptId} onChange={(v) => setEdit({ ...edit, deptId: v })} className="w-full">
              {st.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </NativeSelect>
          </Field>
          <div className="sm:col-span-2"><Field label="Qualification (optional)"><Input value={qual} onChange={(e) => setQual(e.target.value)} placeholder="PhD in Computer Science" /></Field></div>
        </>}
      </FormDialog>

      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign courses to {assign?.name}</DialogTitle></DialogHeader>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {st.courses.map((c) => (
              <label key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted cursor-pointer">
                <input type="checkbox" className="accent-primary" checked={sel.includes(c.id)}
                  onChange={(e) => setSel(e.target.checked ? [...sel, c.id] : sel.filter((x) => x !== c.id))} />
                <span className="font-semibold">{c.code}</span>
                <span className="flex-1 truncate">{c.title}</span>
                {c.lecturerId && c.lecturerId !== assign?.id && (
                  <span className="text-xs text-muted-foreground">{st.lecturers.find((l) => l.id === c.lecturerId)?.name}</span>
                )}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={saveAssign} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}Save assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Confirm open={!!deact} onOpenChange={(o) => !o && setDeact(null)} destructive
        title={`Deactivate ${deact?.name}?`} desc="They will lose access to the lecturer portal." confirmLabel="Deactivate"
        onConfirm={() => deact && toggleActive(deact, false)}
      />
    </>
  );
}

// ── Courses ───────────────────────────────────────────────────────────────────
function CoursesMgmt() {
  const st = useStore();
  const [q, setQ] = useState(""); const [dep, setDep] = useState("all");
  const [edit, setEdit] = useState<Course | null>(null); const [isNew, setIsNew] = useState(false);
  const [del, setDel]   = useState<Course | null>(null);
  const [err, setErr]   = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const rows = st.courses.filter((c) =>
    `${c.code} ${c.title}`.toLowerCase().includes(q.toLowerCase()) && (dep === "all" || c.deptId === dep));
  const enrolled = (id: string) => st.registrations.filter((r) => r.courseId === id && r.status !== "rejected").length;
  const slot = edit?.slots[0] ?? { day: "Mon" as Day, start: 8, end: 10, room: "" };
  const setSlot = (p: Partial<typeof slot>) => edit && setEdit({ ...edit, slots: [{ ...slot, ...p }, ...edit.slots.slice(1)] });

  const save = async () => {
    if (!edit) return;
    const e: Record<string, string> = {};
    if (!/^[A-Z]{2,4}\d{3}$/.test(edit.code)) e.code = "Format like CS201.";
    else if (isNew && st.courses.some((c) => c.code === edit.code)) e.code = "Code already exists.";
    if (edit.title.trim().length < 3) e.title = "Enter a title.";
    if (edit.credits < 1 || edit.credits > 4) e.credits = "1–4 credits.";
    if (edit.capacity < 1) e.capacity = "Must be at least 1.";
    if (!edit.deptId) e.deptId = "Select a department.";
    // semesterId stored in edit as (edit as any).semesterId
    const semId: string = (edit as any).semesterId ?? "";
    if (!semId) e.semesterId = "Select a semester.";
    const s0 = edit.slots[0]; if (s0 && s0.end <= s0.start) e.slot = "End must be after start.";
    setErr(e); if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const payload = {
        code: edit.code, title: edit.title, description: edit.description,
        credits: edit.credits, departmentId: edit.deptId, semesterId: semId,
        capacity: edit.capacity,
        lecturerId: edit.lecturerId || undefined,
        slots: edit.slots.map((s) => ({ day: s.day, startTime: s.start, endTime: s.end, room: s.room })),
      };
      if (isNew) await adminApi.post("/courses", payload);
      else       await adminApi.patch(`/courses/${edit.id}`, payload);
      st.log(`Course ${edit.code} ${isNew ? "created" : "updated"}`);
      await st.reloadAll();
      toast.success(`Course ${isNew ? "created" : "updated"}`);
      setEdit(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to save course");
    } finally { setSaving(false); }
  };

  const deleteCourse = async () => {
    if (!del) return;
    try {
      await adminApi.delete(`/courses/${del.id}`);
      st.log(`Course ${del.code} deleted`);
      await st.reloadAll();
      toast.success("Course deleted");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to delete course");
    }
    setDel(null);
  };

  return (
    <>
      <PageHeader title="Course Management"
        actions={<Button onClick={() => {
          setErr({}); setIsNew(true);
          setEdit({ id: "", code: "", title: "", description: "", credits: 3, deptId: st.departments[0]?.id ?? "", semester: 1, capacity: 40, lecturerId: null, slots: [{ day: "Mon", start: 8, end: 10, room: "" }] } as any);
        }}><Plus className="size-4" />New course</Button>}
      />
      <DataTable rows={rows}
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search courses…" className="sm:w-72" />
          <NativeSelect value={dep} onChange={setDep} className="sm:ml-auto">
            <option value="all">All departments</option>
            {st.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </NativeSelect>
        </>}
        columns={[
          { key: "c",  header: "Code",     cell: (c) => <span className="font-semibold">{c.code}</span> },
          { key: "t",  header: "Title",    cell: (c) => c.title },
          { key: "d",  header: "Dept",     cell: (c) => st.departments.find((d) => d.id === c.deptId)?.code ?? "—" },
          { key: "cr", header: "Credits",  cell: (c) => c.credits },
          { key: "e",  header: "Enrolled", cell: (c) => `${enrolled(c.id)} / ${c.capacity}` },
          { key: "l",  header: "Lecturer", cell: (c) => st.lecturers.find((l) => l.id === c.lecturerId)?.name ?? <Badge tone="warning">Unassigned</Badge> },
          { key: "a",  header: "", className: "text-right", cell: (c) => (
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" className="size-8" onClick={() => { setErr({}); setIsNew(false); setEdit(structuredClone(c)); }}><Pencil className="size-4" /></Button>
              <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDel(c)}><Trash2 className="size-4" /></Button>
            </div>
          )},
        ]}
      />

      <FormDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={isNew ? "New course" : `Edit ${edit?.code}`} onSave={save} saving={saving}>
        {edit && <>
          <Field label="Course code" error={err.code}><Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} placeholder="CS201" /></Field>
          <Field label="Credit hours" error={err.credits}><Input type="number" min={1} max={4} value={edit.credits} onChange={(e) => setEdit({ ...edit, credits: Number(e.target.value) })} /></Field>
          <div className="sm:col-span-2"><Field label="Title" error={err.title}><Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field></div>
          <div className="sm:col-span-2"><Field label="Description"><Textarea rows={2} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field></div>
          <Field label="Department" error={err.deptId}>
            <NativeSelect value={edit.deptId} onChange={(v) => setEdit({ ...edit, deptId: v })} className="w-full">
              <option value="">Select department</option>
              {st.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Capacity" error={err.capacity}><Input type="number" min={1} value={edit.capacity} onChange={(e) => setEdit({ ...edit, capacity: Number(e.target.value) })} /></Field>
          <Field label="Semester" error={err.semesterId}>
            <NativeSelect value={(edit as any).semesterId ?? ""} onChange={(v) => setEdit({ ...edit, ...(edit as any), semesterId: v } as any)} className="w-full">
              <option value="">Select semester</option>
              {st.semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Lecturer">
            <NativeSelect value={edit.lecturerId ?? ""} onChange={(v) => setEdit({ ...edit, lecturerId: v || null })} className="w-full">
              <option value="">Unassigned</option>
              {st.lecturers.filter((l) => l.active).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Day" error={err.slot}>
            <NativeSelect value={slot.day} onChange={(v) => setSlot({ day: v as Day })} className="w-full">
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Room"><Input value={slot.room} onChange={(e) => setSlot({ room: e.target.value })} /></Field>
          <Field label="Start hour"><Input type="number" min={8} max={17} value={slot.start} onChange={(e) => setSlot({ start: Number(e.target.value) })} /></Field>
          <Field label="End hour"><Input type="number" min={9} max={18} value={slot.end} onChange={(e) => setSlot({ end: Number(e.target.value) })} /></Field>
        </>}
      </FormDialog>

      <Confirm open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive
        title={`Delete ${del?.code}?`} desc={`Permanently removes the course and ${del ? enrolled(del.id) : 0} registration(s).`} confirmLabel="Delete course"
        onConfirm={deleteCourse}
      />
    </>
  );
}

// ── Departments ───────────────────────────────────────────────────────────────
function DepartmentsMgmt() {
  const st = useStore();
  const [edit, setEdit] = useState<Department | null>(null);
  const [del,  setDel]  = useState<Department | null>(null);
  const [err,  setErr]  = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit) return;
    if (!edit.name.trim() || !/^[A-Z]{2,10}$/.test(edit.code)) {
      setErr("Name and a 2–10 letter uppercase code are required."); return;
    }
    setSaving(true);
    try {
      const payload = { code: edit.code, name: edit.name };
      if (edit.id) await adminApi.patch(`/departments/${edit.id}`, payload);
      else         await adminApi.post("/departments", payload);
      st.log(`Department ${edit.name} ${edit.id ? "updated" : "created"}`);
      await st.reloadAll();
      toast.success(edit.id ? "Department updated" : "Department created");
      setEdit(null);
    } catch (e: any) {
      setErr(e.response?.data?.message ?? "Failed to save department");
    } finally { setSaving(false); }
  };

  const deleteDept = async () => {
    if (!del) return;
    const used = st.students.some((s) => s.deptId === del.id) ||
                 st.courses.some((c) => c.deptId  === del.id) ||
                 st.lecturers.some((l) => l.deptId === del.id);
    if (used) { toast.error("This department still has students, courses, or lecturers."); setDel(null); return; }
    try {
      await adminApi.delete(`/departments/${del.id}`);
      st.log(`Department ${del.name} deleted`);
      await st.reloadAll();
      toast.success("Department deleted");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to delete department");
    }
    setDel(null);
  };

  return (
    <>
      <PageHeader title="Department Management"
        actions={<Button onClick={() => { setErr(""); setEdit({ id: "", code: "", name: "", head: "" }); }}><Plus className="size-4" />New department</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {st.departments.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{d.code}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="size-8" onClick={() => { setErr(""); setEdit({ ...d }); }}><Pencil className="size-4" /></Button>
                <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDel(d)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
            <p className="mt-3 font-semibold">{d.name}</p>
            <p className="text-xs text-muted-foreground">Head: {d.head || "—"}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[["Students", st.students.filter((s) => s.deptId === d.id).length],
                ["Lecturers", st.lecturers.filter((l) => l.deptId === d.id).length],
                ["Courses",   st.courses.filter((c) => c.deptId  === d.id).length]].map(([k, v]) => (
                <div key={String(k)} className="rounded-lg bg-muted py-2">
                  <p className="text-base font-bold">{v}</p>
                  <p className="text-muted-foreground">{k}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <FormDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.id ? "Edit department" : "New department"} onSave={save} saving={saving}>
        {edit && <>
          <Field label="Code (uppercase)" error={err}><Input value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} placeholder="CS" /></Field>
          <Field label="Name"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Computer Science" /></Field>
          <div className="sm:col-span-2"><Field label="Head (name)"><Input value={edit.head} onChange={(e) => setEdit({ ...edit, head: e.target.value })} /></Field></div>
        </>}
      </FormDialog>

      <Confirm open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive
        title={`Delete ${del?.name}?`} desc="This cannot be undone." confirmLabel="Delete"
        onConfirm={deleteDept}
      />
    </>
  );
}

// ── Semesters ─────────────────────────────────────────────────────────────────
function SemestersMgmt() {
  const st = useStore();
  const blank = { id: "", name: "", opens: today(), closes: today(), status: "upcoming" as const };
  const [edit,   setEdit]   = useState<Semester | null>(null);
  const [closeS, setCloseS] = useState<Semester | null>(null);
  const [err,    setErr]    = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit) return;
    if (edit.name.trim().length < 3) { setErr("Enter a semester name."); return; }
    if (!edit.opens || !edit.closes || edit.closes <= edit.opens) { setErr("Closing date must be after opening date."); return; }
    setSaving(true);
    try {
      // Backend requires: startDate, endDate, registrationOpenDate, registrationCloseDate
      const payload = {
        name: edit.name,
        startDate: edit.opens,
        endDate: edit.closes,
        registrationOpenDate: edit.opens,
        registrationCloseDate: edit.closes,
        status: edit.status,
      };
      if (edit.id) await adminApi.patch(`/semesters/${edit.id}`, payload);
      else         await adminApi.post("/semesters", payload);
      st.log(`Semester ${edit.name} saved`);
      await st.reloadAll();
      toast.success("Semester saved");
      setEdit(null);
    } catch (e: any) {
      setErr(e.response?.data?.message ?? "Failed to save semester");
    } finally { setSaving(false); }
  };

  const changeStatus = async (sem: Semester, status: "active" | "closed") => {
    try {
      await adminApi.patch(`/semesters/${sem.id}/status`, { status });
      st.log(`Semester ${sem.name} set to ${status}`);
      await st.reloadAll();
      toast.success(status === "active" ? `${sem.name} is now active` : `${sem.name} closed`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to change status");
    }
    setCloseS(null);
  };

  return (
    <>
      <PageHeader title="Semester Management"
        actions={<Button onClick={() => { setErr(""); setEdit({ ...blank }); }}><Plus className="size-4" />New semester</Button>}
      />
      <DataTable rows={st.semesters}
        columns={[
          { key: "n", header: "Name",   cell: (s) => <span className="font-semibold">{s.name}</span> },
          { key: "o", header: "Opens",  cell: (s) => s.opens },
          { key: "c", header: "Closes", cell: (s) => s.closes },
          { key: "s", header: "Status", cell: (s) => <Badge>{s.status}</Badge> },
          { key: "a", header: "", className: "text-right", cell: (s) => (
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" className="size-8" onClick={() => { setErr(""); setEdit({ ...s }); }}><Pencil className="size-4" /></Button>
              {s.status !== "active" && <Button size="sm" variant="outline" onClick={() => changeStatus(s, "active")}>Activate</Button>}
              {s.status === "active" && <Button size="sm" variant="outline" className="text-destructive" onClick={() => setCloseS(s)}>Close</Button>}
            </div>
          )},
        ]}
      />

      <FormDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.id ? "Edit semester" : "New semester"} onSave={save} saving={saving}>
        {edit && <>
          <div className="sm:col-span-2"><Field label="Name" error={err}><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Fall 2027" /></Field></div>
          <Field label="Starts"><Input type="date" value={edit.opens}  onChange={(e) => setEdit({ ...edit, opens:  e.target.value })} /></Field>
          <Field label="Ends">  <Input type="date" value={edit.closes} onChange={(e) => setEdit({ ...edit, closes: e.target.value })} /></Field>
        </>}
      </FormDialog>

      <Confirm open={!!closeS} onOpenChange={(o) => !o && setCloseS(null)} destructive
        title={`Close ${closeS?.name}?`} desc="Students can no longer register or drop courses."
        confirmLabel="Close semester" onConfirm={() => closeS && changeStatus(closeS, "closed")}
      />
    </>
  );
}

// ── Registrations ─────────────────────────────────────────────────────────────
function RegistrationsMgmt() {
  const st = useStore();
  const [q, setQ] = useState(""); const [status, setStatus] = useState("all");
  const [actioning, setActioning] = useState<string | null>(null);

  const rows = st.registrations
    .map((r) => ({ ...r, s: st.students.find((x) => x.id === r.studentId), c: st.courses.find((x) => x.id === r.courseId) }))
    .filter((r) => r.s && r.c && (status === "all" || r.status === status) &&
      `${r.s.name} ${r.c.code}`.toLowerCase().includes(q.toLowerCase()));

  const act = async (id: string, action: "approve" | "reject") => {
    setActioning(id);
    try {
      await adminApi.post(`/registrations/${id}/${action}`, {});
      st.log(`Registration ${action}d`);
      await st.reloadAll();
      toast.success(`Registration ${action}d`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? `Failed to ${action}`);
    } finally { setActioning(null); }
  };

  const count = (s: string) => st.registrations.filter((r) => r.status === s).length;

  return (
    <>
      <PageHeader title="Registration Management" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Approved" value={count("approved")} icon={ClipboardList} tone="success" />
        <StatCard label="Pending"  value={count("pending")}  icon={ClipboardList} tone="warning" />
        <StatCard label="Rejected" value={count("rejected")} icon={ClipboardList} tone="danger" />
      </div>
      <DataTable rows={rows} pageSize={10}
        toolbar={<>
          <SearchInput value={q} onChange={setQ} placeholder="Search student or course…" className="sm:w-72" />
          <NativeSelect value={status} onChange={setStatus} className="sm:ml-auto">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </NativeSelect>
        </>}
        columns={[
          { key: "s",  header: "Student", cell: (r) => <div><p className="font-medium">{r.s!.name}</p><p className="text-xs text-muted-foreground">{r.s!.id}</p></div> },
          { key: "c",  header: "Course",  cell: (r) => `${r.c!.code} · ${r.c!.title}` },
          { key: "d",  header: "Date",    cell: (r) => r.date },
          { key: "st", header: "Status",  cell: (r) => <Badge>{r.status}</Badge> },
          { key: "a",  header: "", className: "text-right", cell: (r) => r.status === "pending" ? (
            <div className="flex justify-end gap-1">
              <Button size="sm" disabled={actioning === r.id} onClick={() => act(r.id, "approve")}>
                {actioning === r.id ? <Loader2 className="size-4 animate-spin" /> : "Approve"}
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" disabled={actioning === r.id} onClick={() => act(r.id, "reject")}>Reject</Button>
            </div>
          ) : null },
        ]}
      />
    </>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function download(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  toast.success(`Exported ${name}`);
}

function Reports() {
  const st = useStore();
  const courseData = st.courses.map((c) => ({
    name: c.code,
    enrolled: st.registrations.filter((r) => r.courseId === c.id && r.status !== "rejected").length,
    capacity: c.capacity,
  }));
  const deptData = st.departments.map((d) => ({
    name: d.code,
    students: st.students.filter((s) => s.deptId === d.id).length,
    courses:  st.courses.filter((c) => c.deptId  === d.id).length,
  }));
  return (
    <>
      <PageHeader title="Reports & Analytics"
        actions={<>
          <Button variant="outline" onClick={() => download("students.csv", [
            ["Reg. No", "Name", "Department", "Year", "Status"],
            ...st.students.map((s) => [s.id, s.name, st.departments.find((d) => d.id === s.deptId)?.name ?? "", s.year, s.active ? "Active" : "Inactive"]),
          ])}><Download className="size-4" />Students</Button>
          <Button variant="outline" onClick={() => download("courses.csv", [
            ["Code", "Title", "Enrolled", "Capacity"],
            ...courseData.map((c) => [c.name, st.courses.find((x) => x.code === c.name)?.title ?? "", c.enrolled, c.capacity]),
          ])}><Download className="size-4" />Courses</Button>
          <Button variant="outline" onClick={() => download("departments.csv", [
            ["Department", "Students", "Courses"],
            ...deptData.map((d) => [d.name, d.students, d.courses]),
          ])}><Download className="size-4" />Departments</Button>
        </>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHead title="Course registrations" desc="Enrolled vs capacity" />
          <div className="h-72 p-4">
            <ResponsiveContainer>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip {...tip} />
                <Bar dataKey="enrolled" fill="var(--chart-1)" radius={[4,4,0,0]} name="Enrolled" />
                <Bar dataKey="capacity" fill="var(--chart-2)" opacity={0.2} radius={[4,4,0,0]} name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHead title="Department stats" />
          <div className="h-64 p-4">
            <ResponsiveContainer>
              <BarChart data={deptData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" fontSize={11} stroke="var(--muted-foreground)" width={36} />
                <Tooltip {...tip} />
                <Bar dataKey="students" fill="var(--chart-3)" radius={[0,4,4,0]} name="Students" />
                <Bar dataKey="courses"  fill="var(--chart-4)" radius={[0,4,4,0]} name="Courses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHead title="Students by year" />
          <ul className="space-y-3 p-5">
            {[1,2,3,4].map((y) => {
              const n = st.students.filter((s) => s.year === y).length;
              return (
                <li key={y}>
                  <div className="flex justify-between text-sm"><span>Year {y}</span><span className="font-semibold">{n}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: st.students.length ? `${(n / st.students.length) * 100}%` : "0%" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}

// ── Announcements ─────────────────────────────────────────────────────────────
function AnnouncementsMgmt() {
  const st = useStore();
  const [f, setF] = useState({ title: "", body: "", audience: "all" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<string | null>(null);

  const publish = async () => {
    if (f.title.trim().length < 4 || f.body.trim().length < 10) {
      setErr("Title (4+ chars) and message (10+ chars) required."); return;
    }
    setSaving(true);
    try {
      await adminApi.post("/announcements", { title: f.title, body: f.body, audience: f.audience });
      st.log(`Announcement "${f.title}" published`);
      await st.reloadAll();
      setF({ title: "", body: "", audience: "all" });
      setErr("");
      toast.success("Announcement published");
    } catch (e: any) {
      setErr(e.response?.data?.message ?? "Failed to publish");
    } finally { setSaving(false); }
  };

  const deleteAnn = async (id: string) => {
    try {
      await adminApi.delete(`/announcements/${id}`);
      st.log("Announcement deleted");
      await st.reloadAll();
      toast.success("Announcement deleted");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Failed to delete");
    }
    setDel(null);
  };

  return (
    <>
      <PageHeader title="Announcements" />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHead title="New announcement" />
          <div className="space-y-3 p-5">
            <Field label="Audience">
              <NativeSelect value={f.audience} onChange={(v) => setF({ ...f, audience: v })} className="w-full">
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="lecturers">Lecturers</option>
                {st.courses.map((c) => <option key={c.id} value="course">{c.code}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Title" error={err}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Message"><Textarea rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
            <Button className="w-full" onClick={publish} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}Publish
            </Button>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <CardHead title="All announcements" />
          <div className="divide-y">
            {st.announcements.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{a.date} · {a.audience}</p>
                </div>
                <Button size="icon" variant="ghost" className="size-7 shrink-0 text-destructive" onClick={() => setDel(a.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            {st.announcements.length === 0 && <p className="px-5 py-8 text-sm text-muted-foreground text-center">No announcements yet.</p>}
          </div>
        </Card>
      </div>
      <Confirm open={!!del} onOpenChange={(o) => !o && setDel(null)} destructive
        title="Delete this announcement?" desc="This cannot be undone." confirmLabel="Delete"
        onConfirm={() => del && deleteAnn(del)}
      />
    </>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SystemSettings() {
  const st = useStore();
  const [limit, setLimit] = useState(String(st.settings.creditLimit));
  const [reset, setReset] = useState(false);
  const n = Number(limit); const bad = !Number.isInteger(n) || n < 6 || n > 30;
  return (
    <>
      <PageHeader title="System Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead title="Registration rules" />
          <div className="space-y-5 p-5">
            <Field label="Max credit hours per student" error={bad ? "Enter a whole number 6–30." : undefined}>
              <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
            </Field>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Require admin approval</p>
                <p className="text-xs text-muted-foreground">New registrations start as pending.</p>
              </div>
              <Switch checked={st.settings.requireApproval}
                onCheckedChange={(v) => { st.update((s) => ({ settings: { ...s.settings, requireApproval: v } })); toast.success(v ? "Approval required" : "Auto-approval enabled"); }} />
            </div>
            <Button disabled={bad} onClick={() => { st.update((s) => ({ settings: { ...s.settings, creditLimit: n } })); toast.success("Settings saved"); }}>
              Save rules
            </Button>
            <p className="text-xs text-muted-foreground">Note: settings are frontend-only and persist only for this session.</p>
          </div>
        </Card>
        <Card>
          <CardHead title="Data" desc="Reset your local view to empty." />
          <div className="p-5">
            <Button variant="outline" className="text-destructive" onClick={() => setReset(true)}>Reset local state</Button>
          </div>
        </Card>
        <div className="lg:col-span-2"><SettingsPage /></div>
      </div>
      <Confirm open={reset} onOpenChange={setReset} destructive title="Reset local state?" desc="Clears the in-memory state. Data in MongoDB is not affected." confirmLabel="Reset"
        onConfirm={() => { st.reset(); toast.success("Local state cleared"); }} />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function AdminApp({ section }: { section: string }) {
  const body = (() => {
    switch (section) {
      case "students":      return <StudentsMgmt />;
      case "lecturers":     return <LecturersMgmt />;
      case "courses":       return <CoursesMgmt />;
      case "departments":   return <DepartmentsMgmt />;
      case "semesters":     return <SemestersMgmt />;
      case "registrations": return <RegistrationsMgmt />;
      case "reports":       return <Reports />;
      case "announcements": return <AnnouncementsMgmt />;
      case "settings":      return <SystemSettings />;
      default:              return <Overview />;
    }
  })();
  return <AppShell role="admin" nav={adminNav} section={section}>{body}</AppShell>;
}
