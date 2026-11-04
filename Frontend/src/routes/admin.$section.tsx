import { createFileRoute } from "@tanstack/react-router";
import { AdminApp } from "@/components/roles/AdminApp";

export const Route = createFileRoute("/admin/$section")({
  head: () => ({ meta: [{ title: "Admin Console – SCRS" }, { name: "description", content: "University registration administration." }, { property: "og:title", content: "Admin Console – SCRS" }, { property: "og:description", content: "University registration administration." }] }),
  component: AdminSection,
});

function AdminSection() {
  return <AdminApp section={Route.useParams().section} />;
}
