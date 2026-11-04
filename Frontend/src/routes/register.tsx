import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Loader2, GraduationCap, Eye, EyeOff, CheckCircle2,
  User, Mail, Phone, Lock, ChevronDown, Calendar, Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { CampusBackground, DARK_COLORS, LIGHT_COLORS } from "@/components/app/CampusBackground";
import { useTheme } from "@/lib/ThemeContext";
import { HERO_CHECKLIST } from "@/lib/site-constants";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({ meta: [{ title: "Student Registration – SCRS" }] }),
  component: Register,
});

interface Dept { _id: string; code: string; name: string }

/* ── password strength meter ── */
function PwBar({ pw, isDark }: { pw: string; isDark: boolean }) {
  if (!pw.length) return null;
  const s   = pw.length >= 12 ? 4 : pw.length >= 10 ? 3 : pw.length >= 8 ? 2 : 1;
  const col = s === 1 ? "#dc2626" : s === 2 ? "#ea580c" : s === 3 ? "#ca8a04" : "#00e5ff";
  const lbl = ["", "Weak", "Fair", "Good", "Strong"][s];
  const C = isDark ? DARK_COLORS : LIGHT_COLORS;
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: "4px", borderRadius: "4px", background: i <= s ? col : C.cardBorder, transition: "background 300ms ease-out" }} />
        ))}
      </div>
      <p style={{ color: col, fontSize: "12px", margin: 0 }}>{lbl} password{s >= 3 ? " ✓" : ""}</p>
    </div>
  );
}

