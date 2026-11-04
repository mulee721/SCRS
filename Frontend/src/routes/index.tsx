import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarCheck, BarChart3, ShieldCheck, Bell, Gauge, GraduationCap,
  ArrowRight, CheckCircle2, Users, BookOpen, Star, Zap, Clock,
  CalendarDays, Moon, MapPin, Phone, Mail,
  Linkedin, Github, Twitter, Instagram,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Site";
import { CampusBackground } from "@/components/app/CampusBackground";
import { useTheme } from "@/lib/ThemeContext";
import { SITE_STATS, SOCIAL_PROOF, HERO_CHECKLIST } from "@/lib/site-constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SCRS – Student Course Registration System" },
      { name: "description", content: "Register for courses, view timetables and track grades at Jimma University." },
    ],
  }),
  component: Home,
});

/* ── theme-aware palette ── */
function getColors(isDark: boolean) {
  return {
    bg:          isDark ? "#0b1626"                : "#f8fbff",
    card:        isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    cardSolid:   isDark ? "#13243a"               : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    accent:      isDark ? "#00e5ff" : "#0891b2",
    accent2:     isDark ? "#00bfd4" : "#06b6d4",
    labelAccent: isDark ? "#00e5ff" : "#0e7490",
    border:      isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    text:        isDark ? "#ffffff" : "#0f172a",
    textMuted:   isDark ? "#cbd5e1" : "#475569",
    sectionBg:   isDark ? "rgba(15,31,53,0.5)" : "rgba(255,255,255,0.65)",
    inputBg:     isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
    btnText:     isDark ? "#0b1626" : "#ffffff",
  };
}
type Colors = ReturnType<typeof getColors>;

/* ─── data ─────────────────────────────────────────────────── */
const platformFeatures = [
  { icon: CalendarCheck, title: "Conflict Detection",  desc: "Overlapping classes blocked automatically before you confirm registration." },
  { icon: Gauge,         title: "Credit Limits",       desc: "Automatic enforcement of per-semester credit-hour maximums per student." },
  { icon: Bell,          title: "Live Notifications",  desc: "Instant alerts for approvals, grade posts and registration deadlines." },
  { icon: BarChart3,     title: "Reports & Analytics", desc: "Enrollment charts and department stats — export to CSV in one click." },
  { icon: ShieldCheck,   title: "Role-based Access",   desc: "Secure, separate workspaces for students, lecturers and administrators." },
  { icon: GraduationCap, title: "Grade Management",    desc: "Lecturers post grades online; students see results the same moment." },
  { icon: CalendarDays,  title: "Smart Timetable",     desc: "Visual weekly schedule auto-built from your confirmed registrations." },
  { icon: Moon,          title: "Light & Dark Mode",   desc: "Comfortable on every screen, day or night — toggle in one click." },
];

const heroStats = [
  { value: SITE_STATS[0].value, label: SITE_STATS[0].label, icon: Users    },
  { value: SITE_STATS[1].value, label: SITE_STATS[1].label, icon: BookOpen },
  { value: SITE_STATS[2].value, label: SITE_STATS[2].label, icon: Zap      },
];

const roles = [
  { emoji: "🎓", role: "Students",  items: ["Browse & register for courses", "Auto conflict & credit checks", "View GPA, transcript & timetable", "Get instant grade notifications"] },
  { emoji: "📚", role: "Lecturers", items: ["View full class rosters", "Enter and manage grades online", "Track real-time enrollment numbers", "Communicate with students"] },
  { emoji: "🏛️", role: "Admins",    items: ["Manage depts, courses & semesters", "Approve or reject registrations", "Provision lecturer login accounts", "Generate & export detailed reports"] },
];

const steps = [
  { n: "01", title: "Create your account",   desc: "Register in under 2 minutes — name, email, department and a secure password." },
  { n: "02", title: "Browse & pick courses", desc: "Search by department or semester. Conflicts and credit limits are checked automatically." },
  { n: "03", title: "Register & track",      desc: "Submit your selections and track grades, notifications and academic progress live." },
];

const testimonials = [
  { q: "Course registration used to take a full day at the registrar's office. Now it takes 3 minutes online.", name: "Hana Tesfaye",      role: "3rd year, Computer Science", ini: "H" },
  { q: "Managing class rosters, posting grades and seeing dashboards — all in one place. Saves me hours weekly.", name: "Dr. Robert Taylor", role: "Professor, CS Department",    ini: "R" },
  { q: "The admin dashboard replaced 5 spreadsheets. We have real-time visibility into every registration.",      name: "Mekdes Alemu",     role: "Academic Registrar",         ini: "M" },
];

