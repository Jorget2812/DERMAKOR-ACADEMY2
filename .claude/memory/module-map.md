---
name: Module Map — Mapa de Módulos y Responsabilidades
description: Lista de módulos principales, responsabilidades de cada carpeta y dependencias entre módulos
type: project
---

# Mapa de Módulos — DERMAKOR ACADEMY

## Tabla General de Módulos

| Carpeta | Tipo | Responsabilidad |
|---------|------|-----------------|
| `src/app/` | Rutas Next.js | Páginas, layouts, API routes — lo que el usuario ve |
| `src/domains/commerce/` | Dominio | Tienda, carrito, checkout, pedidos, Stripe |
| `src/domains/admin/` | Dominio | Panel de administración — toda la gestión |
| `src/domains/academy/` | Dominio | Cursos, lecciones, progreso del estudiante |
| `src/domains/auth/` | Dominio | Login y logout |
| `src/domains/auth-verification/` | Dominio | Solicitud y aprobación de profesionales |
| `src/lib/supabase/` | Utilidad | Clientes de Supabase (browser, server, admin) |
| `src/lib/auth/` | Utilidad | Guardia de admin (`ensureAdmin`) |
| `src/lib/email-service.ts` | Utilidad | Envío de emails transaccionales |
| `src/lib/rate-limit.ts` | Utilidad | Limitador de requests con Redis |
| `src/lib/crypto.ts` | Utilidad | Hash de tokens con SHA-256 |
| `src/lib/logger.ts` | Utilidad | Logger estructurado con redacción de datos sensibles |
| `src/lib/config.ts` | Utilidad | Validación de variables de entorno |
| `src/lib/invoice-service.ts` | Utilidad | Generación de facturas PDF |
| `src/components/` | UI | Componentes React reutilizables compartidos |
| `src/i18n/` + `src/messages/` | i18n | Internacionalización FR/IT/DE |

---

## `src/domains/` — En Detalle

### `domains/commerce/` — Tienda y Pedidos

**Archivos principales:**
- `actions.ts` — Server Actions principales de la tienda
- `bank-actions.ts` — Acciones para pagos por transferencia bancaria
- `store.ts` — Estado del carrito (Zustand + localStorage, solo cliente)
- `shipping-actions.ts` — Cálculo y gestión de tarifas de envío
- `cancel-order-action.ts` — Cancelación de pedidos
- `invoice-actions.ts` — Descarga de facturas
- `types.ts` — Tipos TypeScript: `CartItem`, `PublicProduct`, `VerifiedProduct`, `OrderInput`

**Server Actions exportadas:**
```
listProductsPublic()        → Productos sin precios (visitantes)
listProductsVerified()      → Productos CON precios (usuarios aprobados)
getProductBySlug()          → Detalle de un producto
createCheckoutSession()     → Inicia pago con Stripe
createBankTransferOrder()   → Crea pedido por transferencia
getUserOrders()             → Historial de pedidos del usuario
getOrderById()              → Detalle de un pedido
cancelOrder()               → Cancela un pedido
getShippingRates()          → Tarifas de envío disponibles
downloadInvoice()           → Descarga factura PDF
```

**Quién lo usa:**
- Páginas: `(public)/shop/`, `(app)/shop/`, `(app)/checkout/`, `(app)/orders/`
- Componentes: carrito, formulario de checkout, lista de pedidos

---

### `domains/admin/` — Panel Administrativo

**Archivos principales:**
- `admin-actions.ts` — Acciones generales de admin (usuarios, verificaciones)
- `product-actions.ts` — CRUD de productos y variantes
- `order-actions.ts` — Gestión de estado de pedidos
- `verification-actions.ts` — Aprobar/rechazar solicitudes profesionales
- `academy-actions.ts` — Crear y editar cursos y lecciones
- `discount-actions.ts` — Configurar descuentos por mes y nivel
- `pricing-pro-actions.ts` — Reglas de precios para profesionales
- `cms-actions.ts` — Editor de contenido de páginas públicas
- `nav-actions.ts` — Editor de navegación del sitio
- `notification-actions.ts` — Contadores de badges en sidebar admin
- `settings-actions.ts` — Configuración de pagos y facturación
- `components/` — Componentes de UI del panel admin

