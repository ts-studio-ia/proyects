import type { ApprovalPackage, ApprovalDecision } from "./types.js";

export type HumanLoopSession = {
  id: string;
  commandId: string;
  packageId: string;
  requestedAt: string;
  decidedAt?: string | undefined;
  decision: ApprovalDecision;
  operatorNotes?: string | undefined;
};

export type HumanLoopRequest = {
  commandId: string;
  package: ApprovalPackage;
  deadline?: string;
};

export type HumanLoopResult =
  | { status: "approved"; session: HumanLoopSession }
  | { status: "rejected"; session: HumanLoopSession; reason: string }
  | { status: "pending"; session: HumanLoopSession }
  | { status: "expired"; session: HumanLoopSession };

export const createHumanLoopSession = (request: HumanLoopRequest): HumanLoopSession => ({
  id: `hls-${request.commandId}-${Date.now()}`,
  commandId: request.commandId,
  packageId: request.package.id,
  requestedAt: new Date().toISOString(),
  decision: "pending"
});

export const resolveHumanLoopSession = (
  session: HumanLoopSession,
  decision: "approved" | "rejected",
  operatorNotes?: string
): HumanLoopSession => ({
  ...session,
  decision,
  decidedAt: new Date().toISOString(),
  operatorNotes
});

export const isSessionExpired = (session: HumanLoopSession, deadlineMs: number): boolean => {
  if (session.decision !== "pending") return false;
  return Date.now() - new Date(session.requestedAt).getTime() > deadlineMs;
};

export const evaluateHumanLoopResult = (
  session: HumanLoopSession,
  deadlineMs?: number
): HumanLoopResult => {
  if (deadlineMs !== undefined && isSessionExpired(session, deadlineMs)) {
    return { status: "expired", session };
  }
  if (session.decision === "approved") return { status: "approved", session };
  if (session.decision === "rejected")
    return { status: "rejected", session, reason: session.operatorNotes ?? "rejected by operator" };
  return { status: "pending", session };
};
