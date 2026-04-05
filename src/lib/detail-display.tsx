import type { ReactNode } from "react";

/** Known URL field names in merged `details` objects. */
const LINK_KEY_HINTS = /(url|link|site|portal|href|uri)$/i;

export type LeaderEntry = {
  name: string;
  role?: string;
  profileUrl: string;
  imageUrl?: string;
};

export function parseLeaders(raw: unknown): LeaderEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: LeaderEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const profileUrl = typeof o.profileUrl === "string" ? o.profileUrl.trim() : "";
    if (!name || !profileUrl) continue;
    const role = typeof o.role === "string" ? o.role.trim() : undefined;
    const imageUrl = typeof o.imageUrl === "string" ? o.imageUrl.trim() : undefined;
    out.push({
      name,
      role,
      profileUrl,
      imageUrl: imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : undefined,
    });
  }
  return out;
}

export function isProbablyHttpString(v: unknown): v is string {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

export function isLinkFieldKey(key: string): boolean {
  if (LINK_KEY_HINTS.test(key)) return true;
  if (key === "officialOrganisationUrl" || key === "officialSite" || key === "constitution") return true;
  return false;
}

const SUMMARY_PRIORITY = [
  "summary",
  "type",
  "role",
  "bodyType",
  "chamber",
  "statutoryRole",
  "statutoryBasis",
  "ceremonialHeadRole",
  "constituencyName",
  "localAuthorityCode",
  "electedMemberSeats",
  "seatCount",
  "graphPath",
  "dataSourceNote",
];

const HIDE_FROM_FLAT = new Set(["leaders", "summary", "graphPath", "dataSourceNote"]);

export function sortDetailKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = SUMMARY_PRIORITY.indexOf(a);
    const ib = SUMMARY_PRIORITY.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  });
}

export type DetailBuckets = {
  summaryPairs: [string, unknown][];
  linkPairs: [string, unknown][];
  otherPairs: [string, unknown][];
};

export function bucketDetails(details: Record<string, unknown>): DetailBuckets {
  const keys = sortDetailKeys(Object.keys(details));
  const summaryPairs: [string, unknown][] = [];
  const linkPairs: [string, unknown][] = [];
  const otherPairs: [string, unknown][] = [];

  for (const key of keys) {
    if (key === "leaders") continue;
    const value = details[key];
    if (SUMMARY_PRIORITY.includes(key)) {
      summaryPairs.push([key, value]);
      continue;
    }
    if (isLinkFieldKey(key) && (isProbablyHttpString(value) || (typeof value === "string" && value.startsWith("/")))) {
      linkPairs.push([key, value]);
      continue;
    }
    if (isProbablyHttpString(value) && !HIDE_FROM_FLAT.has(key)) {
      linkPairs.push([key, value]);
      continue;
    }
    if (!HIDE_FROM_FLAT.has(key)) otherPairs.push([key, value]);
  }

  return { summaryPairs, linkPairs, otherPairs };
}

export function formatScalarForDisplay(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ExternalGovLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const h = href.trim();
  return (
    <a
      href={h}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "text-[var(--codex-crimson)] underline decoration-[var(--codex-border)] underline-offset-2 hover:decoration-[var(--codex-gold)]"
      }
    >
      {children}
    </a>
  );
}
