# MCP Security Boundaries

## Sandbox constraints
- tool permissions
- network scope
- filesystem scope
- tenant/project scope
- secrets boundary
- output redaction
- timeout + resource budget
- replay + rollback metadata

## Trust and quarantine
- App sin trust profile -> blocked.
- App puede ser quarantined para bloquear futuras invocaciones.

## Invariante
MCP no es puerta trasera: toda capacidad MCP debe ser scoped, policy-governed, constitutionally bounded, auditable y replayable.
