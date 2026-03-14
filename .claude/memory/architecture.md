---
name: Architecture — Arquitectura del Sistema
description: Arquitectura completa del proyecto DERMAKOR ACADEMY incluyendo stack, componentes, flujos y decisiones técnicas
type: project
---

# Arquitectura del Sistema — DERMAKOR ACADEMY

## ¿Qué hace este proyecto?

DERMAKOR ACADEMY es una plataforma B2B para profesionales de la estética y dermatología. Tiene tres partes principales:
1. **Tienda online** con precios diferenciados según el nivel del profesional
2. **Academia de cursos** con acceso por niveles
3. **Panel de administración** para gestionar todo el sistema

---

## Stack Tecnológico

| Tecnología | Versión | Para qué sirve |
|-----------|---------|----------------|
| Next.js | 16 (App Router) | Framework principal — páginas, rutas, server actions |
| React | 19 | Componentes de interfaz de usuario |
| TypeScript | 5 | Tipado del código para detectar errores antes de producción |
| Supabase | — | Base de datos PostgreSQL + Autenticación + Storage |
| PostgreSQL | — | Base de datos relacional con RLS (seguridad por fila) |
| Stripe | — | Procesamiento de pagos con tarjeta |
| Tailwind CSS | — | Estilos de la interfaz |
| Shadcn UI + Radix UI | — | Componentes de UI accesibles y estilizados |
| Upstash Redis | — | Rate limiting (limitar requests por IP) |
| Nodemailer + Hostinger SMTP | — | Envío de emails transaccionales |
| n8n | — | Automatización de flujos (notificaciones de verificación) |
| Sentry | — | Monitoreo de errores en producción |
| next-intl | — | Internacionalización (FR, IT, DE) |

---

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR DEL USUARIO                    │
│                                                                  │
│   Visitante público    Profesional aprobado      Administrador  │
│   /fr/(public)/         /fr/(app)/               /fr/(admin)/   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  NEXT.JS MIDDLEWARE  │
                    │  (middleware.ts)     │
                    │  • Verifica sesión  │
                    │  • Verifica is_admin│
                    │  • Redirige si falla│
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────▼──────┐  ┌──────────▼────────┐  ┌──────▼──────────┐
│ Server Components│  │  Server Actions   │  │   API Routes    │
│ (layouts, pages) │  │  (domains/)       │  │   (app/api/)    │
│                  │  │                   │  │                  │
│ Renderizan HTML  │  │ Lógica de negocio │  │ /webhooks/stripe│
│ en el servidor   │  │ sin exponer al    │  │ /auth/callback  │
│                  │  │ cliente           │  │ /health         │
└─────────┬────────┘  └──────────┬────────┘  └──────┬──────────┘
          │                      │                   │
          └──────────────────────┼───────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       SUPABASE           │
                    │                          │
                    │  PostgreSQL (datos)      │
                    │  Auth (sesiones)         │
                    │  Storage (facturas PDF)  │
                    │  RPCs (lógica en DB)     │
                    └──────────────────────────┘

Servicios externos:
  Stripe <-> Webhooks         Nodemailer -> Hostinger SMTP
  Upstash Redis (rate limit)  Sentry (errores)   n8n (automatización)
```

---

## Estructura de Carpetas `src/`

```
src/
├── app/           → Rutas y páginas (Next.js App Router)
│                    Cada carpeta = una URL del sitio
│
├── components/    → Componentes React reutilizables
│                    Piezas de UI que se usan en múltiples páginas
│
├── domains/       → Lógica de negocio por tema
│                    El corazón del sistema — aquí viven las Server Actions
│
├── lib/           → Herramientas compartidas
│                    Supabase, email, rate limit, logger, crypto...
│
├── i18n/          → Configuración de idiomas
│                    Rutas de traducción con next-intl
│
└── messages/      → Textos traducidos
                     fr.json, it.json, de.json
