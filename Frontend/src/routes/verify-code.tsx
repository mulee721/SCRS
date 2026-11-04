import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/verify-code")({
  ssr: false,
  head: () => ({ meta: [{ title: "Verify Code – SCRS" }] }),
  component: VerifyCode,
  validateSearch: (search: Record<string, any>) => ({
    email: search.email || "",
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

function VerifyCode() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const email = search.email || "";

  const [code, setCode] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (code.length !== 6)  v.code = "Enter the 6-digit code.";
    if (!email)             v.email = "Email is required.";
    setErr(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid code. Please try again.");
      }

      toast.success("Code verified! Redirecting to password reset…");
      setTimeout(() => {
        navigate({ to: "/reset-password", search: { email, code } });
      }, 1500);
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
          Verify code
        </h1>
        <p style={{ color: C.muted, fontSize: "15px", margin: "0 0 24px" }}>
          Enter the 6-digit code sent to your email to verify your identity.
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

            {/* code input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: C.muted, fontSize: "13px",
                fontWeight: 600, marginBottom: "8px" }}>
                6-Digit Code
              </label>
              <input
                type="text" 
                value={code} 
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" 
                maxLength={6}
                style={{ ...inputBase, letterSpacing: "8px", fontSize: "18px",
                  textAlign: "center", borderColor: err.code ? C.error : C.border }}
                onFocus={onF} 
                onBlur={onB("code")}
              />
              {err.code && <p style={{ color: C.error, fontSize: "12px", marginTop: "6px" }}>{err.code}</p>}
              <p style={{ color: C.muted, fontSize: "12px", marginTop: "8px" }}>
                Check your email for the verification code
              </p>
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
              {loading ? "Verifying…" : <><span>Verify Code</span><ArrowRight size={16} /></>}
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
