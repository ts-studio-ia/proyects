import type { WorkflowState } from "../governance/state-machine.js";

export type OperatorView = "executive" | "operator" | "governance" | "engineering" | "incident" | "replay";

export type SystemHealthStatus = "healthy" | "degraded" | "critical" | "unknown";

export type OperatorAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  details: string;
  timestamp: string;
  requiresAck: boolean;
};

export type ProductionReadinessCheck = {
  id: string;
  name: string;
  passed: boolean;
  notes: string;
};

export type SystemHealthOverview = {
  status: SystemHealthStatus;
  workflowState: WorkflowState;
  pendingApprovals: number;
  retryRatio: number;
  constitutionalViolations: number;
  activeAlerts: number;
  uiValid: boolean;
};

export type OperatorSummary = {
  sessionId: string;
  generatedAt: string;
  view: OperatorView;
  health: SystemHealthOverview;
  alerts: OperatorAlert[];
  productionReadiness: ProductionReadinessCheck[];
  narrative: string;
};
