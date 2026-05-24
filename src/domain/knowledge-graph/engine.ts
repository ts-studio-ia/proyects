import type { KnowledgeGraph, KnowledgeNode, KnowledgeEdge } from "./types.js";

export const createKnowledgeGraph = (tenantId: string): KnowledgeGraph => ({
  id: `kg-${tenantId}-${Date.now()}`,
  tenantId,
  nodes: new Map(),
  edges: [],
  version: 0
});

export const upsertKnowledgeNode = (
  graph: KnowledgeGraph,
  node: KnowledgeNode
): KnowledgeGraph => {
  if (node.tenantId !== graph.tenantId) return graph;
  const updated = new Map(graph.nodes);
  updated.set(node.id, { ...node, updatedAt: new Date().toISOString() });
  return { ...graph, nodes: updated, version: graph.version + 1 };
};

export const addKnowledgeEdge = (
  graph: KnowledgeGraph,
  edge: KnowledgeEdge
): KnowledgeGraph => {
  if (edge.tenantId !== graph.tenantId) return graph;
  const exists = graph.edges.some((e) => e.fromId === edge.fromId && e.toId === edge.toId && e.relationship === edge.relationship);
  if (exists) return graph;
  return { ...graph, edges: [...graph.edges, edge], version: graph.version + 1 };
};

export const traverseFrom = (
  graph: KnowledgeGraph,
  nodeId: string,
  maxDepth = 3
): KnowledgeNode[] => {
  const visited = new Set<string>();
  const result: KnowledgeNode[] = [];

  const visit = (id: string, depth: number): void => {
    if (depth > maxDepth || visited.has(id)) return;
    visited.add(id);
    const node = graph.nodes.get(id);
    if (node) result.push(node);
    graph.edges
      .filter((e) => e.fromId === id)
      .forEach((e) => visit(e.toId, depth + 1));
  };

  visit(nodeId, 0);
  return result;
};

export const getNodesByType = (graph: KnowledgeGraph, type: KnowledgeNode["type"]): KnowledgeNode[] =>
  Array.from(graph.nodes.values()).filter((n) => n.type === type);
