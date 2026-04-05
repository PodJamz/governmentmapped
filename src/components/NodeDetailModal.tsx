"use client";

import { useCallback, useMemo } from "react";
import type { GraphNode } from "@/types/graph";
import { serializeNodeForModal } from "@/lib/graph-node-utils";
import {
  avatarBackgroundHsl,
  avatarTextFill,
  getAvatarUrlFromDetails,
  hueFromString,
  initialsFromName,
  isPersonAvatarCategory,
} from "@/lib/person-avatar";

type Props = {
  node: GraphNode | null;
  open: boolean;
  onClose: () => void;
  theme: "dark" | "light";
};

export function NodeDetailModal({ node, open, onClose, theme }: Props) {
  const json = useMemo(() => {
    if (!node) return "";
    try {
      return JSON.stringify(serializeNodeForModal(node), null, 2);
    } catch {
      return "{}";
    }
  }, [node]);

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      /* ignore */
    }
  }, [json]);

  const folio = theme === "dark" ? "codex-page--ink" : "";
  const muted = "text-[var(--codex-ink-muted)]";

  if (!open || !node) return null;

  const d =
    node.details && typeof node.details === "object" && !Array.isArray(node.details)
      ? (node.details as Record<string, unknown>)
      : {};

  const portraitUrl = getAvatarUrlFromDetails(d);
  const showPersonAvatar = isPersonAvatarCategory(node.category) || !!portraitUrl;

  const highlightKeys = [
    "summary",
    "type",
    "role",
    "chamber",
    "constituencyName",
    "localAuthorityCode",
    "electedMemberSeats",
    "ceremonialHeadRole",
    "statutoryBasis",
    "graphPath",
  ];

  const entries = Object.entries(d).sort(([a], [b]) => {
    const ia = highlightKeys.indexOf(a);
    const ib = highlightKeys.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  });

  return (
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="node-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close details"
        onClick={onClose}
      />
      <div
        className={`codex-frame relative z-10 flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-none shadow-2xl sm:max-w-2xl ${folio} text-[var(--codex-ink)]`}
      >
        <div className="codex-knot-rule shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--codex-border)] px-4 py-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {showPersonAvatar ? (
              <div
                className="relative mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--codex-border)]"
                style={
                  portraitUrl
                    ? undefined
                    : { backgroundColor: avatarBackgroundHsl(hueFromString(node.id), theme) }
                }
              >
                {portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external portrait URLs from curated details
                  <img src={portraitUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-base font-bold"
                    style={{ color: avatarTextFill(theme) }}
                  >
                    {initialsFromName(node.name)}
                  </span>
                )}
              </div>
            ) : null}
            <div className="min-w-0">
              <h2
                id="node-detail-title"
                className="text-balance font-[family-name:var(--font-cormorant)] text-lg font-semibold leading-tight"
              >
                {node.name}
              </h2>
              <p className={`codex-label mt-1`}>{node.category.replace(/_/g, " ")}</p>
              <p className={`font-[family-name:var(--font-jetbrains-mono)] text-[11px] ${muted}`}>{node.id}</p>
            </div>
          </div>
          <button type="button" className="codex-btn px-3 py-2" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {entries.length > 0 ? (
            <dl className="space-y-2 text-sm">
              {entries.map(([key, value]) => (
                <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-x-3">
                  <dt className={`shrink-0 text-xs font-medium uppercase tracking-wide ${muted}`}>
                    {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                  </dt>
                  <dd className="break-words text-sm leading-snug">
                    {formatDetailValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className={`text-sm ${muted}`}>No extra metadata beyond graph context.</p>
          )}

          <div className="mt-4 border-t border-[var(--codex-border)] pt-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className={`font-[family-name:var(--font-cinzel)] text-[0.65rem] font-semibold tracking-[0.18em] ${muted}`}>
                Full JSON
              </span>
              <button type="button" className="codex-btn px-3 py-2" onClick={copyJson}>
                Copy JSON
              </button>
            </div>
            <pre
              className="max-h-[min(40vh,320px)] overflow-auto rounded-none border border-[var(--codex-border)] bg-[var(--codex-parchment-mid)] p-3 font-[family-name:var(--font-jetbrains-mono)] text-[11px] leading-relaxed text-[var(--codex-ink)]"
            >
              {json}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDetailValue(value: unknown): string {
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
