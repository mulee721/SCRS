import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, BookOpen, CalendarDays, ClipboardList, GraduationCap, LayoutDashboard, Settings, User, Clock, Award, CheckCircle2 } from "lucide-react";
import { checkRegistration, fmtTime, gradeLetter, type Course } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { Avatar, Badge, Card, CardHead, Confirm, DataTable, EmptyState, Field, NativeSelect, PageHeader, SearchInput, StatCard } from "@/components/app/kit";
import { AnnouncementList, SettingsPage, TimetableGrid } from "@/components/app/shared";

export const studentNav: NavItem[] = [
  { section: "overview", label: "Overview", icon: LayoutDashboard },
  { section: "courses", label: "Browse Courses", icon: BookOpen },
  { section: "registrations", label: "My Registrations", icon: ClipboardList },
  { section: "timetable", label: "My Timetable", icon: CalendarDays },
  { section: "results", label: "Academic Results", icon: GraduationCap },
  { section: "profile", label: "Profile", icon: User },
  { section: "notifications", label: "Notifications", icon: Bell },
  { section: "settings", label: "Settings", icon: Settings },
];

function useStudent() {
  const st = useStore();
  const me = st.students.find((s) => s.id === st.session?.refId)!;
  const myRegs = st.registrations.filter((r) => r.studentId === me?.id && r.status !== "rejected");
  const myCourses = myRegs.map((r) => ({ reg: r, course: st.courses.find((c) => c.id === r.courseId)! })).filter((x) => x.course);
  const credits = myCourses.reduce((s, x) => s + x.course.credits, 0);
  const lect = (id: string | null) => st.lecturers.find((l) => l.id === id)?.name ?? "TBA";
  const dept = (id: string) => st.departments.find((d) => d.id === id);
  return { ...st, me, myRegs, myCourses, credits, lect, dept };
}

