export type ShapeKind = "circle" | "rect" | "diamond";

export type StyleDef = {
  shape: ShapeKind;
  fill: string;
  stroke: string;
  size: number;
};

function strokeFor(theme: "dark" | "light") {
  return theme === "dark" ? "rgba(232,220,200,0.14)" : "rgba(28,22,18,0.2)";
}

/** Colours aligned with the UK Irish Government Map reference (officials red scale, departments, NDPBs). */
export function categoryStyle(category: string, theme: "dark" | "light"): StyleDef {
  const stroke = strokeFor(theme);
  const map: Record<string, StyleDef> = {
    government_root: { shape: "circle", fill: "#14532d", stroke, size: 22 },
    taoiseach: { shape: "circle", fill: "#450a0a", stroke, size: 18 },
    tanaiste: { shape: "circle", fill: "#7f1d1d", stroke, size: 15 },
    cabinet_collective: { shape: "circle", fill: "#991b1b", stroke, size: 14 },
    cabinet_minister: { shape: "circle", fill: "#dc2626", stroke, size: 11 },
    junior_minister: { shape: "circle", fill: "#fca5a5", stroke, size: 9 },
    civil_servant: { shape: "circle", fill: "#7dd3fc", stroke, size: 8 },
    independent_official: { shape: "circle", fill: "#34d399", stroke, size: 9 },
    ministerial_dept: { shape: "rect", fill: "#b91c1c", stroke, size: 12 },
    division: { shape: "rect", fill: "#f87171", stroke, size: 9 },
    non_ministerial: { shape: "rect", fill: "#3b82f6", stroke, size: 9 },
    executive_agency: { shape: "rect", fill: "#ea580c", stroke, size: 8 },
    executive_ndpb: { shape: "diamond", fill: "#22c55e", stroke, size: 8 },
    advisory_ndpb: { shape: "diamond", fill: "#eab308", stroke, size: 8 },
    tribunal: { shape: "diamond", fill: "#f97316", stroke, size: 8 },
    public_corporation: { shape: "rect", fill: "#ea580c", stroke, size: 8 },
    charter_body: { shape: "rect", fill: "#06b6d4", stroke, size: 7 },
    other_body: { shape: "rect", fill: "#a1a1aa", stroke, size: 7 },
    local_authority: { shape: "rect", fill: "#0d9488", stroke, size: 10 },
    local_executive: { shape: "circle", fill: "#5eead4", stroke, size: 7 },
    mayor: { shape: "circle", fill: "#fbbf24", stroke, size: 8 },
    cathaoirleach: { shape: "circle", fill: "#fcd34d", stroke, size: 8 },
    councillor_group: { shape: "rect", fill: "#2dd4bf", stroke, size: 7 },
    constituency: { shape: "rect", fill: "#6366f1", stroke, size: 9 },
    td: { shape: "circle", fill: "#a5b4fc", stroke, size: 6 },
    oireachtas_elected: { shape: "rect", fill: "#4338ca", stroke, size: 9 },
    seanad_panel: { shape: "rect", fill: "#0e7490", stroke, size: 8 },
    senator: { shape: "circle", fill: "#67e8f9", stroke, size: 6 },
  };
  return map[category] ?? map.other_body;
}