const avatarLetters = ["H", "R", "M", "A"];

const teamMembers = [
  { name: "Prof. Abebe Girma",    role: "Rector, Jimma University",        ini: "AG" },
  { name: "Dr. Sara Tadesse",     role: "Academic Registrar",              ini: "ST" },
  { name: "Mulugeta Kebede",      role: "Lead Engineer",                   ini: "MK" },
  { name: "Tigist Haile",         role: "UX & Product Design",             ini: "TH" },
];

/* ─── shared components ─────────────────────────────────────── */
function Btn({ to, children, outline, C }: { to: string; children: ReactNode; outline?: boolean; C: Colors }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <button
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "12px 28px", borderRadius: "10px", fontWeight: 700,
          fontSize: "15px", cursor: "pointer", transition: "all 200ms ease-out",
          ...(outline
            ? { background: "transparent", border: `1.5px solid ${C.accent}80`, color: C.accent }
            : { background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, border: "none", color: C.btnText, boxShadow: `0 6px 24px ${C.accent}40` }),
        }}
        onMouseEnter={(e) => {
          if (outline) e.currentTarget.style.background = `${C.accent}12`;
          else { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${C.accent}60`; }
        }}
        onMouseLeave={(e) => {
          if (outline) e.currentTarget.style.background = "transparent";
          else { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 24px ${C.accent}40`; }
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {children}
      </button>
    </Link>
  );
}

