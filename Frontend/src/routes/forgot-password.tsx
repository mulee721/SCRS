import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, GraduationCap, ArrowRight, Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Forgot Password – SCRS" }] }),
  component: ForgotPassword,
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

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  // Handle resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendCode = async (emailToSend: string) => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset code.");
      }

      return true;
    } catch (x) {
      throw x;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      v.email = "Enter a valid email address.";
    }
    setErr(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await sendCode(email);
      toast.success("Reset code sent to your email!");
      setSent(true);
      setResendTimer(60); // 60 second cooldown
      // Redirect to verify code page after 2 seconds
      setTimeout(() => {
        navigate({ to: "/verify-code", search: { email } });
      }, 2000);
    } catch (x) {
      setErr({ form: (x as Error).message });
      toast.error((x as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      await sendCode(email);
      toast.success("Code resent to your email!");
      setResendTimer(60); // 60 second cooldown
    } catch (x) {
      toast.error((x as Error).message);
    } finally {
      setResendLoading(false);
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

        {!sent ? (
          <>
            <h1 style={{ color: C.accent, fontSize: "32px", fontWeight: 800,
              margin: "0 0 8px", textShadow: `0 0 24px ${C.accent}50` }}>
              Reset password
            </h1>
            <p style={{ color: C.muted, fontSize: "15px", margin: "0 0 24px" }}>
              Enter your email and we'll send a 6-digit code to reset your password.
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
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", color: C.muted, fontSize: "13px",
                    fontWeight: 600, marginBottom: "8px" }}>
                    Email Address
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    style={{ ...inputBase, borderColor: err.email ? C.error : C.border }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = C.accent;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accent}25`;
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = err.email ? C.error : C.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {err.email && <p style={{ color: C.error, fontSize: "12px", marginTop: "6px" }}>{err.email}</p>}
                </div>

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
                  {loading ? "Sending…" : "Send Reset Code"}
                </button>
              </form>
            </div>

            <p style={{ textAlign: "center", fontSize: "14px", color: C.muted, marginTop: "20px" }}>
              Remember your password?{" "}
              <Link to="/login"
                style={{ color: C.accent, fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%",
              background: `${C.accent}20`, border: `2px solid ${C.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px" }}>
              <Mail size={32} color={C.accent} />
            </div>
            <h2 style={{ color: C.text, fontSize: "24px", fontWeight: 800, margin: "0 0 12px" }}>
              Check your email
            </h2>
            <p style={{ color: C.muted, fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>
              We've sent a 6-digit code to <strong style={{ color: C.text }}>{email}</strong>.
              <br />
              Enter it on the next page to reset your password.
            </p>
            <button
              onClick={() => navigate({ to: "/verify-code", search: { email } })}
              style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                color: "#0f1e2d", fontWeight: 800, fontSize: "15px", cursor: "pointer",
                boxShadow: `0 6px 24px ${C.accent}50`, display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px", transition: "opacity .2s", marginBottom: "12px" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.92"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
              Enter code <ArrowRight size={16} />
            </button>

            {/* resend button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resendLoading}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
                background: resendTimer > 0 ? "transparent" : `${C.accent}15`,
                color: resendTimer > 0 ? C.muted : C.accent, fontWeight: 700, fontSize: "14px", 
                cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "all .2s" }}
              onMouseEnter={e => { 
                if (resendTimer === 0 && !resendLoading) {
                  (e.currentTarget as HTMLButtonElement).style.background = `${C.accent}25`;
                }
              }}
              onMouseLeave={e => { 
                (e.currentTarget as HTMLButtonElement).style.background = resendTimer > 0 ? "transparent" : `${C.accent}15`;
              }}>
              {resendLoading && <Loader2 size={14} className="animate-spin" />}
              {!resendLoading && <RotateCcw size={14} />}
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't receive the code? Resend"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
