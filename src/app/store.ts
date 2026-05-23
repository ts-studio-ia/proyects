import type { RepoNode } from "../domain/repo/types.js";
import type { TraceEvent } from "../domain/trace/types.js";
import type { WorkflowState } from "../domain/governance/state-machine.js";

export type CanvasView = { zoom: number; panX: number; panY: number; search: string; activeLayer: string };

export interface AppState {
  repoSlice: { nodes: RepoNode[]; selectedNodeId: string | undefined };
  graphSlice: { view: CanvasView };
  editorSlice: { activeTab: "code" | "description" };
  agentSlice: { mode: "guided" | "autonomous"; pendingCommandIds: string[] };
  traceSlice: { events: TraceEvent[] };
  governanceSlice: { state: WorkflowState };
  uiValidationSlice: { isValid: boolean; retryCount: number; retryBudget: number; lastDiagnostic: string | undefined };
}

export const createInitialState = (): AppState => ({
  repoSlice: { nodes: [], selectedNodeId: undefined },
  graphSlice: { view: { zoom: 1, panX: 0, panY: 0, search: "", activeLayer: "all" } },
  editorSlice: { activeTab: "code" },
  agentSlice: { mode: "guided", pendingCommandIds: [] },
  traceSlice: { events: [] },
  governanceSlice: { state: "DRAFT" },
  uiValidationSlice: { isValid: true, retryCount: 0, retryBudget: 3, lastDiagnostic: undefined }
});

export const storeActions = {
  setNodes: (state: AppState, nodes: RepoNode[]): AppState => ({ ...state, repoSlice: { ...state.repoSlice, nodes: [...nodes] } }),
  selectNode: (state: AppState, nodeId: string): AppState => ({ ...state, repoSlice: { ...state.repoSlice, selectedNodeId: nodeId } }),
  setTab: (state: AppState, tab: "code" | "description"): AppState => ({ ...state, editorSlice: { ...state.editorSlice, activeTab: tab } }),
  setSearch: (state: AppState, search: string): AppState => ({ ...state, graphSlice: { view: { ...state.graphSlice.view, search } } }),
  setZoomPan: (state: AppState, zoom: number, panX: number, panY: number): AppState => ({ ...state, graphSlice: { view: { ...state.graphSlice.view, zoom, panX, panY } } }),
  publishTrace: (state: AppState, event: TraceEvent): AppState => ({ ...state, traceSlice: { events: [...state.traceSlice.events, event] } }),
  setWorkflowState: (state: AppState, workflowState: WorkflowState): AppState => ({ ...state, governanceSlice: { ...state.governanceSlice, state: workflowState } })
};
