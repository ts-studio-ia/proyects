# MCP UI Surface

Superficie gobernada para operar MCP con progressive disclosure.

## Vistas
- MCP App Panel
- MCP Tool Inspector
- MCP Permission View
- MCP Invocation Preview
- MCP Audit Trail
- MCP Replay View
- MCP Capability Graph
- MCP Marketplace View
- MCP UI Action Bar

## MCP UI Action contract
Toda acción declara: `id`, `label`, `appId`, `toolId`, `actionType`, `mutatesState`, `requiresApproval`, `requiredPolicyEffects`, `inputSchema`, `outputSchema`, `tenantScope`, `projectScope`, `traceEvents`, `rollbackSupport`, `replaySupport`.

## Guardrails
- UI action no bypass de policy runtime.
- UI action no bypass de constitutional runtime.
- Mutaciones sin approval quedan bloqueadas.

## MCP UI runtime binding
External UI actions must bind to runtime gateway and governance checks.
