import { useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { DAYS, fmtTime, type Course, type Slot } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { Card, CardHead, EmptyState, PageHeader } from "./kit";
import { useTheme } from "./AppShell";

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i);
const palette = ["bg-primary/12 border-primary text-primary", "bg-success/12 border-success text-success", "bg-warning/15 border-warning text-warning", "bg-navy/10 border-navy text-navy dark:text-primary", "bg-destructive/10 border-destructive text-destructive"];

export function TimetableGrid({ courses, lecturerName }: { courses: Course[]; lecturerName: (id: string | null) => string }) {
  if (courses.length === 0) return <Card><EmptyState title="No classes scheduled" desc="Register for courses to see your weekly timetable." /></Card>;
  return (
    <Card className="overflow-x-auto">
      <div className="grid min-w-[760px]" style={{ gridTemplateColumns: "64px repeat(5, 1fr)", gridTemplateRows: `40px repeat(${HOURS.length}, 56px)` }}>
        <div />
        {DAYS.map((d) => <div key={d} className="border-b border-l px-3 py-2.5 text-xs font-semibold text-muted-foreground">{d}</div>)}
        {HOURS.map((h, r) => (
          <div key={h} className="contents">
            <div className="border-b px-2 pt-1 text-[10px] text-muted-foreground" style={{ gridRow: r + 2, gridColumn: 1 }}>{fmtTime(h)}</div>
            {DAYS.map((d, ci) => <div key={d} className="border-b border-l" style={{ gridRow: r + 2, gridColumn: ci + 2 }} />)}
          </div>
        ))}
        {courses.flatMap((co, i) => co.slots.map((s: Slot, k) => (
          <div key={co.id + k} className={`m-1 overflow-hidden rounded-lg border-l-4 p-2 text-xs ${palette[i % palette.length]}`}
            style={{ gridColumn: DAYS.indexOf(s.day) + 2, gridRow: `${s.start - 8 + 2} / ${s.end - 8 + 2}` }}>
            <p className="font-bold">{co.code}</p>
            <p className="truncate text-foreground/80">{co.title}</p>
            <p className="mt-0.5 text-[10px] text-foreground/60">{fmtTime(s.start)}–{fmtTime(s.end)} · {s.room}</p>
            <p className="truncate text-[10px] text-foreground/60">{lecturerName(co.lecturerId)}</p>
          </div>
        )))}
      </div>
    </Card>
  );
}

export function AnnouncementList({ filter }: { filter?: (audience: string) => boolean }) {
  const { announcements } = useStore();
  const list = announcements.filter((a) => !filter || filter(a.audience));
  if (!list.length) return <EmptyState icon={Megaphone} title="No announcements yet" />;
  return (
    <ul className="divide-y">
      {list.map((a) => (
        <li key={a.id} className="px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">{a.title}</p>
            <span className="shrink-0 text-[11px] text-muted-foreground">{a.date}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
          <p className="mt-2 text-[11px] font-medium text-primary">{a.author} · {a.audience}</p>
        </li>
      ))}
    </ul>
  );
}

export function SettingsPage() {
  const { dark, toggle } = useTheme();
  const [emailNotes, setEmailNotes] = useState(true);

  return (
    <>
      <PageHeader title="Settings" desc="Manage appearance, notifications and security." />
      <div className="grid gap-6">
        <Card>
          <CardHead title="Preferences" />
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Dark mode</p><p className="text-xs text-muted-foreground">Easier on the eyes at night.</p></div><Switch checked={dark} onCheckedChange={toggle} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Email notifications</p><p className="text-xs text-muted-foreground">Registration and grade updates.</p></div><Switch checked={emailNotes} onCheckedChange={(v) => { setEmailNotes(v); toast.success(v ? "Email notifications on" : "Email notifications off"); }} /></div>
          </div>
        </Card>
      </div>
    </>
  );
}
