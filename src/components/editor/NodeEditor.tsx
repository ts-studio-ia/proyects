import type { TraceEvent } from "../../domain/trace/types.js";
import type { RepoNode } from "../../domain/repo/types.js";

export type NodeEditorTab = "code" | "description";

export const renderNodeEditor = (node: RepoNode, tab: NodeEditorTab, timeline: TraceEvent[] = []): string => {
  const header = `📄 ${node.path} | ${node.language ?? "plain"} | ${node.artifactType}`;
  const badges = `Risk:${node.risk} | Confidence:${node.confidence} | Cost:${node.cost}`;

  if (tab === "code") {
    const codeLines = node.codePreview.split("\n").map((line, index) => `${String(index + 1).padStart(3, " ")} ${line}`).join("\n");
    return `${header}\n${badges}\nTAB: CÓDIGO (Editor principal)\n${codeLines}`;
  }

  const changelog = node.changelog.map((entry) => `- ${entry.at} ${entry.author}: ${entry.summary}`).join("\n") || "- sin cambios";
  const traces = node.traceEvents.map((event) => `- ${event.type} @ ${event.timestamp}`).join("\n") || "- sin trazas";
  const validations = node.validations.map((validation) => `- ${validation.name}: ${validation.passed ? "ok" : "fail"}`).join("\n") || "- sin validaciones";
  const traceTimeline = timeline.map((event) => `- ${event.timestamp} | ${event.type} | actor:${event.actor} | result:${event.details}`).join("\n") || "- timeline vacía";

  return `${header}\n${badges}\nTAB: Descripción y Registro\nDescripción del Nodo: ${node.description}\nResponsabilidades principales: ${node.responsibilities.join(", ")}\nDependencies clave: ${node.dependencies.join(", ")}\nNotas de Arquitectura: ${node.architectureNotes.join(" | ")}\nRegistro de Cambios:\n${changelog}\nTrace-events asociados:\n${traces}\nValidaciones:\n${validations}\nTrace Timeline:\n${traceTimeline}`;
};
