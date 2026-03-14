---
name: Tech Debt — Deuda Técnica del Proyecto
description: Inventario completo de deuda técnica, errores TypeScript, duplicación de lógica, logging y archivos innecesarios
type: project
---

# Deuda Técnica — DERMAKOR ACADEMY

---

## 1. Resumen Ejecutivo

**Nivel de deuda técnica: MEDIO**

El proyecto tiene una arquitectura bien pensada, pero acumula deuda técnica en áreas específicas que pueden causar problemas reales en producción. Los problemas más graves son los errores de TypeScript confirmados y la duplicación de guardias de seguridad.

**Áreas más afectadas:**
- TypeScript: 115+ usos de `as any`, 8 errores confirmados en producción
- Seguridad: 2 guardias de admin paralelos que pueden desincronizarse
- Logging: 36 usos de `console.log/error` que saltean el redactor de datos sensibles
- Código muerto: archivos `.bak`, logs de build, imports sin usar

---

## 2. Errores de TypeScript Confirmados

Estos errores existen en `typecheck_errors.txt` y **pueden causar crashes en producción**:

### Error CRÍTICO — `new Date(null)` en panel admin

**Archivo:** `src/app/[locale]/(admin)/admin/orders/page.tsx` (líneas 71, 77)
**Archivo:** `src/app/[locale]/(admin)/admin/users/page.tsx` (líneas 77, 85)

**Qué es el problema:**
```typescript
// Código actual (peligroso):
new Date(order.created_at)  // created_at puede ser null
new Date(user.created_at)   // TypeScript dice: Argument of type 'string | null' is not assignable

// Lo que puede pasar: new Date(null) retorna Invalid Date
// Cualquier operación posterior (formateo, comparación) puede crashear la página
```

**Cómo corregirlo:**
```typescript
// Opción segura:
order.created_at ? new Date(order.created_at) : null
// O con nullish coalescing:
new Date(order.created_at ?? new Date())
```

**Severidad:** ALTA — puede crashear las páginas de órdenes y usuarios del panel admin

---

### Error MEDIO — `lesson.module` posiblemente null

**Archivo:** `src/app/[locale]/(app)/app/academy/[slug]/lessons/[lessonId]/page.tsx` (líneas 18, 23)

**Qué es el problema:**
```typescript
lesson.module.title  // module puede ser null → TypeError en runtime
lesson.module.course.slug  // encadenamiento de nulls
```

**Severidad:** MEDIA — puede crashear la página de una lección

---

### Error BAJO — `variants` tipado como `Json` genérico

**Archivo:** Páginas de producto

**Qué es el problema:** El campo `variants` viene de Supabase como tipo `Json` genérico en lugar de como un array tipado. Cualquier operación `.map()` sobre él requiere un cast.

**Severidad:** BAJA — funciona pero sin seguridad de tipos

---

## 3. Uso Excesivo de `as any`

**Total detectado:** 115 usos en 30 archivos (85 en `.ts`, 30 en `.tsx`)

### ¿Por qué es un problema?

`as any` le dice a TypeScript "ignórame aquí". Cuando el compilador está ciego, los errores que debería detectar en desarrollo llegan como crashes en producción.

### Los 5 Casos Más Problemáticos

**Caso 1: Clientes Supabase para RPCs (patrón recurrente)**

**Archivo:** `src/domains/commerce/actions.ts` (líneas 28, 39, 50, 258, 311)
```typescript
// Problemático:
const { data } = await (supabase as any).rpc('create_order_secure', params)

// Por qué: el compilador no puede verificar que 'create_order_secure' exista
// ni que los parámetros sean correctos
```

**Solución correcta:** Regenerar tipos de Supabase con `supabase gen types typescript`

---

**Caso 2: Toda la lógica de transferencia bancaria**

**Archivo:** `src/domains/commerce/bank-actions.ts` (múltiples líneas)
```typescript
// Casi todo el archivo usa as any
const items = cartItems as any[]
const address = shippingInfo as any
```

