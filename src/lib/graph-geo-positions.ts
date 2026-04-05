import type { GraphNode } from "@/types/graph";
import { CONSTITUENCY_CENTROIDS } from "@/data/constituency-centroids";
import { LOCAL_AUTHORITY_CENTROIDS } from "@/data/local-authority-centroids";
import { categoryStyle } from "@/lib/machinery-styles";

export type MapGeoNode = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  fill: string;
  /** Shallow copy for map popups (same metadata as graph node, no children). */
  popupNode: GraphNode;
};

const DUBLIN_HUB: [number, number] = [53.338, -6.259];
const IRELAND_CENTER: [number, number] = [53.4129, -8.2439];

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function diskJitterFromId(id: string, baseLat: number, baseLng: number, maxRadiusDeg: number): [number, number] {
  const h1 = hash32(id);
  const h2 = hash32(`${id}:j2`);
  const u = (h1 % 10000) / 10000;
  const v = (h2 % 10000) / 10000;
  const r = maxRadiusDeg * Math.sqrt(u);
  const theta = 2 * Math.PI * v;
  return [baseLat + r * Math.cos(theta), baseLng + r * Math.sin(theta)];
}

function tdSeatOffset(
  constituencyId: string,
  seatIndex: number,
  seatsTotal: number,
): [number, number] {
  const base = CONSTITUENCY_CENTROIDS[constituencyId] ?? IRELAND_CENTER;
  if (seatsTotal <= 1) return base;
  const angle = (2 * Math.PI * (seatIndex - 1)) / seatsTotal;
  const r = 0.028 + 0.004 * Math.sqrt(seatsTotal);
  return [base[0] + r * Math.cos(angle), base[1] + r * Math.sin(angle)];
}

function localAuthorityCodeFromNode(node: GraphNode): string | null {
  const d = node.details;
  if (d && typeof d === "object" && !Array.isArray(d) && typeof d.localAuthorityCode === "string") {
    return d.localAuthorityCode;
  }
  if (!node.id.startsWith("la-")) return null;
  const rest = node.id.slice(3);
  const m = rest.match(/^(.+?)(-head|-ceo|-members)$/);
  return m ? m[1] : rest;
}

function constituencyIdFromDetails(node: GraphNode): string | null {
  const d = node.details;
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const id = d.constituencyId;
  return typeof id === "string" ? id : null;
}

function placeNode(node: GraphNode): [number, number] {
  const laCode = localAuthorityCodeFromNode(node);
  if (laCode && LOCAL_AUTHORITY_CENTROIDS[laCode]) {
    return diskJitterFromId(node.id, LOCAL_AUTHORITY_CENTROIDS[laCode][0], LOCAL_AUTHORITY_CENTROIDS[laCode][1], 0.035);
  }

  const cId = constituencyIdFromDetails(node);
  if (cId && node.category === "td") {
    const d = node.details as Record<string, unknown>;
    const seat = typeof d.seatIndex === "number" ? d.seatIndex : 1;
    const total = typeof d.seatsInConstituency === "number" ? d.seatsInConstituency : 5;
    return tdSeatOffset(cId, seat, total);
  }

  if (cId && node.category === "constituency" && CONSTITUENCY_CENTROIDS[cId]) {
    const [lat, lng] = CONSTITUENCY_CENTROIDS[cId];
    return diskJitterFromId(node.id, lat, lng, 0.02);
  }

  if (node.category === "seanad_panel") {
    const d = node.details as Record<string, unknown> | undefined;
    const panelId = d && typeof d.panelId === "string" ? d.panelId : node.id;
    const h = hash32(panelId) % 360;
    const rad = (h * Math.PI) / 180;
    const r = 0.052;
    return [DUBLIN_HUB[0] + r * Math.cos(rad), DUBLIN_HUB[1] + r * Math.sin(rad) * 1.25];
  }

  if (node.category === "senator") {
    const d = (node.details ?? {}) as Record<string, unknown>;
    const panelId = typeof d.panelId === "string" ? d.panelId : node.id;
    const seat = typeof d.seatIndex === "number" ? d.seatIndex : 1;
    const total = typeof d.seatsInPanel === "number" ? d.seatsInPanel : 11;
    const h = hash32(panelId) % 360;
    const rad = (h * Math.PI) / 180;
    const rPanel = 0.052;
    const bx = DUBLIN_HUB[0] + rPanel * Math.cos(rad);
    const by = DUBLIN_HUB[1] + rPanel * Math.sin(rad) * 1.25;
    const n = Math.max(total, 1);
    const a = (2 * Math.PI * (seat - 1)) / n;
    const rSeat = 0.014;
    return [bx + rSeat * Math.cos(a), by + rSeat * Math.sin(a)];
  }

  if (
    node.category === "oireachtas_elected" ||
    node.id === "dail" ||
    node.id === "seanad" ||
    node.id === "dail-tds-ge2024" ||
    node.id === "seanad-panels"
  ) {
    return diskJitterFromId(node.id, DUBLIN_HUB[0], DUBLIN_HUB[1], 0.05);
  }

  return diskJitterFromId(node.id, IRELAND_CENTER[0], IRELAND_CENTER[1], 0.55);
}

function flattenNodes(root: GraphNode): GraphNode[] {
  const out: GraphNode[] = [];
  const walk = (n: GraphNode) => {
    out.push(n);
    for (const c of n.children ?? []) walk(c);
  };
  walk(root);
  return out;
}

/** One marker per graph node with stable lat/lng for the Ireland map overlay. */
export function buildMapGeoNodes(root: GraphNode, theme: "dark" | "light"): MapGeoNode[] {
  return flattenNodes(root).map((node) => {
    const [lat, lng] = placeNode(node);
    const { fill } = categoryStyle(node.category, theme);
    return {
      id: node.id,
      name: node.name,
      category: node.category,
      lat,
      lng,
      fill,
      popupNode: {
        id: node.id,
        name: node.name,
        category: node.category,
        details: node.details,
      },
    };
  });
}
