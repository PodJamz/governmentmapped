/** Categories whose nodes represent an individual office-holder or named person seat. */
const PERSON_AVATAR_CATEGORIES = new Set([
  "taoiseach",
  "tanaiste",
  "cabinet_minister",
  "junior_minister",
  "civil_servant",
  "mayor",
  "cathaoirleach",
  "local_executive",
  "td",
  "senator",
]);

export function isPersonAvatarCategory(category: string): boolean {
  return PERSON_AVATAR_CATEGORIES.has(category);
}

const CONNECTORS = new Set([
  "for",
  "of",
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "in",
]);

function significantTokens(parts: string[]): string[] {
  return parts.filter((p) => !CONNECTORS.has(p.toLowerCase()));
}

/** Two-letter initials for SVG graph labels and modal avatars. */
export function initialsFromName(name: string): string {
  const stripped = name.replace(/\([^)]*\)/g, "").trim();
  const parts = stripped.split(/\s+/).filter((p) => p.length > 0);
  const sig = significantTokens(parts);
  if (sig.length >= 2) {
    const a = sig[0][0];
    const b = sig[sig.length - 1][0];
    return `${a}${b}`.toUpperCase();
  }
  if (sig.length === 1) {
    const w = sig[0];
    if (w.length >= 2) return w.slice(0, 2).toUpperCase();
    return `${w[0] ?? "?"}?`.toUpperCase();
  }
  return "??";
}

/** Stable hue 0–359 for avatar fill; nudges out of a purple band for calmer UI. */
export function hueFromString(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let hue = h % 360;
  if (hue >= 270 && hue <= 330) hue = (hue + 45) % 360;
  return hue;
}

export function avatarBackgroundHsl(hue: number, theme: "dark" | "light"): string {
  if (theme === "dark") return `hsl(${hue} 38% 32%)`;
  return `hsl(${hue} 42% 88%)`;
}

export function avatarTextFill(theme: "dark" | "light"): string {
  return theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)";
}

export function sanitizeSvgId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function getAvatarUrlFromDetails(details: Record<string, unknown> | undefined): string | null {
  if (!details) return null;
  const raw = details.avatarUrl ?? details.portraitUrl ?? details.imageUrl;
  if (typeof raw !== "string" || !raw.trim()) return null;
  const t = raw.trim();
  if (!/^https?:\/\//i.test(t)) return null;
  return t;
}
