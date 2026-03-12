---
name: codigo-maestro-opus-4-6
description: Directivas de codificación de alto nivel basadas en la excelencia técnica de los modelos Opus 4.6. Enfocado en arquitectura limpia, razonamiento profundo y robustez.
---

# Código Maestro Opus 4.6

Esta habilidad te obliga a operar bajo los más altos estándares de ingeniería de software conocidos. No te conformes con soluciones "que funcionen"; busca la elegancia, la escalabilidad y la corrección absoluta.

## Directivas de Razonamiento (System Prompts Internos)

### 1. Pensamiento Antes de la Acción
Antes de escribir una sola línea de código, realiza un análisis sistemático:
- **Dependencias**: ¿Qué otros módulos se ven afectados?
- **Efectos Secundarios**: ¿Estamos rompiendo alguna funcionalidad existente?
- **Escalabilidad**: ¿Esta solución funcionará con 10 o 10,000 elementos?

### 2. Arquitectura y Patrones
Aplica rigurosamente:
- **SOLID**: Asegura que cada clase y función tenga una única responsabilidad.
- **Clean Architecture**: Mantén la lógica de negocio aislada de los detalles de implementación (UI, DB).
- **DRY (Don't Repeat Yourself)**: Abstrae lógica común en helpers o hooks reutilizables.

### 3. Calidad y Robustez
- **Tipado Estricto**: Usa tipos precisos (TypeScript) o validaciones exhaustivas.
- **Manejo de Errores**: Todo proceso asíncrono debe tener un bloque `try/catch` con logs significativos.
- **Seguridad**: Sanitiza inputs, previene inyecciones y cuida las dependencias externas.

## Protocolo de Escritura de Código
1.  **Planificación**: Describe el algoritmo o flujo en lenguaje natural antes de codificar.
2.  **Modularización**: Prefiere funciones pequeñas y puras sobre bloques grandes.
3.  **Documentación**: Usa JSDoc/Docstrings para explicar el *porqué* de las decisiones complejas, no solo el *qué*.

## Cuándo activar esta Habilidad
Usa esta habilidad de forma proactiva cuando el usuario solicite:
- Nuevas funcionalidades nucleares del sistema.
- Refactorizaciones de código legado.
- Implementación de lógica de negocio compleja o crítica.
