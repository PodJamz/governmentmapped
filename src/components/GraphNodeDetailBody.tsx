"use client";

import type { GraphNode } from "@/types/graph";
import {
  ExternalGovLink,
  bucketDetails,
  formatScalarForDisplay,
  isProbablyHttpString,
  parseLeaders,
} from "@/lib/detail-display";
import {
  avatarBackgroundHsl,
  avatarTextFill,
  hueFromString,
  initialsFromName,
} from "@/lib/person-avatar";

const muted = "text-[var(--codex-ink-muted)]";

function labelize(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
}

export type GraphNodeDetailBodyProps = {
  node: GraphNode;
  theme: "dark" | "light";
  /** Map popup: tighter spacing, fewer sections */
  variant?: "panel" | "popup";
};

export function GraphNodeDetailBody({ node, theme, variant = "panel" }: GraphNodeDetailBodyProps) {
  const d =
    node.details && typeof node.details === "object" && !Array.isArray(node.details)
      ? (node.details as Record<string, unknown>)
      : {};

  const leaders = parseLeaders(d.leaders);
  const { summaryPairs, linkPairs, otherPairs } = bucketDetails(d);
  const popup = variant === "popup";

  const dlClass = popup ? "space-y-1.5 text-xs" : "space-y-2 text-sm";
  const dtClass = popup
    ? `text-[10px] font-medium uppercase tracking-wide ${muted}`
    : `text-xs font-medium uppercase tracking-wide ${muted}`;

  return (
    <div className={popup ? "text-zinc-900" : "text-[var(--codex-ink)]"}>
      {!popup && summaryPairs.length > 0 ? (
        <dl className={dlClass}>
          {summaryPairs.map(([key, value]) => (
            <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,120px)_1fr] sm:gap-x-2">
              <dt className={dtClass}>{labelize(key)}</dt>
              <dd className="break-words leading-snug">
                {isProbablyHttpString(value) ? (
                  <ExternalGovLink
                    href={value}
                    className={
                      popup
                        ? "text-teal-700 underline underline-offset-2 hover:text-teal-900"
                        : undefined
                    }
                  >
                    Open link
                  </ExternalGovLink>
                ) : (
                  formatScalarForDisplay(value)
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {popup && summaryPairs.filter(([k]) => k === "summary").length > 0 ? (
        <p className="mb-2 text-xs leading-relaxed text-zinc-700">
          {String(summaryPairs.find(([k]) => k === "summary")?.[1] ?? "")}
        </p>
      ) : null}

      {leaders.length > 0 ? (
        <div className={popup ? "mb-2 mt-1" : "mt-4"}>
          <p className={`mb-2 font-[family-name:var(--font-cinzel)] text-[0.65rem] font-semibold tracking-[0.14em] ${popup ? "text-zinc-600" : muted}`}>
            People
          </p>
          <ul className="space-y-2">
            {leaders.map((L, i) => (
              <li key={`${L.profileUrl}-${i}`}>
                <ExternalGovLink
                  href={L.profileUrl}
                  className={
                    popup ? "text-teal-800 underline-offset-2 hover:text-teal-950" : undefined
                  }
                >
                  <span className="flex items-start gap-2">
                    <span
                      className={`relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border ${popup ? "border-zinc-300" : "border-[var(--codex-border)]"}`}
                      style={
                        L.imageUrl
                          ? undefined
                          : { backgroundColor: avatarBackgroundHsl(hueFromString(L.name), theme) }
                      }
                    >
                      {L.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- external gov / oireachtas portraits when provided
                        <img src={L.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span
                          className="flex h-full w-full items-center justify-center text-[10px] font-bold"
                          style={{ color: avatarTextFill(theme) }}
                        >
                          {initialsFromName(L.name)}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block font-[family-name:var(--font-cormorant)] font-semibold leading-tight">
                        {L.name}
                      </span>
                      {L.role ? <span className={`block text-[11px] ${popup ? "text-zinc-600" : muted}`}>{L.role}</span> : null}
                    </span>
                  </span>
                </ExternalGovLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {linkPairs.length > 0 ? (
        <div className={popup ? "mb-2" : "mt-4 border-t border-[var(--codex-border)] pt-3"}>
          <p className={`mb-2 font-[family-name:var(--font-cinzel)] text-[0.65rem] font-semibold tracking-[0.14em] ${popup ? "text-zinc-600" : muted}`}>
            Links
          </p>
          <ul className={`space-y-1.5 ${popup ? "text-xs" : "text-sm"}`}>
            {linkPairs.map(([key, value]) => {
              if (!isProbablyHttpString(value)) return null;
              return (
                <li key={key}>
                  <ExternalGovLink
                    href={value}
                    className={
                      popup
                        ? "text-teal-700 underline underline-offset-2 hover:text-teal-900"
                        : undefined
                    }
                  >
                    {labelize(key)}
                  </ExternalGovLink>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {otherPairs.length > 0 && !popup ? (
        <div className="mt-4 border-t border-[var(--codex-border)] pt-3">
          <p className={`mb-2 font-[family-name:var(--font-cinzel)] text-[0.65rem] font-semibold tracking-[0.14em] ${muted}`}>
            Further particulars
          </p>
          <dl className={dlClass}>
            {otherPairs.map(([key, value]) => (
              <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,120px)_1fr] sm:gap-x-2">
                <dt className={dtClass}>{labelize(key)}</dt>
                <dd className="break-words leading-snug">{formatScalarForDisplay(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {popup && otherPairs.length > 0 ? (
        <div className="mt-2 border-t border-zinc-200 pt-2">
          <dl className="space-y-1 text-[11px] text-zinc-700">
            {otherPairs.slice(0, 8).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0">
                <dt className="font-medium text-zinc-500">{labelize(key)}</dt>
                <dd className="break-words">{formatScalarForDisplay(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
