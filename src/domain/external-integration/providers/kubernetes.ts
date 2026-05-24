import { BaseDisabledProvider } from "./base.js";
import type { HealthCheckResult } from "../types.js";

export class KubernetesProvider extends BaseDisabledProvider {
  readonly id = "kubernetes";
  readonly name = "Kubernetes/K3s";

  override healthCheck(): HealthCheckResult {
    return {
      ...super.healthCheck(),
      notes: `Kubernetes is disabled. Kyverno readiness required before enabling in staging/production.`
    };
  }
}
