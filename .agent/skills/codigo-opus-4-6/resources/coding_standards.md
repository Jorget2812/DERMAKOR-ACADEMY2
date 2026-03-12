# Estándares de Calidad Opus 4.6

Este documento sirve como referencia rápida para mantener la excelencia técnica en el desarrollo.

## 1. Nombramiento y Semántica
- Las variables y funciones deben ser autodescriptivas.
- Evita abreviaturas crípticas (ej. `usr` -> `user`, `calcT` -> `calculateTotalPrice`).
- Sigue las convenciones del lenguaje (CamelCase en JS, snake_case en Python).

## 2. Lógica y Estructura
- **Complejidad Ciclomática**: Mantén las funciones simples (máximo 15-20 líneas preferiblemente).
- **Inmutabilidad**: Prefiere métodos que no muten el estado original (ej. `map`, `filter`, `reduce` en lugar de `forEach` con mutaciones).
- **Composición vs Herencia**: Prefiere la composición para reutilizar lógica.

## 3. Comentarios y Documentación
- Los comentarios deben explicar la **intención**.
- Evita comentarios obvios (ej. `// Incrementa i` encima de `i++`).
- Documenta los "edge cases" manejados en la función.

## 4. Pruebas y Validación
- El código Opus 4.6 debe ser fácilmente testable.
- Inyecta dependencias para facilitar el mocking.
- Considera el rendimiento (complejidad O(n)) en algoritmos críticos.
