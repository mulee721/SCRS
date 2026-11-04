import { createFileRoute } from "@tanstack/react-router";
import { StudentApp } from "@/components/roles/StudentApp";

export const Route = createFileRoute("/student/$section")({
  head: () => ({ meta: [{ title: "Student Portal – SCRS" }, { name: "description", content: "Your courses, timetable and results." }, { property: "og:title", content: "Student Portal – SCRS" }, { property: "og:description", content: "Your courses, timetable and results." }] }),
  component: StudentSection,
});

function StudentSection() {
  return <StudentApp section={Route.useParams().section} />;
}
