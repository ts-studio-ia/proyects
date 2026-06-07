# Real Infrastructure Activation (Fase 27)

Activación externa **disabled-by-default**, sandbox-first, preview-first, dry-run-first, read-only-first.

## Guardrails
- sin policy/constitution: blocked
- sin tenant/project scope: blocked
- secretos solo por Vault reference
- terraform apply bloqueado por defecto y fuertemente gateado
- k8s staging/prod bloqueado sin Kyverno readiness
- acceso privado bloqueado sin Tailscale readiness

## Canonical boundaries
- Drizzle canonical, Prisma prohibido
- Milvus canonical, Qdrant prohibido