**Quién lo usa:**
- Exclusivamente las páginas `(admin)/admin/*`

---

### `domains/academy/` — Academia de Cursos

**Archivo principal:** `actions.ts`

**Server Actions exportadas:**
```
listCourses()          → Lista cursos disponibles según nivel del usuario
getCourse()            → Detalle de un curso con sus módulos
getLesson()            → Contenido de una lección (video, PDF, texto)
updateProgress()       → Marca una lección como completada
getResourceUrl()       → URL firmada para descargar recursos protegidos
```

**⚠️ Nota importante:** Usa `createAdminClient()` (bypasea RLS). La lógica de acceso está en la función `canAccess()` en JavaScript, no en la base de datos.

**Quién lo usa:**
- Páginas: `(app)/app/academy/`, `(app)/app/academy/[slug]/`, `(app)/app/academy/[slug]/lessons/[lessonId]/`

---

### `domains/auth/` — Autenticación

**Archivo principal:** `auth-actions.ts`

**Server Actions exportadas:**
```
login(email, password)  → Inicia sesión con Supabase Auth
logout()                → Cierra sesión y limpia cookies
```

**Quién lo usa:** Página `(public)/login/`

---

### `domains/auth-verification/` — Verificación Profesional

**Archivo principal:** `actions.ts`

**Server Actions exportadas:**
```
submitVerification(data)    → Usuario envía solicitud de verificación profesional
                              También llama al webhook de n8n
adminApproveUser(userId)    → Admin aprueba solicitud y envía invitación por email
```

**Quién lo usa:**
- `(public)/pro/` — formulario de registro profesional
- `(admin)/admin/verifications/` — gestión de solicitudes

---

## `src/lib/` — Utilidades Compartidas

| Archivo | Función |
|---------|---------|
| `supabase/client.ts` | Cliente Supabase para componentes browser |
| `supabase/server.ts` | Cliente Supabase para Server Actions (con cookies) |
| `supabase/admin.ts` | Cliente Supabase admin (SERVICE_ROLE — bypasea RLS) |
| `supabase/middleware.ts` | Lógica de protección de rutas en el middleware |
| `auth/admin-guard.ts` | `ensureAdmin()` — lanza error si el usuario no es admin |
| `email-service.ts` | Envía emails con Nodemailer + Hostinger SMTP |
| `rate-limit.ts` | Rate limiting con Upstash Redis |
| `crypto.ts` | `hashToken()` — hash SHA-256 para tokens de invitación |
| `logger.ts` | Logger estructurado con redacción de datos sensibles |
| `config.ts` | Valida variables de entorno al iniciar el servidor |
| `invoice-service.ts` | Genera PDFs de facturas |

---

## Árbol de Rutas — `src/app/`

