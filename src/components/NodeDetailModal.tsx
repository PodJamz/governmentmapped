"use client";

import { useCallback, useMemo, useState } from "react";
import type { GraphNode } from "@/types/graph";
import { findNodeById, serializeNodeForModal } from "@/lib/graph-node-utils";
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
  getAvatarUrlFromDetails,
  hueFromString,
  initialsFromName,
  isPersonAvatarCategory,
} from "@/lib/person-avatar";
type TabId = "info" | "people" | "links" | "more" | "folio";

type Props = {
  node: GraphNode | null;
  root: GraphNode;
  open: boolean;
  onClose: () => void;
  theme: "dark" | "light";
};

function labelize(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
}

export function NodeDetailModal({ node, root, open, onClose, theme }: Props) {
  const [tab, setTab] = useState<TabId>("info");

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

  const parentNode = useMemo(() => {
    if (!node?.details || typeof node.details !== "object" || Array.isArray(node.details)) return null;
    const pid = (node.details as Record<string, unknown>).parentId;
    if (typeof pid !== "string") return null;
    return findNodeById(root, pid);
  }, [node, root]);

  if (!open || !node) return null;

  const d =
    node.details && typeof node.details === "object" && !Array.isArray(node.details)
      ? (node.details as Record<string, unknown>)
      : {};

  const leaders = parseLeaders(d.leaders);
  const { summaryPairs, linkPairs, otherPairs } = bucketDetails(d);

  const portraitUrl = getAvatarUrlFromDetails(d);
  const showPersonAvatar = isPersonAvatarCategory(node.category) || !!portraitUrl;

  const tabs: { id: TabId; label: string }[] = [
    { id: "info", label: "Info" },
    { id: "people", label: "People" },
    { id: "links", label: "Links" },
    { id: "more", label: "More" },
    { id: "folio", label: "Folio" },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex" role="dialog" aria-modal="true" aria-labelledby="node-detail-title">
      <aside
        className={`codex-frame relative flex h-full w-[min(100vw,28rem)] shrink-0 flex-col overflow-hidden border-r-2 border-[var(--codex-gold)] shadow-2xl ${folio} text-[var(--codex-ink)]`}
      >
        <div className="codex-knot-rule shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--codex-border)] px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 flex-1 items-start gap-2.5">
            {showPersonAvatar ? (
              <div
                className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[var(--codex-border)]"
                style={
                  portraitUrl ? undefined : { backgroundColor: avatarBackgroundHsl(hueFromString(node.id), theme) }
                }
              >
                {portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external portrait URLs from curated details
                  <img src={portraitUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-lg font-bold"
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
                className="text-balance font-[family-name:var(--font-cormorant)] text-base font-semibold leading-tight sm:text-lg"
              >
                {node.name}
              </h2>
              <p className="codex-label mt-0.5">{node.category.replace(/_/g, " ")}</p>
              <p className={`mt-0.5 font-[family-name:var(--font-jetbrains-mono)] text-[10px] ${muted}`}>{node.id}</p>
            </div>
          </div>
          <button type="button" className="codex-btn shrink-0 px-2.5 py-1.5 text-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <nav className="flex shrink-0 gap-0 border-b border-[var(--codex-border)] px-2" aria-label="Detail sections">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-w-0 flex-1 border-b-2 px-1 py-2 font-[family-name:var(--font-cinzel)] text-[0.6rem] font-semibold tracking-[0.12em] transition-colors sm:text-[0.65rem] ${
                tab === t.id
                  ? "border-[var(--codex-gold-bright)] text-[var(--codex-ink)]"
                  : `border-transparent ${muted} hover:text-[var(--codex-ink)]`
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
          {tab === "info" && (
            <div className="space-y-3 text-sm">
              {summaryPairs.length > 0 ? (
                <dl className="space-y-2">
                  {summaryPairs.map(([key, value]) => (
                    <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,110px)_1fr] sm:gap-x-2">
                      <dt className={`text-xs font-medium uppercase tracking-wide ${muted}`}>{labelize(key)}</dt>
                      <dd className="break-words leading-snug">
                        {isProbablyHttpString(value) ? (
                          <ExternalGovLink href={value}>Open link</ExternalGovLink>
                        ) : (
                          formatScalarForDisplay(value)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={muted}>No summary fields for this node.</p>
              )}

              {parentNode ? (
                <div className="border-t border-[var(--codex-border)] pt-3">
                  <p className={`mb-1.5 font-[family-name:var(--font-cinzel)] text-[0.6rem] font-semibold tracking-[0.16em] ${muted}`}>
                    Parent body
                  </p>
                  <p className="font-[family-name:var(--font-cormorant)] font-semibold">{parentNode.name}</p>
                  <p className={`text-xs ${muted}`}>{parentNode.category.replace(/_/g, " ")}</p>
                </div>
              ) : null}
            </div>
          )}

          {tab === "people" && (
            <div className="text-sm">
              {leaders.length > 0 ? (
                <ul className="space-y-3">
                  {leaders.map((L, i) => (
                    <li key={`${L.profileUrl}-${i}`}>
                      <ExternalGovLink href={L.profileUrl}>
                        <span className="flex items-start gap-3">
                          <span
                            className="relative mt-0.5 h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--codex-border)]"
                            style={
                              L.imageUrl
                                ? undefined
                                : { backgroundColor: avatarBackgroundHsl(hueFromString(L.name), theme) }
                            }
                          >
                            {L.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={L.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span
                                className="flex h-full w-full items-center justify-center text-xs font-bold"
                                style={{ color: avatarTextFill(theme) }}
                              >
                                {initialsFromName(L.name)}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 text-left">
                            <span className="block font-[family-name:var(--font-cormorant)] text-base font-semibold leading-tight">
                              {L.name}
                            </span>
                            {L.role ? <span className={`mt-0.5 block text-xs ${muted}`}>{L.role}</span> : null}
                            <span className={`mt-1 block text-[11px] ${muted}`}>Opens official profile in a new tab</span>
                          </span>
                        </span>
                      </ExternalGovLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={muted}>
                  No named office-holders are curated for this node yet. Use the Links tab for the organisation page,
                  which lists current ministers and leadership.
                </p>
              )}
            </div>
          )}

          {tab === "links" && (
            <div className="text-sm">
              {linkPairs.length > 0 ? (
                <ul className="space-y-2">
                  {linkPairs.map(([key, value]) =>
                    isProbablyHttpString(value) ? (
                      <li key={key}>
                        <ExternalGovLink href={value}>{labelize(key)}</ExternalGovLink>
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : (
                <p className={muted}>No outbound URLs in metadata.</p>
              )}
            </div>
          )}

          {tab === "more" && (
            <div className="text-sm">
              {otherPairs.length > 0 ? (
                <dl className="space-y-2">
                  {otherPairs.map(([key, value]) => (
                    <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,110px)_1fr] sm:gap-x-2">
                      <dt className={`text-xs font-medium uppercase tracking-wide ${muted}`}>{labelize(key)}</dt>
                      <dd className="break-words leading-snug">{formatScalarForDisplay(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={muted}>No additional fields.</p>
              )}
            </div>
          )}

          {tab === "folio" && (
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className={`font-[family-name:var(--font-cinzel)] text-[0.65rem] font-semibold tracking-[0.18em] ${muted}`}>
                  Serialised node
                </span>
                <button type="button" className="codex-btn px-3 py-1.5 text-xs" onClick={copyJson}>
                  Copy JSON
                </button>
              </div>
              <pre className="max-h-[min(50vh,420px)] overflow-auto rounded-none border border-[var(--codex-border)] bg-[var(--codex-parchment-mid)] p-3 font-[family-name:var(--font-jetbrains-mono)] text-[10px] leading-relaxed text-[var(--codex-ink)]">
                {json}
              </pre>
            </div>
          )}
        </div>
      </aside>
      <button
        type="button"
        className="min-h-0 min-w-0 flex-1 cursor-default bg-[var(--codex-ink)]/35 backdrop-blur-[2px]"
        aria-label="Close details"
        onClick={onClose}
      />
    </div>
  );
}
