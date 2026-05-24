import { BaseDisabledProvider } from "./base.js";
import type { ProviderBoundary } from "../types.js";

export class MilvusProvider extends BaseDisabledProvider {
  readonly id = "milvus";
  readonly name = "Milvus";

  verifyVectorBoundary(boundary: ProviderBoundary): { ok: boolean; reason?: string } {
    if (this.status === "disabled") {
      return { ok: false, reason: "Milvus is disabled by default" };
    }
    if (!boundary.tenantId || !boundary.projectId) {
      return { ok: false, reason: "tenant and project scope required for vector operations" };
    }
    return { ok: true };
  }
}
