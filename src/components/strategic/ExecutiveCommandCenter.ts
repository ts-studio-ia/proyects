import type { OrganizationGraph } from "../../domain/civilization/model.js";
import { calculateStrategicKpis, generateEnterpriseHeatmaps } from "../../domain/civilization/intelligence.js";

export const renderExecutiveCommandCenter = (graph: OrganizationGraph): string => {
  const kpi = calculateStrategicKpis(graph);
  const heat = generateEnterpriseHeatmaps(graph);
  return `ExecutiveCommandCenter\norgs:${graph.organizations.length}\nresilience:${kpi.organizationResilienceScore}\nrecovery:${kpi.strategicRecoveryVelocity}\nmesh:${graph.organizations[0]?.governanceMesh.id}\nheatmaps:${heat.escalationStormHeatmap.join(",")}`;
};
