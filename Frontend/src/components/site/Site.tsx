import type { ReactNode } from "react";
import { useState, useEffect, useCallback } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Mail, MapPin, Phone, GraduationCap,
  Sun, Moon, Menu, X,
  Home, Info, Star, MessageSquare,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

/* ── single place to change the university name ── */
const UNIVERSITY_NAME = "Jimma University";

/* ─────────────────────────────────────────────────────────
   Social SVG icons (inline — stays crisp on retina)
───────────────────────────────────────────────────────── */
const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const IconGitHub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

/* ── animated social link button ── */
function SocialLink({
  href, label, icon, accent, border,
}: {
  href: string; label: string; icon: React.ReactNode;
  accent: string; border: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="social-link"
      style={{ "--social-accent": accent, "--social-border": border } as React.CSSProperties}
    >
      {icon}
      <span className="social-link__tooltip">{label}</span>
    </a>
  );
}

/* ── nav links (icon for mobile rows) ── */
const navLinks = [
  { to: "/",         label: "Home",     Icon: Home          },
  { to: "/about",    label: "About",    Icon: Info          },
  { to: "/features", label: "Features", Icon: Star          },
  { to: "/contact",  label: "Contact",  Icon: MessageSquare },
] as const;

/* ── theme-aware palette ── */
function getColors(isDark: boolean) {
  return {
    bg:           isDark ? "#0b1626"                : "#f8fbff",
    headerBg:     isDark ? "rgba(11,22,38,0.85)"    : "rgba(248,251,255,0.85)",
    accent:       isDark ? "#00e5ff"                : "#0891b2",
    accent2:      isDark ? "#00bfd4"                : "#06b6d4",
    accentBg:     isDark ? "rgba(0,229,255,0.08)"   : "rgba(8,145,178,0.08)",
    headerBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    footerBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    text:         isDark ? "#ffffff"                : "#0f172a",
    muted:        isDark ? "#cbd5e1"                : "#475569",
    toggleBorder: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db",
    footer:       isDark ? "#080f1a"                : "#f0f4f8",
    btnText:      isDark ? "#0b1626"                : "#ffffff",
  };
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const C = getColors(isDark);

  const pathname = useRouterState({ select: s => s.location.pathname });
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* close on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* close on Escape */
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setMobileOpen(false);
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  /* shadow after 8 px scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>

      {/* ══════════ HEADER ══════════ */}
      <header
        style={{
          position:             "sticky",
          top:                  0,
          zIndex:               50,
          background:           C.headerBg,
          borderBottom:         `1px solid ${C.headerBorder}`,
          backdropFilter:       "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:            scrolled
            ? `0 4px 20px ${isDark ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.06)"}`
            : "none",
          transition:           "box-shadow 200ms ease-out",
        }}
      >
        {/*
          Three-column layout inside a max-w-7xl container:
            [logo]   [nav — absolute center]   [actions]
          The nav is position:absolute so it's always centred relative to the
          header regardless of how wide the logo or actions group is.
        */}
        <div
          style={{
            maxWidth:  "80rem",
            margin:    "0 auto",
            padding:   "0 24px",
            height:    "64px",
            display:   "flex",
            alignItems:"center",
            position:  "relative",   /* anchor for the absolute nav */
          }}
        >

          {/* ── LOGO (left) ── */}
          <Link
            to="/"
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            "10px",
              textDecoration: "none",
              flexShrink:     0,
              zIndex:         1,
            }}
          >
            <div
              style={{
                width:          "36px",
                height:         "36px",
                borderRadius:   "9px",
                background:     `${C.accent}20`,
                border:         `1.5px solid ${C.accent}40`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap size={18} color={C.accent} aria-hidden="true" />
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <span
                style={{
                  display:    "block",
                  color:      C.accent,
                  fontWeight: 600,
                  fontSize:   "15px",
                  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                SCRS
              </span>
              <span
                style={{
                  display:    "block",
                  color:      C.muted,
                  fontSize:   "12px",
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                }}
              >
                {UNIVERSITY_NAME}
              </span>
            </div>
          </Link>

          {/* ── NAV — truly centered via absolute positioning (desktop lg+) ── */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex"
            style={{
              position:       "absolute",
              left:           "50%",
              transform:      "translateX(-50%)",
              display:        "flex",
              alignItems:     "center",
              gap:            "2px",
            }}
          >
            {navLinks.map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  /* CSS class drives hover + active underline — no inline-style fights */
                  className={`site-nav-link${active ? " site-nav-link--active" : ""}`}
                  style={
                    {
                      "--nav-accent": C.accent,
                      "--nav-accent-bg": C.accentBg,
                      "--nav-muted": C.muted,
                    } as React.CSSProperties
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── ACTIONS (right) ── */}
          <div
            style={{
              marginLeft: "auto",
              display:    "flex",
              alignItems: "center",
              gap:        "6px",
              zIndex:     1,
            }}
          >
            {/* theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="site-icon-btn"
              style={
                {
                  "--btn-border":  C.toggleBorder,
                  "--btn-accent":  C.accent,
                  "--btn-muted":   C.muted,
                  color:           C.muted,
                } as React.CSSProperties
              }
            >
              {theme === "dark"
                ? <Sun  size={18} aria-hidden="true" />
                : <Moon size={18} aria-hidden="true" />}
            </button>

            {/* sign in — desktop only */}
            <Link
              to="/login"
              className="hidden lg:inline-flex site-signin-link"
              style={
                {
                  "--link-accent": C.accent,
                  "--link-muted":  C.muted,
                  color:           C.muted,
                } as React.CSSProperties
              }
            >
              Sign in
            </Link>

            {/* get started — desktop only */}
            <Link to="/register" className="hidden lg:inline-flex" style={{ textDecoration: "none" }}>
              <button
                className="site-cta-btn"
                style={
                  {
                    "--cta-accent":   C.accent,
                    "--cta-btn-text": C.btnText,
                  } as React.CSSProperties
                }
              >
                Get started
              </button>
            </Link>

            {/* hamburger — mobile/tablet only (below lg) */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="lg:hidden site-icon-btn"
              style={
                {
                  "--btn-border": C.toggleBorder,
                  "--btn-accent": C.accent,
                  "--btn-muted":  C.muted,
                  color:          C.muted,
                } as React.CSSProperties
              }
            >
              {mobileOpen
                ? <X    size={20} aria-hidden="true" />
                : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE SLIDE-DOWN PANEL ── */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="lg:hidden"
            style={{
              background:           C.headerBg,
              borderBottom:         `1px solid ${C.headerBorder}`,
              backdropFilter:       "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              animation:            "slideInDown 0.22s ease-out",
            }}
          >
            <div
              style={{
                maxWidth:      "80rem",
                margin:        "0 auto",
                padding:       "8px 20px 16px",
                display:       "flex",
                flexDirection: "column",
                gap:           "2px",
              }}
            >
              {navLinks.map(({ to, label, Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`site-mobile-link${active ? " site-mobile-link--active" : ""}`}
                    style={
                      {
                        "--nav-accent":    C.accent,
                        "--nav-accent-bg": C.accentBg,
                        "--nav-muted":     C.muted,
                      } as React.CSSProperties
                    }
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}

              {/* divider + auth buttons */}
              <div
                style={{
                  borderTop:  `1px solid ${C.headerBorder}`,
                  marginTop:  "8px",
                  paddingTop: "12px",
                  display:    "flex",
                  gap:        "10px",
                }}
              >
                <Link
                  to="/login"
                  className="site-mobile-auth-outline"
                  style={
                    {
                      "--nav-accent":    C.accent,
                      "--nav-accent-bg": C.accentBg,
                    } as React.CSSProperties
                  }
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="site-mobile-auth-solid"
                  style={
                    {
                      "--cta-accent":   C.accent,
                      "--cta-btn-text": C.btnText,
                    } as React.CSSProperties
                  }
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══════════ CONTENT ══════════ */}
      <main>{children}</main>

      {/* ══════════ FOOTER ══════════ */}
      <footer
        style={{
          background: C.footer,
          borderTop:  `1px solid ${C.footerBorder}`,
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        {/* subtle top glow line */}
        <div
          style={{
            position:   "absolute",
            inset:      "0 0 auto 0",
            height:     "1px",
            background: `linear-gradient(90deg, transparent, ${C.accent}50, transparent)`,
          }}
        />
        {/* ambient blob */}
        <div
          style={{
            position:      "absolute",
            top:           "-80px",
            left:          "50%",
            transform:     "translateX(-50%)",
            width:         "400px",
            height:        "200px",
            borderRadius:  "50%",
            background:    `${C.accent}08`,
            filter:        "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "80rem",
            margin:   "0 auto",
            padding:  "56px 24px 32px",
            position: "relative",
          }}
        >
          <div
            style={{
              display:             "grid",
              gap:                 "40px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              marginBottom:        "48px",
            }}
          >
            {/* brand column */}
            <div>
              <div
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         "10px",
                  marginBottom:"16px",
                }}
              >
                <div
                  style={{
                    width:          "36px",
                    height:         "36px",
                    borderRadius:   "9px",
                    background:     `${C.accent}20`,
                    border:         `1.5px solid ${C.accent}40`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap size={18} color={C.accent} />
                </div>
                <div>
                  <span
                    style={{
                      display:    "block",
                      color:      C.accent,
                      fontWeight: 600,
                      fontSize:   "14px",
                      fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
                    }}
                  >
                    SCRS
                  </span>
                  <span style={{ display: "block", color: C.muted, fontSize: "12px" }}>
                    {UNIVERSITY_NAME}
                  </span>
                </div>
              </div>
              <p
                style={{
                  color:     C.muted,
                  fontSize:  "13px",
                  lineHeight: 1.7,
                  maxWidth:  "260px",
                  margin:    "0 0 20px",
                }}
              >
                Streamlining course registration, academic planning, and grade management for our entire campus.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <SocialLink href="https://www.linkedin.com/mulee217"          label="LinkedIn"  accent={C.accent} border={C.footerBorder} icon={<IconLinkedIn />} />
                <SocialLink href="https://github.com/mulee721"                label="GitHub"    accent={C.accent} border={C.footerBorder} icon={<IconGitHub />} />
                <SocialLink href="https://x.com/DabaMuluge21496"              label="X (Twitter)" accent={C.accent} border={C.footerBorder} icon={<IconX />} />
                <SocialLink href="https://www.instagram.com/mulee_19/"        label="Instagram" accent={C.accent} border={C.footerBorder} icon={<IconInstagram />} />
              </div>
            </div>

            {/* platform links */}
            <div>
              <p
                style={{
                  color:          C.accent,
                  fontSize:       "12px",
                  fontWeight:     700,
                  textTransform:  "uppercase",
                  letterSpacing:  "1.5px",
                  marginBottom:   "16px",
                }}
              >
                Platform
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="hover-underline"
                    style={{
                      color:          C.muted,
                      fontSize:       "14px",
                      textDecoration: "none",
                      transition:     "color 180ms ease-out",
                      width:          "fit-content",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = C.accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = C.muted; }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* contact */}
            <div>
              <p
                style={{
                  color:         C.accent,
                  fontSize:      "12px",
                  fontWeight:    700,
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom:  "16px",
                }}
              >
                Contact
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: MapPin, text: "Main Campus, Jimma, Ethiopia" },
                  { icon: Phone,  text: "+251 972 272 667"              },
                  { icon: Mail,   text: "registrar@scrs.edu"            },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <Icon size={14} color={C.accent} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: C.muted, fontSize: "13px" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* bottom bar */}
          <div
            style={{
              borderTop:      `1px solid ${C.footerBorder}`,
              paddingTop:     "24px",
              display:        "flex",
              flexWrap:       "wrap",
              justifyContent: "space-between",
              alignItems:     "center",
              gap:            "12px",
            }}
          >
            <p style={{ color: C.muted, fontSize: "12px", margin: 0, opacity: 0.6 }}>
              © {new Date().getFullYear()} {UNIVERSITY_NAME}. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "24px" }}>
              {["Privacy Policy", "Terms of Service", "Accessibility"].map((t) => (
                <span
                  key={t}
                  style={{
                    color:      C.muted,
                    fontSize:   "12px",
                    cursor:     "pointer",
                    opacity:    0.6,
                    transition: "color 180ms ease-out",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color   = C.accent;
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color   = C.muted;
                    e.currentTarget.style.opacity = "0.6";
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
