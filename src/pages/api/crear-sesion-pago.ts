export const prerender = false;

import Stripe from 'stripe';
import type { APIRoute } from 'astro';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil' as const,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    console.log('[API] Texto recibido:', text);

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'El cuerpo de la petición está vacío' }),
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('[API] Error al parsear JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'JSON malformado' }),
        { status: 400 }
      );
    }

    const { monto } = body;
    if (!monto || typeof monto !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Monto inválido' }),
        { status: 400 }
      );
    }

    console.log('[API] Monto recibido:', monto);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'Donación',
            },
            unit_amount: monto,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://raiz-verde.vercel.app/donaciones?estado=exito',
      cancel_url: 'https://raiz-verde.vercel.app/donaciones?estado=cancelado',    
    });

    console.log('[API] Sesión creada:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200 }
    );
  } catch (err) {
    console.error('[API] Error inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Error en el servidor' }),
      { status: 500 }
    );
  }
};
