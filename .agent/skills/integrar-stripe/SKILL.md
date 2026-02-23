---
name: integrar-stripe
description: Especialidad en la implementación de pagos, suscripciones y gestión de webhooks con Stripe en aplicaciones Next.js con Supabase.
---

# Integrar Stripe (Stripe Integration)

Esta habilidad proporciona un flujo de trabajo estandarizado para implementar cobros, suscripciones y liquidaciones utilizando Stripe, optimizado para la arquitectura de Dermakor Academy (Next.js App Router + Supabase + Stripe SDK).

## Cuándo usar esta habilidad
Activa esta habilidad cuando el usuario solicite:
- Implementar un flujo de Checkout.
- Configurar Webhooks para procesar eventos de pago (success, failure).
- Gestionar suscripciones o niveles de precios dinámicos.
- Integrar facturación automática ligada a órdenes.

## Estándares de Implementación

### 1. Configuración de Cliente (Server-Side)
Siempre inicializa Stripe en el servidor usando variables de entorno seguras.
```typescript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // O la versión más reciente compatible
});
```

### 2. Flujo de Checkout (Server Actions)
Para crear una sesión de checkout, usa Server Actions que validen el stock y el precio final antes de llamar a Stripe.
- **Validación Critica**: Nunca confíes en los precios enviados desde el cliente. Consúltalos en la base de datos (ej. RPC `get_products_with_pricing`).
- **Metadata**: Incluye el `userId` y `orderId` (si existe) en la metadata de la sesión de Stripe para facilitar la reconciliación en el webhook.

### 3. Webhooks (API Route)
El webhook debe estar en `src/app/api/webhooks/stripe/route.ts`.
- **Verificación de Firma**: Usa `stripe.webhooks.constructEvent` para validar que la petición viene de Stripe.
- **Manejo de Eventos**:
    - `checkout.session.completed`: Crea la orden en la base de datos y marca como pagada.
    - `invoice.paid`: (Para suscripciones) Actualiza el nivel del perfil del usuario.
- **Idempotencia**: Registra el `event_id` en una tabla `stripe_events` para evitar procesar la misma notificación dos veces.

### 4. Seguridad y RLS
- Asegúrate de que los usuarios solo puedan ver sus propias sesiones de pago.
- Las tablas sensibles como `orders` deben tener políticas RLS estrictas.

## Recursos Disponibles
- Ver `src/domains/commerce/actions.ts` para un ejemplo real de `createCheckoutSession`.
- Ver `src/app/api/webhooks/stripe/route.ts` para la lógica de procesamiento de eventos.

## Pasos para una nueva integración
1. **Verificar Env**: Asegurar que `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` existan.
2. **Definir Precios**: Sincronizar productos en Stripe o usar precios dinámicos mediante `price_data`.
3. **Implementar Acción**: Crear la acción de servidor para el Checkout.
4. **Configurar Webhook**: Implementar el handler para `checkout.session.completed`.
5. **Testing**: Usar Stripe CLI para reenviar eventos localmente.
