import type { GraphNode } from "@/types/graph";

/** 31 local authorities: id suffix, display name, ceremonial head label, elected member seats. */
export const LOCAL_AUTHORITIES: {
  id: string;
  name: string;
  head: string;
  seats: number;
}[] = [
  { id: "carlow", name: "Carlow County Council", head: "Cathaoirleach", seats: 18 },
  { id: "cavan", name: "Cavan County Council", head: "Cathaoirleach", seats: 18 },
  { id: "clare", name: "Clare County Council", head: "Cathaoirleach", seats: 19 },
  { id: "cork-city", name: "Cork City Council", head: "Lord Mayor of Cork", seats: 31 },
  { id: "cork-county", name: "Cork County Council", head: "Cathaoirleach", seats: 55 },
  { id: "donegal", name: "Donegal County Council", head: "Cathaoirleach", seats: 37 },
  { id: "dublin-city", name: "Dublin City Council", head: "Lord Mayor of Dublin", seats: 64 },
  { id: "dun-laoghaire", name: "Dún Laoghaire–Rathdown County Council", head: "Cathaoirleach", seats: 40 },
  { id: "fingal", name: "Fingal County Council", head: "Cathaoirleach", seats: 40 },
  { id: "south-dublin", name: "South Dublin County Council", head: "Cathaoirleach", seats: 40 },
  { id: "galway-city", name: "Galway City Council", head: "Mayor of Galway", seats: 18 },
  { id: "galway-county", name: "Galway County Council", head: "Cathaoirleach", seats: 39 },
  { id: "kerry", name: "Kerry County Council", head: "Cathaoirleach", seats: 24 },
  { id: "kildare", name: "Kildare County Council", head: "Cathaoirleach", seats: 40 },
  { id: "kilkenny", name: "Kilkenny County Council", head: "Cathaoirleach", seats: 24 },
  { id: "laois", name: "Laois County Council", head: "Cathaoirleach", seats: 19 },
  { id: "leitrim", name: "Leitrim County Council", head: "Cathaoirleach", seats: 18 },
  { id: "limerick", name: "Limerick City and County Council", head: "Mayor of Limerick", seats: 40 },
  { id: "longford", name: "Longford County Council", head: "Cathaoirleach", seats: 18 },
  { id: "louth", name: "Louth County Council", head: "Cathaoirleach", seats: 29 },
  { id: "mayo", name: "Mayo County Council", head: "Cathaoirleach", seats: 30 },
  { id: "meath", name: "Meath County Council", head: "Cathaoirleach", seats: 40 },
  { id: "monaghan", name: "Monaghan County Council", head: "Cathaoirleach", seats: 18 },
  { id: "offaly", name: "Offaly County Council", head: "Cathaoirleach", seats: 19 },
  { id: "roscommon", name: "Roscommon County Council", head: "Cathaoirleach", seats: 18 },
  { id: "sligo", name: "Sligo County Council", head: "Cathaoirleach", seats: 18 },
  { id: "tipperary", name: "Tipperary County Council", head: "Cathaoirleach", seats: 40 },
  { id: "waterford", name: "Waterford City and County Council", head: "Mayor of Waterford", seats: 32 },
  { id: "westmeath", name: "Westmeath County Council", head: "Cathaoirleach", seats: 20 },
  { id: "wexford", name: "Wexford County Council", head: "Cathaoirleach", seats: 34 },
  { id: "wicklow", name: "Wicklow County Council", head: "Cathaoirleach", seats: 32 },
];

