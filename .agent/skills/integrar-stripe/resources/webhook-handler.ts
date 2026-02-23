import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Cliente admin para saltar RLS en procesos de sistema
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // 1. Idempotencia: Verificar si el evento ya fue procesado
    const { data: existingEvent } = await supabaseAdmin
        .from('stripe_events')
        .select('event_id')
        .eq('event_id', event.id)
        .single();

    if (existingEvent) return NextResponse.json({ received: true, duplicate: true });

    // 2. Manejo de Eventos
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            // Lógica de creación de orden...
            break;

        case 'invoice.paid':
            // Lógica de actualización de suscripción...
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // 3. Registrar éxito
    await supabaseAdmin.from('stripe_events').insert({ event_id: event.id });

    return NextResponse.json({ received: true });
}
