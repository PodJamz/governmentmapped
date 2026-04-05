/**
 * Writes data/irish-public-sector.json (root graph for the atlas).
 * Run: node scripts/generate-irish-public-sector-json.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const outPath = path.join(rootDir, "data", "irish-public-sector.json");

function dept(id, name, children = []) {
  return { id, name, category: "ministerial_dept", children };
}

function ndpb(id, name, category = "executive_ndpb") {
  return { id, name, category };
}

function cho(n) {
  const id = `hse-cho-${n}`;
  return {
    id,
    name: `CHO ${n} (Community Healthcare Organisation)`,
    category: "division",
  };
}

function hg(name, slug) {
  return {
    id: `hse-hg-${slug}`,
    name,
    category: "division",
  };
}

function gardaRegion(name, slug) {
  return {
    id: `garda-${slug}`,
    name: `Garda ${name}`,
    category: "division",
  };
}

const graph = {
  id: "ie-root",
  name: "Ireland (Éire)",
  category: "government_root",
  children: [
    {
      id: "executive-cluster",
      name: "Executive branch",
      category: "cabinet_collective",
      children: [
        { id: "taoiseach", name: "Taoiseach", category: "taoiseach" },
        { id: "tanaiste", name: "Tánaiste", category: "tanaiste" },
        {
          id: "cabinet-collective",
          name: "Government (Cabinet)",
          category: "cabinet_collective",
        },
        {
          id: "departments",
          name: "Ministerial departments",
          category: "other_body",
          children: [
            dept("dept-taoiseach", "Department of the Taoiseach"),
            dept("dept-foreign", "Department of Foreign Affairs"),
            dept("dept-finance", "Department of Finance", [
              ndpb("ntma", "National Treasury Management Agency"),
              ndpb("revenue", "Revenue Commissioners"),
              ndpb("ogp", "Office of Government Procurement", "executive_agency"),
            ]),
            dept("dept-expenditure", "Department of Public Expenditure, NDP Delivery and Reform"),
            dept("dept-health", "Department of Health", [
              {
                id: "hse",
                name: "Health Service Executive (HSE)",
                category: "executive_ndpb",
                children: [
                  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(cho),
                  hg("Dublin Midlands Hospital Group", "dublin-midlands"),
                  hg("Ireland East Hospital Group", "ireland-east"),
                  hg("South/South West Hospital Group", "south"),
                  hg("RCSI Hospitals", "rcsi"),
                  hg("University of Galway Hospitals", "galway"),
                ],
              },
              ndpb("hpra", "Health Products Regulatory Authority", "advisory_ndpb"),
              ndpb("hiqa", "HIQA", "advisory_ndpb"),
            ]),
            dept("dept-justice", "Department of Justice", [
              {
                id: "garda",
                name: "An Garda Síochána",
                category: "executive_ndpb",
                children: [
                  gardaRegion("Dublin Metropolitan Region", "dmr"),
                  gardaRegion("Eastern Region", "eastern"),
                  gardaRegion("North Western Region", "north-western"),
                  gardaRegion("Southern Region", "southern"),
                  gardaRegion("South Eastern Region", "south-eastern"),
                ],
              },
              ndpb("ips", "Irish Prison Service"),
              ndpb("lpi", "Legal Aid Board"),
            ]),
            dept("dept-education", "Department of Education", [
              ndpb("sec-exams", "State Examinations Commission"),
              ndpb("ncca", "NCCA", "advisory_ndpb"),
            ]),
            dept("dept-further", "Department of Further and Higher Education", [
              ndpb("hei-authority", "Higher Education Authority"),
              ndpb("sfi", "Science Foundation Ireland"),
            ]),
            dept("dept-enterprise", "Department of Enterprise, Trade and Employment", [
              ndpb("enterprise-ireland", "Enterprise Ireland"),
              ndpb("ida", "IDA Ireland"),
              ndpb("wrc", "Workplace Relations Commission", "tribunal"),
            ]),
            dept("dept-transport", "Department of Transport", [
              ndpb("nta", "National Transport Authority"),
              ndpb("irish-rail", "Iarnród Éireann", "public_corporation"),
            ]),
            dept("dept-housing", "Department of Housing, Local Government and Heritage", [
              ndpb("lgma", "Local Government Management Agency"),
              ndpb("housing-agency", "The Housing Agency"),
            ]),
            dept("dept-environment", "Department of the Environment, Climate and Communications", [
              ndpb("epa", "Environmental Protection Agency"),
              ndpb("seai", "SEAI"),
            ]),
            dept("dept-agriculture", "Department of Agriculture, Food and the Marine", [
              ndpb("teagasc", "Teagasc"),
              ndpb("bord-bia", "Bord Bia"),
            ]),
            dept("dept-social", "Department of Social Protection", [ndpb("intreo", "Intreo (service network)")]),
            dept("dept-children", "Department of Children, Equality, Disability, Integration and Youth", [
              ndpb("tusla", "Tusla"),
            ]),
            dept("dept-defence", "Department of Defence", [ndpb("df", "Defence Forces")]),
            dept("dept-rural", "Department of Rural and Community Development", [ndpb("pobal", "Pobal")]),
          ],
        },
      ],
    },
    {
      id: "oireachtas",
      name: "Oireachtas (Parliament)",
      category: "other_body",
      children: [
        {
          id: "dail",
          name: "Dáil Éireann",
          category: "other_body",
          children: [
            { id: "dail-clerk", name: "Clerk of the Dáil", category: "civil_servant" },
            { id: "dail-committees", name: "Select committees", category: "other_body" },
            { id: "dail-debates", name: "Debates and votes", category: "other_body" },
          ],
        },
        {
          id: "seanad",
          name: "Seanad Éireann",
          category: "other_body",
          children: [
            { id: "seanad-clerk", name: "Clerk of the Seanad", category: "civil_servant" },
            {
              id: "seanad-panels",
              name: "Panel groups (replaced at build with elected model)",
              category: "oireachtas_elected",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "courts",
      name: "Courts Service",
      category: "non_ministerial",
      children: [
        { id: "superior-courts", name: "Superior courts", category: "other_body" },
        { id: "courts-hc", name: "High Court", category: "tribunal" },
        { id: "courts-co", name: "Court of Appeal", category: "tribunal" },
        { id: "courts-sc", name: "Supreme Court", category: "tribunal" },
      ],
    },
  ],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
console.log("Wrote", outPath);
