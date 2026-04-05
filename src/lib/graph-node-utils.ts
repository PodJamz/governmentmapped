import type { GraphNode } from "@/types/graph";

export function findNodeById(root: GraphNode, id: string): GraphNode | null {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const f = findNodeById(c, id);
    if (f) return f;
  }
  return null;
}

export function countDescendants(node: GraphNode): number {
  if (!node.children?.length) return 0;
  let n = node.children.length;
  for (const c of node.children) n += countDescendants(c);
  return n;
}

/** Payload for the detail modal: full metadata without embedding entire subtrees as nested JSON. */
export function serializeNodeForModal(node: GraphNode): Record<string, unknown> {
  return {
    id: node.id,
    name: node.name,
    category: node.category,
    details: node.details && typeof node.details === "object" ? node.details : {},
    childrenPreview:
      node.children?.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        directChildren: c.children?.length ?? 0,
        descendantCount: countDescendants(c),
      })) ?? [],
    descendantCount: countDescendants(node),
  };
}