/** Dáil constituencies (39) and seat counts for GE2024 boundaries; total 160. */
export const DAIL_CONSTITUENCIES: { id: string; name: string; seats: number }[] = [
  { id: "carlow-kilkenny", name: "Carlow–Kilkenny", seats: 5 },
  { id: "cavan-monaghan", name: "Cavan–Monaghan", seats: 5 },
  { id: "clare", name: "Clare", seats: 4 },
  { id: "cork-east", name: "Cork East", seats: 4 },
  { id: "cork-north-central", name: "Cork North-Central", seats: 4 },
  { id: "cork-north-west", name: "Cork North-West", seats: 3 },
  { id: "cork-south-central", name: "Cork South-Central", seats: 4 },
  { id: "cork-south-west", name: "Cork South-West", seats: 3 },
  { id: "donegal", name: "Donegal", seats: 5 },
  { id: "dublin-bay-north", name: "Dublin Bay North", seats: 5 },
  { id: "dublin-bay-south", name: "Dublin Bay South", seats: 4 },
  { id: "dublin-central", name: "Dublin Central", seats: 4 },
  { id: "dublin-fingal", name: "Dublin Fingal", seats: 5 },
  { id: "dublin-mid-west", name: "Dublin Mid-West", seats: 4 },
  { id: "dublin-north-west", name: "Dublin North-West", seats: 3 },
  { id: "dublin-rathdown", name: "Dublin Rathdown", seats: 3 },
  { id: "dublin-south-central", name: "Dublin South-Central", seats: 4 },
  { id: "dublin-south-west", name: "Dublin South-West", seats: 4 },
  { id: "dublin-west", name: "Dublin West", seats: 4 },
  { id: "dun-laoghaire", name: "Dún Laoghaire", seats: 4 },
  { id: "galway-east", name: "Galway East", seats: 3 },
  { id: "galway-west", name: "Galway West", seats: 5 },
  { id: "kerry", name: "Kerry", seats: 5 },
  { id: "kildare-north", name: "Kildare North", seats: 4 },
  { id: "kildare-south", name: "Kildare South", seats: 4 },
  { id: "laois-offaly", name: "Laois–Offaly", seats: 5 },
  { id: "limerick-city", name: "Limerick City", seats: 3 },
  { id: "limerick-county", name: "Limerick County", seats: 3 },
  { id: "longford-westmeath", name: "Longford–Westmeath", seats: 5 },
  { id: "louth", name: "Louth", seats: 5 },
  { id: "mayo", name: "Mayo", seats: 5 },
  { id: "meath-east", name: "Meath East", seats: 3 },
  { id: "meath-west", name: "Meath West", seats: 3 },
  { id: "roscommon-galway", name: "Roscommon–Galway", seats: 3 },
  { id: "sligo-leitrim", name: "Sligo–Leitrim", seats: 4 },
  { id: "tipperary", name: "Tipperary", seats: 5 },
  { id: "waterford", name: "Waterford", seats: 4 },
  { id: "wexford", name: "Wexford", seats: 5 },
  { id: "wicklow", name: "Wicklow", seats: 5 },
];

const tdSeatTotal = DAIL_CONSTITUENCIES.reduce((a, c) => a + c.seats, 0);
if (tdSeatTotal !== 160) {
  console.warn(`[elected-layers] Dáil seat sum is ${tdSeatTotal}, expected 160`);
}

function tdSeatsForConstituency(c: { id: string; name: string; seats: number }): GraphNode[] {
  const out: GraphNode[] = [];
  for (let i = 1; i <= c.seats; i++) {
    out.push({
      id: `td-${c.id}-${i}`,
      name: `TD seat ${i} of ${c.seats}`,
      category: "td",
      details: {
        type: "dail_td_seat",
        chamber: "dail",
        constituencyId: c.id,
        constituencyName: c.name,
        seatIndex: i,
        seatsInConstituency: c.seats,
        electionBoundary: "GE2024",
        summary: `Dáil Éireann seat slot ${i} of ${c.seats} in ${c.name} (GE2024).`,
      },
    });
  }
  return out;
}

