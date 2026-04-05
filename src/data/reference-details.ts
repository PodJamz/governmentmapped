import type { GraphNode } from "@/types/graph";

/**
 * Extra `details` merged before graph enrichment. Sources: gov.ie organisation pages,
 * body homepages, and Oireachtas / Courts portals. Verify URLs if government rebrands.
 */
const BY_ID: Record<string, Record<string, unknown>> = {
  "ie-root": {
    type: "jurisdiction_root",
    officialPortal: "https://www.gov.ie",
    departmentsIndex: "https://www.gov.ie/en/departments/",
    csoStatistics: "https://www.cso.ie",
    constitution: "https://www.irishstatutebook.ie/eli/cons/en/html",
    summary: "Irish national government and major arms-length bodies (illustrative structure).",
  },
  taoiseach: {
    role: "head_of_government",
    bunreachtArticle: "Article 28",
    summary: "Taoiseach chairs the Government and is appointed by the President on nomination of the Dáil.",
  },
  tanaiste: {
    role: "deputy_head_of_government",
    summary: "Tánaiste deputises for the Taoiseach and holds a ministerial portfolio.",
  },
  "cabinet-collective": {
    type: "cabinet",
    summary: "Government of Ireland: collective executive of ministers under the Taoiseach.",
  },
  "dept-taoiseach": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-the-taoiseach/",
    statutoryRole: "Supports Taoiseach and Cabinet; corporate centre of government.",
  },
  "dept-foreign": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-foreign-affairs/",
    alsoKnownAs: "Department of Foreign Affairs and Trade (common usage)",
  },
  "dept-finance": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-finance/",
    alternateSite: "https://www.gov.ie/en/department-of-finance/",
  },
  "dept-expenditure": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-public-expenditure-n-d-p-delivery-and-reform/",
    note: "Department title may change after machinery-of-government reforms; use departments index if link breaks.",
  },
  "dept-health": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-health/",
  },
  "dept-justice": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-justice/",
  },
  "dept-education": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-education/",
  },
  "dept-further": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-further-and-higher-education-research-innovation-and-science/",
  },
  "dept-enterprise": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-enterprise-tourism-and-employment/",
  },
  "dept-transport": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-transport/",
  },
  "dept-housing": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-housing-local-government-and-heritage/",
  },
  "dept-environment": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-the-environment-climate-and-communications/",
  },
  "dept-agriculture": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-agriculture-food-and-the-marine/",
  },
  "dept-social": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-social-protection/",
  },
  "dept-children": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-children-equality-disability-integration-and-youth/",
  },
  "dept-defence": {
    officialOrganisationUrl: "https://www.gov.ie/en/organisation/department-of-defence/",
  },
  "dept-rural": {
    officialOrganisationUrl:
      "https://www.gov.ie/en/organisation/department-of-rural-and-community-development/",
  },
  ntma: {
    officialSite: "https://www.ntma.ie",
    bodyType: "state_agency",
    summary: "National Treasury Management Agency: funding, ISF, and related state financial functions.",
  },
  revenue: {
    officialSite: "https://www.revenue.ie",
    irishName: "Na Coimisinéirí Ioncam",
    summary: "Tax and customs administration.",
  },
  ogp: {
    officialSite: "https://ogp.gov.ie",
    summary: "Office of Government Procurement.",
  },
  hse: {
    officialSite: "https://www.hse.ie",
    bodyType: "executive_ndpb_health",
    summary: "Health Service Executive: delivery of publicly funded health and social services.",
  },
  hpra: {
    officialSite: "https://www.hpra.ie",
    summary: "Regulates medicines, medical devices, and cosmetics.",
  },
  hiqa: {
    officialSite: "https://www.hiqa.ie",
    summary: "Health Information and Quality Authority: standards and inspection.",
  },
  garda: {
    officialSite: "https://www.garda.ie",
    irishName: "An Garda Síochána",
    summary: "National police service.",
  },
  ips: {
    officialSite: "https://www.irishprisons.ie",
    summary: "Irish Prison Service.",
  },
  lpi: {
    officialSite: "https://www.legalaidboard.ie",
    summary: "Legal Aid Board.",
  },
  "sec-exams": {
    officialSite: "https://www.examinations.ie",
    summary: "State Examinations Commission.",
  },
  ncca: {
    officialSite: "https://www.ncca.ie",
    summary: "National Council for Curriculum and Assessment.",
  },
  "hei-authority": {
    officialSite: "https://hea.ie",
    summary: "Higher Education Authority.",
  },
  sfi: {
    officialSite: "https://www.sfi.ie",
    summary: "Science Foundation Ireland.",
  },
  "enterprise-ireland": {
    officialSite: "https://www.enterprise-ireland.com",
    summary: "Trade and innovation agency for Irish enterprise.",
  },
  ida: {
    officialSite: "https://www.idaireland.com",
    summary: "Industrial Development Agency: inward investment.",
  },
  wrc: {
    officialSite: "https://www.workplacerelations.ie",
    summary: "Workplace Relations Commission.",
  },
  nta: {
    officialSite: "https://www.nationaltransport.ie",
    summary: "National Transport Authority.",
  },
  "irish-rail": {
    officialSite: "https://www.irishrail.ie",
    irishName: "Iarnród Éireann",
    summary: "National rail operator.",
  },
  lgma: {
    officialSite: "https://lgma.ie",
    summary: "Local Government Management Agency.",
  },
  "housing-agency": {
    officialSite: "https://www.housingagency.ie",
    summary: "Supports housing policy and delivery.",
  },
  epa: {
    officialSite: "https://www.epa.ie",
    summary: "Environmental Protection Agency.",
  },
  seai: {
    officialSite: "https://www.seai.ie",
    summary: "Sustainable Energy Authority of Ireland.",
  },
  teagasc: {
    officialSite: "https://www.teagasc.ie",
    summary: "Agriculture and food development authority.",
  },
  "bord-bia": {
    officialSite: "https://www.bordbia.ie",
    summary: "Irish food board.",
  },
  intreo: {
    officialSite: "https://www.gov.ie/en/help/departments/social-protection/",
    note: "Intreo is DSP's public-facing service brand; local offices nationwide.",
  },
  tusla: {
    officialSite: "https://www.tusla.ie",
    summary: "Child and family agency.",
  },
  df: {
    officialSite: "https://www.military.ie",
    irishName: "Óglaigh na hÉireann",
    summary: "Defence Forces (Army, Naval Service, Air Corps).",
  },
  pobal: {
    officialSite: "https://www.pobal.ie",
    summary: "EU and national programme administrator for communities.",
  },
  oireachtas: {
    officialSite: "https://www.oireachtas.ie",
    bunreachtArticle: "Article 15",
    summary: "National parliament: President, Dáil, and Seanad.",
  },
  dail: {
    officialSite: "https://www.oireachtas.ie",
    chamber: "dail",
    seatCount: 160,
    summary: "House of Representatives; members are Teachtaí Dála (TDs).",
  },
  seanad: {
    officialSite: "https://www.oireachtas.ie",
    chamber: "seanad",
    seatCount: 60,
    summary: "Senate; vocational panels, university seats, and Taoiseach nominees.",
  },
  "dail-clerk": {
    role: "clerk_of_dail",
    officialSite: "https://www.oireachtas.ie",
  },
  "seanad-clerk": {
    role: "clerk_of_seanad",
    officialSite: "https://www.oireachtas.ie",
  },
  "dail-committees": {
    officialSite: "https://www.oireachtas.ie/en/committees/",
  },
  "dail-debates": {
    officialSite: "https://www.oireachtas.ie/en/debates/",
  },
  courts: {
    officialSite: "https://www.courts.ie",
    summary: "Courts Service: administration of courts (independent judiciary).",
  },
  "superior-courts": {
    officialSite: "https://www.courts.ie",
  },
  "courts-hc": {
    courtTier: "high_court",
  },
  "courts-co": {
    courtTier: "court_of_appeal",
  },
  "courts-sc": {
    courtTier: "supreme_court",
  },
};

