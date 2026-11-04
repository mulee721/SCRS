import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Gauge, Bell, BarChart3, ShieldCheck, Moon } from "lucide-react";
import { SiteLayout } from "@/components/site/Site";
import { Card } from "@/components/app/kit";

const f = [
  { i: CalendarDays, t: "Conflict detection", d: "Overlapping classes are blocked before they happen." },
  { i: Gauge, t: "Credit limits", d: "Students can't exceed the configured credit-hour maximum." },
  { i: Bell, t: "Notifications", d: "Approvals, grades and deadlines delivered instantly." },
  { i: BarChart3, t: "Reports", d: "Enrollment and department statistics with CSV export." },
  { i: ShieldCheck, t: "Role-based access", d: "Each role sees only its own tools." },
  { i: Moon, t: "Light & dark mode", d: "Comfortable on every screen, day or night." },
];

export const Route = createFileRoute("/features")({
  head: () => ({ meta: [{ title: "Features – SCRS" }, { name: "description", content: "Everything SCRS does for students, lecturers and admins." }, { property: "og:title", content: "Features – SCRS" }, { property: "og:description", content: "Everything SCRS does for students, lecturers and admins." }] }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="text-center text-3xl font-bold">Features</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{f.map((x) => <Card key={x.t} className="p-6"><x.i className="size-6 text-primary" /><p className="mt-3 font-semibold">{x.t}</p><p className="mt-1 text-sm text-muted-foreground">{x.d}</p></Card>)}</div>
      </section>
    </SiteLayout>
  ),
});
