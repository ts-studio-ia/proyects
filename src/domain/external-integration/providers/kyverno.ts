import { BaseDisabledProvider } from "./base.js";

export type KyvernoPolicyCheckResult = {
  policyId: string;
  passed: boolean;
  violations: string[];
  checkedAt: string;
};

export class KyvernoProvider extends BaseDisabledProvider {
  readonly id = "kyverno";
  readonly name = "Kyverno";

  verifyProductionReadiness(): { ready: boolean; reason: string } {
    return {
      ready: false,
      reason: "Kyverno not enabled — production-ready requires Kyverno policy enforcement active"
    };
  }

  checkPolicy(policyId: string): KyvernoPolicyCheckResult {
    return {
      policyId,
      passed: false,
      violations: ["Kyverno not connected — sandbox mode only"],
      checkedAt: new Date().toISOString()
    };
  }
}