function useRegisterActions() {
  const st = useStudent();
  const register = async (course: Course) => {
    const err = checkRegistration({ course, studentId: st.me.id, registrations: st.registrations, courses: st.courses, creditLimit: st.settings.creditLimit });
    if (err) { toast.error(err); return; }
    const semesterId = course.semesterId ?? st.semesters.find((semester) => semester.status === "active")?.id;
    if (!semesterId) { toast.error("No active semester is available."); return; }
    try {
      await st.registerCourse(course.id, semesterId);
      toast.success(`${course.code} registration submitted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    }
  };
  const drop = async (courseId: string) => {
    const co = st.courses.find((c) => c.id === courseId);
    const registration = st.myRegs.find((item) => item.courseId === courseId);
    if (!registration) return;
    try {
      await st.dropCourse(registration.id);
      toast.success(`Dropped ${co?.code}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to drop course");
    }
  };
  return { register, drop };
}

function Overview() {
  const { me, myCourses, credits, settings, dept, notifications, lect } = useStudent();
  const today = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const upcoming = myCourses.flatMap((x) => x.course.slots.map((s) => ({ ...s, course: x.course }))).sort((a, b) => today.indexOf(a.day) - today.indexOf(b.day) || a.start - b.start).slice(0, 5);
  const pending = myCourses.filter((x) => x.reg.status === "pending").length;
  return (
    <>
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 bg-navy p-6 text-navy-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm opacity-80">Welcome back,</p>
            <h1 className="mt-1 text-2xl font-bold">{me.name.split(" ")[0]} 👋</h1>
            <p className="mt-2 text-sm opacity-80">{me.id} · {dept(me.deptId)?.name} · Year {me.year}</p>
          </div>
          <Button asChild variant="secondary"><Link to="/student/$section" params={{ section: "courses" }}>Browse courses</Link></Button>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered courses" value={myCourses.length} icon={BookOpen} />
        <StatCard label="Credit hours" value={`${credits} / ${settings.creditLimit}`} icon={Clock} tone="navy" />
        <StatCard label="Registration status" value={pending ? "Pending" : "Confirmed"} icon={CheckCircle2} tone={pending ? "warning" : "success"} hint={pending ? `${pending} awaiting approval` : "All courses approved"} />
        <StatCard label="Current semester" value="Fall 2026" icon={CalendarDays} tone="primary" hint="Closes Nov 15" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHead title="Upcoming classes" desc="Your next sessions this week" />
          {upcoming.length === 0 ? <EmptyState title="No upcoming classes" /> : (
            <ul className="divide-y">{upcoming.map((u, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="w-12 rounded-lg bg-primary/10 py-1.5 text-center text-xs font-bold text-primary">{u.day}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{u.course.code} · {u.course.title}</p><p className="text-xs text-muted-foreground">{lect(u.course.lecturerId)} · {u.room}</p></div>
                <span className="text-xs font-medium text-muted-foreground">{fmtTime(u.start)}–{fmtTime(u.end)}</span>
              </li>))}
            </ul>)}
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Recent notifications" />
          <ul className="divide-y">{notifications.filter((n) => n.userId === me.id).slice(0, 4).map((n) => (
            <li key={n.id} className="flex gap-3 px-5 py-3"><Bell className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm">{n.text}</p><p className="text-[11px] text-muted-foreground">{n.date}</p></div></li>
          ))}</ul>
        </Card>
      </div>
    </>
  );
}

function Browse() {
  const st = useStudent();
  const { register } = useRegisterActions();
  const [q, setQ] = useState(""); const [dep, setDep] = useState("all"); const [sem, setSem] = useState("all"); const [cr, setCr] = useState("all");
  const [confirm, setConfirm] = useState<Course | null>(null);
  const rows = useMemo(() => st.courses.filter((c) =>
    (q === "" || `${c.code} ${c.title}`.toLowerCase().includes(q.toLowerCase())) &&
    (dep === "all" || c.deptId === dep) && (sem === "all" || String(c.semester) === sem) && (cr === "all" || String(c.credits) === cr)), [st.courses, q, dep, sem, cr]);
  const seats = (c: Course) => c.capacity - st.registrations.filter((r) => r.courseId === c.id && r.status !== "rejected").length;
  return (
    <>
      <PageHeader title="Browse Courses" desc={`You have ${st.settings.creditLimit - st.credits} credit hours remaining this semester.`} />
      <DataTable rows={rows} toolbar={<>
        <SearchInput value={q} onChange={setQ} placeholder="Search by code or name" className="sm:w-72" />
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <NativeSelect value={dep} onChange={setDep}><option value="all">All departments</option>{st.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</NativeSelect>
          <NativeSelect value={sem} onChange={setSem}><option value="all">All semesters</option><option value="1">Semester 1</option><option value="2">Semester 2</option></NativeSelect>
          <NativeSelect value={cr} onChange={setCr}><option value="all">Any credits</option>{[2, 3, 4].map((n) => <option key={n} value={n}>{n} credits</option>)}</NativeSelect>
        </div></>}
        columns={[
          { key: "code", header: "Code", cell: (c) => <span className="font-semibold">{c.code}</span> },
          { key: "title", header: "Title", cell: (c) => <div><p className="font-medium">{c.title}</p><p className="text-xs text-muted-foreground">{st.dept(c.deptId)?.name} · Sem {c.semester}</p></div> },
          { key: "lec", header: "Lecturer", cell: (c) => st.lect(c.lecturerId) },
          { key: "cr", header: "Credits", cell: (c) => c.credits },
          { key: "seats", header: "Seats", cell: (c) => { const s = seats(c); return s <= 0 ? <Badge>Full</Badge> : <span className={s < 5 ? "font-semibold text-warning" : ""}>{s} / {c.capacity}</span>; } },
          { key: "act", header: "", className: "text-right", cell: (c) => {
            const reg = st.myRegs.find((r) => r.courseId === c.id);
            if (reg) return <Badge>{reg.status === "approved" ? "Registered" : reg.status}</Badge>;
            return <Button size="sm" disabled={seats(c) <= 0} onClick={() => setConfirm(c)}>Register</Button>;
          } },
        ]} />
      <Confirm open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title={`Register for ${confirm?.code}?`}
        desc={<>{confirm?.title} · {confirm?.credits} credit hours. Schedule: {confirm?.slots.map((s) => `${s.day} ${fmtTime(s.start)}–${fmtTime(s.end)}`).join(", ")}</>}
        confirmLabel="Register" onConfirm={() => { if (confirm) register(confirm); setConfirm(null); }} />
    </>
  );
}

function Registrations() {
  const st = useStudent();
  const { drop } = useRegisterActions();
  const [target, setTarget] = useState<Course | null>(null);
  return (
    <>
      <PageHeader title="My Registrations" desc="Fall 2026 semester" actions={<Button asChild><Link to="/student/$section" params={{ section: "courses" }}>Add course</Link></Button>} />
      <Card className="mb-6 p-5">
        <div className="flex items-center justify-between text-sm"><span className="font-semibold">Credit hours used</span><span className="text-muted-foreground">{st.credits} of {st.settings.creditLimit}</span></div>
        <Progress value={(st.credits / st.settings.creditLimit) * 100} className="mt-3 h-2" />
      </Card>
      <DataTable rows={st.myCourses.map((x) => ({ ...x, id: x.reg.id }))}
        empty={<EmptyState icon={BookOpen} title="No registered courses" desc="Browse the course catalogue to register." />}
        columns={[
          { key: "code", header: "Code", cell: (x) => <span className="font-semibold">{x.course.code}</span> },
          { key: "t", header: "Title", cell: (x) => x.course.title },
          { key: "l", header: "Lecturer", cell: (x) => st.lect(x.course.lecturerId) },
          { key: "c", header: "Credits", cell: (x) => x.course.credits },
          { key: "d", header: "Date", cell: (x) => x.reg.date },
          { key: "s", header: "Status", cell: (x) => <Badge>{x.reg.status}</Badge> },
          { key: "a", header: "", className: "text-right", cell: (x) => <Button size="sm" variant="outline" className="text-destructive" onClick={() => setTarget(x.course)}>Drop</Button> },
        ]} />
      <Confirm open={!!target} onOpenChange={(o) => !o && setTarget(null)} destructive title={`Drop ${target?.code}?`} desc="Your seat will be released and may be taken by another student." confirmLabel="Drop course" onConfirm={() => { if (target) drop(target.id); setTarget(null); }} />
    </>
  );
}

function Results() {
  const st = useStudent();
  const graded = st.myCourses.filter((x) => x.reg.grade != null);
  const pts = graded.reduce((s, x) => s + gradeLetter(x.reg.grade!).points * x.course.credits, 0);
  const cr = graded.reduce((s, x) => s + x.course.credits, 0);
  const gpa = cr ? (pts / cr).toFixed(2) : "—";
  return (
    <>
      <PageHeader title="Academic Results" desc="Grades published by your lecturers." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Semester GPA" value={gpa} icon={Award} tone="success" />
        <StatCard label="Graded credits" value={cr} icon={Clock} tone="navy" />
        <StatCard label="Awaiting grades" value={st.myCourses.length - graded.length} icon={GraduationCap} tone="warning" />
      </div>
      <DataTable rows={st.myCourses.map((x) => ({ ...x, id: x.reg.id }))} columns={[
        { key: "c", header: "Course", cell: (x) => <div><p className="font-semibold">{x.course.code}</p><p className="text-xs text-muted-foreground">{x.course.title}</p></div> },
        { key: "cr", header: "Credits", cell: (x) => x.course.credits },
        { key: "m", header: "Mark", cell: (x) => x.reg.grade ?? "—" },
        { key: "g", header: "Grade", cell: (x) => x.reg.grade != null ? <Badge tone={x.reg.grade >= 50 ? "success" : "danger"}>{gradeLetter(x.reg.grade).letter}</Badge> : <Badge tone="warning">Pending</Badge> },
        { key: "p", header: "Points", cell: (x) => x.reg.grade != null ? gradeLetter(x.reg.grade).points.toFixed(2) : "—" },
      ]} />
    </>
  );
}

function Profile() {
  const st = useStudent();
  const [form, setForm] = useState({ name: st.me.name, phone: st.me.phone });
  const [err, setErr] = useState("");
  const save = async () => {
    if (form.name.trim().length < 3) { setErr("Name must be at least 3 characters."); return; }
    setErr("");
    try {
      await st.updateMyProfile({ name: form.name.trim(), phone: form.phone });
      toast.success("Profile updated");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unable to update profile");
    }
  };
  return (
    <>
      <PageHeader title="Profile" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center">
          <Avatar name={st.me.name} className="mx-auto size-20 text-xl" />
          <p className="mt-4 font-semibold">{st.me.name}</p><p className="text-xs text-muted-foreground">{st.me.email}</p>
          <div className="mt-4 space-y-2 text-left text-sm">
            {[["Student ID", st.me.id], ["Department", st.dept(st.me.deptId)?.name], ["Academic year", `Year ${st.me.year}`]].map(([k, v]) => <div key={k} className="flex justify-between border-t pt-2"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>)}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Personal information" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Full name" error={err}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><Input value={st.me.email} disabled /></Field>
            <Field label="Department"><Input value={st.dept(st.me.deptId)?.name ?? ""} disabled /></Field>
            <div className="sm:col-span-2"><Button onClick={save}>Save changes</Button></div>
          </div>
        </Card>
      </div>
    </>
  );
}

function Notifications() {
  const st = useStudent();
  const mine = st.notifications.filter((n) => n.userId === st.me.id);
  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="outline" onClick={() => { st.update((s) => ({ notifications: s.notifications.map((n) => n.userId === st.me.id ? { ...n, read: true } : n) })); toast.success("All marked as read"); }}>Mark all read</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHead title="Personal" />
          {mine.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : <ul className="divide-y">{mine.map((n) => (
            <li key={n.id} className="flex items-start gap-3 px-5 py-3">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-primary"}`} />
              <div className="flex-1"><p className="text-sm">{n.text}</p><p className="text-[11px] text-muted-foreground">{n.date}</p></div>
            </li>))}</ul>}
        </Card>
        <Card><CardHead title="Announcements" /><AnnouncementList filter={(a) => a === "All" || st.myCourses.some((x) => x.course.code === a)} /></Card>
      </div>
    </>
  );
}

export function StudentApp({ section }: { section: string }) {
  const st = useStore();
  const profileLoaded = st.students.some((student) => student.id === st.session?.refId);
  const body = (() => {
    switch (section) {
      case "courses": return <Browse />;
      case "registrations": return <Registrations />;
      case "timetable": return <Timetable />;
      case "results": return <Results />;
      case "profile": return <Profile />;
      case "notifications": return <Notifications />;
      case "settings": return <SettingsPage />;
      default: return <Overview />;
    }
  })();
  return <AppShell role="student" nav={studentNav} section={section}>
    {st.session?.role === "student" && (profileLoaded ? body : <div className="p-8 text-sm text-muted-foreground">Loading your profile...</div>)}
  </AppShell>;
}

function Timetable() {
  const st = useStudent();
  return (<><PageHeader title="My Timetable" desc="Weekly schedule. Conflicting courses are blocked at registration." /><TimetableGrid courses={st.myCourses.map((x) => x.course)} lecturerName={st.lect} /></>);
}
