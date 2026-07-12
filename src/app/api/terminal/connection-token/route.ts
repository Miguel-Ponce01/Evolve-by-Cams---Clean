// src/app/api/terminal/connection-token/route.ts
// Creates a connection token for Stripe Terminal reader registration.

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY not configured in server environment.' },
        { status: 500 }
      );
    }

    // Leave apiVersion empty/default as instructed in the blueprint
    const stripe = new Stripe(stripeSecretKey);

    const token = await stripe.terminal.connectionTokens.create();

    return NextResponse.json({ secret: token.secret });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
