---
name: Data Flow — Flujos Críticos del Sistema
description: Documentación paso a paso de los flujos principales del sistema incluyendo login, checkout, Stripe, academia y verificación
type: project
---

# Flujos Críticos del Sistema — DERMAKOR ACADEMY

---

## FLUJO 1 — Login

### Descripción simple
El usuario escribe email y contraseña. Supabase verifica las credenciales. Si son correctas, guarda la sesión en una cookie segura. A partir de ahí, cada página lee esa cookie para saber quién es el usuario.

### Paso a paso

```
[1] Usuario escribe email + password en /login/page.tsx
        │
        ▼
[2] Formulario llama a login() — Server Action en domains/auth/auth-actions.ts
        │
        ▼
[3] login() llama a supabase.auth.signInWithPassword(email, password)
    • Si falla → retorna error "Credenciales incorrectas"
    • Si hay rate limit → retorna error de demasiados intentos
        │
        ▼ (éxito)
[4] Supabase crea sesión (access_token + refresh_token)
    Los tokens se guardan en cookies HttpOnly seguras automáticamente
        │
        ▼
[5] login() redirige al usuario según su estado:
    • verification_status = 'APPROVED' y active = true → /app/
    • verification_status = 'PENDING'                  → /pending/
    • is_admin = true                                  → /admin/
```

### Archivos involucrados
- `src/app/[locale]/(public)/login/page.tsx` — formulario
- `src/domains/auth/auth-actions.ts` → función `login()`
- `src/lib/supabase/server.ts` → cliente con cookies
- `src/lib/rate-limit.ts` → límite de 5 intentos / 15 min

### ¿Qué puede salir mal?
- Credenciales incorrectas → mensaje de error, no revela si el email existe
- Rate limit superado → bloqueo temporal por IP
- Supabase caído → error de conexión

---

## FLUJO 2 — Checkout con Stripe (Pago con Tarjeta)

### Descripción simple
Primero se crea el pedido en nuestra base de datos (con precios calculados en el servidor). Luego se crea una sesión de pago en Stripe con el ID del pedido como referencia. El usuario paga en Stripe. Stripe nos avisa por webhook cuando el pago se completa.

### Por qué se crea el pedido ANTES de Stripe
Si creáramos el pedido DESPUÉS del pago, podría pasar que Stripe cobre pero nuestro servidor falle antes de crear el pedido. El orden correcto protege contra eso.

### Paso a paso

```
[1] Usuario tiene productos en el carrito (Zustand store en store.ts)
    El carrito solo guarda IDs y cantidades — NUNCA precios
        │
        ▼
[2] Usuario hace clic en "Pagar con tarjeta"
    Llama a createCheckoutSession() en domains/commerce/actions.ts
        │
        ▼
[3] createCheckoutSession() en el servidor:
    a) Verifica que el usuario esté autenticado
    b) Llama al RPC create_order_secure() en Supabase
       • La DB verifica stock disponible
       • La DB calcula precios según nivel del usuario (NUNCA del cliente)
       • Si hay stock suficiente → crea la orden con status='PENDING'
       • Si no hay stock → retorna error
        │
        ▼
[4] Con el orderId de la DB, crea sesión en Stripe:
    stripe.checkout.sessions.create({
      metadata: { orderId, userId, shippingAddress }
      success_url: /orders/success?session_id={CHECKOUT_SESSION_ID}
      cancel_url: /checkout
    })
        │
        ▼
[5] Retorna la URL de Stripe al cliente
    Next.js redirige al usuario a la página de pago de Stripe
        │
        ▼
[6a] Usuario COMPLETA el pago → Stripe llama al webhook (ver FLUJO 3)
[6b] Usuario CANCELA → vuelve a /checkout, el pedido queda en PENDING
     (el admin puede cancelarlo manualmente o hay un proceso de limpieza)
```

### Archivos involucrados
- `src/domains/commerce/actions.ts` → `createCheckoutSession()`
- `src/lib/supabase/admin.ts` → cliente para llamar RPCs
- RPC `create_order_secure()` en PostgreSQL — lógica crítica de negocio
- RPC `get_products_with_pricing()` — calcula precios

---

## FLUJO 3 — Webhook de Stripe (Pago Completado)

### Descripción simple
Cuando un usuario completa el pago en Stripe, Stripe envía una notificación a nuestro servidor en `/api/webhooks/stripe`. Este endpoint verifica que la notificación sea legítima (firmada por Stripe), evita procesar el mismo pago dos veces, y actualiza el pedido a PAID.

### Paso a paso

