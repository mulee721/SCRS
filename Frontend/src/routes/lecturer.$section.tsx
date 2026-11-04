import { createFileRoute } from "@tanstack/react-router";
import { LecturerApp } from "@/components/roles/LecturerApp";

export const Route = createFileRoute("/lecturer/$section")({
  head: () => ({ meta: [{ title: "Lecturer Portal – SCRS" }, { name: "description", content: "Manage your courses, students and grades." }, { property: "og:title", content: "Lecturer Portal – SCRS" }, { property: "og:description", content: "Manage your courses, students and grades." }] }),
  component: LecturerSection,
});

function LecturerSection() {
  return <LecturerApp section={Route.useParams().section} />;
}
