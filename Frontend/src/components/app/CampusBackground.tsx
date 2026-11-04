import { useState, useRef, useEffect } from "react";

export type ThemeMode = "dark" | "light";
export type PageType = "landing" | "login" | "register";

interface CampusBackgroundProps {
  children: React.ReactNode;
  overlayOpacity?: number;
  parallax?: boolean;
  theme?: ThemeMode;
  pageType?: PageType;
}

// ── CSS Variables for consistent theming across all pages ──
const CSS_VARS_DARK = {
  bg: "#0b1626",           // deep navy base
  bgSecondary: "#0f1f35",  // slightly lighter navy for alternating sections
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.10)",
  accent: "#00e5ff",       // primary cyan
  accentGlow: "rgba(0,229,255,0.35)",    // top-right glow (15-20% brightened)
  accentGlowSoft: "rgba(99,102,241,0.25)", // bottom-left indigo glow
  text: "#ffffff",
  textMuted: "#cbd5e1",    // brighter secondary text (WCAG AA)
  gridPattern: "rgba(255,255,255,0.04)",
};

const CSS_VARS_LIGHT = {
  bg: "#f8fbff",           // soft white-blue
  bgSecondary: "#f0f8fc",  // slightly darker for sections
  card: "rgba(0,0,0,0.03)",
  cardBorder: "rgba(0,0,0,0.08)",
  accent: "#0891b2",       // dark slate cyan
  accentGlow: "rgba(8,145,178,0.30)",    // top-right glow (15-20% brightened)
  accentGlowSoft: "rgba(139,92,246,0.20)", // bottom-left violet glow
  text: "#0f172a",
  textMuted: "#475569",    // brighter secondary text for light mode
  gridPattern: "rgba(0,0,0,0.02)",
};

export const CampusBackground = ({
  children,
  overlayOpacity = 0.6,
  parallax = false,
  theme = "dark",
  pageType = "landing",
}: CampusBackgroundProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const bgImageRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const vars = isDark ? CSS_VARS_DARK : CSS_VARS_LIGHT;

  // Layered background with glows and grid
  const getBackgroundStyle = () => {
    if (isDark) {
      return {
        background: `
          radial-gradient(600px at 80% -20%, rgba(0,229,255,0.35) 0%, transparent 80%),
          radial-gradient(400px at 10% 110%, rgba(99,102,241,0.25) 0%, transparent 70%),
          linear-gradient(to bottom, ${vars.bg} 0%, ${vars.bg} 100%)
        `,
      };
    } else {
      return {
        background: `
          radial-gradient(600px at 80% -20%, rgba(8,145,178,0.30) 0%, transparent 80%),
          radial-gradient(400px at 10% 110%, rgba(139,92,246,0.20) 0%, transparent 70%),
          linear-gradient(to bottom, #f8fbff 0%, #e6f6fb 100%)
        `,
      };
    }
  };

  // Grid pattern with radial fade mask
  const renderGridPattern = () => {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${vars.gridPattern} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black 0%, transparent 100%)",
          opacity: isDark ? 0.4 : 0.3,
          pointerEvents: "none",
        }}
      />
    );
  };

  return (
    <div
      ref={bgImageRef}
      style={{
        position: "relative",
        overflow: "hidden",
        ...getBackgroundStyle(),
        minHeight: "100vh",
        userSelect: "none",
      }}
      className={pageType === "login" || pageType === "register" ? "auth-bg" : ""}
    >
      {/* Grid pattern with radial fade */}
      {renderGridPattern()}

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>

      {/* Global styles for auth background and animations */}
      <style>{`
        .auth-bg {
          background: 
            radial-gradient(600px at 80% -20%, rgba(0,229,255,0.35) 0%, transparent 80%),
            radial-gradient(400px at 10% 110%, rgba(99,102,241,0.25) 0%, transparent 70%),
            linear-gradient(to bottom, #0b1626 0%, #0b1626 100%);
        }
        
        .auth-bg.light-theme {
          background: 
            radial-gradient(600px at 80% -20%, rgba(8,145,178,0.30) 0%, transparent 80%),
            radial-gradient(400px at 10% 110%, rgba(139,92,246,0.20) 0%, transparent 70%),
            linear-gradient(to bottom, #f8fbff 0%, #e6f6fb 100%);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(48px); }
        }
      `}</style>
    </div>
  );
};

// ── Export CSS Variables for use in pages ──
export const DARK_COLORS = CSS_VARS_DARK;
export const LIGHT_COLORS = CSS_VARS_LIGHT;

export default CampusBackground;
