# MCP Marketplace Model (Internal Only)

Modelo interno (sin marketplace real).

## Marketplace Entry
Incluye trust profile, permisos solicitados, risk score y approval requirement.

## Estado inicial
- Install blocked by default.
- Requiere governance review explícita antes de habilitar instalación.

## Eventos
- `mcp_marketplace_entry_created`
- `mcp_marketplace_install_blocked`
