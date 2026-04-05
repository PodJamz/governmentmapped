"use client";

import * as d3 from "d3";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NodeDetailModal } from "@/components/NodeDetailModal";
import { findNodeById } from "@/lib/graph-node-utils";
import { categoryStyle, type StyleDef } from "@/lib/machinery-styles";
import {
  avatarBackgroundHsl,
  avatarTextFill,
  getAvatarUrlFromDetails,
  hueFromString,
  initialsFromName,
  isPersonAvatarCategory,
  sanitizeSvgId,
} from "@/lib/person-avatar";
import { buildMapGeoNodes } from "@/lib/graph-geo-positions";
import type { GraphNode } from "@/types/graph";

export type { GraphNode } from "@/types/graph";

const IrelandMapView = dynamic(
  () => import("@/components/IrelandMapView").then((m) => m.IrelandMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(80dvh,720px)] w-full items-center justify-center text-sm text-zinc-400">
        Loading map…
      </div>
    ),
  },
);

type Hier = d3.HierarchyNode<GraphNode> & { x: number; y: number };

function project(angle: number, rad: number): [number, number] {
  const a = angle - Math.PI / 2;
  return [rad * Math.cos(a), rad * Math.sin(a)];
}

function appendShape(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  s: StyleDef,
  pixelSize: number,
) {
  const half = pixelSize / 2;
  if (s.shape === "circle") {
    g.append("circle")
      .attr("r", half)
      .attr("fill", s.fill)
      .attr("stroke", s.stroke)
      .attr("stroke-width", 0.85);
  } else if (s.shape === "rect") {
    g.append("rect")
      .attr("x", -half)
      .attr("y", -half)
      .attr("width", pixelSize)
      .attr("height", pixelSize)
      .attr("rx", 0.5)
      .attr("fill", s.fill)
      .attr("stroke", s.stroke)
      .attr("stroke-width", 0.85);
  } else {
    const d = `M0,-${half} L${half},0 L0,${half} L-${half},0 Z`;
    g.append("path").attr("d", d).attr("fill", s.fill).attr("stroke", s.stroke).attr("stroke-width", 0.85);
  }
}

function layoutTree(data: GraphNode, radius: number) {
  const root = d3.hierarchy(data) as Hier;
  d3
    .cluster<GraphNode>()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(1, a.depth))(root);
  return root;
}

/** Ancestors, selected node, and full subtree (for link and node emphasis). */
function relatedNodeIds(root: Hier, selectedId: string | null): Set<string> | null {
  if (!selectedId) return null;
  const picked = root.descendants().find((d) => d.data.id === selectedId);
  if (!picked) return null;
  const ids = new Set<string>();
  let up: Hier | null = picked;
  while (up) {
    ids.add(up.data.id);
    up = up.parent;
  }
  const down: Hier[] = [...(picked.children ?? [])];
  while (down.length) {
    const n = down.pop()!;
    ids.add(n.data.id);
    if (n.children) down.push(...n.children);
  }
  return ids;
}

function linkTouchesRelated(
  sourceId: string,
  targetId: string,
  related: Set<string> | null,
): boolean {
  if (!related) return false;
  return related.has(sourceId) && related.has(targetId);
}

function depthSizeMultiplier(depth: number, maxDepth: number): number {
  if (maxDepth <= 0) return 1;
  const t = 1 - depth / (maxDepth + 0.35);
  return Math.max(0.38, 0.42 + 0.58 * t);
}

type Props = {
  data: GraphNode;
};

