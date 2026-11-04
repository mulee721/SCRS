/**
 * Theme System for SCRS Landing Page
 * Supports dark and light modes with unified color schemes
 */

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  bg: string;
  card: string;
  accent: string;
  accent2: string;
  border: string;
  text: string;
  muted: string;
  footer: string;
  input: string;
  error: string;
}

const darkTheme: ThemeColors = {
  bg: "#1B2938",
  card: "#202D3D",
  accent: "#00DCEB",
  accent2: "#00BFD4",
  border: "#34485E",
  text: "#F1F5F9",
  muted: "#94A3B8",
  footer: "#111D2B",
  input: "#162030",
  error: "#F87171",
};

const lightTheme: ThemeColors = {
  bg: "#F8FAFB",
  card: "#FFFFFF",
  accent: "#0891B2",
  accent2: "#06B6D4",
  border: "#E5E7EB",
  text: "#1F2937",
  muted: "#6B7280",
  footer: "#F3F4F6",
  input: "#FFFFFF",
  error: "#DC2626",
};

export const getThemeColors = (theme: ThemeMode): ThemeColors => {
  return theme === "dark" ? darkTheme : lightTheme;
};

export const themeColors = {
  dark: darkTheme,
  light: lightTheme,
};
