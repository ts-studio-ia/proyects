# TST Autonomous — repo-navigator-canvas

**Operating System for Governed Autonomous Engineering**

> Humano gobierna. Policy decide. Constitución limita. Trace registra. Rollback protege.

---

## Estado actual (verificado 2026-05-24)

| Capa | Estado |
|---|---|
| Domain types + store + selectors | Implementado |
| Governance stubs (10 módulos) | Implementado con lógica real |
| Command pipeline gobernado | Implementado |
| Policy Runtime | Implementado |
| Constitutional Runtime (6 invariantes) | Implementado |
| Unified Runtime Kernel | Implementado |
| Event Sourcing / Ledger | Implementado |
| Knowledge Graph | Implementado |
| MCP Fabric | Implementado |
| Controlled Apply | Implementado |
| Reality Bridge | Implementado |
| Operator Experience | Implementado |
| Stack Definition | Implementado |
| External Integration (12 providers, todos disabled) | Implementado |
| **Backend NestJS** | **No existe** |
| **PostgreSQL + Drizzle** | **No existe** |
| **UI React real** | **No existe** |
| **CI/CD** | **No existe** |
| **Auth** | **No existe** |

Ver [docs/REALITY_AUDIT.md](docs/REALITY_AUDIT.md) para análisis completo.

---

## Estructura

```
src/
├── app/                          # Store (7 slices) + selectors
├── domain/
│   ├── repo/                     # RepoNode types
│   ├── trace/                    # TraceEvent bus (65 event types)
│   ├── governance/               # State machine + 10 módulos reales
│   ├── agent/                    # Governed command pipeline
│   ├── graph/                    # Canvas controller
│   ├── validation/               # UI validation
│   ├── policy-runtime/           # Policy evaluation (deny-by-default)
│   ├── constitutional-runtime/   # Constitutional invariants
│   ├── event-sourcing/           # Append-only ledger + hash chain
│   ├── knowledge-graph/          # Sovereign knowledge graph
│   ├── mcp-fabric/               # MCP tool registry + invocations
│   ├── controlled-apply/         # Apply sessions + receipts
│   ├── reality-bridge/           # Execution permits + boundaries
│   ├── stack-definition/         # Canonical stack definition
│   ├── operator-experience/      # Health + operator summaries
│   ├── unified-runtime-kernel/   # Unified governed pipeline
│   └── external-integration/     # 12 providers (all disabled by default)
│       └── providers/
│           ├── github.ts
│           ├── local-fs.ts
│           ├── docker.ts
│           ├── kubernetes.ts
│           ├── vercel.ts
│           ├── vault.ts
│           ├── terraform.ts
│           ├── tailscale.ts
│           ├── kyverno.ts
│           ├── milvus.ts
│           ├── drizzle.ts
│           └── mcp.ts
├── components/
│   ├── canvas/                   # RepoCanvas (texto)
│   └── editor/                   # NodeEditor (texto)
└── tests/
    └── core.test.ts              # 31 tests
```

---

## Stack canónico

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | React + TypeScript + Vite + Zustand | Parcial (tipos, sin UI real) |
| Backend | NestJS + TypeScript | Pendiente |
| Agent Runtime | Python FastAPI + LangGraph + Pydantic | Pendiente |
| Orchestration | Temporal.io | Pendiente |
| Queue | Redis/BullMQ | Pendiente |
| Database | PostgreSQL + **Drizzle ORM** (Prisma prohibido) | Pendiente |
| Vector DB | **Milvus** (Qdrant prohibido) | Pendiente |
| Secrets | **HashiCorp Vault** (production) | Pendiente |
| IaC | Terraform plan-first | Pendiente |
| K8s Policy | Kyverno | Pendiente |
| Private Mesh | Tailscale | Pendiente |
| Observability | Grafana + Loki + Prometheus + Tempo + OTel | Pendiente |

---

## Comandos

```bash
npm run lint    # TypeScript check
npm run build   # Compile to dist/
npm test        # Run 31 tests (node --test)
```

---

## Docs

- [docs/REALITY_AUDIT.md](docs/REALITY_AUDIT.md) — Estado real vs documentado
- [docs/UNIFIED_RUNTIME_KERNEL.md](docs/UNIFIED_RUNTIME_KERNEL.md) — Unified pipeline

---

## Invariantes

```
Sin tenantId/projectId → bloqueado
Sin policy decision → deny-by-default
Constitutional violation → pipeline bloqueado
Mutación sin approval → bloqueado
Secrets por valor → bloqueado
Providers externos → disabled by default
Terraform apply sin approval/policy/constitution/rollback → bloqueado
Kyverno no activo → production deployment bloqueado
Tailscale no activo → private access bloqueado
Prisma → prohibido
Qdrant → prohibido
```
