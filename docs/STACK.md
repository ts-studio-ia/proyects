# Canonical Production Stack (Fase 26.5)

## Persistence
- PostgreSQL (required)
- Drizzle ORM (required)
- Event ledger append-only
- Tenant isolation estricta

## Knowledge / Vector
- Milvus (required, principal)
- PostgreSQL/pgvector (optional, simple queries)
- Qdrant: prohibited

## Infrastructure
- Docker
- K3s/Kubernetes
- Traefik ingress
- Cloudflare Tunnel
- Tailscale private mesh
- Kyverno policy enforcement
- HashiCorp Terraform (canonical IaC; plan/preview-first)

## Secrets
- HashiCorp Vault (required, principal)
- Doppler (allowed only as dev/staging alternative)
- Secrets must be referenced, never plain-value embedded

## Governance/Security Non-Negotiables
- Kyverno required before production-ready
- Tailscale required for private admin/runtime access
- Vault required for production secrets readiness
- Terraform apply forbidden without approval package + policy decision + constitutional validation + rollback plan
- Prisma prohibited

## MCP Fabric (Fase 26.6)
- MCP capability fabric governed (no external real execution yet).
- MCP tools require policy + constitutional checks + tenant/project scope.
- Mutating actions require approval package.

## Fase 27 additions
- Unified Runtime Execution Kernel domain added.
- External Integration domain added (disabled-by-default adapters).
- MCP Runtime Bridge formalized.