function buildLocalAuthoritiesSubtree(): GraphNode {
  const children: GraphNode[] = LOCAL_AUTHORITIES.map((la) => {
    const headCategory =
      la.head.includes("Lord Mayor") || la.head.includes("Mayor of")
        ? "mayor"
        : "cathaoirleach";
    return {
      id: `la-${la.id}`,
      name: la.name,
      category: "local_authority",
      details: {
        type: "local_authority",
        localAuthorityCode: la.id,
        localAuthorityName: la.name,
        electedMemberSeats: la.seats,
        ceremonialHeadRole: la.head,
        statutoryBasis: "Local Government Act 2001 (as amended)",
        summary: `${la.name}: ${la.seats} elected councillors; chief executive as accounting officer.`,
      },
      children: [
        {
          id: `la-${la.id}-head`,
          name: la.head,
          category: headCategory,
          details: {
            type: "ceremonial_head_local",
            localAuthorityCode: la.id,
            role: la.head,
            summary: `Ceremonial chair for ${la.name} (not executive).`,
          },
        },
        {
          id: `la-${la.id}-ceo`,
          name: "Chief executive",
          category: "local_executive",
          details: {
            type: "local_chief_executive",
            localAuthorityCode: la.id,
            role: "Chief executive",
            summary: `Statutory chief executive and accounting officer for ${la.name}.`,
          },
        },
        {
          id: `la-${la.id}-members`,
          name: `Elected councillors (${la.seats} seats)`,
          category: "councillor_group",
          details: {
            type: "councillor_group",
            localAuthorityCode: la.id,
            seatCount: la.seats,
            summary: `Elected members (proportional representation STV); policy and budget role.`,
          },
        },
      ],
    };
  });
  return {
    id: "local-authorities-31",
    name: "County & city councils (31 local authorities)",
    category: "local_authority",
    details: {
      type: "local_authority_group",
      authorityCount: 31,
      summary: "All county and city councils in the Republic of Ireland.",
    },
    children,
  };
}

function buildDailElectedSubtree(): GraphNode {
  const constituencyNodes: GraphNode[] = DAIL_CONSTITUENCIES.map((c) => ({
    id: `const-${c.id}`,
    name: c.name,
    category: "constituency",
    details: {
      type: "dail_constituency",
      chamber: "dail",
      constituencyId: c.id,
      constituencyName: c.name,
      seats: c.seats,
      electionBoundary: "GE2024",
      summary: `Dáil constituency with ${c.seats} seats (GE2024).`,
    },
    children: tdSeatsForConstituency(c),
  }));
  return {
    id: "dail-tds-ge2024",
    name: `TDs by constituency (GE2024, ${tdSeatTotal} seats)`,
    category: "oireachtas_elected",
    details: {
      type: "dail_elected_group",
      chamber: "dail",
      totalSeats: tdSeatTotal,
      constituencyCount: DAIL_CONSTITUENCIES.length,
      summary: "Teachtaí Dála by constituency under GE2024 boundaries.",
    },
    children: constituencyNodes,
  };
}

function senatorLeaves(
  idPrefix: string,
  count: number,
  shortLabel: string,
  panel: { panelId: string; panelDisplayName: string; electorGroup: string },
): GraphNode[] {
  const out: GraphNode[] = [];
  for (let i = 1; i <= count; i++) {
    out.push({
      id: `${idPrefix}-${i}`,
      name: `${shortLabel} · seat ${i}`,
      category: "senator",
      details: {
        type: "seanad_seat",
        chamber: "seanad",
        panelId: panel.panelId,
        panelDisplayName: panel.panelDisplayName,
        electorGroup: panel.electorGroup,
        seatIndex: i,
        seatsInPanel: count,
        summary: `Seanad Éireann seat ${i} of ${count} · ${panel.panelDisplayName}.`,
      },
    });
  }
  return out;
}

