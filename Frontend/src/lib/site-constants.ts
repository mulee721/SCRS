/**
 * Site-wide constants for the public pages (landing, login, register).
 *
 * Edit the placeholder numbers here to update stats, social proof and
 * the hero checklist across the entire site from one place.
 */

/** Stats strip shown at the bottom of the hero section. */
export const SITE_STATS = [
  { value: "10,000+", label: "Students" },
  { value: "500+",    label: "Courses"  },
  { value: "99.9%",   label: "Uptime"   },
] as const;

/** Social-proof line under the hero CTAs. */
export const SOCIAL_PROOF = {
  count: "3,000+",
  text: "Trusted by 3,000+ students",
  /** Number of small avatar circles to render. */
  avatarCount: 4,
} as const;

/** Specific feature claims shown as a checklist in the hero. */
export const HERO_CHECKLIST = [
  "Real-time conflict detection",
  "Role-based access",
  "Credit-limit enforcement",
  "Live grade tracking",
] as const;
