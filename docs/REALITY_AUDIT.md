# Reality Audit — TST Autonomous Repository

> Invariante: Arquitectura no comprobada no se declara implementada.

## Estado verificado al: 2026-05-24

---

## Ramas existentes

| Rama | Estado | Descripción |
|---|---|---|
| `main` | Vacía | Solo `.gitkeep` — punto de origen limpio |
| `codex/refactor-tst-autonomous-repo-navigator-canvas` | Fases 1-3 | Implementación original por TST Autonomus |
| `claude/tst-studio-ia-projects-XdEpt` | Activa | Rama de desarrollo actual (Fase 26.7-R) |

---

## Archivos y dominios reales (post Fase 26.7-R)

### Dominios implementados con lógica real

| Dominio | Archivos | Estado |
|---|---|---|
| `domain/repo` | `types.ts` | Completo — tipos de RepoNode |
| `domain/trace` | `types.ts`, `event-bus.ts` | Completo — 65 trace event types |
| `domain/governance` | `state-machine.ts`, `types.ts`, + 10 módulos | Completo — stubs reemplazados con lógica real |
| `domain/agent` | `commands.ts` | Completo — 8 comandos gobernados |
| `domain/graph` | `canvas-controller.ts` | Completo |
| `domain/validation` | `ui-validation.ts` | Completo |
| `domain/policy-runtime` | `types.ts`, `engine.ts` | Nuevo — evaluador de políticas funcional |
| `domain/constitutional-runtime` | `types.ts`, `engine.ts` | Nuevo — 6 invariantes constitucionales |
| `domain/event-sourcing` | `types.ts`, `engine.ts` | Nuevo — ledger append-only con hash chain |
| `domain/knowledge-graph` | `types.ts`, `engine.ts` | Nuevo — grafo de conocimiento tipado |
| `domain/mcp-fabric` | `types.ts`, `engine.ts` | Nuevo — registry + invocation receipts |
| `domain/controlled-apply` | `types.ts`, `engine.ts` | Nuevo — apply sessions + receipts |
| `domain/reality-bridge` | `types.ts`, `engine.ts` | Nuevo — permits + boundary validation |
| `domain/stack-definition` | `types.ts` | Nuevo — stack canónico completo |
| `domain/operator-experience` | `types.ts`, `engine.ts` | Nuevo — health + summaries |
| `domain/unified-runtime-kernel` | `types.ts`, `engine.ts` | Nuevo — pipeline gobernado unificado |
| `domain/external-integration` | `types.ts`, `registry.ts`, 12 providers | Nuevo — todos disabled by default |

### Infraestructura de app

| Módulo | Estado |
|---|---|
| `app/store.ts` | Completo — 7 slices |
| `app/selectors.ts` | Completo |
| `components/canvas/RepoCanvas.tsx` | Funcional (render texto) |
| `components/editor/NodeEditor.tsx` | Funcional (render texto) |

---

## Tests

**31 tests — 31/31 pasan.**

| Categoría | Tests |
|---|---|
| Comandos gobernados originales | 7 |
| Governance stubs (semantic firewall, validation gate, cognitive, loop, evolution) | 6 |
| Policy Runtime | 1 |
| Constitutional Runtime | 2 |
| Unified Runtime Kernel | 5 |
| External Integration | 7 |
| Event Sourcing / Ledger | 1 |
| Stack validation | 1 |
| Trace timeline | 1 |

---

## Lo que NO existe (honestamente)

| Componente | Estado | Notas |
|---|---|---|
| Backend NestJS | No existe | Definido en stack canónico, no implementado |
| Python FastAPI + LangGraph | No existe | Pendiente — agent runtime real |
| Temporal.io | No existe | Pendiente — workflow orchestration |
| PostgreSQL + Drizzle | No existe | DrizzleProvider es un adapter stub |
| Milvus | No existe | MilvusProvider es un adapter stub |
| MinIO / S3 | No existe | No iniciado |
| Kubernetes / K3s | No existe | KubernetesProvider es un adapter stub |
| HashiCorp Vault | No existe | VaultProvider es un adapter stub |
| Terraform | No existe | TerraformProvider es un adapter stub |
| Tailscale | No existe | TailscaleProvider es un adapter stub |
| Kyverno | No existe | KyvernoProvider es un adapter stub |
| CI/CD (GitHub Actions) | No existe | No hay `.github/workflows/` |
| Grafana + Loki + Prometheus | No existe | Observabilidad pendiente |
| Auth (Clerk/Auth0) | No existe | No iniciado |
| UI React real | No existe | Componentes actuales son renderizado texto |
| Real repo read/write | No existe | Providers deshabilitados por defecto |

---

## Governance modules — estado pre/post Fase 26.7-R

| Módulo | Antes | Después |
|---|---|---|
| `semantic-firewall.ts` | `export const moduleStatus` (stub) | Firewall real con reglas, contexto y evaluación |
| `validation-gate.ts` | stub | GateCheck real, state transition gate |
| `trace-spine.ts` | stub | TraceSpine con subscribers y filtros |
| `cognitive-interpretation.ts` | stub | Intent classification real (7 categorías) |
| `context-flywheel.ts` | stub | ContextBundle real desde AppState |
| `human-loop.ts` | stub | HumanLoopSession + resolución + expiración |
| `l8-governance.ts` | stub | L8Route matrix con 5 rutas y criterios |
| `loop-prevention.ts` | stub | Detección de patrones repetitivos |
| `markov-engine.ts` | stub | Route scoring con retry discount |
| `evolution.ts` | stub | EvolutionReadiness con score y blockers |

---

## Correcciones estructurales aplicadas

- `zustand` movido de `devDependencies` a `dependencies`
- 33 trace event types nuevos agregados (total: 65)
- `ProviderStatus` incluye `"enabled"` (faltaba en definición original)

---

## Próximos pasos reales (orden de dependencias)

1. **Backend NestJS mínimo** — health endpoint, tenant context, auth middleware
2. **PostgreSQL + Drizzle** — schema mínimo (tenants, projects, events ledger)
3. **CI/CD** — GitHub Actions: build + lint + test en cada PR
4. **Clerk/Auth0** — autenticación real antes de exponer cualquier endpoint
5. **Habilitar providers con governance** — primero LocalFS en modo read-only
6. **UI React real** — integrar Zustand store con componentes React reales
7. **Fase 27 completa** — cuando backend + DB + auth estén activos
