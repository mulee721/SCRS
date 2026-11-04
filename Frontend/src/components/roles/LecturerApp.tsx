import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard, Megaphone, Settings, User, Users, Activity, Clock } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtTime, gradeLetter } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { Avatar, Badge, Card, CardHead, DataTable, EmptyState, Field, NativeSelect, PageHeader, SearchInput, StatCard } from "@/components/app/kit";
import { AnnouncementList, SettingsPage, TimetableGrid } from "@/components/app/shared";

export const lecturerNav: NavItem[] = [
  { section: "overview", label: "Overview", icon: LayoutDashboard },
  { section: "courses", label: "My Courses", icon: BookOpen },
  { section: "students", label: "Enrolled Students", icon: Users },
  { section: "attendance", label: "Attendance", icon: ClipboardCheck },
  { section: "grades", label: "Grade Management", icon: GraduationCap },
  { section: "timetable", label: "Timetable", icon: CalendarDays },
  { section: "announcements", label: "Announcements", icon: Megaphone },
  { section: "profile", label: "Profile", icon: User },
  { section: "settings", label: "Settings", icon: Settings },
];

function useLecturer() {
  const st = useStore();
  const me = st.lecturers.find((l) => l.id === st.session?.refId)!;
  const mine = st.courses.filter((c) => c.lecturerId === me?.id);
  const enrolled = (cid: string) => st.registrations.filter((r) => r.courseId === cid && r.status === "approved");
  const student = (id: string) => st.students.find((s) => s.id === id);
  return { ...st, me, mine, enrolled, student };
}