```
[1] Stripe envía POST a /api/webhooks/stripe/route.ts
    Con header: stripe-signature (firma HMAC)
        │
        ▼
[2] Rate limit check con Upstash Redis
    Si supera 200 req/min → retorna 429 Too Many Requests
        │
        ▼
[3] Verificación de firma:
    stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    Si la firma no coincide → retorna 400 y descarta el evento
    (previene que alguien falsifique notificaciones de pago)
        │
        ▼
[4] Verificación de idempotencia:
    ¿Existe stripe_event_id en tabla stripe_events?
    • Sí → retorna 200 sin procesar (ya fue procesado)
    • No → continúa
        │
        ▼
[5] Guarda el stripe_event_id en tabla stripe_events
    (para que future duplicados sean ignorados)
        │
        ▼
[6] Extrae orderId de session.metadata.orderId
    Verifica que el pedido exista y no esté ya pagado
        │
        ▼
[7] Llama al RPC mark_order_paid(orderId) en Supabase
    • Cambia status a 'PAID'
    • Guarda stripe_payment_intent_id
        │
        ▼
[8] Llama al RPC decrement_stock_safe() para cada producto del pedido
    • Descuenta el stock sin permitir que quede negativo
        │
        ▼
[9] Envía email de confirmación al cliente (fire-and-forget)
    (ver nota sobre futuros problemas en tech-debt.md)
        │
        ▼
[10] Retorna 200 OK a Stripe
     Si no recibe 200, Stripe reintentará el webhook hasta 3 días
```

### Archivos involucrados
- `src/app/api/webhooks/stripe/route.ts` — lógica completa del webhook
- `src/lib/rate-limit.ts` → límite 200/min
- `src/lib/logger.ts` → logging estructurado
- `src/lib/email-service.ts` → email de confirmación
- RPCs: `mark_order_paid()`, `decrement_stock_safe()`

---

## FLUJO 4 — Checkout por Transferencia Bancaria

### Descripción simple
Alternativa a Stripe sin pago online. El cliente hace un pedido, recibe los datos bancarios por email, y transfiere el dinero manualmente. El admin confirma el pago cuando lo recibe.

### Paso a paso

```
[1] Usuario selecciona "Pago por transferencia" en checkout
    Llama a createBankTransferOrder() en domains/commerce/bank-actions.ts
        │
        ▼
[2] createBankTransferOrder() en el servidor:
    a) Llama al RPC create_order_secure() — mismo que Stripe
       (precios calculados en DB, stock verificado)
    b) Crea la orden con status='PENDING_PAYMENT'
        │
        ▼
[3] Envía email al CLIENTE con:
    • Resumen del pedido
    • Datos bancarios para transferir
    • Referencia del pedido
        │
        ▼
[4] Envía email al ADMIN notificando nuevo pedido
        │
        ▼
[5] Admin recibe el pago bancario (fuera del sistema)
    En admin/orders/, hace clic en "Confirmar pago recibido"
    Llama a markOrderAsPaid() en domains/admin/order-actions.ts
        │
        ▼
[6] El pedido cambia a status='PAID'
    Se descuenta el stock
    Se envía email de confirmación al cliente
```

### Archivos involucrados
- `src/domains/commerce/bank-actions.ts` → `createBankTransferOrder()`
- `src/domains/admin/order-actions.ts` → `markOrderAsPaid()`
- `src/lib/email-service.ts` → emails de notificación

---

## FLUJO 5 — Acceso a Cursos de la Academia

### Descripción simple
Los cursos tienen niveles de acceso (FREE, STANDARD, PREMIUM). Cuando el usuario visita un curso o lección, el sistema verifica si su nivel de usuario da acceso a ese contenido. Si no tiene acceso, ve un mensaje de upgrade.

### Niveles de usuario
```
NONE       → Usuario sin verificación (visitante registrado)
STANDARD   → Profesional verificado básico
PREMIUM    → Profesional verificado premium
```

### Paso a paso

```
[1] Usuario visita /app/academy/[slug]/
    El Server Component llama a getCourse(slug)
        │
        ▼
[2] getCourse() en domains/academy/actions.ts:
    a) Usa createAdminClient() (bypasea RLS)
    b) Obtiene todos los datos del curso con módulos y lecciones
    c) Obtiene el nivel del usuario con getUserLevel()
        │
        ▼
[3] Para cada lección del curso, aplica canAccess(userLevel, lessonLevel):
    • userLevel >= lessonLevel → tiene acceso → muestra el contenido
    • userLevel < lessonLevel  → sin acceso → muestra "upgrade" button
        │
        ▼ (si tiene acceso)
[4] Usuario hace clic en una lección → visita /app/academy/[slug]/lessons/[id]
    Llama a getLesson(lessonId)
        │
        ▼
[5] getLesson() obtiene el contenido de la lección:
    • Video: URL firmada temporal de Supabase Storage
    • PDF: URL firmada temporal de Supabase Storage
    • Texto: contenido HTML/Markdown directo
        │
        ▼
[6] Al completar la lección, el frontend llama a updateProgress(lessonId)
    Guarda el progreso en tabla user_progress
```

