# MCP Fabric

Fase 26.6 define una **capability fabric gobernada** para MCP sin ejecución real externa.

## Modelos
- MCPServer, MCPApp, MCPTool
- MCPPermission, MCPScope, MCPInvocation
- MCPAuditReceipt, MCPReplayRecord
- MCPCapabilityGraph, MCPTrustProfile, MCPBoundary

## Reglas de enforcement
- Apps MCP inician `disabled`.
- Toda invocación requiere policy decision + tenant/project scope.
- Invocación mutante requiere approval package.
- Tool sin schema queda bloqueada.
- Tool con secret por valor queda bloqueada; solo `SecretVaultReference`.
- Todas las invocaciones deben generar audit receipt y replay metadata.

## Engine
`src/domain/mcp-fabric/engine.ts` implementa registro, validación, simulación, quarantine, trust scoring, replay y enlaces a policy/ledger/canvas.

## MCP runtime bridge integration
External MCP execution is bound to policy+constitutional gates and audit/replay receipts.
