// supabase/functions/create-checkout/index.ts
// Creates a PayMongo Checkout Session for wallet credit top-ups.
// Supports: GCash, Maya, Card, and QR Ph payments in Philippines PHP currency.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS options
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, customer_email, customer_name, customer_phone, redirect_url } = await req.json()

    if (!amount || !customer_email) {
      return new Response(JSON.stringify({ error: "Missing required parameters: amount, customer_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const paymongoSecretKey = Deno.env.get('PAYMONGO_SECRET_KEY') ?? ""
    if (!paymongoSecretKey) {
      throw new Error("PayMongo Secret Key not configured in edge function environment.")
    }

    // Convert amount in PHP to centavos (1 PHP = 100 centavos)
    const amountInCentavos = Math.round(amount * 100)

    // Base64 encode PayMongo secret key for Basic Auth Header
    const authHeader = `Basic ${btoa(paymongoSecretKey + ":")}`

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            billing: {
              email: customer_email,
              name: customer_name || 'Client',
              phone: customer_phone || undefined,
            },
            line_items: [
              {
                amount: amountInCentavos,
                currency: 'PHP',
                name: 'Evolve Loyalty Credits Bundle',
                quantity: 1,
              }
            ],
            payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
            success_url: redirect_url || 'https://evolve.studio/dashboard?status=success',
            cancel_url: redirect_url || 'https://evolve.studio/dashboard?status=cancelled',
            description: `Top-up transaction for Evolve Studio Loyalty wallet.`,
          }
        }
      })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`PayMongo API error: ${data.errors?.[0]?.detail || 'Unknown error'}`)
    }

    const checkoutUrl = data.data.attributes.checkout_url
    const checkoutSessionId = data.data.id

    return new Response(JSON.stringify({ checkout_url: checkoutUrl, session_id: checkoutSessionId }), {
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
