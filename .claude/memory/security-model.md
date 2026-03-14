---
name: Security Model — Modelo de Seguridad
description: Documentación del modelo de autenticación, control de acceso, RLS, manejo de secretos y superficies de ataque
type: project
---

# Modelo de Seguridad — DERMAKOR ACADEMY

---

## 1. Modelo de Autenticación

### ¿Cómo funciona el login?

Supabase Auth gestiona toda la autenticación. Usa el protocolo PKCE (Proof Key for Code Exchange) que es más seguro que el flujo OAuth estándar porque previene ataques de interceptación.

```
[Usuario] → email + password
        ↓
[Supabase Auth] verifica credenciales
        ↓
[Tokens creados]
  • access_token  → válido ~1 hora
  • refresh_token → válido semanas (renueva el access_token automáticamente)
        ↓
[Cookies HttpOnly] → guardadas en el navegador
  • HttpOnly = JavaScript del browser NO puede leerlas (protección XSS)
  • Secure   = solo se envían por HTTPS
```

### ¿Cómo se valida la sesión en cada request?

```
Cada request del usuario
        ↓
supabase.auth.getUser()  ← IMPORTANTE: valida contra el servidor de Supabase
        ↓                   NO usa datos del navegador (que podrían manipularse)
Session válida o null
```

**Por qué `getUser()` y no `getSession()`:**
- `getSession()` lee los datos de la cookie local sin validar con el servidor → puede ser manipulado
- `getUser()` hace una llamada a Supabase para verificar que el token sigue siendo válido → más seguro

---

## 2. Control de Acceso — Las 3 Capas

