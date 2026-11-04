import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, GraduationCap, Mail, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";
import { CampusBackground, DARK_COLORS, LIGHT_COLORS } from "@/components/app/CampusBackground";
import { useTheme } from "@/lib/ThemeContext";
import { HERO_CHECKLIST } from "@/lib/site-constants";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in – SCRS" }] }),
  component: Login,
});

function Login() {
  const { login } = useStore();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const base = isDark ? DARK_COLORS : LIGHT_COLORS;
  const C = {
    ...base,
    accent2:   isDark ? "#00bfd4" : "#06b6d4",
    btnText:   isDark ? "#0b1626" : "#ffffff",
    cardSolid: isDark ? "#13243a" : "#ffffff",
  };

  /* ── submit — unchanged auth logic ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (!id.trim()) v.id = "Enter your email or username.";
    if (pw.length < 6) v.pw = "Password must be at least 6 characters.";
    setErr(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      const s = await login(id.trim(), pw, remember);
      toast.success(`Welcome back, ${s.name}!`);
      navigate({
        to: s.role === "student" ? "/student/$section" : s.role === "lecturer" ? "/lecturer/$section" : "/admin/$section",
        params: { section: "overview" },
      });
    } catch (x) {
      setErr({ form: (x as Error).message });
    } finally {
      setLoading(false);
    }
  };

  /* ── input style + handlers ── */
  const inputBase: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.cardBorder}`,
    color: C.text,
    borderRadius: "12px",
    fontSize: "15px",
    width: "100%",
    minHeight: "44px",
    outline: "none",
    transition: "border-color 200ms ease-out, box-shadow 200ms ease-out",
    backdropFilter: "blur(8px)",
    boxSizing: "border-box",
  };

  const focusH = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = C.accent;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accent}30`;
  };
  const blurH = (hasError: boolean) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = hasError ? "#dc2626" : (C as any).cardBorder;
    e.currentTarget.style.boxShadow = "none";
  };
  const hoverEnter = (hasError: boolean) => (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget && !hasError)
      e.currentTarget.style.borderColor = `${C.accent}80`;
  };
  const hoverLeave = (hasError: boolean) => (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget && !hasError)
      e.currentTarget.style.borderColor = (C as any).cardBorder;
  };

  return (
    <CampusBackground overlayOpacity={isDark ? 0.2 : 0.12} parallax={false} theme={theme} pageType="login">
      <div style={{ minHeight: "100vh", display: "flex", userSelect: "text" }}>
        {/* ══════════ BRANDED PANEL (desktop) ══════════ */}
        <div
          className="hidden lg:flex"
          style={{
            width: "45%",
            position: "relative",
            overflow: "hidden",
            background: isDark
              ? "linear-gradient(135deg, rgba(15,31,53,0.7), rgba(11,22,38,0.9))"
              : "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(11,22,38,0.03))",
            borderRight: `1px solid ${C.cardBorder}`,
          }}
        >
          {/* grid pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle, ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} 1px, transparent 1px)`,
            backgroundSize: "48px 48px", opacity: 0.5, pointerEvents: "none",
          }} />
          {/* glow */}
          <div style={{
            position: "absolute", top: "15%", right: "-100px",
            width: "300px", height: "300px", borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}20 0%, transparent 70%)`,
            filter: "blur(60px)", pointerEvents: "none",
          }} />

          {/* content */}
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
              The modern way to <span style={{ color: C.accent }}>register courses.</span>
            </h2>
            <p style={{ color: C.textMuted, fontSize: "16px", lineHeight: 1.6, margin: "0 0 36px" }}>
              Sign in to manage your registrations, view timetables, and track academic progress — all in one place.
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
        <div className="flex-1" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: "440px" }}>
            {/* mobile brand */}
            <div className="flex lg:hidden" style={{ marginBottom: "32px", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={18} color={C.accent} />
              </div>
              <span style={{ color: C.accent, fontWeight: 700, fontSize: "18px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>SCRS</span>
            </div>

            {/* heading */}
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ color: C.text, fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, margin: "0 0 8px" }}>
                Welcome back
              </h1>
              <p style={{ color: C.textMuted, fontSize: "15px", margin: 0 }}>
                Sign in to your SCRS account to continue.
              </p>
            </div>

            {/* form card */}
            <div style={{
              background: C.card, borderRadius: "20px", padding: "32px",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: `0 8px 32px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)"}`,
              backdropFilter: "blur(8px)",
            }}>
              {err.form && (
                <div style={{
                  background: "#DC262620", border: "1px solid #DC262640",
                  color: "#dc2626", borderRadius: "10px", padding: "12px 16px",
                  fontSize: "14px", marginBottom: "20px",
                }} role="alert">
                  {err.form}
                </div>
              )}

              <form onSubmit={submit} noValidate autoComplete="off">
                {/* email */}
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="login-id" style={{ display: "block", color: C.textMuted, fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                    Email or Username
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="login-id"
                      value={id} onChange={(e) => setId(e.target.value)}
                      autoComplete="off" placeholder="you@university.edu"
                      style={{ ...inputBase, padding: "0 16px 0 44px", borderColor: err.id ? "#dc2626" : (C as any).cardBorder }}
                      onFocus={focusH}
                      onBlur={blurH(!!err.id)}
                      onMouseEnter={hoverEnter(!!err.id)}
                      onMouseLeave={hoverLeave(!!err.id)}
                    />
                  </div>
                  {err.id && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>{err.id}</p>}
                </div>

                {/* password */}
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label htmlFor="login-pw" style={{ color: C.textMuted, fontSize: "13px", fontWeight: 600 }}>Password</label>
                    <button type="button" className="hover-underline"
                      style={{ color: C.accent, fontSize: "12px", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => navigate({ to: "/forgot-password" })}>
                      Forgot your password?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={18} color={C.textMuted} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      id="login-pw"
                      type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)}
                      autoComplete="off" placeholder="••••••••"
                      style={{ ...inputBase, padding: "0 48px 0 44px", borderColor: err.pw ? "#dc2626" : (C as any).cardBorder }}
                      onFocus={focusH}
                      onBlur={blurH(!!err.pw)}
                      onMouseEnter={hoverEnter(!!err.pw)}
                      onMouseLeave={hoverLeave(!!err.pw)}
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      aria-label={show ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMuted, padding: 0, display: "flex" }}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {err.pw && <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>{err.pw}</p>}
                </div>

                {/* divider */}
                <div style={{ margin: "20px 0", height: "1px", background: `linear-gradient(90deg, transparent, ${(C as any).cardBorder}, transparent)` }} />

                {/* remember me */}
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: C.textMuted, fontSize: "13px", marginBottom: "20px" }}>
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                  Keep me signed in
                </label>

                {/* submit */}
                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                    color: C.btnText, fontWeight: 700, fontSize: "15px",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: `0 6px 24px ${C.accent}45`,
                    transition: "transform 200ms ease-out, box-shadow 200ms ease-out, opacity 200ms",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    opacity: loading ? 0.7 : 1, minHeight: "44px",
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${C.accent}60`; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 6px 24px ${C.accent}45`; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>

                {/* divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: (C as any).cardBorder }} />
                  <span style={{ color: C.textMuted, fontSize: "12px" }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: (C as any).cardBorder }} />
                </div>

                {/* signup link */}
                <p style={{ textAlign: "center", fontSize: "14px", color: C.textMuted, margin: 0 }}>
                  Don't have an account?{" "}
                  <Link to="/register" className="hover-underline"
                    style={{ color: C.accent, fontWeight: 700, textDecoration: "none" }}>
                    Register
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </CampusBackground>
  );
}