**Por qué es grave:** Este archivo maneja la creación de pedidos con dinero real. Sin tipos, un campo malformado puede crear órdenes con datos incorrectos silenciosamente.

---

**Caso 3: Componente AdminCourseEditor con interface `any`**

**Archivo:** `src/domains/admin/components/AdminCourseEditor.tsx` (línea 22)
```typescript
interface AdminCourseEditorProps {
  course: any  // Elimina toda protección de tipos para el componente (524 líneas)
}
```

---

**Caso 4: Invoice Service**

**Archivo:** `src/lib/invoice-service.ts` (15+ usos)
```typescript
// Datos financieros de facturas sin tipar correctamente
const invoice = data as any
invoice.total  // puede ser undefined sin que TypeScript avise
```

---

**Caso 5: Datos de productos en admin**

**Archivo:** `src/domains/admin/product-actions.ts`
```typescript
export async function updateProductDetails(productId: string, data: any) {
  // data se escribe directo a la DB sin validar el tipo de cada campo
  const { ...updateData } = data
  await supabase.from('products').update(updateData)
}
```

**Por qué es grave:** Un campo inesperado en `data` se escribe a la base de datos sin ningún control.

### Causa Raíz

La mayoría de los `as any` existen porque los **tipos generados de Supabase están desactualizados**. Cada vez que se agrega una tabla o columna, hay que regenerar los tipos con:
```bash
supabase gen types typescript --project-id TU_PROJECT_ID > src/types/supabase.ts
```

---

## 4. Duplicación de Lógica

### Problema 1: Dos Guardias de Admin

**Archivos:**
- `src/lib/auth/admin-guard.ts` → función `ensureAdmin()`
- `src/domains/admin/admin-actions.ts` → función `adminCheck()` (líneas 31-40)

**Qué hacen ambas:** Verifican si el usuario actual es admin. Si no lo es, lanzan un error o redirigen.

**Por qué es peligroso:**
```
Si se actualiza ensureAdmin() para agregar logging de auditoría...
→ adminCheck() NO se actualiza
→ 10 acciones en admin-actions.ts quedan sin el nuevo logging
→ Comportamiento inconsistente e invisible
```

**Solución:** Eliminar `adminCheck()` y reemplazar sus 10 usos con `ensureAdmin()`.

---

### Problema 2: Dos Funciones `approveVerification`

Se detectaron dos implementaciones con comportamientos distintos para aprobar verificaciones de usuarios.

**Por qué es peligroso:** Si el admin usa una interfaz que llama a la implementación incorrecta, puede aprobar usuarios sin enviar el email de invitación, o sin actualizar el estado correctamente.

---

## 5. Problemas de Logging

### El proyecto tiene un logger excelente que se ignora en 26 archivos

`src/lib/logger.ts` redacta automáticamente tokens, contraseñas y claves de los logs. Pero en 26 archivos se usa `console.error` / `console.log` directamente.

**Archivos más afectados:**
- `src/domains/admin/admin-actions.ts` — 18 ocurrencias de `console`
- `src/lib/cms-actions.ts` — 8 ocurrencias de `console`

**Por qué importa:**
```typescript
// Con console.error (peligroso):
console.error('Error de auth:', { user, token: 'abc123...' })
// → el token aparece en texto plano en los logs de Vercel

// Con el logger (seguro):
logger.error('Error de auth', { user, token: 'abc123...' })
// → el token aparece como [REDACTED] en los logs
```

---

## 6. Archivos Innecesarios en el Repositorio

### Archivos de backup de código
- `src/domains/admin/product-actions.ts.bak` — copia de respaldo manual
- `src/domains/admin/product-actions.ts.utf8` — versión con conversión de encoding

**Por qué no deben estar en git:** Git ya guarda todo el historial. Los `.bak` confunden — ¿cuál es la versión correcta?