```
REQUEST DEL USUARIO
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  CAPA 1: MIDDLEWARE (src/lib/supabase/middleware.ts)     │
│                                                          │
│  Rutas (app)/*   → requiere sesión activa               │
│  Rutas (admin)/* → requiere is_admin() = true           │
│                                                          │
│  is_admin() es una función RPC de PostgreSQL             │
│  que busca el rol en la tabla profiles                   │
│                                                          │
│  Si falla → redirect a /login o /app                    │
└──────────────────────────────────────────────────────────┘
        │ (pasa)
        ▼
┌──────────────────────────────────────────────────────────┐
│  CAPA 2: LAYOUT + SERVER ACTIONS                         │
│                                                          │
│  Layout (admin): ensureAdmin() en admin-guard.ts        │
│  Layout (app):   verifica verification_status=APPROVED  │
│                                                          │
│  Cada Server Action crítica llama ensureAdmin()          │
│  ANTES de cualquier lógica de negocio                    │
│                                                          │
│  Si falla → lanza error, redirige                       │
└──────────────────────────────────────────────────────────┘
        │ (pasa)
        ▼
┌──────────────────────────────────────────────────────────┐
│  CAPA 3: RLS EN POSTGRESQL                               │
│                                                          │
│  Row Level Security: cada fila en la DB tiene reglas    │
│  de quién puede leerla/modificarla                       │
│                                                          │
│  Incluso si alguien bypasea Capas 1 y 2, la DB          │
│  solo devuelve las filas permitidas para ese usuario     │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Roles y Niveles de Usuario

### Roles (stored en tabla `profiles`)

| Rol | Cómo se establece | Acceso |
|-----|------------------|--------|
| `admin` | Manualmente en DB por el owner | Panel admin completo |
| `user` | Por defecto al registrarse | Solo su propia información |

### Niveles de usuario (stored en tabla `profiles`)

| Nivel | Cómo se obtiene | Acceso a tienda | Acceso a academia |
|-------|----------------|-----------------|-------------------|
| `NONE` | Por defecto | Sin precios | Solo contenido FREE |
| `STANDARD` | Tras aprobación básica | Precios nivel estándar | Contenido FREE + STANDARD |
| `PREMIUM` | Tras aprobación premium | Precios nivel premium | Todo el contenido |

### Verificación de estado

El campo `verification_status` en `profiles` puede ser:
- `PENDING` → solicitud enviada, esperando aprobación
- `APPROVED` → aprobado, puede usar la app
- `REJECTED` → rechazado

---

## 4. Políticas RLS Detectadas

### Tablas con RLS activo (detectado en código)

| Tabla | Protección | Detalle |
|-------|-----------|---------|
| `orders` | SELECT, UPDATE | Usuario solo ve sus propias órdenes (`.eq('user_id', user.id)`) |
| `order_items` | SELECT | Via relación con orders del usuario |
| `profiles` | SELECT, UPDATE | Usuario solo lee/modifica su perfil |
| `user_progress` | SELECT, INSERT, UPDATE | Usuario solo ve su progreso |
| `verification_requests` | INSERT | Cualquier usuario puede enviar (público) |

### Tablas SIN RLS suficiente (riesgo identificado)

| Tabla | Problema |
|-------|---------|
| `lessons` | El contenido premium se protege en código JS, no en RLS |
| `courses` | Acceso controlado en JS con `createAdminClient()` |

**Recomendación:** Agregar políticas RLS en `lessons` que verifiquen el nivel del usuario directamente en la base de datos. No depender solo del código JavaScript.

---

## 5. Manejo de Secretos

### Variables de Entorno Sensibles

| Variable | Pública/Secreta | Dónde se usa |
|----------|----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública (OK) | Browser y servidor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública (OK por diseño) | Browser y servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRETA** | Solo servidor — nunca al cliente |
| `STRIPE_SECRET_KEY` | **SECRETA** | Solo servidor — Server Actions |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Pública (OK) | Browser para Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | **SECRETA** | Solo webhook endpoint |
| `SMTP_USER`, `SMTP_PASSWORD` | **SECRETAS** | Solo email-service.ts |
| `UPSTASH_REDIS_REST_URL/TOKEN` | **SECRETAS** | Solo rate-limit.ts |

### ¿Cómo se previene que lleguen al cliente?

`src/lib/config.ts` tiene la función `requireEnvOnServer()`:

```typescript
function requireEnvOnServer(key: string): string {
  if (typeof window !== 'undefined') {
    throw new Error(`${key} no debe usarse en el cliente`)
  }
  const value = process.env[key]
  if (!value) throw new Error(`Variable de entorno ${key} no encontrada`)
  return value
}
```

Esta función lanza error si alguien intenta usarla en el browser. Las claves secretas SIEMPRE se obtienen con esta función.

### ADVERTENCIA CRÍTICA

El archivo `.env.vercel` contiene credenciales reales de producción y ESTÁ en `.gitignore`. Sin embargo, verificar con:

```bash
git log --all --full-history -- .env.vercel
```

Si aparece en el historial → **rotar TODAS las credenciales inmediatamente**.

---

## 6. Rate Limiting

### Configuración (src/lib/rate-limit.ts)

| Limitador | Ventana | Máximo | Aplica a |
|-----------|---------|--------|----------|
| `authRateLimit` | 15 minutos | 5 requests | Login, set-password |
| `apiRateLimit` | 1 minuto | 100 requests | APIs generales |
| `webhookRateLimit` | 1 minuto | 200 requests | Webhook de Stripe |

### ¿Cómo funciona?

1. Cada request llega con una IP
2. Se consulta Upstash Redis: ¿cuántos requests ha hecho esta IP en la ventana de tiempo?
3. Si supera el límite → responde con HTTP 429 (Too Many Requests)
4. Si no supera → procesa el request normalmente

### ¿Qué protege?

- **Login**: previene fuerza bruta de contraseñas (5 intentos / 15 min)
- **Webhook**: previene ataques DDoS al endpoint de Stripe
- **APIs**: previene abuso general

---

## 7. Seguridad en Stripe

### Verificación de Firma HMAC

Cuando Stripe llama al webhook, incluye una firma en el header `stripe-signature`. Esta firma se genera con `STRIPE_WEBHOOK_SECRET` (una clave compartida entre Stripe y nosotros).

```typescript
// En app/api/webhooks/stripe/route.ts
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  STRIPE_WEBHOOK_SECRET
)
// Si la firma no coincide → lanza error → ignoramos el request
```

Esto previene que cualquiera pueda enviar notificaciones falsas de pago.

### Idempotencia con tabla `stripe_events`

```typescript
// 1. ¿Ya procesamos este evento?
const existing = await supabase.from('stripe_events').select().eq('event_id', event.id)
if (existing.data?.length) return Response.json({ received: true }) // ya procesado

