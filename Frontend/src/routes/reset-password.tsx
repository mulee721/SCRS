import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, GraduationCap, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset Password – SCRS" }] }),
  component: ResetPassword,
  validateSearch: (search: Record<string, any>) => ({
    email: search.email || "",
    code: search.code || "",
  }),
});

const C = {
  bg:      "#1B2938",
  card:    "#202D3D",
  accent:  "#00DCEB",
  accent2: "#00BFD4",
  border:  "#34485E",
  text:    "#F1F5F9",
  muted:   "#94A3B8",
  input:   "#162030",
  error:   "#F87171",
};

function PwBar({ pw }: { pw: string }) {
  if (!pw.length) return null;
  const s   = pw.length >= 12 ? 4 : pw.length >= 10 ? 3 : pw.length >= 8 ? 2 : 1;
  const col = s === 1 ? "#F87171" : s === 2 ? "#FB923C" : s === 3 ? "#FACC15" : C.accent;
  const lbl = ["", "Weak", "Fair", "Good", "Strong"][s];
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: "4px", borderRadius: "4px",
            background: i <= s ? col : C.border, transition: "background .3s" }} />
        ))}
      </div>
      <p style={{ color: col, fontSize: "12px", margin: 0 }}>{lbl} password{s >= 3 ? " ✓" : ""}</p>
    </div>
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const email = search.email || "";
  const code = search.code || "";

  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (pw.length < 8)                      v.pw = "Password must be at least 8 characters.";
    if (pw !== confirmPw)                   v.confirmPw = "Passwords do not match.";
    if (!email)                             v.email = "Email is required.";
    if (!code)                              v.code = "Verification code is required.";
    setErr(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: pw }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      toast.success("Password reset successfully! Redirecting to login…");
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (x) {
      setErr({ form: (x as Error).message });
      toast.error((x as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    background:  C.input,
    border:      `1.5px solid ${C.border}`,
    color:       C.text,
    borderRadius: "10px",
    padding:     "12px 16px",
    fontSize:    "14px",
    width:       "100%",
    outline:     "none",
    transition:  "border-color .2s, box-shadow .2s",
  };

  const onF = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = C.accent;
    e.currentTarget.style.boxShadow   = `0 0 0 3px ${C.accent}25`;
  };
  const onB = (key: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = err[key] ? C.error : C.border;
    e.currentTarget.style.boxShadow   = "none";
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>

      <div style={{ maxWidth: "420px", width: "100%" }}>

        {/* brand */}
        <div className="flex lg:hidden" style={{ marginBottom: "32px", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "9px",
            background: `${C.accent}20`, border: `1.5px solid ${C.accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={18} color={C.accent} />
          </div>
          <span style={{ color: C.accent, fontWeight: 800, fontSize: "18px" }}>SCRS</span>
        </div>

        <h1 style={{ color: C.accent, fontSize: "32px", fontWeight: 800,
          margin: "0 0 8px", textShadow: `0 0 24px ${C.accent}50` }}>
          Create new password
        </h1>
        <p style={{ color: C.muted, fontSize: "15px", margin: "0 0 24px" }}>
          Set a new password for your account.
        </p>

        <div style={{ background: C.card, borderRadius: "20px", padding: "32px",
          border: `1px solid ${C.border}`, boxShadow: `0 20px 60px #00000050` }}>

          {err.form && (
            <div style={{ background: "#F8717120", border: "1px solid #F8717140",
              color: C.error, borderRadius: "10px", padding: "12px 16px",
              fontSize: "14px", marginBottom: "20px" }}>
              {err.form}
            </div>
          )}

          <form onSubmit={submit} noValidate>

            {/* password */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: C.muted, fontSize: "13px",
                fontWeight: 600, marginBottom: "8px" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{ ...inputBase, paddingRight: "48px", borderColor: err.pw ? C.error : C.border }}
                  onFocus={onF} onBlur={onB("pw")} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {err.pw && <p style={{ color: C.error, fontSize: "12px", marginTop: "6px" }}>{err.pw}</p>}
              <PwBar pw={pw} />
            </div>

            {/* confirm password */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: C.muted, fontSize: "13px",
                fontWeight: 600, marginBottom: "8px" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input type={showCf ? "text" : "password"} value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat your password"
                  style={{ ...inputBase, paddingRight: "48px", borderColor: err.confirmPw ? C.error : C.border }}
                  onFocus={onF} onBlur={onB("confirmPw")} />
                <button type="button" onClick={() => setShowCf(!showCf)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0, display: "flex" }}>
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {err.confirmPw && <p style={{ color: C.error, fontSize: "12px", marginTop: "6px" }}>{err.confirmPw}</p>}
              {confirmPw.length > 0 && !err.confirmPw && pw === confirmPw && (
                <p style={{ color: C.accent, fontSize: "12px", marginTop: "6px",
                  display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 size={13} /> Passwords match
                </p>
              )}
            </div>

            {/* submit */}
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                color: "#0f1e2d", fontWeight: 800, fontSize: "15px", cursor: "pointer",
                boxShadow: `0 6px 24px ${C.accent}50`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                opacity: loading ? 0.7 : 1, transition: "opacity .2s" }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.92"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = loading ? "0.7" : "1"; }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "14px", color: C.muted, marginTop: "20px" }}>
          <Link to="/login"
            style={{ color: C.accent, fontWeight: 700, textDecoration: "none" }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
