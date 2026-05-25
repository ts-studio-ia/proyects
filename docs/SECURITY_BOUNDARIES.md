# Security Boundaries

## Kyverno Required Policies
- namespaces per tenant/environment
- no privileged pods
- image policies
- resource limits
- secret mounting rules
- runtime boundaries
- deployment approval annotations

## Tailscale Required Controls
- private admin mesh
- worker-to-control-plane secure access
- emergency operator access
- private observability access
- zero-trust internal routing

## Secrets
- HashiCorp Vault is mandatory for production secret resolution.
- Doppler allowed only as initial dev/staging alternative.
- Real secrets must be resolved by reference, never plain values.
- Secrets are forbidden in traces/logs/exports and must be redacted.

## MCP Security Boundary
- Secret-by-value blocked for MCP tools.
- MCP invocations must emit audit receipt and be replayable.
- Quarantine state blocks future invocations.

## Unified runtime/external security
- Terraform apply fuertemente gateado.
- Kyverno + Tailscale readiness obligatorias para operaciones sensibles.
- Secretos externos siempre por Vault reference y redacción defensiva.
