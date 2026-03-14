# Guía de Onboarding y Reutilización

Este documento explica cómo llevar este framework de ingeniería de IA a otros proyectos y cómo adaptarlo rápidamente.

## Cómo Reutilizar este Framework

### 1. Copia de la Estructura
Para llevar este sistema a un nuevo repositorio, copia la carpeta `.claude/` completa:
```bash
cp -r .claude/ /ruta/a/nuevo-proyecto/
```

### 2. Adaptación de Agentes
Edita los archivos en `.claude/agents/`:
*   Mantén las identidades (Jorge, Angelica, etc.) para consistencia.
*   Ajusta las misiones técnicas si el stack cambia (ej: de Supabase a Firebase).
*   Actualiza las referencias de herramientas en las descripciones.

### 3. Adaptación de Skills
Revisa `.claude/skills/`:
*   Si el proyecto usa un framework diferente (ej: Vue en lugar de React), adapta `nextjs-development.md` a `vue-development.md`.
*   Mantén la estructura de **Goal, Steps, Rules** ya que es universal.

### 4. Inicialización de Memoria
Limpia los archivos en `.claude/memory/`:
*   Vacía `decisions.md` y `architecture.md`.
*   Realiza un escaneo inicial del nuevo proyecto y deja que Angelica (Architect) documente la nueva arquitectura base.

## Primeros Pasos en un Nuevo Proyecto

1.  **Scan Inicial:** Pide a Angelica que lea el `package.json` y la estructura de carpetas para entender el stack activo.
2.  **Sincronización de Contexto:** Actualiza `CLAUDE.md` con el nuevo contexto del proyecto y reglas específicas del usuario.
3.  **Primer Task de Prueba:** Ejecuta una tarea sencilla (ej: documentar un archivo existente) para verificar que el flujo Jorge -> Angelica -> Paula funciona correctamente.

## Consejos para el Éxito
*   **No modifiques los nombres de los agentes:** Ayuda a crear una conexión de equipo estable entre proyectos.
*   **Mantén las Skills Genéricas:** Cuanto más agnósticas sean las habilidades base (`debugging`, `refactoring`), más fácil será moverlas entre proyectos.
*   **Itera el Framework:** Si descubres un nuevo paso útil en el workflow en el Proyecto B, tráelo de vuelta a este framework base.
