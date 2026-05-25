import type { AppState } from "../../app/store.js";
import type { ExecutionGraph } from "../../domain/graph-orchestration/types.js";

export const renderOperationalHUD = (state: AppState, graph: ExecutionGraph, traceThroughputPerSec: number): string => {
  const activeExecution = graph.nodes.filter((n) => n.state === "EXECUTING").length;
  const blocked = graph.nodes.filter((n) => n.state === "BLOCKED").length;
  const escalated = graph.nodes.filter((n) => n.state === "ESCALATED").length;
  const activeAgents = new Set(graph.nodes.map((n) => n.ownerAgent)).size;
  const validationFailures = state.traceSlice.events.filter((e) => e.type === "validation_gate_failed").length;
  return `TOP|mode:${state.repoSlice.repoMode} gov:${state.governanceSlice.state} active:${activeExecution} blocked:${blocked} escalations:${escalated} validationFailures:${validationFailures} activeAgents:${activeAgents} throughput:${traceThroughputPerSec}`;
};