```
src/app/
├── [locale]/                    → Prefijo de idioma (fr, it, de)
│   │
│   ├── (public)/                → Sin autenticación
│   │   ├── layout.tsx           → Header público + Footer
│   │   ├── page.tsx             → Homepage
│   │   ├── shop/
│   │   │   ├── page.tsx         → Lista de productos (sin precios)
│   │   │   ├── [slug]/page.tsx  → Detalle de producto
│   │   │   └── category/[slug]/page.tsx
│   │   ├── pro/page.tsx         → Registro profesional
│   │   ├── login/page.tsx
│   │   ├── academy-info/page.tsx
│   │   ├── about/, faq/, contact/, cgv/, confidentialite/
│   │   └── [...slug]/page.tsx   → CMS dinámico
│   │
│   ├── (app)/                   → Usuarios aprobados
│   │   ├── layout.tsx           → Verifica sesión + estado APPROVED
│   │   ├── pending/page.tsx     → Espera de aprobación
│   │   └── app/
│   │       ├── page.tsx         → Dashboard usuario
│   │       ├── shop/
│   │       │   ├── page.tsx     → Tienda CON precios
│   │       │   └── [slug]/page.tsx
│   │       ├── checkout/page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   ├── [id]/page.tsx
│   │       │   └── success/page.tsx
│   │       └── academy/
│   │           ├── page.tsx
│   │           └── [slug]/
│   │               ├── page.tsx
│   │               └── lessons/[lessonId]/page.tsx
│   │
│   ├── (admin)/                 → Solo administradores
│   │   ├── layout.tsx           → Llama ensureAdmin()
│   │   └── admin/
│   │       ├── page.tsx         → Dashboard admin
│   │       ├── orders/
│   │       ├── products/
│   │       ├── users/
│   │       ├── verifications/
│   │       ├── academy/
│   │       ├── analytics/
│   │       ├── discounts/
│   │       ├── shipping/
│   │       ├── pricing-pro/
│   │       ├── settings/
│   │       ├── pages/
│   │       └── navigation/
│   │
│   └── auth/set-password/       → Crear contraseña tras invitación
│
└── api/
    ├── health/route.ts          → Health check del sistema
    ├── auth/
    │   ├── callback/route.ts    → Intercambio de código PKCE (OAuth)
    │   └── set-password/route.ts
    └── webhooks/
        └── stripe/route.ts      → Recibe eventos de pago de Stripe
```

---

## Dependencias Entre Módulos

```
domains/commerce/
  ├── depende de → lib/supabase/server (cliente DB)
  ├── depende de → lib/supabase/admin (webhook, admin client)
  ├── depende de → lib/email-service (emails de confirmación)
  ├── depende de → lib/rate-limit (protección endpoints)
  └── depende de → lib/logger (logging)

domains/admin/
  ├── depende de → lib/auth/admin-guard (ensureAdmin)
  ├── depende de → lib/supabase/admin (acceso total a DB)
  ├── depende de → lib/email-service (emails admin)
  └── depende de → lib/invoice-service (generar facturas)

domains/academy/
  ├── depende de → lib/supabase/admin (bypasea RLS — ⚠️ ver security-model.md)
  └── depende de → lib/supabase/server (sesión del usuario)

domains/auth/
  └── depende de → lib/supabase/server (login/logout con cookies)

domains/auth-verification/
  ├── depende de → lib/supabase/admin (crear usuario, enviar invitación)
  ├── depende de → lib/email-service (email de invitación)
  └── depende de → lib/crypto (hashToken para tokens de invitación)

app/api/webhooks/stripe/
  ├── depende de → lib/supabase/admin (mark_order_paid, decrement_stock)
  ├── depende de → lib/rate-limit (protección webhook)
  └── depende de → lib/logger (logging estructurado)
```

---

## Los 10 Archivos Más Críticos

| Prioridad | Archivo | Por qué es crítico |
|-----------|---------|-------------------|
| 1 | `src/lib/supabase/middleware.ts` | Protege TODAS las rutas de la app |
| 2 | `src/lib/auth/admin-guard.ts` | `ensureAdmin()` — protege el panel admin |
| 3 | `src/domains/commerce/actions.ts` | Lógica de compra y checkout con Stripe |
| 4 | `src/app/api/webhooks/stripe/route.ts` | Procesa pagos — dinero real |
| 5 | `src/domains/academy/actions.ts` | Acceso a contenido premium |
| 6 | `src/lib/config.ts` | Valida variables de entorno al arrancar |
| 7 | `src/domains/auth-verification/actions.ts` | Aprobación de profesionales |
| 8 | `src/lib/email-service.ts` | Todos los emails transaccionales |
| 9 | `src/lib/rate-limit.ts` | Protección contra abuso |
| 10 | `db_schema.sql` | Esquema completo de la base de datos |
