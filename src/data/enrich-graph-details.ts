import type { GraphNode } from "@/types/graph";

/**
 * Ensures every node has a `details` object with graph context (path, depth, counts).
 * Merges with any existing `details` from JSON or elected-layers.
 */
export function enrichGraphWithDetails(root: GraphNode): GraphNode {
  function walk(
    node: GraphNode,
    parentId: string | null,
    pathNames: string[],
    depth: number,
  ): GraphNode {
    const graphPath = [...pathNames, node.name].join(" → ");
    const childCount = node.children?.length ?? 0;
    const existing =
      node.details && typeof node.details === "object" && !Array.isArray(node.details)
        ? (node.details as Record<string, unknown>)
        : {};

    const merged: GraphNode = {
      ...node,
      details: {
        ...existing,
        graphPath,
        depth,
        parentId,
        childCount,
        hasChildren: childCount > 0,
        jurisdiction: "Ireland",
        schemaVersion: 1,
      },
    };

    if (merged.children?.length) {
      merged.children = merged.children.map((c) =>
        walk(c, node.id, [...pathNames, node.name], depth + 1),
      );
    }

    return merged;
  }

  return walk(root, null, [], 0);
}
