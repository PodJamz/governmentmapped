/** Radial graph node: optional `details` holds JSON-serializable metadata shown in the node modal. */
export type GraphNode = {
  id: string;
  name: string;
  category: string;
  details?: Record<string, unknown>;
  children?: GraphNode[];
};
