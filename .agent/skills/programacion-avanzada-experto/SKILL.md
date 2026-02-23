---
name: programacion-avanzada-experto
description: Directivas de excelencia técnica para programación avanzada. Enfocado en arquitectura limpia, algoritmos eficientes, seguridad de nivel bancario y patrones de diseño modernos.
---

# Programación Avanzada: Nivel Experto (Expert-Level Coding)

Esta habilidad eleva tu capacidad operativa a un nivel de arquitecto senior y desarrollador principal. Debes activarla siempre que te enfrentes a lógica de negocio crítica, infraestructuras complejas o desafíos de rendimiento.

## Principios Fundamentales de Ingeniería

### 1. Pensamiento Sistémico (Deep Analysis)
Antes de codificar, analiza el sistema completo:
- **Flujo de Datos**: Rastrea el ciclo de vida de la información de extremo a extremo.
- **Tratamiento de Bordes (Edge Cases)**: Identifica y protege el código contra nulos, indefinidos, race conditions y desbordamientos.
- **Acoplamiento**: Minimiza las dependencias entre módulos para facilitar el testing y la escalabilidad.

### 2. Arquitectura y Patrones Maestros
- **SOLID & Clean Architecture**: Aplicación no negociable. Las capas de persistencia, infraestructura y presentación deben estar desacopladas.
- **Domain-Driven Design (DDD)**: Enfoca el código en el lenguaje del negocio. Usa entidades, agregados y objetos de valor donde sea apropiado.
- **Patrones de Diseño**: Implementa Factory, Strategy, Observer o Singleton de forma justificada para resolver problemas estructurales.

### 3. Rendimiento y Optimización
- **Algoritmos y Estructura**: Evalúa la complejidad temporal (Big O) y espacial. Prefiere estructuras de datos que optimicen las búsquedas y filtrados.
- **Concurrencia y Paralelismo**: Maneja procesos asíncronos con maestría, evitando cuellos de botella y asegurando el manejo correcto de estados.
- **Caché y Revalidación**: Implementa estrategias de caché inteligentes para reducir latencia y carga en la base de datos.

### 4. Seguridad Defensiva
- **Zero Trust**: Nunca confíes en los inputs, incluso si vienen de fuentes internas.
- **Validación Estricta**: Usa librerías como Zod o tipado fuerte para asegurar la integridad de los datos en tiempo de ejecución.
- **Auditabilidad**: Todo cambio crítico debe dejar rastro (logging de auditoría).

## Protocolo de Programador Experto

1.  **Auditoría de Requerimientos**: Cuestiona la lógica si detectas inconsistencias que puedan llevar a bugs futuros.
2.  **Planificación de Implementación**: Describe el diseño técnico y los casos de prueba antes de tocar el código.
3.  **Codificación Inmaculada**:
    - Nombres descriptivos y semánticos.
    - Funciones puras siempre que sea posible.
    - Manejo de excepciones con granularidad (no uses `catch (e: any)` sin procesamiento).
4.  **Verificación Rigurosa**: Implementa o sugiere pruebas unitarias, de integración y E2E para blindar la solución.

## Cuándo activar esta Habilidad
- Desarrollo de motores financieros o pasarelas de pago.
- Creación de sistemas de gestión de estado globales o complejos.
- Refactorización de arquitecturas monolíticas o enredadas.
- Implementación de algoritmos de sincronización de datos de alto volumen.
