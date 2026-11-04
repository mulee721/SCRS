import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Site";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About SCRS" }, { name: "description", content: "Why Addis Valley University built SCRS." }, { property: "og:title", content: "About SCRS" }, { property: "og:description", content: "Why Addis Valley University built SCRS." }] }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-3xl font-bold">About SCRS</h1>
        <p className="mt-4 text-muted-foreground">SCRS replaces paper forms and long registrar queues with a single online platform. Students register for courses with automatic credit-limit and timetable-conflict checks, lecturers manage their classes and grades, and administrators oversee semesters, departments and reports.</p>
        <p className="mt-4 text-muted-foreground">Built for Addis Valley University, it is designed to be fast, accessible on any device and easy to use for everyone on campus.</p>
      </section>
    </SiteLayout>
  ),
});