### Archivos de log de build
Encontrados en la raíz del proyecto:
- `build_log.txt`, `build_log_2.txt`, `build_log_final_v2.txt`
- `typecheck_errors.txt`, `typecheck_errors_2.txt`
- `lint_output.txt`
- `import_debug.json`

**Por qué no deben estar en git:** Pueden contener información sobre la estructura interna del sistema. Deben estar en `.gitignore`.

### Import sin usar

**Archivo:** `src/domains/admin/product-actions.ts` (línea 6)
```typescript
import * as fs from 'fs'  // nunca se usa en el archivo
```

**Impacto:** Ninguno en runtime, pero confunde a quien lee el código.

---

## 7. Constantes Hardcodeadas

### URL de admin hardcodeada en HTML de email

**Archivo:** `src/lib/email-service.ts` (línea 177 aproximada)
```typescript
// Problemático:
<a href="https://dermakor-academy.vercel.app/fr/admin/orders">

// La variable APP_URL ya existe en el mismo archivo:
const appUrl = process.env.NEXT_PUBLIC_APP_URL

// Correcto sería:
<a href="${appUrl}/fr/admin/orders">
```

**Impacto:** En producción con dominio final, los links del email apuntan al dominio de Vercel en lugar del dominio definitivo.

---

### Tasa de IVA hardcodeada

**Archivo:** `src/domains/commerce/actions.ts` (línea 431)
```typescript
const tvaRate = 8.1  // Tasa de IVA suiza — sin nombre, sin contexto
```

Esta tasa aparece en 10+ lugares del proyecto. Si cambia (la tasa suiza cambió en 2024 de 7.7% a 8.1%), hay que encontrar y cambiar todos los lugares.

**Solución:** Crear constante nombrada en `src/lib/config.ts`:
```typescript
export const TVA_RATE_STANDARD = 8.1  // IVA estándar suizo desde 2024
```

---

### URL de webhook n8n en código fuente

**Archivo:** `src/domains/auth-verification/actions.ts` (línea 47)
```typescript
const n8nWebhookUrl = "https://jorge2812.app.n8n.cloud/webhook/1c994d86-..."
```

Debe estar en variable de entorno: `process.env.N8N_WEBHOOK_URL`

---

## 8. Componentes Demasiado Grandes

### AdminCourseEditor.tsx — 524 líneas

**Archivo:** `src/domains/admin/components/AdminCourseEditor.tsx`

Hace demasiadas cosas en un solo componente:
- Carga de lecciones del API
- Subida de videos a Supabase Storage
- Subida de PDFs
- Gestión de módulos y su orden
- Formulario de configuración de acceso
- Modal de creación de lección

**Por qué importa:** Cuando algo falla, es difícil encontrar en qué parte del componente está el bug.

**Interfaz duplicada en el mismo archivo:**
```typescript
// Línea 14:
interface InventoryContainerProps { ... }
// Línea 25 — exactamente igual:
interface InventoryContainerProps { ... }
// TypeScript lo permite pero indica código copiado descuidadamente
```

---

## 9. Patrones Anti-Pattern

### Fire-and-Forget en Emails

**Archivos:** `src/domains/commerce/actions.ts` (líneas 401-470), `src/domains/admin/order-actions.ts`

```typescript
// Patrón problemático:
(async () => {
  try {
    await sendOrderConfirmationEmail(order)
  } catch (error) {
    console.error('Email error:', error)  // error silenciado
  }
})()  // sin await — la función principal termina sin esperar al email
```

**Por qué es un problema en Vercel serverless:**
- Las funciones serverless se terminan cuando la respuesta se envía
- Si el email tarda más que la función, se cancela
- El error queda en un `catch` interno sin alertar al sistema de monitoreo

**Solución:** Usar un servicio de cola de emails (Resend, SendGrid) o esperar el resultado.

---

### `listUsers()` para Buscar un Email

**Archivo:** `src/domains/admin/admin-actions.ts` (línea 259)

