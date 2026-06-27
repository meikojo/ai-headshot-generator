import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { extractIP } from '@/lib/ratelimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  const ip = extractIP(request);
  const body = await request.json();
  const { priceId, toolName, fingerprint } = body;

  if (!priceId || !fingerprint) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: priceId === process.env.NEXT_PUBLIC_STRIPE_SUB_PRICE_ID ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tools/${toolName}`,
      metadata: { fingerprint, ip, toolName },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
