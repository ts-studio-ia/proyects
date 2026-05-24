import { BaseDisabledProvider } from "./base.js";
import type { ProviderBoundary } from "../types.js";

export class DrizzleProvider extends BaseDisabledProvider {
  readonly id = "postgres-drizzle";
  readonly name = "PostgreSQL + Drizzle ORM";

  verifyDatabaseBoundary(boundary: ProviderBoundary): { ok: boolean; reason?: string } {
    if (this.status === "disabled") {
      return { ok: false, reason: "Drizzle/PostgreSQL is disabled by default" };
    }
    if (!boundary.tenantId || !boundary.projectId) {
      return { ok: false, reason: "tenant and project scope required for database operations" };
    }
    return { ok: true };
  }

  verifyPrismaProhibited(): { prohibited: true; reason: string } {
    return { prohibited: true, reason: "Prisma is prohibited — use Drizzle ORM as the canonical database layer" };
  }
}
