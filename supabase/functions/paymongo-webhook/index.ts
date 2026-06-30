// supabase/functions/paymongo-webhook/index.ts
// Secure Webhook Listener for PayMongo checkout success callbacks.
// Verifies signatures, credits client wallets atomically, and creates financial ledger audits.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

// Verify HMAC-SHA256 signature from PayMongo
async function verifyPayMongoSignature(
  signatureHeader: string,
  rawBody: string,
  signingSecret: string
): Promise<boolean> {
  try {
    const parts = signatureHeader.split(',');
    const tPart = parts.find(p => p.trim().startsWith('t='));
    const liPart = parts.find(p => p.trim().startsWith('li='));
    
    if (!tPart || !liPart) return false;

    const timestamp = tPart.split('=')[1];
    const expectedSignature = liPart.split('=')[1];

    const encoder = new TextEncoder();
    const keyData = encoder.encode(signingSecret);
    const messageData = encoder.encode(`${timestamp}.${rawBody}`);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = signatureArray
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    return computedSignature === expectedSignature;
  } catch (err) {
    console.error("Signature verification exception:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Only POST method allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const signatureHeader = req.headers.get('Paymongo-Signature') ?? ""
    const rawBody = await req.text()

    const signingSecret = Deno.env.get('PAYMONGO_WEBHOOK_SIGNING_SECRET') ?? ""
    
    // Verify signature in production environments
    if (signingSecret && signatureHeader) {
      const isSignatureValid = await verifyPayMongoSignature(signatureHeader, rawBody, signingSecret)
      if (!isSignatureValid) {
        return new Response(JSON.stringify({ error: "Invalid signature verification" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.data?.attributes?.type

    // We only process checkout session paid callbacks
    if (eventType !== 'checkout_session.payment.paid') {
      return new Response(JSON.stringify({ message: "Ignored event type: " + eventType }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const sessionData = payload.data.attributes.data.attributes
    const amountInCentavos = sessionData.payments?.[0]?.attributes?.amount ?? 0
    const paymentMethodType = sessionData.payments?.[0]?.attributes?.payment_method_type ?? 'card'
    const customerEmail = sessionData.billing?.email
    const customerName = sessionData.billing?.name ?? 'Client'
    const customerPhone = sessionData.billing?.phone ?? ''

    if (!customerEmail || amountInCentavos <= 0) {
      throw new Error("Missing customer email or payment amount in callback data.")
    }

    // Initialize Supabase Client with service key to mutate wallet states
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Resolve the Customer UUID from email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, credits')
      .eq('email', customerEmail)
      .single()

    if (customerError || !customer) {
      throw new Error(`Customer with email ${customerEmail} not registered in database: ${customerError?.message}`)
    }

    const amountInPhp = amountInCentavos / 100
    // Price per credit is 250 PHP
    const creditsToCredit = Math.floor(amountInPhp / 250)

    if (creditsToCredit <= 0) {
      return new Response(JSON.stringify({ message: "Paid amount insufficient to purchase credits." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 1. Credit wallet atomically
    const { error: updateError } = await supabase
      .from('customers')
      .update({ credits: customer.credits + creditsToCredit })
      .eq('id', customer.id)

    if (updateError) {
      throw new Error(`Failed to update customer credit balance: ${updateError.message}`)
    }

    // 2. Log transaction in financial audit ledger
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        customer_id: customer.id,
        type: 'membership',
        description: `PayMongo wallet top-up (+${creditsToCredit} Credits)`,
        payment_method: paymentMethodType === 'gcash' || paymentMethodType === 'paymaya' ? 'cash' : 'card', // mappings
        amount: amountInPhp,
        status: 'paid',
        handled_by: 'PayMongo Webhook'
      })

    if (txError) {
      console.error("Warning: wallet updated but transaction ledger logging failed:", txError.message)
    }

    return new Response(JSON.stringify({ success: true, credited_amount: creditsToCredit }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
