# Integration Boundaries

## Allowed Canonical Integrations
- ORM: Drizzle
- Vector DB: Milvus (primary), pgvector optional
- Policy Engine: Kyverno
- Private Mesh: Tailscale
- Secrets: HashiCorp Vault (primary), Doppler (dev/staging only)
- IaC: Terraform (plan/preview-first)

## Explicitly Blocked
- Prisma (blocked)
- Qdrant (blocked)
- Terraform apply without governance package (blocked)

## Boundary Principle
No component is production-ready if it bypasses Kyverno policy checks, Tailscale private mesh requirements, or Vault-based secret references.

## MCP Integration Boundary
- MCP execution is simulation-only in Fase 26.6.
- No external tools can run without policy decision and scope validation.

## Unified runtime + external integration boundary
- Toda ejecución externa pasa por MCP + Policy + Constitutional + Reality Bridge + Controlled Apply + Ledger + Replay.