export function MachineryGraph({ data }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const lastTransformRef = useRef<d3.ZoomTransform | null>(null);
  const [hover, setHover] = useState<{ name: string; category: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [mapViewOpen, setMapViewOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [rotation, setRotation] = useState(0);

  const mapGeoNodes = useMemo(() => buildMapGeoNodes(data, theme), [data, theme]);

  const detailNode = useMemo(() => {
    if (!selectedId) return null;
    return findNodeById(data, selectedId);
  }, [data, selectedId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (detailModalOpen) {
        setDetailModalOpen(false);
        return;
      }
      if (mapViewOpen) setMapViewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailModalOpen, mapViewOpen]);

  const getSize = () => {
    const wrap = wrapRef.current;
    if (!wrap) return { width: 800, height: 640, radius: 300 };
    const width = wrap.clientWidth;
    const height = Math.max(560, Math.min(window.innerHeight - 48, 920));
    const radius = Math.min(width, height) / 2 - 36;
    return { width, height, radius };
  };

  const defaultTransform = (width: number, height: number) =>
    d3.zoomIdentity.translate(width / 2, height / 2).scale(0.78);

  const draw = useCallback(() => {
    const svgEl = ref.current;
    const wrap = wrapRef.current;
    if (!svgEl || !wrap) return;

    const { width, height, radius } = getSize();
    const root = layoutTree(data, radius);
    const maxDepth = d3.max(root.descendants(), (d) => d.depth) ?? 1;

    const ink = theme === "dark";
    const linkMuted = ink ? "rgba(232,220,200,0.08)" : "rgba(28,22,18,0.11)";
    const linkActive = ink ? "rgba(228,192,74,0.92)" : "rgba(166,124,42,0.9)";
    const linkFaded = ink ? "rgba(232,220,200,0.04)" : "rgba(28,22,18,0.06)";
    const related = relatedNodeIds(root, selectedId);
    const guideStroke = ink ? "rgba(232,220,200,0.055)" : "rgba(28,22,18,0.075)";
    const bgInner = ink ? "#1e1a16" : "#ede4d4";
    const bgOuter = ink ? "#0f0d0b" : "#cfc4ae";

    const svg = d3.select(svgEl).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const glow = defs
      .append("filter")
      .attr("id", "mog-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", 1.4).attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", `url(#mog-bg)`);
    defs
      .append("radialGradient")
      .attr("id", "mog-bg")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "72%")
      .call((g) => {
        g.append("stop").attr("offset", "0%").attr("stop-color", bgInner);
        g.append("stop").attr("offset", "100%").attr("stop-color", bgOuter);
      });

    const zoomLayer = svg.append("g").attr("class", "zoom-layer");
    const rotateLayer = zoomLayer
      .append("g")
      .attr("class", "rotate-layer")
      .attr("transform", `rotate(${rotation})`);

    const guides = rotateLayer.append("g").attr("pointer-events", "none");
    const rings = 6;
    for (let i = 1; i <= rings; i++) {
      const r = (radius * i) / rings;
      guides
        .append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", guideStroke)
        .attr("stroke-width", 1);
    }

    const linkGen = d3
      .linkRadial<d3.HierarchyPointLink<GraphNode>, d3.HierarchyPointNode<GraphNode>>()
      .angle((d) => d.x)
      .radius((d) => d.y);

    const links = root.links().map((l) => ({
      source: l.source as d3.HierarchyPointNode<GraphNode>,
      target: l.target as d3.HierarchyPointNode<GraphNode>,
    }));

    rotateLayer
      .append("g")
      .attr("class", "links")
      .attr("fill", "none")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", (d) => linkGen(d) ?? "")
      .attr("stroke", (d) => {
        const sid = d.source.data.id;
        const tid = d.target.data.id;
        if (related && linkTouchesRelated(sid, tid, related)) return linkActive;
        if (related) return linkFaded;
        return linkMuted;
      })
      .attr("stroke-width", (d) => {
        const sid = d.source.data.id;
        const tid = d.target.data.id;
        if (related && linkTouchesRelated(sid, tid, related)) return 1.35;
        return 0.55;
      });

    const nodes = root.descendants() as Hier[];

    const node = rotateLayer
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, Hier>("g.node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", (d) => {
        const [x, y] = project(d.x, d.y);
        return `translate(${x},${y})`;
      })
      .style("cursor", "pointer")
      .on("mouseenter", (_ev, d) => {
        setHover({ name: d.data.name, category: d.data.category });
      })
      .on("mouseleave", () => setHover(null))
      .on("click", (_ev, d) => {
        setSelectedId(d.data.id);
        setDetailModalOpen(true);
      })
      .style("opacity", (d) => {
        if (!related) return 1;
        return related.has(d.data.id) ? 1 : 0.2;
      });

    node.each(function (d) {
      const gg = d3.select(this);
      const base = categoryStyle(d.data.category, theme);
      const mult = depthSizeMultiplier(d.depth, maxDepth);
      const px = Math.max(2.5, base.size * mult);
      const half = px / 2;
      const det =
        d.data.details && typeof d.data.details === "object" && !Array.isArray(d.data.details)
          ? (d.data.details as Record<string, unknown>)
          : undefined;
      const portraitUrl = getAvatarUrlFromDetails(det);
      const useAvatar = isPersonAvatarCategory(d.data.category) || !!portraitUrl;

      if (useAvatar) {
        if (portraitUrl) {
          const clipId = `mog-av-${sanitizeSvgId(d.data.id)}`;
          defs
            .append("clipPath")
            .attr("id", clipId)
            .append("circle")
            .attr("r", half)
            .attr("cx", 0)
            .attr("cy", 0);
          gg.append("circle")
            .attr("r", half)
            .attr("fill", base.fill)
            .attr("stroke", base.stroke)
            .attr("stroke-width", 0.85);
          gg.append("image")
            .attr("clip-path", `url(#${clipId})`)
            .attr("href", portraitUrl)
            .attr("x", -half)
            .attr("y", -half)
            .attr("width", px)
            .attr("height", px)
            .attr("preserveAspectRatio", "xMidYMid slice");
        } else {
          gg.append("circle")
            .attr("r", half)
            .attr("fill", avatarBackgroundHsl(hueFromString(d.data.id), theme))
            .attr("stroke", base.stroke)
            .attr("stroke-width", 0.85);
          gg.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", Math.max(4, half * 0.72))
            .attr("font-weight", "700")
            .attr("font-family", "'EB Garamond', Georgia, serif")
            .attr("fill", avatarTextFill(theme))
            .text(initialsFromName(d.data.name));
        }
      } else {
        appendShape(gg, base, px);
      }
      if (d.depth === 0) {
        gg.selectChild().attr("filter", "url(#mog-glow)");
      }
      const isSelected = d.data.id === selectedId;
      const isRelated = related?.has(d.data.id) ?? false;
      if (isSelected) {
        gg.append("circle")
          .attr("r", px / 2 + 4)
          .attr("fill", "none")
          .attr("stroke", ink ? "#e4c04a" : "#a67c2a")
          .attr("stroke-width", 1.5);
      } else if (related && isRelated) {
        gg.append("circle")
          .attr("r", px / 2 + 3)
          .attr("fill", "none")
          .attr("stroke", ink ? "rgba(228, 192, 74, 0.45)" : "rgba(166, 124, 42, 0.5)")
          .attr("stroke-width", 1);
      }
    });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.12, 6])
      .on("zoom", (event) => {
        lastTransformRef.current = event.transform;
        zoomLayer.attr("transform", event.transform.toString());
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    const nextT = lastTransformRef.current ?? defaultTransform(width, height);
    svg.call(zoom.transform, nextT);
  }, [data, selectedId, theme, rotation]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const resetView = () => {
    const svg = ref.current;
    if (!svg || !zoomRef.current) return;
    const { width, height } = getSize();
    const t = defaultTransform(width, height);
    lastTransformRef.current = t;
    d3.select(svg).transition().duration(320).call(zoomRef.current.transform, t);
  };

  const zoomBy = (factor: number) => {
    const svg = ref.current;
    if (!svg || !zoomRef.current) return;
    d3.select(svg).transition().duration(200).call(zoomRef.current.scaleBy, factor);
  };

  const focusSelected = () => {
    const svg = ref.current;
    if (!svg || !selectedId || !zoomRef.current) return;
    const { width, height, radius } = getSize();
    const root = layoutTree(data, radius);
    const found = root.descendants().find((d) => d.data.id === selectedId);
    if (!found) return;
    const [nx, ny] = project(found.x, found.y);
    const rad = (rotation * Math.PI) / 180;
    const rx = nx * Math.cos(rad) - ny * Math.sin(rad);
    const ry = nx * Math.sin(rad) + ny * Math.cos(rad);
    const k = 2.35;
    const t = d3.zoomIdentity.translate(width / 2 - k * rx, height / 2 - k * ry).scale(k);
    lastTransformRef.current = t;
    d3.select(svg).transition().duration(420).call(zoomRef.current.transform, t);
  };

  const pageTheme = theme === "dark" ? "codex-page--ink" : "";
  const toolBtn =
    "codex-btn flex h-9 min-w-[2.25rem] items-center justify-center px-2.5";

  return (
    <div className={`codex-page relative flex min-h-0 flex-1 flex-col ${pageTheme}`}>
      <div className="pointer-events-none absolute left-4 top-4 z-10 md:left-6 md:top-6">
        <div className="codex-knot-rule mb-3 max-w-[min(92vw,420px)]" aria-hidden="true" />
        <h1 className="max-w-[min(92vw,440px)] text-balance font-[family-name:var(--font-cormorant)] text-lg font-semibold leading-tight tracking-tight text-[var(--codex-ink)] md:text-2xl">
          <span className="codex-initial" aria-hidden="true">
            G
          </span>
          overnment of Ireland map
        </h1>
        <p className="codex-label mt-2 max-w-sm">Atlas of public sector bodies</p>
      </div>

      <div className="codex-frame pointer-events-auto absolute right-3 top-3 z-10 flex flex-col gap-1.5 rounded-none p-2 md:right-5 md:top-5">
        <div className="flex gap-1">
          <button type="button" className={toolBtn} title="Zoom in" onClick={() => zoomBy(1.22)}>
            +
          </button>
          <button type="button" className={toolBtn} title="Zoom out" onClick={() => zoomBy(1 / 1.22)}>
            −
          </button>
          <button type="button" className={toolBtn} title="Reset view" onClick={resetView}>
            ⟲
          </button>
          <button
            type="button"
            className={toolBtn}
            title="Rotate 15°"
            onClick={() => setRotation((r) => (r + 15) % 360)}
          >
            ↻
          </button>
        </div>
        <div className="codex-knot-rule opacity-40" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <button type="button" className={toolBtn + " w-full justify-start gap-2"} onClick={focusSelected} disabled={!selectedId}>
            <span className="opacity-70">⊡</span> Focus
          </button>
          <button
            type="button"
            className={toolBtn + " w-full justify-start gap-2"}
            onClick={() => setLegendOpen((v) => !v)}
          >
            <span className="opacity-70">☰</span> Legend
          </button>
          <button
            type="button"
            className={toolBtn + " w-full justify-start gap-2"}
            title="Ireland map: graph nodes at approximate locations"
            onClick={() => setMapViewOpen(true)}
          >
            <span className="opacity-70">⌖</span> Map
          </button>
          <button
            type="button"
            className={toolBtn + " w-full justify-start gap-2"}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Switch to vellum (light folio)" : "Switch to ink (dark folio)"}
          >
            {theme === "dark" ? "☾ Ink" : "☀ Vellum"}
          </button>
        </div>
      </div>

      <div ref={wrapRef} className="min-h-dvh flex-1 w-full overflow-hidden pt-14 md:pt-10">
        <svg ref={ref} className="block h-full w-full max-w-full touch-none" role="img" aria-label="Government of Ireland Map — radial view of public bodies" />
        {hover && (
          <div className="codex-hover-pop pointer-events-none absolute left-4 top-28 max-w-xs rounded-none px-3 py-2 text-sm md:left-6 md:top-32">
            <div className="font-[family-name:var(--font-cormorant)] font-semibold leading-snug text-[var(--codex-ink)]">
              {hover.name}
            </div>
            <div className="codex-label mt-1 opacity-80">{hover.category.replace(/_/g, " ")}</div>
          </div>
        )}
      </div>

      <p className="codex-footnote pointer-events-none absolute bottom-4 left-1/2 z-10 max-w-[min(96vw,520px)] -translate-x-1/2 text-center opacity-80">
        Hover to explore · Click a node for particulars · Scroll to zoom · Escape closes folios
      </p>

      {mapViewOpen && (
        <div
          className="codex-map-overlay fixed inset-0 z-[200] flex flex-col p-3 backdrop-blur-[2px] md:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Government of Ireland geographic map"
        >
          <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <p className="font-[family-name:var(--font-cormorant)] text-sm font-semibold">
              Map · Ireland (approximate placement)
            </p>
            <button type="button" className="codex-btn px-4 py-2" onClick={() => setMapViewOpen(false)}>
              Close
            </button>
          </div>
          <div className="codex-map-panel min-h-0 flex-1 overflow-hidden rounded-none border border-[var(--codex-border)]">
            <IrelandMapView
              className="relative h-full min-h-[min(78dvh,760px)] w-full overflow-hidden rounded-none border-0 bg-[var(--codex-parchment-edge)]"
              graphNodes={mapGeoNodes}
              selectedNodeId={selectedId}
              onGraphNodeClick={(id) => {
                setSelectedId(id);
                setDetailModalOpen(true);
              }}
            />
          </div>
          <p className="codex-footnote mt-2 shrink-0 text-center">Escape to close</p>
        </div>
      )}

      <NodeDetailModal
        node={detailNode}
        open={detailModalOpen && !!detailNode}
        theme={theme}
        onClose={() => setDetailModalOpen(false)}
      />

      {legendOpen && (
        <div
          className="codex-frame absolute bottom-12 left-1/2 z-20 max-h-[min(52vh,420px)] w-[min(96vw,640px)] -translate-x-1/2 overflow-y-auto rounded-none p-4 text-xs md:bottom-14"
          role="dialog"
          aria-label="Legend"
        >
          <div className="codex-knot-rule mb-3" aria-hidden="true" />
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.2em] text-[var(--codex-ink-muted)]">
              Legend
            </span>
            <button type="button" className="codex-btn h-8 px-3" onClick={() => setLegendOpen(false)}>
              Close
            </button>
          </div>
          <div className="grid gap-4 text-[var(--codex-ink)] sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-2 font-semibold text-[10px] uppercase tracking-widest opacity-50">Officials · circles</p>
              <ul className="space-y-1.5 opacity-90">
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#450a0a]" /> Taoiseach / PM role
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#991b1b]" /> Cabinet
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#fca5a5]" /> Junior minister
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#7dd3fc]" /> Civil servant
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#34d399]" /> Independent official
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-[10px] uppercase tracking-widest opacity-50">Departments · squares</p>
              <ul className="space-y-1.5 opacity-90">
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#b91c1c]" /> Ministerial department
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#f87171]" /> Division / directorate
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#3b82f6]" /> Non-ministerial
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#ea580c]" /> Executive agency
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-[10px] uppercase tracking-widest opacity-50">Public bodies</p>
              <ul className="space-y-1.5 opacity-90">
                <li className="flex items-center gap-2">
                  <span className="inline-block size-2 rotate-45 bg-[#22c55e]" /> Executive NDPB
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block size-2 rotate-45 bg-[#eab308]" /> Advisory NDPB
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block size-2 rotate-45 bg-[#f97316]" /> Tribunal
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#ea580c]" /> Public corporation
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#a1a1aa]" /> Other body
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-[10px] uppercase tracking-widest opacity-50">Elected (local & Oireachtas)</p>
              <ul className="space-y-1.5 opacity-90">
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#0d9488]" /> Local authority (council)
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#fbbf24]" /> Lord Mayor / Mayor
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#fcd34d]" /> Cathaoirleach
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#5eead4]" /> Chief executive (local)
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#2dd4bf]" /> Councillor seats (grouped)
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#6366f1]" /> Dáil constituency
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#a5b4fc]" /> TD seat
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#4338ca]" /> Oireachtas elected (group)
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 bg-[#0e7490]" /> Seanad panel
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#67e8f9]" /> Senator seat
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