function buildSeanadElectedSubtree(): GraphNode {
  return {
    id: "seanad-panels",
    name: "Panel & vocational groups (60 Seanad seats)",
    category: "oireachtas_elected",
    details: {
      type: "seanad_elected_group",
      chamber: "seanad",
      totalSeats: 60,
      summary: "Seanad composition: Taoiseach nominees, university, and vocational panels.",
    },
    children: [
      {
        id: "seanad-taoiseach-nom",
        name: "Taoiseach's nominees (11)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-taoiseach-nom",
          seatCount: 11,
          electorGroup: "Taoiseach nomination",
          summary: "Eleven senators nominated by the Taoiseach.",
        },
        children: senatorLeaves("seanad-tn", 11, "Nominated senator", {
          panelId: "seanad-taoiseach-nom",
          panelDisplayName: "Taoiseach's nominees",
          electorGroup: "Taoiseach nomination",
        }),
      },
      {
        id: "seanad-university",
        name: "University constituencies (6)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-university",
          seatCount: 6,
          electorGroup: "University graduates",
          summary: "Six seats elected by university constituencies.",
        },
        children: senatorLeaves("seanad-uni", 6, "University senator", {
          panelId: "seanad-university",
          panelDisplayName: "University constituencies",
          electorGroup: "University graduates",
        }),
      },
      {
        id: "seanad-admin",
        name: "Administrative Panel (7)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-admin",
          seatCount: 7,
          electorGroup: "Administrative Panel",
          summary: "Vocational panel for public administration.",
        },
        children: senatorLeaves("seanad-adm", 7, "Panel senator", {
          panelId: "seanad-admin",
          panelDisplayName: "Administrative Panel",
          electorGroup: "Administrative Panel",
        }),
      },
      {
        id: "seanad-agri",
        name: "Agricultural Panel (11)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-agri",
          seatCount: 11,
          electorGroup: "Agricultural Panel",
          summary: "Vocational panel for agriculture and fisheries.",
        },
        children: senatorLeaves("seanad-agr", 11, "Panel senator", {
          panelId: "seanad-agri",
          panelDisplayName: "Agricultural Panel",
          electorGroup: "Agricultural Panel",
        }),
      },
      {
        id: "seanad-culture",
        name: "Cultural and Educational Panel (5)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-culture",
          seatCount: 5,
          electorGroup: "Cultural and Educational Panel",
          summary: "Vocational panel for culture, education, and arts.",
        },
        children: senatorLeaves("seanad-cul", 5, "Panel senator", {
          panelId: "seanad-culture",
          panelDisplayName: "Cultural and Educational Panel",
          electorGroup: "Cultural and Educational Panel",
        }),
      },
      {
        id: "seanad-industrial",
        name: "Industrial and Commercial Panel (9)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-industrial",
          seatCount: 9,
          electorGroup: "Industrial and Commercial Panel",
          summary: "Vocational panel for industry and commerce.",
        },
        children: senatorLeaves("seanad-ind", 9, "Panel senator", {
          panelId: "seanad-industrial",
          panelDisplayName: "Industrial and Commercial Panel",
          electorGroup: "Industrial and Commercial Panel",
        }),
      },
      {
        id: "seanad-labour",
        name: "Labour Panel (11)",
        category: "seanad_panel",
        details: {
          type: "seanad_panel",
          panelId: "seanad-labour",
          seatCount: 11,
          electorGroup: "Labour Panel",
          summary: "Vocational panel for organised labour.",
        },
        children: senatorLeaves("seanad-lab", 11, "Panel senator", {
          panelId: "seanad-labour",
          panelDisplayName: "Labour Panel",
          electorGroup: "Labour Panel",
        }),
      },
    ],
  };
}

/** Deep clone and attach local government + Oireachtas elected layers. */
export function mergeElectedLayers(base: GraphNode): GraphNode {
  const root = JSON.parse(JSON.stringify(base)) as GraphNode;

  const housing = findById(root, "dept-housing");
  if (housing?.children) {
    housing.children.push(buildLocalAuthoritiesSubtree());
  }

  const dail = findById(root, "dail");
  if (dail?.children) {
    dail.children.push(buildDailElectedSubtree());
  }

  const seanad = findById(root, "seanad");
  if (seanad?.children) {
    const idx = seanad.children.findIndex((c) => c.id === "seanad-panels");
    const elected = buildSeanadElectedSubtree();
    if (idx >= 0) {
      seanad.children[idx] = elected;
    } else {
      seanad.children.push(elected);
    }
  }

  return root;
}

function findById(node: GraphNode, id: string): GraphNode | null {
  if (node.id === id) return node;
  for (const c of node.children ?? []) {
    const f = findById(c, id);
    if (f) return f;
  }
  return null;
}
