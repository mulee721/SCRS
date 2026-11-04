import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/Site";
import { Card, Field } from "@/components/app/kit";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact – SCRS" }, { name: "description", content: "Get in touch with the registrar office." }, { property: "og:title", content: "Contact – SCRS" }, { property: "og:description", content: "Get in touch with the registrar office." }] }),
  component: Contact,
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  const [err, setErr] = useState("");
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-20">
        <h1 className="text-3xl font-bold">Contact the registrar</h1>
        <Card className="mt-8 space-y-4 p-6">
          <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Email"><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Message" error={err}><Textarea rows={4} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /></Field>
          <Button onClick={() => { if (!f.name || !/\S+@\S+\.\S+/.test(f.email) || f.msg.length < 10) { setErr("Please fill in all fields with a valid email."); return; } setErr(""); setF({ name: "", email: "", msg: "" }); toast.success("Message sent. We'll reply soon."); }}>Send message</Button>
        </Card>
      </section>
    </SiteLayout>
  );
}
