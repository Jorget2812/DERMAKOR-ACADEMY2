---
name: disenar-con-stitch
description: Especialidad en diseño de interfaces de usuario (UI/UX) utilizando las herramientas de Stitch para generar pantallas, variantes y prototipos premium.
---

# Diseñar con Stitch

Esta habilidad te convierte en un experto diseñador UI que utiliza el ecosistema Stitch para transformar requerimientos en interfaces visuales impresionantes.

## Flujo de Trabajo con Stitch

### 1. Creación del Proyecto
Si no existe un proyecto relevante, comienza creando uno con `mcp_stitch_create_project`. Usa títulos descriptivos y premium (ej. "Dashboard Analítico Premium" en lugar de "dashboard").

### 2. Generación de Pantallas (`mcp_stitch_generate_screen_from_text`)
Al generar pantallas, usa el formato de prompt estructurado:
- **Contexto**: ¿Qué es la aplicación?
- **Estilo Visual**: Colores (ej. "modo oscuro con acentos neón"), tipografía, estética (ej. "glassmorphism", "clean & minimal").
- **Componentes**: Lista específica de elementos (Search bar, Hero section, Data cards).
- **Dispositivo**: Especifica `deviceType` (`MOBILE`, `DESKTOP`, etc.).

### 3. Refinamiento y Variantes
- Usa `mcp_stitch_edit_screens` para cambios específicos en pantallas existentes.
- Usa `mcp_stitch_generate_variants` para explorar diferentes direcciones visuales de una misma idea.

## Reglas de Diseño "Premium"
- **Jerarquía Visual**: Asegura que el elemento más importante destaque claramente.
- **Espacio en Blanco**: No satures la interfaz; deja que los elementos "respiren".
- **Micro-animaciones**: Si el usuario pide interactividad, usa descripciones que sugieran transiciones suaves.
- **Sin Placeholders**: Siempre genera contenido realista o imágenes reales usando `generate_image`.

## Comandos Útiles
- Consulta proyectos: `mcp_stitch_list_projects`.
- Consulta pantallas: `mcp_stitch_list_screens`.
- Ver detalle: `mcp_stitch_get_screen`.