### ADVERTENCIA DE SEGURIDAD
La lógica de acceso (`canAccess`) está en JavaScript del servidor, NO en la base de datos (RLS). Esto significa que si un usuario accede directamente a la tabla `lessons` con la `anon key` pública de Supabase, podría ver el contenido sin restricciones.

Ver `security-model.md` para más detalle.

### Archivos involucrados
- `src/domains/academy/actions.ts` → `listCourses()`, `getCourse()`, `getLesson()`, `updateProgress()`
- `src/lib/supabase/admin.ts` → cliente admin (bypasea RLS)

---

## FLUJO 6 — Solicitud y Aprobación de Profesional

### Descripción simple
Un visitante llena el formulario de registro profesional. El sistema guarda la solicitud y notifica al admin via n8n. El admin revisa y aprueba. Se envía una invitación por email con un link para que el profesional cree su contraseña.

### Paso a paso

```
[1] Visitante llena formulario en /pro/
    Llama a submitVerification(data) en domains/auth-verification/actions.ts
        │
        ▼
[2] submitVerification() valida los datos con Zod (VerificationRequestSchema)
    Si fallan las validaciones → retorna errores de campo
        │
        ▼
[3] Guarda la solicitud en tabla verification_requests con status='PENDING'
        │
        ▼
[4] Envía webhook a n8n con todos los datos del formulario
    (nombre, empresa, email, teléfono, número IDE, etc.)
    n8n puede notificar por Slack, email al equipo, etc.
        │
        ▼
[5] El visitante ve mensaje "Tu solicitud está siendo revisada"
        │
        ▼ (días después, el admin revisa)
[6] Admin va a /admin/verifications/
    Hace clic en "Aprobar" en la solicitud
    Llama a adminApproveUser(verificationId)
        │
        ▼
[7] adminApproveUser() en domains/auth-verification/actions.ts:
    a) Genera un token aleatorio seguro con crypto.randomBytes(32)
    b) Hashea el token con SHA-256 y lo guarda en DB
    c) Genera un magic link de Supabase (invitación)
    d) Envía email al profesional con el link de invitación
    e) Actualiza verification_request a status='APPROVED'
        │
        ▼
[8] El profesional recibe el email y hace clic en el link
    Es redirigido a /auth/set-password/
        │
        ▼
[9] El profesional crea su contraseña
    Llama a la API route /api/auth/set-password/
    La API verifica el token (hash SHA-256), lo marca como usado
    El profesional queda con cuenta activa y puede hacer login
```

### Archivos involucrados
- `src/app/[locale]/(public)/pro/page.tsx` → formulario
- `src/domains/auth-verification/actions.ts` → `submitVerification()`, `adminApproveUser()`
- `src/app/api/auth/set-password/route.ts` → establece contraseña
- `src/lib/crypto.ts` → `hashToken()`
- `src/lib/email-service.ts` → email de invitación

---

## Tabla Resumen — Capas de Seguridad por Flujo

| Flujo | Rate Limit | Auth verificada | RLS activo | Firma/Token |
|-------|-----------|----------------|------------|-------------|
| Login | Sí (5/15min) | — | — | — |
| Checkout Stripe | No | Sí | Sí (create_order) | — |
| Webhook Stripe | Sí (200/min) | — | No (admin client) | Sí (HMAC Stripe) |
| Transferencia | No | Sí | Sí (create_order) | — |
| Academia | No | Sí | No (admin client) | — |
| Verificación | No | — (público) | Sí | Sí (SHA-256) |

---

## Tablas de Base de Datos Involucradas

| Tabla | Usada en |
|-------|----------|
| `profiles` | Login, verificación, todos los flujos |
| `verification_requests` | Flujo de verificación profesional |
| `orders` | Checkout Stripe, transferencia, academia |
| `order_items` | Checkout (detalle de productos del pedido) |
| `products` | Tienda, checkout |
| `product_variants` | Tienda, checkout |
| `stripe_events` | Webhook Stripe (idempotencia) |
| `courses` | Academia |
| `modules` | Academia |
| `lessons` | Academia |
| `user_progress` | Academia (progreso del estudiante) |
| `invitation_tokens` | Verificación profesional |
| `stripe_settings` | Configuración de Stripe |
