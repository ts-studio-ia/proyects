export type StackLayer =
  | "frontend"
  | "backend_control_plane"
  | "agent_runtime"
  | "workflow_orchestration"
  | "queue"
  | "database"
  | "vector_db"
  | "event_trace"
  | "storage"
  | "infrastructure"
  | "private_mesh"
  | "kubernetes_policy"
  | "secrets"
  | "iac"
  | "auth"
  | "observability"
  | "ci_cd";

export type StackReadiness = "not_started" | "defined" | "implemented" | "tested" | "production_ready";

export type StackComponent = {
  id: string;
  layer: StackLayer;
  name: string;
  technology: string;
  readiness: StackReadiness;
  isCanonical: boolean;
  isProhibited: boolean;
  reason?: string;
};

export type StackViolation = {
  component: string;
  rule: string;
  severity: "warning" | "error" | "fatal";
};

export const CANONICAL_STACK: StackComponent[] = [
  { id: "react", layer: "frontend", name: "React + TypeScript + Vite + Zustand", technology: "react", readiness: "defined", isCanonical: true, isProhibited: false },
  { id: "nestjs", layer: "backend_control_plane", name: "NestJS + TypeScript", technology: "nestjs", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "fastapi", layer: "agent_runtime", name: "Python FastAPI + LangGraph + Pydantic", technology: "fastapi", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "temporal", layer: "workflow_orchestration", name: "Temporal.io", technology: "temporal", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "redis_bullmq", layer: "queue", name: "Redis/BullMQ", technology: "redis", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "postgres_drizzle", layer: "database", name: "PostgreSQL + Drizzle ORM", technology: "drizzle", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "prisma", layer: "database", name: "Prisma", technology: "prisma", readiness: "not_started", isCanonical: false, isProhibited: true, reason: "Prisma is prohibited — use Drizzle ORM" },
  { id: "milvus", layer: "vector_db", name: "Milvus", technology: "milvus", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "qdrant", layer: "vector_db", name: "Qdrant", technology: "qdrant", readiness: "not_started", isCanonical: false, isProhibited: true, reason: "Qdrant is prohibited — use Milvus" },
  { id: "otel", layer: "event_trace", name: "OpenTelemetry + NATS JetStream + Postgres Ledger", technology: "opentelemetry", readiness: "defined", isCanonical: true, isProhibited: false },
  { id: "minio", layer: "storage", name: "MinIO local / Cloudflare R2 or AWS S3 production", technology: "minio", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "k3s", layer: "infrastructure", name: "Docker + K3s/Kubernetes + Traefik + Cloudflare Tunnel", technology: "kubernetes", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "tailscale", layer: "private_mesh", name: "Tailscale", technology: "tailscale", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "kyverno", layer: "kubernetes_policy", name: "Kyverno", technology: "kyverno", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "vault", layer: "secrets", name: "HashiCorp Vault (prod) + Doppler (dev/staging)", technology: "vault", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "terraform", layer: "iac", name: "Terraform plan-first", technology: "terraform", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "clerk", layer: "auth", name: "Clerk/Auth0 → OIDC/SAML enterprise", technology: "clerk", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "grafana", layer: "observability", name: "Grafana + Loki + Prometheus + Tempo + OpenTelemetry", technology: "grafana", readiness: "not_started", isCanonical: true, isProhibited: false },
  { id: "github_actions", layer: "ci_cd", name: "GitHub Actions + GHCR + preview deployments", technology: "github_actions", readiness: "not_started", isCanonical: true, isProhibited: false }
];

export const validateStackUsage = (technology: string): StackViolation | undefined => {
  const component = CANONICAL_STACK.find(
    (c) => c.technology.toLowerCase() === technology.toLowerCase()
  );
  if (!component) return undefined;
  if (component.isProhibited) {
    return { component: component.name, rule: component.reason ?? "prohibited", severity: "fatal" };
  }
  return undefined;
};