function Register() {
  const { registerStudent } = useStore();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === "dark";
  const base = isDark ? DARK_COLORS : LIGHT_COLORS;
  const C = {
    ...base,
    accent2:   isDark ? "#00bfd4" : "#06b6d4",
    btnText:   isDark ? "#0b1626" : "#ffffff",
    cardSolid: isDark ? "#13243a" : "#ffffff",
  };

  const [depts,        setDepts]        = useState<Dept[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(true);
  const [deptsError,   setDeptsError]   = useState("");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [deptId,   setDeptId]   = useState("");
  const [year,     setYear]     = useState("1");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [err,      setErr]      = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);

  /* ── fetch depts — unchanged ── */
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/departments")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json) => {
        const list: Dept[] = Array.isArray(json.data) ? json.data : [];
        setDepts(list);
        if (list.length) setDeptId(list[0]._id);
      })
      .catch(() => setDeptsError("Could not load departments. Is the backend running?"))
      .finally(() => setDeptsLoading(false));
  }, []);

  /* ── validation + submit — unchanged ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (name.trim().length < 3)                      v.name     = "Full name must be at least 3 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))   v.email    = "Enter a valid email address.";
    if (!phone.trim())                               v.phone    = "Phone number is required.";
    if (!deptId)                                     v.deptId   = "Please select a department.";
    if (password.length < 8)                         v.password = "Password must be at least 8 characters.";
    if (password !== confirm)                        v.confirm  = "Passwords do not match.";
    setErr(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await registerStudent({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), deptId, year: Number(year), password });
      toast.success("Account created! Please sign in.");
      navigate({ to: "/login" });
    } catch (x) {
      setErr({ form: (x as Error).message });
    } finally {
      setLoading(false);
    }
  };

  /* ── input style + handlers ── */
  const inputS = (key: string): React.CSSProperties => ({
    width: "100%", background: C.card, border: `1px solid ${err[key] ? "#dc2626" : C.cardBorder}`,
    color: C.text, borderRadius: "12px", padding: "0 16px 0 44px", fontSize: "15px",
    outline: "none", minHeight: "44px", boxSizing: "border-box",
    transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
    backdropFilter: "blur(8px)",
  });

  type FocusEl = HTMLInputElement | HTMLSelectElement;
  const onF = (e: React.FocusEvent<FocusEl>) => {
    e.currentTarget.style.borderColor = C.accent;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accent}30`;
  };
  const onB = (key: string) => (e: React.FocusEvent<FocusEl>) => {
    e.currentTarget.style.borderColor = err[key] ? "#dc2626" : C.cardBorder;
    e.currentTarget.style.boxShadow = "none";
  };
  const onHEnter = (key: string) => (e: React.MouseEvent<FocusEl>) => {
    if (document.activeElement !== e.currentTarget && !err[key]) e.currentTarget.style.borderColor = `${C.accent}80`;
  };
  const onHLeave = (key: string) => (e: React.MouseEvent<FocusEl>) => {
    if (document.activeElement !== e.currentTarget && !err[key]) e.currentTarget.style.borderColor = err[key] ? "#dc2626" : C.cardBorder;
  };

  const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor} style={{ display: "block", color: C.textMuted, fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>{children}</label>
  );
  const ErrMsg = ({ k }: { k: string }) => err[k] ? <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>{err[k]}</p> : null;

  const cardStyle: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.cardBorder}`,
    borderRadius: "20px", padding: "28px", marginBottom: "16px",
    boxShadow: `0 4px 24px ${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.06)"}`,
    backdropFilter: "blur(8px)",
  };
  const cardTitle: React.CSSProperties = {
    color: C.accent, fontSize: "12px", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 20px",
  };

  return (
    <CampusBackground overlayOpacity={isDark ? 0.2 : 0.12} parallax={false} theme={theme} pageType="register">
      <div style={{ minHeight: "100vh", display: "flex", userSelect: "text" }}>
        {/* ══════════ BRANDED PANEL (desktop) ══════════ */}
        <div
          className="hidden lg:flex"
          style={{
            width: "42%",
            position: "relative",
            overflow: "hidden",
            background: isDark
              ? "linear-gradient(135deg, rgba(15,31,53,0.7), rgba(11,22,38,0.9))"
              : "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(11,22,38,0.03))",
            borderRight: `1px solid ${C.cardBorder}`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} 1px, transparent 1px)`, backgroundSize: "48px 48px", opacity: 0.5, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "15%", right: "-100px", width: "300px", height: "300px", borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}20 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "480px" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "48px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={20} color={C.accent} />
              </div>
              <div>
                <span style={{ display: "block", color: C.accent, fontWeight: 700, fontSize: "16px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>SCRS</span>
                <span style={{ display: "block", color: C.textMuted, fontSize: "11px" }}>Addis Valley University</span>
              </div>
            </Link>

            <h2 style={{ color: C.text, fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 16px" }}>
              Start your <span style={{ color: C.accent }}>academic journey.</span>
            </h2>
            <p style={{ color: C.textMuted, fontSize: "16px", lineHeight: 1.6, margin: "0 0 36px" }}>
              Create your free student account in under 2 minutes and start registering courses right away.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
              {HERO_CHECKLIST.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: "10px", color: C.textMuted, fontSize: "15px" }}>
                  <CheckCircle2 size={18} color={C.accent} style={{ flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ══════════ FORM PANEL ══════════ */}
        <div className="flex-1" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px 60px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: "560px", position: "relative" }}>
            {/* mobile brand */}
            <div className="flex lg:hidden" style={{ marginBottom: "28px", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={18} color={C.accent} />
              </div>
              <span style={{ color: C.accent, fontWeight: 700, fontSize: "18px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>SCRS</span>
            </div>

            {/* heading */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h1 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, margin: "0 0 8px" }}>Create Account</h1>
              <p style={{ color: C.textMuted, fontSize: "15px", margin: 0 }}>Join Addis Valley University's student portal</p>
            </div>

            {err.form && (
              <div style={{ background: "#DC262620", border: "1px solid #DC262640", color: "#dc2626", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", marginBottom: "16px" }} role="alert">
                {err.form}
              </div>
            )}

            <form onSubmit={submit} noValidate autoComplete="off">
              {/* ── Personal Info ── */}
              <div style={cardStyle}>
                <p style={cardTitle}>Personal Information</p>

                {/* full name — full width */}
                <div style={{ marginBottom: "16px" }}>
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div style={{ position: "relative" }}>
                    <User size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Abebe Kebede" autoComplete="name"
                      style={inputS("name")} onFocus={onF} onBlur={onB("name")} onMouseEnter={onHEnter("name")} onMouseLeave={onHLeave("name")} />
                  </div>
                  <ErrMsg k="name" />
                </div>

                {/* email + phone — two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-email">Email Address</Label>
                    <div style={{ position: "relative" }}>
                      <Mail size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                        style={inputS("email")} onFocus={onF} onBlur={onB("email")} onMouseEnter={onHEnter("email")} onMouseLeave={onHLeave("email")} />
                    </div>
                    <ErrMsg k="email" />
                  </div>
                  <div>
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <div style={{ position: "relative" }}>
                      <Phone size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9XX XXX XXX" autoComplete="tel"
                        style={inputS("phone")} onFocus={onF} onBlur={onB("phone")} onMouseEnter={onHEnter("phone")} onMouseLeave={onHLeave("phone")} />
                    </div>
                    <ErrMsg k="phone" />
                  </div>
                </div>
              </div>

              {/* ── Academic Info ── */}
              <div style={cardStyle}>
                <p style={cardTitle}>Academic Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* department */}
                  <div>
                    <Label htmlFor="reg-dept">Department</Label>
                    <div style={{ position: "relative" }}>
                      <Building2 size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
                      {deptsLoading ? (
                        <div style={{ ...inputS("deptId"), display: "flex", alignItems: "center", gap: "8px", color: C.textMuted }}>
                          <Loader2 size={14} className="animate-spin" /> Loading…
                        </div>
                      ) : (
                        <>
                          <select id="reg-dept" value={deptId} onChange={(e) => setDeptId(e.target.value)}
                            style={{ ...inputS("deptId"), appearance: "none", paddingRight: "44px" }}
                            onFocus={onF} onBlur={onB("deptId")} onMouseEnter={onHEnter("deptId")} onMouseLeave={onHLeave("deptId")}>
                            {deptsError
                              ? <option value="">⚠ Backend error</option>
                              : <><option value="">Select department</option>{depts.map((d) => <option key={d._id} value={d._id}>{d.code} — {d.name}</option>)}</>}
                          </select>
                          <ChevronDown size={18} color={C.textMuted} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        </>
                      )}
                    </div>
                    <ErrMsg k="deptId" />
                    {deptsError && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>{deptsError}</p>}
                  </div>

                  {/* year */}
                  <div>
                    <Label htmlFor="reg-year">Academic Year</Label>
                    <div style={{ position: "relative" }}>
                      <Calendar size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
                      <select id="reg-year" value={year} onChange={(e) => setYear(e.target.value)}
                        style={{ ...inputS(""), appearance: "none", paddingRight: "44px" }}
                        onFocus={onF} onBlur={onB("")} onMouseEnter={onHEnter("")} onMouseLeave={onHLeave("")}>
                        {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                      <ChevronDown size={18} color={C.textMuted} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Security ── */}
              <div style={cardStyle}>
                <p style={cardTitle}>Account Security</p>

                {/* password */}
                <div style={{ marginBottom: "16px" }}>
                  <Label htmlFor="reg-pw">Password</Label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input id="reg-pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" autoComplete="off"
                      style={{ ...inputS("password"), paddingRight: "48px" }}
                      onFocus={onF} onBlur={onB("password")} onMouseEnter={onHEnter("password")} onMouseLeave={onHLeave("password")} />
                    <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", padding: 0 }}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrMsg k="password" />
                  <PwBar pw={password} isDark={isDark} />
                </div>

                {/* confirm */}
                <div>
                  <Label htmlFor="reg-cf">Confirm Password</Label>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input id="reg-cf" type={showCf ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password" autoComplete="off"
                      style={{ ...inputS("confirm"), paddingRight: "48px" }}
                      onFocus={onF} onBlur={onB("confirm")} onMouseEnter={onHEnter("confirm")} onMouseLeave={onHLeave("confirm")} />
                    <button type="button" onClick={() => setShowCf(!showCf)} aria-label={showCf ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", padding: 0 }}>
                      {showCf ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrMsg k="confirm" />
                  {confirm.length > 0 && !err.confirm && password === confirm && (
                    <p style={{ color: C.accent, fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} /> Passwords match
                    </p>
                  )}
                </div>
              </div>

              {/* submit */}
              <button type="submit" disabled={loading || deptsLoading}
                style={{
                  width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                  color: C.btnText, fontWeight: 700, fontSize: "15px",
                  cursor: (loading || deptsLoading) ? "not-allowed" : "pointer",
                  boxShadow: `0 6px 24px ${C.accent}45`,
                  transition: "transform 200ms ease-out, box-shadow 200ms ease-out, opacity 200ms",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  opacity: (loading || deptsLoading) ? 0.7 : 1, minHeight: "44px",
                }}
                onMouseEnter={(e) => { if (!loading && !deptsLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${C.accent}60`; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 24px ${C.accent}45`; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Creating account…" : "Create Student Account"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "14px", color: C.textMuted, marginTop: "20px" }}>
              Already have an account?{" "}
              <Link to="/login" className="hover-underline" style={{ color: C.accent, fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
            </p>
            <p style={{ textAlign: "center", fontSize: "12px", color: C.textMuted, marginTop: "10px", opacity: 0.7 }}>
              Lecturer &amp; admin accounts are provisioned by the registrar office.
            </p>
          </div>
        </div>
      </div>
    </CampusBackground>
  );
}
