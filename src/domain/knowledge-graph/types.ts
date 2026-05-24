export type KnowledgeNodeType =
  | "decision"
  | "trace_event"
  | "proposal"
  | "policy"
  | "workflow"
  | "evidence"
  | "tenant"
  | "risk"
  | "objective"
  | "governance";

export type KnowledgeNode = {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  tenantId: string;
  projectId: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  evidenceRefs: string[];
};

export type KnowledgeEdge = {
  id: string;
  fromId: string;
  toId: string;
  relationship: "causes" | "requires" | "blocks" | "produces" | "validates" | "supersedes" | "references";
  weight: number;
  tenantId: string;
};

export type KnowledgeGraph = {
  id: string;
  tenantId: string;
  nodes: Map<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
  version: number;
};
