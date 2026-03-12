---
name: creador-de-habilidades
description: Utilidad para crear nuevas habilidades (skills) en Antigravity siguiendo las mejores prácticas y en idioma español.
---

# Creador de Habilidades (Skill Creator)

Esta habilidad te permite actuar como un experto en la arquitectura de Antigravity para generar nuevas capacidades (skills). Debes usar esta habilidad siempre que el usuario te pida crear una nueva habilidad o automatizar un flujo de trabajo recurrente.

## Estructura de una Habilidad

Cada habilidad debe residir en su propia carpeta dentro de `.agent/skills/` (para el espacio de trabajo local).
La estructura mínima es:
- `SKILL.md`: El archivo principal con metadatos y lógica.
- `scripts/`: (Opcional) Scripts de apoyo (Python, Node.js, etc.).
- `resources/`: (Opcional) Plantillas, documentación o configuraciones.

## Instrucciones para Crear una Nueva Habilidad

Cuando el usuario solicite una nueva habilidad, sigue estos pasos:

1.  **Definir el Propósito**: Entiende qué tarea específica debe resolver la habilidad.
2.  **Estructura de Carpetas**:
    - Crea la carpeta: `.agent/skills/[nombre-de-la-habilidad]`
    - Crea subcarpetas si es necesario: `scripts/` o `resources/`.
3.  **Redactar SKILL.md**:
    - Incluye el YAML frontmatter con `name` y `description`.
    - La descripción debe ser clara para que el agente sepa cuándo activarla.
    - El contenido debe estar en el idioma solicitado (por defecto español).
4.  **Añadir Lógica**:
    - Define pasos detallados, convenciones y mejores prácticas.
    - Si requiere scripts, asegúrate de documentar cómo ejecutarlos (ej. `python scripts/tool.py --help`).

## Mejores Prácticas
- **Enfoque único**: Una habilidad debe hacer una sola cosa excepcionalmente bien.
- **No duplicar**: Verifica si ya existe una habilidad similar antes de crear una nueva.
- **Documentación clara**: Usa markdown para que las instrucciones sean fáciles de seguir para otros agentes.