```typescript
// Problemático — descarga TODOS los usuarios:
const { data: { users } } = await adminClient.auth.admin.listUsers()
const existingUser = users.find(u => u.email === email)

// Correcto — busca solo el usuario necesario:
const { data: user } = await adminClient.auth.admin.getUserByEmail(email)
```

**Por qué no escala:** Con 10,000 usuarios, `listUsers()` descarga 10,000 registros para encontrar uno.

---

## 10. Tabla de Priorización

| Problema | Archivo | Severidad | Esfuerzo | Impacto si no se corrige |
|----------|---------|-----------|----------|--------------------------|
| `new Date(null)` en órdenes/usuarios | orders/page, users/page | CRÍTICA | Bajo (30min) | Crash del panel admin |
| `lesson.module` nullable | lessons/[id]/page | ALTA | Bajo (15min) | Crash en página de lección |
| `deletePricingRule` sin admin | pricing-pro-actions.ts | ALTA | Bajo (5min) | Usuario no-admin borra datos |
| Dos guardias admin (`adminCheck` vs `ensureAdmin`) | admin-actions.ts | ALTA | Medio (2h) | Desincronización de seguridad |
| URL hardcodeada en emails | email-service.ts | ALTA | Bajo (15min) | Links rotos en producción |
| `as any` en bank-actions.ts | bank-actions.ts | MEDIA | Alto (4h) | Pedidos con datos incorrectos |
| 26 archivos con `console` en lugar de logger | varios | MEDIA | Medio (3h) | Datos sensibles en logs |
| Emails fire-and-forget | commerce/actions.ts | MEDIA | Medio (4h) | Emails no enviados en serverless |
| `listUsers()` para buscar email | admin-actions.ts | MEDIA | Bajo (30min) | Lentitud con muchos usuarios |
| Archivos `.bak` y logs en repo | raíz + domains/ | BAJA | Bajo (30min) | Confusión, info expuesta |
| IVA hardcodeado (8.1) | commerce/actions.ts | BAJA | Bajo (1h) | Difícil de actualizar |
| URL n8n en código | auth-verification/actions.ts | MEDIA | Bajo (30min) | Webhook sin autenticación |

---

## 11. Roadmap de Corrección Sugerido

### Semana 1 — Alta severidad, poco esfuerzo

1. **Corregir `new Date(null)`** en pages de órdenes y usuarios (30 min)
   - Archivo: `admin/orders/page.tsx`, `admin/users/page.tsx`
   - Cambio: agregar `?? new Date()` o validar antes de construir la fecha

2. **Agregar `ensureAdmin()` a `deletePricingRule`** (5 min)
   - Archivo: `domains/admin/pricing-pro-actions.ts`
   - Cambio: una línea al inicio de la función

3. **Corregir URL hardcodeada en emails** (15 min)
   - Archivo: `lib/email-service.ts`
   - Cambio: reemplazar URL fija por `${appUrl}/fr/admin/orders`

4. **Corregir `lesson.module` nullable** (15 min)
   - Archivo: lección page
   - Cambio: optional chaining `lesson.module?.title`

5. **Eliminar archivos innecesarios del repo** (30 min)
   - Agregar a `.gitignore`: `*.bak`, `build_log*.txt`, `typecheck_errors*.txt`, `lint_output.txt`

### Sprint 2 — Correcciones de mediano plazo

6. **Unificar los dos guardias admin** — eliminar `adminCheck()` (2h)
7. **Reemplazar `listUsers()` por `getUserByEmail()`** (30 min)
8. **Mover IVA y URL de n8n a constantes/env vars** (1h)
9. **Reemplazar `console` por `logger` en admin-actions.ts y cms-actions.ts** (3h)

### Backlog — Deuda de largo plazo

10. **Regenerar tipos de Supabase** y eliminar `as any` gradualmente
11. **Dividir `AdminCourseEditor.tsx`** en componentes más pequeños
12. **Solucionar emails fire-and-forget** con servicio de cola
