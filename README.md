# TST Autonomous / repo-navigator-canvas

## Plan por fases

### Fase 1: Arquitectura base (prioridad absoluta)
1. Definir estructura de carpetas modular en `src/`.
2. Crear tipos de dominio estrictos (sin `any`) para nodos, trazas, validaciones, gobernanza y state machine.
3. Implementar store con Zustand por slices (`repo`, `graph`, `editor`, `agent`, `trace`, `governance`, `uiValidation`).
4. Implementar selectores puros.

### Fase 2: Navegación operacional del repo
1. Construir canvas navegable (pan/zoom, búsqueda, selección, filtros por capa).
2. Habilitar navegación por dependencias.
3. Mostrar nodos operacionales con metadata (risk/confidence/cost, estado, validaciones, trace-events).

### Fase 3: Node editor dual-tab
1. Tab `CÓDIGO (Editor principal)` con preview, lenguaje y numeración de líneas.
2. Tab `Descripción y Registro` con descripción, responsabilidades, dependencias, notas de arquitectura, trazas y changelog.
3. Header con path real, lenguaje y tipo de artefacto.

### Fase 4: Trace Spine + command pipeline
1. Implementar Trace Event Bus tipado y obligatorio para acciones.
2. Implementar pipeline de comandos de agente con `validate`, `preview`, `expectedTraceEvents`, `apply`, `rollbackPlan`, `requiredApprovalLevel`.
3. Garantizar transiciones de estado válidas por state machine.

### Fase 5: AI Interface Validation Loop
1. Implementar validación de UI previa a aprobación humana.
2. Emitir `ui_validation_failed` ante fallas y aplicar retry budget.
3. Escalar cuando se excede el presupuesto.

### Fase 6: Tests + documentación de extensión
1. Unit tests para selectores, comandos, transiciones y trace bus.
2. Documentar extensión: nuevos nodos, capas, acciones, trace-events e integración futura con API/repo real.

## Prioridad absoluta
Primero arquitectura, estado, tipos y navegación real del repo.
Segundo editor de nodo con Código / Descripción y Registro.
Tercero Trace Spine y validación.
Cuarto estética HUD.

No sacrificar gobernanza por visuales.
No sacrificar trazabilidad por velocidad.
No sacrificar producto por demo.