// 2. Guardar que lo vamos a procesar
await supabase.from('stripe_events').insert({ event_id: event.id })

// 3. Procesar el pago
await markOrderAsPaid(orderId)
```

Esto previene procesar el mismo pago dos veces si Stripe reenvía el webhook.

### Precios no manipulables

Los precios se calculan en PostgreSQL con el RPC `get_products_with_pricing()`. El cliente NUNCA envía precios — solo envía IDs de productos. Los precios siempre vienen de la base de datos.

---

## 8. Logging Seguro

### Campos redactados automáticamente (src/lib/logger.ts)

El logger detecta estas palabras en los nombres de los campos y reemplaza el valor por `[REDACTED]`:

```
password, passwd, secret, token, key, authorization,
auth, credential, private, apikey, api_key
```

### Ejemplo

```typescript
logger.info('Usuario autenticado', {
  userId: '123',
  email: 'user@example.com',
  token: 'abc123...'  // → se guarda como [REDACTED]
})
```

### PROBLEMA DETECTADO

En 26 archivos se usa `console.error` / `console.log` en lugar del logger. Estos logs NO pasan por el redactor de datos sensibles. Archivos más afectados:
- `admin-actions.ts` (18 ocurrencias)
- `cms-actions.ts` (8 ocurrencias)

---

## 9. Superficies de Ataque Identificadas

### Endpoints Públicos (sin autenticación)

| Endpoint | Protección |
|----------|-----------|
| `POST /api/auth/callback` | Rate limit indirecto de Supabase |
| `POST /api/auth/set-password` | Rate limit + token SHA-256 |
| `POST /api/webhooks/stripe` | Rate limit + firma HMAC |
| `GET /api/health` | Sin restricción |

### Server Actions que Necesitan Atención

| Action | Problema |
|--------|---------|
| `deletePricingRule()` en `pricing-pro-actions.ts` | **SIN verificación de admin** — cualquier usuario autenticado puede llamarla |
| `updateProductDetails()` | Acepta `data: any` — sin validación de schema |
| `upsertProduct()` | Acepta `product: any` — sin validación de schema |

### Riesgos Conocidos

| Riesgo | Severidad | Archivo |
|--------|----------|---------|
| Contenido de academia sin RLS real | ALTO | `academy/actions.ts` |
| `deletePricingRule` sin `ensureAdmin` | MEDIO | `pricing-pro-actions.ts` |
| URL de n8n hardcodeada sin autenticación | MEDIO | `auth-verification/actions.ts` |
| `data: any` en updates de productos | MEDIO | `product-actions.ts` |

---

## 10. Checklist de Seguridad para Nuevas Features

Antes de hacer deploy de cualquier nueva funcionalidad, verificar:

**Autenticación y Autorización**
- [ ] ¿Las nuevas Server Actions llaman a `ensureAdmin()` si son solo para admins?
- [ ] ¿Las rutas nuevas están protegidas en el middleware?
- [ ] ¿Se usa `getUser()` (no `getSession()`) para verificar identidad?

**Datos y Validación**
- [ ] ¿Se validan los datos del usuario con Zod antes de tocar la DB?
- [ ] ¿Los nuevos campos tienen tipos TypeScript correctos (sin `as any`)?
- [ ] ¿Se usan RPCs de PostgreSQL para operaciones críticas (precios, stock)?

**Secretos y Variables de Entorno**
- [ ] ¿Las nuevas variables secretas usan `requireEnvOnServer()`?
- [ ] ¿No se expone información sensible en responses de API?
- [ ] ¿Los nuevos archivos `.env.*` están en `.gitignore`?

**Base de Datos**
- [ ] ¿Las nuevas tablas tienen políticas RLS apropiadas?
- [ ] ¿Se usa el cliente correcto de Supabase (browser/server/admin)?
- [ ] ¿Las tablas con datos de usuario tienen política de SELECT solo para el owner?

**Logging**
- [ ] ¿Se usa el `logger` estructurado en lugar de `console.log`?
- [ ] ¿No se loguean datos sensibles (tokens, passwords)?
