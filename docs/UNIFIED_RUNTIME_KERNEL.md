# Unified Runtime Kernel — Fase 26.7-R

## Propósito

El `UnifiedRuntimeKernel` es el único punto de entrada para toda ejecución gobernada en TST Autonomous. Elimina pipelines duplicados y establece una ruta canónica de ejecución que no puede ser bypasseada.

## Ruta obligatoria

```
Human Goal
→ Scope Guard (tenantId + projectId requeridos)
→ Cognitive Interpretation
→ Policy Evaluation (deny-by-default)
→ Constitutional Evaluation (6 invariantes)
→ Execution Preview
→ Approval Verification (obligatorio para mutaciones)
→ Controlled Execution
→ Trace Recording
→ Operator Summary
```

## Invariantes de seguridad

| Invariante | Comportamiento |
|---|---|
| Sin tenantId/projectId | Pipeline bloqueado en stage 1 |
| Policy deny | Pipeline bloqueado en stage 3, emite `policy_denied` |
| Constitutional violation | Pipeline bloqueado en stage 4, emite `constitutional_violation_detected` |
| Mutación sin approval | Pipeline bloqueado en stage 6 |
| Toda ejecución | Emite `RuntimeExecutionReceipt` con hash |

## Modelos clave

- `RuntimeExecutionRequest` — entrada obligatoria con tenantId, projectId, action, isMutating
- `RuntimeExecutionPlan` — plan generado automáticamente con todos los stages
- `RuntimeExecutionReceipt` — recibo inmutable con hash verificable y trace events emitidos
- `RuntimeExecutionContext` — estado transversal durante la ejecución

## Stages

| Stage | Descripción |
|---|---|
| `human_goal_received` | Validación de scope (tenant + project) |
| `cognitive_interpretation` | Interpretación de la acción |
| `policy_evaluation` | Evaluación de política (deny-by-default) |
| `constitutional_evaluation` | Verificación de invariantes constitucionales |
| `execution_preview` | Preview de la ejecución |
| `approval_verification` | Verificación de aprobación humana (si mutación) |
| `controlled_execution` | Ejecución controlada |
| `trace_recording` | Registro de trace events |
| `operator_summary` | Resumen para el operador |

## Uso

```typescript
import { createRuntimeExecutionRequest, executeUnifiedPipeline } from "./engine.js";

const request = createRuntimeExecutionRequest(
  "my-tenant",
  "my-project",
  "create a new service node",
  "create_node",
  { nodeId: "svc-auth" },
  true,           // isMutating
  "delete the node if apply fails"  // rollbackPlan
);

const { state, receipt, context } = executeUnifiedPipeline(appState, request, {
  approvalPackageId: "pkg-123"  // requerido para mutaciones
});

// receipt.finalStatus: "completed" | "blocked" | "aborted" | "failed"
// receipt.receiptHash: hash verificable
// receipt.emittedTraceEventTypes: eventos emitidos durante el pipeline
```

## Restricciones

- **Nunca bypass de policy**: el pipeline siempre evalúa política antes de ejecutar
- **Nunca bypass de constitución**: la constitución bloquea antes que cualquier ejecución
- **Deny-by-default**: sin política explícita allow, toda acción es denegada
- **Mutaciones requieren aprobación**: `isMutating: true` sin `approvalPackageId` → bloqueado
