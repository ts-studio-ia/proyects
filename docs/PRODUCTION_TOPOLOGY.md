# Production Topology

- Control Plane runs in Kubernetes (K3s-compatible).
- Traefik handles ingress; Cloudflare Tunnel exposes controlled edge routes.
- Tailscale provides private admin mesh, worker-to-control-plane secure access, emergency operator path, and private observability routing.
- PostgreSQL stores operational data and append-only event ledger.
- Milvus stores vector knowledge index.
- Kyverno enforces cluster runtime/deployment policies.
- HashiCorp Vault is the primary production secrets backend.
- Doppler may be used only in dev/staging transitional environments.
- Terraform provisions infrastructure declaratively via plan/preview-first workflow.

## Runtime activation order
Preview/sandbox first, then governed activation with policy+constitutional+kyverno+tailscale+vault gates before any production-sensitive path.