function SectionBadge({ icon: Icon, label, C }: { icon: typeof Zap; label: string; C: Colors }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${C.accent}15`, border: `1px solid ${C.accent}35`, borderRadius: "100px", padding: "5px 16px", marginBottom: "16px" }}>
      <Icon size={12} color={C.accent} />
      <span style={{ color: C.accent, fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</span>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────── */
function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const C = getColors(isDark);

  /* contact form state */
  const [cf, setCf] = useState({ name: "", email: "", msg: "" });
  const [cfErr, setCfErr] = useState("");
  const [cfSent, setCfSent] = useState(false);

  return (
    <SiteLayout>

      {/* ══════════ HERO ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.25 : 0.15} parallax theme={theme} pageType="landing">
        <section id="home" style={{ position: "relative", overflow: "hidden", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              {/* left */}
              <div style={{ position: "relative", zIndex: 10 }}>
                <div className="animate-slide-down" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${C.accent}15`, border: `1px solid ${C.accent}35`, borderRadius: "100px", padding: "6px 18px", marginBottom: "24px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.accent, boxShadow: `0 0 8px ${C.accent}`, display: "inline-block" }} />
                  <span style={{ color: C.labelAccent, fontSize: "13px", fontWeight: 600 }}>Jimma University · 2026</span>
                </div>

                <h1 className="animate-fade-up" style={{ color: C.text, fontSize: "clamp(2.5rem, 5vw, 4.25rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 20px", animationDelay: "0.1s" }}>
                  The modern way to<br />
                  <span style={{ color: C.accent, textShadow: `0 0 20px ${C.accent}25` }}>register courses.</span>
                </h1>

                <p className="animate-fade-up" style={{ color: C.textMuted, fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.6, maxWidth: "520px", margin: "0 0 28px", animationDelay: "0.2s" }}>
                  Automatic timetable conflict detection, credit-limit enforcement, and real-time grade tracking — built for students, lecturers and administrators at your fingertips.
                </p>

                <div className="animate-fade-up" style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px", animationDelay: "0.3s" }}>
                  <Btn to="/login" C={C}>Get started free <ArrowRight size={16} /></Btn>
                  <Btn to="/register" outline C={C}>Create student account</Btn>
                </div>

                <div className="animate-fade-up" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px", animationDelay: "0.4s" }}>
                  <div style={{ display: "flex" }}>
                    {Array.from({ length: SOCIAL_PROOF.avatarCount }).map((_, i) => (
                      <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${C.accent}20`, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontWeight: 700, fontSize: "12px", marginLeft: i === 0 ? 0 : "-8px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {avatarLetters[i]}
                      </div>
                    ))}
                  </div>
                  <span style={{ color: C.textMuted, fontSize: "14px" }}>{SOCIAL_PROOF.text}</span>
                </div>

                <div className="animate-fade-up grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animationDelay: "0.5s" }}>
                  {HERO_CHECKLIST.map((item) => (
                    <span key={item} style={{ display: "flex", alignItems: "center", gap: "8px", color: C.textMuted, fontSize: "14px" }}>
                      <CheckCircle2 size={16} color={C.accent} style={{ flexShrink: 0 }} />{item}
                    </span>
                  ))}
                </div>
              </div>

              {/* right: dashboard preview */}
              <div className="hidden lg:flex items-center justify-center" style={{ position: "relative" }}>
                <div style={{ position: "absolute", width: "380px", height: "380px", borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}25 0%, transparent 70%)`, filter: "blur(60px)", zIndex: 0 }} />
                <div className="animate-slide-right" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px", animationDelay: "0.2s" }}>
                  <div className="animate-float" style={{ animationDelay: "0.9s" }}>
                    <div style={{ borderRadius: "20px", overflow: "hidden", border: `1px solid ${C.cardBorder}`, boxShadow: `0 40px 80px ${isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.12)"}, 0 0 40px ${C.accent}15`, background: C.cardSolid, backdropFilter: "blur(8px)" }}>
                      <div style={{ background: isDark ? "#0a1420" : "#1a2a3a", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: `1px solid ${C.accent}20` }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {["#ff5f57", "#febc2e", "#28c840"].map((col) => <div key={col} style={{ width: "12px", height: "12px", borderRadius: "50%", background: col }} />)}
                        </div>
                        <div style={{ flex: 1, background: isDark ? C.bg : "rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 12px", display: "flex", alignItems: "center", gap: "4px", marginLeft: "8px" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent }} />
                          <span style={{ color: isDark ? C.textMuted : "rgba(255,255,255,0.6)", fontSize: "12px" }}>scrs.university.edu</span>
                        </div>
                      </div>
                      <div style={{ background: C.bg, padding: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px", marginBottom: "16px" }}>
                          {[{ label: "Registered", val: "4", col: C.accent }, { label: "Credits", val: "15", col: "#60a5fa" }, { label: "GPA", val: "3.7", col: "#a78bfa" }, { label: "Alerts", val: "2", col: "#34d399" }].map(({ label, val, col }) => (
                            <div key={label} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "10px", padding: "14px" }}>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: col, marginBottom: "8px" }} />
                              <p style={{ color: col, fontSize: "22px", fontWeight: 700, margin: "0 0 2px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{val}</p>
                              <p style={{ color: C.textMuted, fontSize: "12px", margin: 0 }}>{label}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {["CS101 · Mon 10:00", "CS201 · Tue 14:00", "BUS201 · Thu 9:00"].map((c) => (
                            <div key={c} style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}30`, borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.accent, flexShrink: 0 }} />
                              <span style={{ color: C.textMuted, fontSize: "12px" }}>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* stats strip */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12" style={{ marginTop: "56px", paddingTop: "40px", borderTop: `1px solid ${C.border}` }}>
              {heroStats.map(({ value, label, icon: Icon }) => (
                <div key={label} style={{ textAlign: "center", flex: "1 1 120px", maxWidth: "240px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "10px", background: `${C.accent}18`, border: `1px solid ${C.accent}30`, marginBottom: "10px" }}>
                    <Icon size={18} color={C.accent} />
                  </div>
                  <p style={{ color: C.accent, fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, margin: "0 0 4px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{value}</p>
                  <p style={{ color: C.textMuted, fontSize: "14px", margin: 0, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ ABOUT ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.18 : 0.1} parallax={false} theme={theme} pageType="landing">
        <section id="about" style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", background: C.sectionBg, padding: "48px clamp(20px, 4vw, 48px)", borderRadius: "24px", border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* text */}
              <div>
                <SectionBadge icon={GraduationCap} label="About SCRS" C={C} />
                <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.625rem)", fontWeight: 700, margin: "0 0 20px", lineHeight: 1.2 }}>
                  Built for Jimma University
                </h2>
                <p style={{ color: C.textMuted, fontSize: "16px", lineHeight: 1.75, margin: "0 0 16px" }}>
                  SCRS replaces paper forms and long registrar queues with a single online platform. Students register for courses with automatic credit-limit and timetable-conflict checks, lecturers manage their classes and grades, and administrators oversee semesters, departments and reports.
                </p>
                <p style={{ color: C.textMuted, fontSize: "16px", lineHeight: 1.75, margin: "0 0 32px" }}>
                  Designed to be fast, accessible on any device and easy to use for everyone on campus — from the first-year student to the head of the registrar office.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {["Fast & reliable", "Mobile-friendly", "Accessible", "Secure"].map((tag) => (
                    <span key={tag} style={{ background: `${C.accent}15`, border: `1px solid ${C.accent}35`, color: C.accent, borderRadius: "100px", padding: "5px 14px", fontSize: "13px", fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* team grid */}
              <div>
                <p style={{ color: C.textMuted, fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>The team behind it</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  {teamMembers.map(({ name, role: r, ini }) => (
                    <div key={name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "12px", transition: "border-color 200ms" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.accent}50`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontWeight: 700, fontSize: "14px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        {ini}
                      </div>
                      <div>
                        <p style={{ color: C.text, fontSize: "14px", fontWeight: 600, margin: "0 0 2px" }}>{name}</p>
                        <p style={{ color: C.textMuted, fontSize: "12px", margin: 0 }}>{r}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ FEATURES ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.18 : 0.1} parallax={false} theme={theme} pageType="landing">
        <section id="features" style={{ padding: "72px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", background: C.sectionBg, padding: "48px clamp(20px, 4vw, 40px)", borderRadius: "24px", border: `1px solid ${C.border}` }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <SectionBadge icon={Zap} label="Platform features" C={C} />
              <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.625rem)", fontWeight: 700, margin: "0 0 16px" }}>Everything your campus needs</h2>
              <p style={{ color: C.textMuted, fontSize: "17px", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto" }}>
                From first registration to final transcript — SCRS handles the full academic lifecycle.
              </p>
            </div>
            <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {platformFeatures.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "18px", padding: "28px", position: "relative", overflow: "hidden", transition: "all 200ms ease-out", cursor: "default" }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = `${C.accent}60`; el.style.transform = "translateY(-4px)"; el.style.boxShadow = `0 16px 40px ${C.accent}12`; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = C.border; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.accent}60, transparent)`, opacity: 0.6 }} />
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${C.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <Icon size={22} color={C.accent} />
                  </div>
                  <h3 style={{ color: C.text, fontSize: "16px", fontWeight: 700, margin: "0 0 10px" }}>{title}</h3>
                  <p style={{ color: C.textMuted, fontSize: "14px", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  <span style={{ position: "absolute", right: "16px", bottom: "-8px", fontSize: "72px", fontWeight: 700, color: `${C.text}04`, pointerEvents: "none", userSelect: "none", lineHeight: 1, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.2 : 0.12} parallax theme={theme} pageType="landing">
        <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "72px 24px" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", background: C.sectionBg, padding: "48px clamp(20px, 4vw, 40px)", borderRadius: "24px", border: `1px solid ${C.border}` }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <SectionBadge icon={Clock} label="How it works" C={C} />
              <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.625rem)", fontWeight: 700, margin: "0 0 16px" }}>Up and running in minutes</h2>
              <p style={{ color: C.textMuted, fontSize: "17px", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>Three simple steps to your complete academic management portal.</p>
            </div>
            <div style={{ display: "grid", gap: "32px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {steps.map(({ n, title, desc }) => (
                <div key={n} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  <div style={{ width: "56px", height: "56px", flexShrink: 0, borderRadius: "14px", border: `1.5px solid ${C.accent}50`, background: `${C.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: C.accent, boxShadow: `0 0 16px ${C.accent}20`, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    {n}
                  </div>
                  <div style={{ paddingTop: "4px" }}>
                    <h3 style={{ color: C.text, fontSize: "17px", fontWeight: 700, margin: "0 0 10px" }}>{title}</h3>
                    <p style={{ color: C.textMuted, fontSize: "14px", lineHeight: 1.65, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ ROLES ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.15 : 0.08} parallax={false} theme={theme} pageType="landing">
        <section style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", background: C.sectionBg, padding: "48px clamp(20px, 4vw, 40px)", borderRadius: "24px", border: `1px solid ${C.border}` }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <SectionBadge icon={Users} label="Who it's for" C={C} />
              <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.625rem)", fontWeight: 700, margin: "0 0 16px" }}>Built for every role on campus</h2>
              <p style={{ color: C.textMuted, fontSize: "17px", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto" }}>One system, three tailored dashboards — each showing only what you need.</p>
            </div>
            <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {roles.map(({ emoji, role, items }) => (
                <div key={role} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", overflow: "hidden", transition: "all 200ms ease-out" }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = `${C.accent}60`; el.style.transform = "translateY(-6px)"; el.style.boxShadow = `0 20px 50px ${C.accent}15`; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = C.border; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                  <div style={{ background: isDark ? "linear-gradient(135deg, #0f2030, #162840)" : "linear-gradient(135deg, #e0f7fa, #f0f9ff)", borderBottom: `1px solid ${C.border}`, padding: "28px" }}>
                    <span style={{ fontSize: "44px" }}>{emoji}</span>
                    <h3 style={{ color: C.text, fontSize: "22px", fontWeight: 700, margin: "12px 0 6px" }}>{role}</h3>
                    <span style={{ display: "inline-block", background: `${C.accent}20`, border: `1px solid ${C.accent}40`, color: C.accent, borderRadius: "100px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>Tailored dashboard</span>
                  </div>
                  <div style={{ padding: "24px" }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {items.map((item) => (
                        <li key={item} style={{ display: "flex", alignItems: "center", gap: "10px", color: C.textMuted, fontSize: "14px", padding: "6px 0" }}>
                          <CheckCircle2 size={15} color={C.accent} style={{ flexShrink: 0 }} />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.2 : 0.12} parallax theme={theme} pageType="landing">
        <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "72px 24px" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", background: C.sectionBg, padding: "48px clamp(20px, 4vw, 40px)", borderRadius: "24px", border: `1px solid ${C.border}` }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <SectionBadge icon={Star} label="Testimonials" C={C} />
              <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.625rem)", fontWeight: 700, margin: 0 }}>Loved by the campus</h2>
            </div>
            <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {testimonials.map(({ q, name, role: r, ini }) => (
                <div key={name} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "18px", padding: "28px", transition: "all 200ms ease-out" }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = `${C.accent}50`; el.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = C.border; el.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "20px" }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={15} color={C.accent} fill={C.accent} />)}
                  </div>
                  <p style={{ color: C.textMuted, fontSize: "14px", lineHeight: 1.7, margin: "0 0 24px" }}>"{q}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: `1px solid ${C.border}`, paddingTop: "20px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontWeight: 700, fontSize: "14px", flexShrink: 0, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{ini}</div>
                    <div>
                      <p style={{ color: C.text, fontWeight: 700, fontSize: "14px", margin: "0 0 2px" }}>{name}</p>
                      <p style={{ color: C.textMuted, fontSize: "12px", margin: 0, opacity: 0.7 }}>{r}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ CONTACT ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.18 : 0.1} parallax={false} theme={theme} pageType="landing">
        <section id="contact" style={{ padding: "72px 24px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto", background: C.sectionBg, padding: "48px clamp(20px, 4vw, 48px)", borderRadius: "24px", border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* left: info */}
              <div>
                <SectionBadge icon={Mail} label="Contact" C={C} />
                <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.625rem)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>Get in touch</h2>
                <p style={{ color: C.textMuted, fontSize: "16px", lineHeight: 1.7, margin: "0 0 32px" }}>
                  Questions about registration, account issues or anything else? Our registrar team is here to help.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
                  {[
                    { Icon: MapPin, label: "Address",   value: "Main Campus, Jimma, Ethiopia" },
                    { Icon: Phone,  label: "Phone",     value: "+251 972 272 667" },
                    { Icon: Mail,   label: "Email",     value: "registrar@scrs.edu" },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${C.accent}18`, border: `1px solid ${C.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={18} color={C.accent} />
                      </div>
                      <div>
                        <p style={{ color: C.textMuted, fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 2px" }}>{label}</p>
                        <p style={{ color: C.text, fontSize: "15px", margin: 0 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* social row */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {[
                    { href: "https://www.linkedin.com/mulee217", Icon: Linkedin, label: "LinkedIn" },
                    { href: "https://github.com/mulee721",        Icon: Github,   label: "GitHub"   },
                    { href: "https://x.com/DabaMuluge21496",      Icon: Twitter,  label: "X"        },
                    { href: "https://www.instagram.com/mulee_19/",Icon: Instagram,label: "Instagram"},
                  ].map(({ href, Icon, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                      style={{ width: "40px", height: "40px", borderRadius: "10px", border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 180ms ease-out" }}
                      onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = C.accent; el.style.color = C.accent; el.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = C.border; el.style.color = C.textMuted; el.style.transform = "translateY(0)"; }}>
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>

              {/* right: contact form */}
              <div>
                {cfSent ? (
                  <div style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}40`, borderRadius: "16px", padding: "40px", textAlign: "center" }}>
                    <CheckCircle2 size={48} color={C.accent} style={{ marginBottom: "16px" }} />
                    <h3 style={{ color: C.text, fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>Message sent!</h3>
                    <p style={{ color: C.textMuted, fontSize: "15px", margin: "0 0 24px" }}>We'll get back to you within one business day.</p>
                    <button onClick={() => { setCfSent(false); setCf({ name: "", email: "", msg: "" }); }}
                      style={{ background: "transparent", border: `1px solid ${C.accent}60`, color: C.accent, borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "background 180ms" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${C.accent}12`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                      Send another
                    </button>
                  </div>
                ) : (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "32px" }}>
                    <h3 style={{ color: C.text, fontSize: "18px", fontWeight: 700, margin: "0 0 24px" }}>Send us a message</h3>

                    {cfErr && (
                      <div style={{ background: "#DC262618", border: "1px solid #DC262640", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", marginBottom: "16px" }}>
                        {cfErr}
                      </div>
                    )}

                    <form autoComplete="off" onSubmit={(e) => {
                      e.preventDefault();
                      if (!cf.name.trim() || !/\S+@\S+\.\S+/.test(cf.email) || cf.msg.length < 10) {
                        setCfErr("Please fill in all fields with a valid email and at least 10 characters in your message.");
                        return;
                      }
                      setCfErr("");
                      setCfSent(true);
                      toast.success("Message sent. We'll reply soon.");
                    }}>
                      {/* name + email row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
                        <div>
                          <label style={{ display: "block", color: C.textMuted, fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Your name</label>
                          <input value={cf.name} onChange={(e) => setCf({ ...cf, name: e.target.value })} placeholder="Abebe Kebede"
                            style={{ width: "100%", background: C.inputBg, border: `1px solid ${C.border}`, color: C.text, borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 180ms" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                        </div>
                        <div>
                          <label style={{ display: "block", color: C.textMuted, fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Email address</label>
                          <input type="email" value={cf.email} onChange={(e) => setCf({ ...cf, email: e.target.value })} placeholder="you@example.com"
                            style={{ width: "100%", background: C.inputBg, border: `1px solid ${C.border}`, color: C.text, borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 180ms" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                        </div>
                      </div>

                      {/* message */}
                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", color: C.textMuted, fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Message</label>
                        <textarea value={cf.msg} onChange={(e) => setCf({ ...cf, msg: e.target.value })} placeholder="Tell us how we can help…" rows={5}
                          style={{ width: "100%", background: C.inputBg, border: `1px solid ${C.border}`, color: C.text, borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "Inter, sans-serif", transition: "border-color 180ms" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = C.accent; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }} />
                      </div>

                      <button type="submit"
                        style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, color: C.btnText, fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "transform 150ms, box-shadow 150ms", boxShadow: `0 4px 16px ${C.accent}30` }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${C.accent}50`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${C.accent}30`; }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                        Send message <ArrowRight size={16} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </CampusBackground>

      {/* ══════════ FINAL CTA ══════════ */}
      <CampusBackground overlayOpacity={isDark ? 0.25 : 0.15} parallax theme={theme} pageType="landing">
        <section style={{ padding: "80px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative" }}>
            <SectionBadge icon={Zap} label="Get started today" C={C} />
            <h2 style={{ color: C.text, fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, margin: "0 0 20px", lineHeight: 1.15 }}>
              Join thousands of{" "}
              <span style={{ color: C.accent, textShadow: `0 0 20px ${C.accent}25` }}>students today.</span>
            </h2>
            <p style={{ color: C.textMuted, fontSize: "18px", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto 40px" }}>
              Sign in with your university credentials or create a free student account in under 2 minutes.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
              <Btn to="/login" C={C}>Sign in now <ArrowRight size={16} /></Btn>
              <Btn to="/register" outline C={C}>Create student account</Btn>
            </div>
            <p style={{ color: C.textMuted, fontSize: "13px", margin: 0, opacity: 0.7 }}>Free · No credit card required · Instant access</p>
          </div>
        </section>
      </CampusBackground>

    </SiteLayout>
  );
}
