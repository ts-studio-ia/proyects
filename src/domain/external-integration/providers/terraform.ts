import { BaseDisabledProvider } from "./base.js";
import type { ProviderBoundary } from "../types.js";

export type TerraformPlanPreview = {
  planId: string;
  resourceChanges: number;
  estimatedBlastRadius: number;
  isDestructive: boolean;
  requiresApproval: boolean;
  previewedAt: string;
};

export type TerraformApplyRequest = {
  planId: string;
  approvalPackageId: string;
  policyDecisionId: string;
  constitutionalDecisionId: string;
  rollbackPlanExists: boolean;
  environment: "dev" | "staging" | "production";
  blastRadiusThreshold: number;
};

export class TerraformProvider extends BaseDisabledProvider {
  readonly id = "terraform";
  readonly name = "Terraform";

  createTerraformPlanPreview(
    action: string,
    _boundary: ProviderBoundary
  ): TerraformPlanPreview {
    return {
      planId: `tf-plan-${Date.now()}`,
      resourceChanges: 0,
      estimatedBlastRadius: 0,
      isDestructive: false,
      requiresApproval: true,
      previewedAt: new Date().toISOString()
    };
  }

  validateTerraformApplyRequest(req: TerraformApplyRequest): { ok: boolean; blockedReasons: string[] } {
    const blockedReasons: string[] = [];
    if (!req.approvalPackageId) blockedReasons.push("approval package required");
    if (!req.policyDecisionId) blockedReasons.push("policy decision required");
    if (!req.constitutionalDecisionId) blockedReasons.push("constitutional decision required");
    if (!req.rollbackPlanExists) blockedReasons.push("rollback plan required");
    if (req.environment === "production") blockedReasons.push("production apply requires explicit promotion gate");
    return { ok: blockedReasons.length === 0, blockedReasons };
  }
}
