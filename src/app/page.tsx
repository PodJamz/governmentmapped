import { CodexShell } from "@/components/CodexShell";
import { MachineryGraph, type GraphNode } from "@/components/MachineryGraph";
import { enrichGraphWithDetails } from "@/data/enrich-graph-details";
import { mergeElectedLayers } from "@/data/elected-layers";
import { mergeReferenceDetails } from "@/data/reference-details";
import graphData from "../../data/irish-public-sector.json";

const graphReady = enrichGraphWithDetails(
  mergeReferenceDetails(mergeElectedLayers(graphData as GraphNode)),
);

export default function Home() {
  return (
    <CodexShell>
      <MachineryGraph data={graphReady} />
    </CodexShell>
  );
}
