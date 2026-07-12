// supabase/functions/create-checkout/index.ts
// Creates a Stripe Checkout Session for Evolve Studio based on the blueprint specifications.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, customer_email, mode, price_id, product_name } = await req.json()

    if (!customer_email) {
      return new Response(JSON.stringify({ error: "Missing required parameter: customer_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ""
    if (!stripeSecretKey) {
      throw new Error("Stripe Secret Key not configured in edge function environment.")
    }

    // Initialize Stripe client without specifying apiVersion per blueprint instructions
    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const checkoutMode = mode || 'payment'

    let finalPriceId = price_id

    // If no price_id is provided, we create a product and pricing dynamically matching the blueprint specs
    if (!finalPriceId) {
      const product = await stripe.products.create({
        name: product_name || 'Example Product',
        default_price_data: {
          currency: 'usd',
          unit_amount: amount ? Math.round(amount * 100) : 2000,
        }
      })
      finalPriceId = product.default_price as string
    }

    // Create a Checkout Session matching the blueprint parameters
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      customer_email: customer_email,
      success_url: "https://dashboard.stripe.com/workbench/blueprints/one-time-payment/checkout-chapter?confirmation-redirect=create-checkout-session",
      cancel_url: "https://dashboard.stripe.com/workbench/blueprints/one-time-payment/checkout-chapter?confirmation-redirect=create-checkout-session",
      metadata: {
        customer_email: customer_email,
      }
    })

    return new Response(JSON.stringify({ checkout_url: session.url, session_id: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