```

---

## Los 3 Tipos de Clientes Supabase

Este es uno de los conceptos más importantes del proyecto:

```
src/lib/supabase/

  client.ts     → CLIENTE BROWSER
  ┌────────────────────────────────────────────────────────┐
  │ Usado en: componentes del cliente ('use client')       │
  │ Permisos: los del usuario autenticado + RLS activo     │
  │ Clave: NEXT_PUBLIC_SUPABASE_ANON_KEY (pública)        │
  └────────────────────────────────────────────────────────┘

  server.ts     → CLIENTE SERVIDOR
  ┌────────────────────────────────────────────────────────┐
  │ Usado en: Server Actions, layouts, páginas servidor    │
  │ Permisos: los del usuario autenticado + RLS activo     │
  │ Lee cookies para identificar al usuario                │
  └────────────────────────────────────────────────────────┘

  admin.ts      → CLIENTE ADMIN (SERVICE ROLE)
  ┌────────────────────────────────────────────────────────┐
  │ Usado en: webhooks, acciones de admin, academia        │
  │ Permisos: TODOS — bypasea RLS completamente            │
  │ Clave: SUPABASE_SERVICE_ROLE_KEY (secreta, solo server)│
  │ *** NUNCA usar en el cliente/browser ***               │
  └────────────────────────────────────────────────────────┘
```

---

## Servicios Externos

### Stripe — Pagos con Tarjeta
- **Flujo**: usuario → `createCheckoutSession()` → orden en DB → sesión Stripe → webhook → `mark_order_paid()`
- **Seguridad**: firma HMAC verificada, idempotencia con tabla `stripe_events`
- **Archivo principal**: `src/app/api/webhooks/stripe/route.ts`

### Nodemailer + Hostinger SMTP — Emails
- **3 tipos de email**: invitación profesional, confirmación de pedido, pago recibido
- **Archivo principal**: `src/lib/email-service.ts`

### n8n — Automatización
- Recibe webhook cuando un profesional envía solicitud de verificación
- **PROBLEMA**: URL hardcodeada en `src/domains/auth-verification/actions.ts` línea 47

### Upstash Redis — Rate Limiting
- Auth: 5 intentos / 15 minutos por IP
- API general: 100 requests / minuto por IP
- Webhooks: 200 / minuto global
- **Archivo**: `src/lib/rate-limit.ts`

### Sentry — Monitoreo de Errores
- Configurado para cliente, servidor y edge
- Archivos: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`

---

## Decisiones Arquitectónicas Detectadas

### 1. Precios siempre calculados en el servidor
Los precios NUNCA vienen del cliente. Se usan RPCs de PostgreSQL (`get_products_with_pricing()`) que calculan el precio correcto según el nivel del usuario directamente en la base de datos. Imposible manipular desde el browser.

### 2. Seguridad en 3 capas independientes
Si una capa falla, las otras siguen protegiendo:
- **Capa 1**: Middleware de Next.js (redirige si no hay sesión o no es admin)
- **Capa 2**: `ensureAdmin()` en cada Server Action crítica
- **Capa 3**: RLS en PostgreSQL (bloquea a nivel de base de datos)

### 3. Idempotencia en pagos Stripe
La tabla `stripe_events` guarda cada evento procesado. Si Stripe manda el mismo evento dos veces, el segundo se ignora. Previene cobros o cambios de estado duplicados.

### 4. Organización por dominios de negocio
En lugar de `utils/` monolítico, la lógica está en `src/domains/` por tema: `commerce`, `admin`, `academy`, `auth`. Facilita encontrar el código relevante.

### 5. Tokens de invitación hasheados
Los tokens se guardan como hash SHA-256, nunca en texto plano. Si la DB se filtrara, los tokens no podrían usarse. Archivo: `src/lib/crypto.ts`

### 6. Variables de entorno validadas al arrancar
`src/lib/config.ts` verifica que todas las variables requeridas existan. Si falta una, el servidor falla inmediatamente con mensaje claro — nunca en producción silenciosamente.

---

## Protección de Rutas — Las 3 Capas

```
Request del usuario
        │
        ▼
CAPA 1: Middleware (middleware.ts)
  • Si URL empieza con /(app)/ → necesita sesión activa
  • Si URL empieza con /(admin)/ → necesita is_admin() = true
  • Si falla → redirige a /login
        │ (pasa)
        ▼
CAPA 2: Layout Server Component
  • Layout de (app): verifica estado APPROVED/ACTIVE del usuario
  • Layout de (admin): llama ensureAdmin()
  • Si falla → redirige o lanza error
        │ (pasa)
        ▼
CAPA 3: RLS en PostgreSQL
  • Incluso si alguien bypasea las capas anteriores,
    la DB solo devuelve filas que le corresponden al usuario
  • Los admins usan is_admin() en las políticas para acceder a todo
```