function patternDetails(node: GraphNode): Record<string, unknown> | null {
  const { id, name, category } = node;

  if (id.startsWith("hse-cho-")) {
    return {
      hseLayer: "community_health_organisation",
      officialPortal: "https://www.hse.ie",
      coverageNote: name,
      summary: "HSE regional commissioning and community health footprint (CHO).",
    };
  }

  if (id.startsWith("hse-hg-")) {
    return {
      hseLayer: "hospital_group",
      officialPortal: "https://www.hse.ie",
      groupName: name,
      summary: "Acute hospital group under HSE structures.",
    };
  }

  if (id.startsWith("garda-") && id !== "garda") {
    return {
      gardaLayer: "region_or_specialist",
      officialPortal: "https://www.garda.ie",
      unitLabel: name,
    };
  }

  if (id.startsWith("rev-")) {
    return {
      revenueDivision: true,
      officialPortal: "https://www.revenue.ie",
      divisionLabel: name,
    };
  }

  if (category === "ministerial_dept" && !BY_ID[id]) {
    return {
      hint: "Ministerial department",
      departmentsIndex: "https://www.gov.ie/en/departments/",
    };
  }

  if (category === "division" && !BY_ID[id]) {
    return {
      hint: "Organisational division (illustrative in this graph)",
    };
  }

  return null;
}

function mergeIntoNode(node: GraphNode): GraphNode {
  const fromId = BY_ID[node.id];
  const fromPattern = patternDetails(node);
  const base =
    node.details && typeof node.details === "object" && !Array.isArray(node.details)
      ? { ...node.details }
      : {};

  const merged: Record<string, unknown> = {
    ...base,
    ...(fromPattern ?? {}),
    ...(fromId ?? {}),
    dataSourceNote:
      "Reference URLs and labels curated for the Eire demo (Apr 2026). Confirm on live sites after reorganisations.",
  };

  const next: GraphNode = {
    ...node,
    details: merged,
  };

  if (node.children?.length) {
    next.children = node.children.map(mergeIntoNode);
  }

  return next;
}

/** Deep-merge reference metadata into every node’s `details` (before enrichGraphWithDetails). */
export function mergeReferenceDetails(root: GraphNode): GraphNode {
  return mergeIntoNode(JSON.parse(JSON.stringify(root)) as GraphNode);
}
