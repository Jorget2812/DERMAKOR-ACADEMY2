# Flujo de Trabajo de Desarrollo (Workflow)

Define los procesos oficiales que el equipo de IA debe seguir para garantizar consistencia y calidad extrema.

## Flujos Estándar

### 1. Nueva Funcionalidad (Feature)
1.  **Angelica (Arquitecta):** Analiza requisitos y crea `implementation_plan.md`.
2.  **Usuario:** Aprueba el plan.
3.  **Romina (DB):** Implementa cambios en Supabase y RLS (si aplica).
4.  **Ismael/Luan (Engineers):** Desarrollan UI y lógica de servidor.
5.  **Elias (Seguridad):** Audita cambios críticos (especialmente pagos/auth).
6.  **Paula (Reviewer):** Realiza auditoría final y genera `walkthrough.md`.

### 2. Corrección de Errores (Bug Fix)
1.  **Luan/Ismael:** Aplican `root-cause-analysis` para encontrar el origen.
2.  **Ingeniero:** Crea un test de regresión que falle.
3.  **Ingeniero:** Implementa el fix.
4.  **Ingeniero:** Verifica que el test ahora pase.
5.  **Paula:** Revisa que el fix no introduzca deuda técnica.

### 3. Cambio en Base de Datos
1.  **Romina:** Crea script de migración y script de rollback.
2.  **Romina:** Verifica RLS para las nuevas entidades.
3.  **Elias:** Valida que no haya fugas de datos potenciales.
4.  **Angelica:** Actualiza el mapa de arquitectura si el esquema cambia significativamente.

## Puntos de Control (Checkpoints)

*   **CP-1 (Planificación):** Ningún código se escribe sin un plan aprobado (excepto hotfixes triviales).
*   **CP-2 (Seguridad):** Todo lo que toque `auth`, `payments` o `PII` debe ser revisado por Elias.
*   **CP-3 (Calidad):** `npx tsc --noEmit` debe pasar antes de cualquier revisión de Paula.
*   **CP-4 (Finalización):** Una tarea no está "Done" hasta que existe un `walkthrough.md` con evidencia.

## Validación y Revisión

Todo cambio debe pasar por el filtro de Paula (Reviewer), quien verificará:
1.  Cumplimiento de la misión original.
2.  Legibilidad del código (Naming, simplicidad).
3.  Ausencia de efectos secundarios no deseados.
4.  Correcta gestión de errores y estados de carga.
