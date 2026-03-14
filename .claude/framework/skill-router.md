# Enrutador de Habilidades (Skill Router)

Este documento define qué habilidades y agentes deben utilizarse según el tipo de tarea técnica.

## Matriz de Enrutamiento

| Tipo de Tarea | Agente Recomendado | Habilidades Clave | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **Investigación de Bugs** | Luan (Backend) o Ismael (Frontend) | `root-cause-analysis`, `debugging` | Reporte de causa raíz y fix verificado. |
| **Nueva Funcionalidad** | Angelica (Arquitecta) | `architecture-analysis`, `api-design-expert` | Plan de implementación aprobado. |
| **Revisión de Arquitectura** | Angelica (Arquitecta) | `architecture-analysis`, `modular-design-enforcer` | Diagramas y validación de patrones. |
| **Auditoría de Seguridad** | Elias (Seguridad) | `security-analysis`, `supabase-security` | Reporte de riesgos y mitigaciones. |
| **Migración de DB** | Romina (DB Engineer) | `database-migration-guard`, `supabase-security` | Scripts de migración y rollback seguros. |
| **Refactorización** | Paula (Reviewer) o Angelica | `refactoring`, `code-readability-auditor` | Código limpio sin cambios de comportamiento. |
| **Optimización Perf.** | Ismael (Frontend) o Luan | `performance`, `code-optimization` | Mejora medible en Core Web Vitals o latencia. |
| **Generación de Tests** | Ismael o Luan | `testing`, `edge-case-stress-tester` | Suite de tests automatizados (E2E/Unit). |
| **Documentación Técnica** | Jorge (Manager) | `technical-documentation`, `mermaid` | Guías y diagramas actualizados. |

## Ejemplos de Enrutamiento Práctico

### Caso 1: "El pago con Stripe falla aleatoriamente"
*   **Agente:** Luan (Backend Engineer).
*   **Skill:** `root-cause-analysis`.
*   **Proceso:** Analizar logs de webhooks, identificar fallos de firma o timeout, proponer fix.

### Caso 2: "Añadir un nuevo módulo de cursos"
*   **Agente:** Angelica (Architect).
*   **Skill:** `architecture-analysis`.
*   **Proceso:** Mapear el nuevo dominio, definir tipos en Supabase, planificar Server Actions.

### Caso 3: "Hacer que el dashboard cargue en menos de 1s"
*   **Agente:** Ismael (Frontend Engineer).
*   **Skill:** `performance`.
*   **Proceso:** Analizar hidratación, optimizar imágenes, implementar streaming con Suspense.

### Caso 4: "Proteger la tabla de pedidos para que solo el dueño la vea"
*   **Agente:** Romina (DB Engineer).
*   **Skill:** `supabase-security`.
*   **Proceso:** Escribir política RLS usando `auth.uid()`, verificar acceso denegado a otros usuarios.