function Overview() {
  const L = useLecturer();
  const total = L.mine.reduce((s, c) => s + L.enrolled(c.id).length, 0);
  const slots = L.mine.flatMap((c) => c.slots.map((s) => ({ ...s, c })));
  const data = L.mine.map((c) => ({ name: c.code, students: L.enrolled(c.id).length, capacity: c.capacity }));
  return (
    <>
      <PageHeader title={`Welcome, ${L.me.name}`} desc={`${L.me.title} · ${L.departments.find((d) => d.id === L.me.deptId)?.name}`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned courses" value={L.mine.length} icon={BookOpen} />
        <StatCard label="Enrolled students" value={total} icon={Users} tone="success" />
        <StatCard label="Weekly sessions" value={slots.length} icon={Clock} tone="navy" />
        <StatCard label="Teaching hours / week" value={slots.reduce((s, x) => s + x.end - x.start, 0)} icon={CalendarDays} tone="warning" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><CardHead title="Enrollment by course" />
          <div className="h-64 p-4"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" /><YAxis fontSize={12} stroke="var(--muted-foreground)" /><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} /><Bar dataKey="students" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /><Bar dataKey="capacity" fill="var(--chart-2)" radius={[6, 6, 0, 0]} opacity={0.25} /></BarChart></ResponsiveContainer></div>
        </Card>
        <Card><CardHead title="Upcoming classes" />
          <ul className="divide-y">{slots.slice(0, 5).map((s, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-3"><span className="w-12 rounded-lg bg-primary/10 py-1.5 text-center text-xs font-bold text-primary">{s.day}</span><div className="flex-1"><p className="text-sm font-semibold">{s.c.code} · {s.c.title}</p><p className="text-xs text-muted-foreground">{s.room}</p></div><span className="text-xs text-muted-foreground">{fmtTime(s.start)}–{fmtTime(s.end)}</span></li>))}
          </ul>
        </Card>
        <Card className="lg:col-span-2"><CardHead title="Recent activity" />
          <ul className="divide-y">{L.activities.slice(0, 5).map((a) => <li key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm"><Activity className="size-4 text-primary" /><span className="flex-1">{a.text}</span><span className="text-xs text-muted-foreground">{a.date.replace("T", " ")}</span></li>)}</ul>
        </Card>
      </div>
    </>
  );
}

function Courses() {
  const L = useLecturer();
  if (!L.mine.length) return <Card><EmptyState title="No assigned courses" desc="An administrator will assign courses to you." /></Card>;
  return (
    <>
      <PageHeader title="My Courses" desc="Courses assigned to you this semester." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {L.mine.map((c) => { const n = L.enrolled(c.id).length; return (
          <Card key={c.id} className="p-5 transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between"><Badge>{c.code}</Badge><span className="text-xs text-muted-foreground">{c.credits} credits</span></div>
            <p className="mt-3 font-semibold">{c.title}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (n / c.capacity) * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-muted-foreground">{n} / {c.capacity} enrolled · {c.slots.map((s) => `${s.day} ${fmtTime(s.start)}`).join(", ")}</p>
          </Card>); })}
      </div>
    </>
  );
}

function Students() {
  const L = useLecturer();
  const [q, setQ] = useState(""); const [cid, setCid] = useState("all");
  const [view, setView] = useState<string | null>(null);
  const rows = useMemo(() => L.mine.filter((c) => cid === "all" || c.id === cid).flatMap((c) => L.enrolled(c.id).map((r) => ({ id: r.id, r, c, s: L.student(r.studentId)! })))
    .filter((x) => x.s && (q === "" || `${x.s.name} ${x.s.id}`.toLowerCase().includes(q.toLowerCase()))), [L, q, cid]);
  const vs = view ? L.student(view) : null;
  return (
    <>
      <PageHeader title="Enrolled Students" />
      <DataTable rows={rows} toolbar={<><SearchInput value={q} onChange={setQ} placeholder="Search name or ID" className="sm:w-72" />
        <NativeSelect value={cid} onChange={setCid} className="sm:ml-auto"><option value="all">All my courses</option>{L.mine.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}</NativeSelect></>}
        columns={[
          { key: "n", header: "Student", cell: (x) => <div className="flex items-center gap-3"><Avatar name={x.s.name} /><div><p className="font-medium">{x.s.name}</p><p className="text-xs text-muted-foreground">{x.s.id}</p></div></div> },
          { key: "c", header: "Course", cell: (x) => x.c.code },
          { key: "y", header: "Year", cell: (x) => `Year ${x.s.year}` },
          { key: "d", header: "Registered", cell: (x) => x.r.date },
          { key: "a", header: "", className: "text-right", cell: (x) => <Button size="sm" variant="outline" onClick={() => setView(x.s.id)}>View</Button> },
        ]} />
      <Dialog open={!!vs} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent><DialogHeader><DialogTitle>Student details</DialogTitle></DialogHeader>
          {vs && <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Avatar name={vs.name} className="size-12" /><div><p className="font-semibold">{vs.name}</p><p className="text-xs text-muted-foreground">{vs.email}</p></div></div>
            {[["ID", vs.id], ["Department", L.departments.find((d) => d.id === vs.deptId)?.name], ["Year", vs.year], ["Phone", vs.phone || "—"]].map(([k, v]) => <div key={String(k)} className="flex justify-between border-t pt-2"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>)}
            <p className="border-t pt-2 font-semibold">Registrations</p>
            {L.registrations.filter((r) => r.studentId === vs.id).map((r) => <div key={r.id} className="flex justify-between"><span>{L.courses.find((c) => c.id === r.courseId)?.code}</span><Badge>{r.status}</Badge></div>)}
          </div>}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Attendance() {
  const L = useLecturer();
  const [cid, setCid] = useState(L.mine[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const list = cid ? L.enrolled(cid) : [];
  const [present, setPresent] = useState<Record<string, boolean>>({});
  if (!L.mine.length) return <Card><EmptyState title="No courses to take attendance for" /></Card>;
  return (
    <>
      <PageHeader title="Attendance" desc="Mark attendance for a class session." />
      <Card>
        <div className="flex flex-wrap gap-2 border-b p-4">
          <NativeSelect value={cid} onChange={(v) => { setCid(v); setPresent({}); }}>{L.mine.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}</NativeSelect>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-auto" />
          <Button variant="outline" size="sm" className="h-9" onClick={() => setPresent(Object.fromEntries(list.map((r) => [r.studentId, true])))}>Mark all present</Button>
        </div>
        {list.length === 0 ? <EmptyState title="No students enrolled" /> : <ul className="divide-y">{list.map((r) => { const s = L.student(r.studentId)!; return (
          <li key={r.id} className="flex items-center gap-3 px-5 py-3"><Avatar name={s.name} /><div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.id}</p></div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!present[s.id]} onCheckedChange={(v) => setPresent({ ...present, [s.id]: !!v })} />Present</label></li>); })}</ul>}
        <div className="flex items-center justify-between border-t p-4 text-sm"><span className="text-muted-foreground">{Object.values(present).filter(Boolean).length} of {list.length} present</span>
          <Button disabled={!list.length} onClick={() => { L.log(`${L.me.name} recorded attendance for ${L.courses.find((c) => c.id === cid)?.code} on ${date}`); toast.success("Attendance saved"); }}>Save attendance</Button></div>
      </Card>
    </>
  );
}

function Grades() {
  const L = useLecturer();
  const [cid, setCid] = useState(L.mine[0]?.id ?? "");
  const list = cid ? L.enrolled(cid) : [];
  const [draft, setDraft] = useState<Record<string, string>>({});
  const val = (id: string, g?: number | null) => draft[id] ?? (g == null ? "" : String(g));
  const invalid = (v: string) => v !== "" && (!/^\d{1,3}(\.\d)?$/.test(v) || Number(v) > 100);
  const graded = list.filter((r) => r.grade != null);
  const avg = graded.length ? (graded.reduce((s, r) => s + r.grade!, 0) / graded.length).toFixed(1) : "—";
  const save = () => {
    if (Object.values(draft).some(invalid)) { toast.error("Grades must be numbers between 0 and 100."); return; }
    L.update((s) => ({ registrations: s.registrations.map((r) => draft[r.id] !== undefined ? { ...r, grade: draft[r.id] === "" ? null : Number(draft[r.id]) } : r),
      notifications: [...s.notifications, ...Object.keys(draft).map((rid) => ({ id: L.uid(), userId: s.registrations.find((r) => r.id === rid)!.studentId, text: `New grade posted for ${s.courses.find((c) => c.id === cid)?.code}.`, date: new Date().toISOString().slice(0, 10), read: false }))] }));
    L.log(`${L.me.name} updated grades for ${L.courses.find((c) => c.id === cid)?.code}`);
    setDraft({}); toast.success("Grades saved");
  };
  if (!L.mine.length) return <Card><EmptyState title="No courses assigned" /></Card>;
  return (
    <>
      <PageHeader title="Grade Management" actions={<NativeSelect value={cid} onChange={(v) => { setCid(v); setDraft({}); }}>{L.mine.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}</NativeSelect>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Class average" value={avg} icon={GraduationCap} />
        <StatCard label="Graded" value={`${graded.length} / ${list.length}`} icon={ClipboardCheck} tone="success" />
        <StatCard label="Below 50" value={graded.filter((r) => r.grade! < 50).length} icon={Activity} tone="danger" />
      </div>
      <Card>
        {list.length === 0 ? <EmptyState title="No students enrolled" /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground"><th className="px-4 py-3">Student</th><th className="px-4 py-3">Mark (0–100)</th><th className="px-4 py-3">Grade</th></tr></thead>
          <tbody>{list.map((r) => { const s = L.student(r.studentId)!; const v = val(r.id, r.grade); const bad = invalid(v); return (
            <tr key={r.id} className="border-b last:border-0"><td className="px-4 py-2.5"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.id}</p></td>
              <td className="px-4 py-2.5"><Input value={v} onChange={(e) => setDraft({ ...draft, [r.id]: e.target.value })} className={`h-8 w-24 ${bad ? "border-destructive" : ""}`} inputMode="decimal" aria-invalid={bad} />{bad && <p className="mt-1 text-[11px] text-destructive">0–100 only</p>}</td>
              <td className="px-4 py-2.5">{v !== "" && !bad ? <Badge tone={Number(v) >= 50 ? "success" : "danger"}>{gradeLetter(Number(v)).letter}</Badge> : "—"}</td></tr>); })}</tbody></table></div>}
        <div className="flex justify-end gap-2 border-t p-4"><Button variant="outline" onClick={() => setDraft({})} disabled={!Object.keys(draft).length}>Discard</Button><Button onClick={save} disabled={!Object.keys(draft).length}>Save grades</Button></div>
      </Card>
    </>
  );
}

function Announcements() {
  const L = useLecturer();
  const [f, setF] = useState({ title: "", body: "", audience: L.mine[0]?.code ?? "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const publish = () => {
    const e: Record<string, string> = {};
    if (f.title.trim().length < 4) e.title = "Title is too short.";
    if (f.body.trim().length < 10) e.body = "Message must be at least 10 characters.";
    if (!f.audience) e.audience = "Choose a course.";
    setErr(e); if (Object.keys(e).length) return;
    L.update((s) => ({ announcements: [{ id: L.uid(), title: f.title.trim(), body: f.body.trim(), author: L.me.name, audience: f.audience, date: new Date().toISOString().slice(0, 10) }, ...s.announcements] }));
    L.log(`${L.me.name} published an announcement for ${f.audience}`);
    setF({ ...f, title: "", body: "" }); toast.success("Announcement published");
  };
  return (
    <>
      <PageHeader title="Announcements" />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2"><CardHead title="New announcement" />
          <div className="space-y-3 p-5">
            <Field label="Course" error={err.audience}><NativeSelect value={f.audience} onChange={(v) => setF({ ...f, audience: v })} className="w-full">{L.mine.map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</NativeSelect></Field>
            <Field label="Title" error={err.title}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Message" error={err.body}><Textarea rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
            <Button onClick={publish} className="w-full">Publish</Button>
          </div>
        </Card>
        <Card className="lg:col-span-3"><CardHead title="Published" /><AnnouncementList filter={(a) => a === "All" || L.mine.some((c) => c.code === a)} /></Card>
      </div>
    </>
  );
}

function Profile() {
  const L = useLecturer();
  const [f, setF] = useState({ name: L.me.name, title: L.me.title });
  return (
    <>
      <PageHeader title="Profile" />
      <Card className="max-w-2xl"><div className="flex items-center gap-4 border-b p-5"><Avatar name={L.me.name} className="size-14 text-lg" /><div><p className="font-semibold">{L.me.name}</p><p className="text-xs text-muted-foreground">{L.me.email}</p></div></div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Full name" error={f.name.trim().length < 3 ? "Required" : undefined}><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Academic title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Button disabled={f.name.trim().length < 3} onClick={() => { L.update((s) => ({ lecturers: s.lecturers.map((l) => l.id === L.me.id ? { ...l, ...f } : l) })); toast.success("Profile updated"); }}>Save changes</Button></div>
        </div>
      </Card>
    </>
  );
}

export function LecturerApp({ section }: { section: string }) {
  const st = useStore();
  const profileLoaded = st.lecturers.some((lecturer) => lecturer.id === st.session?.refId);
  const body = (() => {
    switch (section) {
      case "courses": return <Courses />;
      case "students": return <Students />;
      case "attendance": return <Attendance />;
      case "grades": return <Grades />;
      case "timetable": return <TT />;
      case "announcements": return <Announcements />;
      case "profile": return <Profile />;
      case "settings": return <SettingsPage />;
      default: return <Overview />;
    }
  })();
  return <AppShell role="lecturer" nav={lecturerNav} section={section}>
    {st.session?.role === "lecturer" && (profileLoaded ? body : <div className="p-8 text-sm text-muted-foreground">Loading your profile...</div>)}
  </AppShell>;
}

function TT() {
  const L = useLecturer();
  return <><PageHeader title="Teaching Timetable" /><TimetableGrid courses={L.mine} lecturerName={() => L.me.name} /></>;
}
