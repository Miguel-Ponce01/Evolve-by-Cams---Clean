// supabase/functions/stripe-webhook/index.ts
// Secure Webhook Listener for Stripe checkout success and subscription status callbacks.
// Verifies signatures, updates client membership profiles, and logs credit adjustments.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Only POST method allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ""
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') ?? ""

    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured in environment.")
    }

    // Initialize Stripe client without specifying apiVersion per blueprint instructions
    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const signature = req.headers.get('stripe-signature') ?? ""
    const body = await req.text()

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      return new Response(JSON.stringify({ error: `Webhook Signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Initialize Supabase Client with service role key to perform database updates
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Helper to resolve user ID by email
    const getUserIdByEmail = async (email: string): Promise<string | null> => {
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      if (error || !users) return null
      const target = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      return target ? target.id : null
    }

    // Get the type of webhook event sent
    const eventType = event.type
    const dataObject = event.data.object

    if (eventType === 'checkout.session.completed') {
      const session = dataObject as Stripe.Checkout.Session
      const customerEmail = session.customer_details?.email || session.metadata?.customer_email
      const amountTotal = session.amount_total ?? 0

      if (session.mode === 'payment') {
        if (!customerEmail || amountTotal <= 0) {
          throw new Error("Missing customer email or payment amount in checkout session data.")
        }

        const userId = await getUserIdByEmail(customerEmail)
        if (!userId) {
          throw new Error(`User with email ${customerEmail} not found in Supabase Auth.`)
        }

        const amountInPhp = amountTotal / 100
        const creditsToCredit = Math.floor(amountInPhp / 250)

        if (creditsToCredit > 0) {
          const { error: ledgerError } = await supabase
            .from('credit_ledger')
            .insert({
              user_id: userId,
              amount: creditsToCredit,
              description: `Stripe online wallet top-up (+${creditsToCredit} Credits)`
            })

          if (ledgerError) {
            throw new Error(`Failed to append credit ledger record: ${ledgerError.message}`)
          }
        }
      }
    }

    // Handle Subscription Created
    else if (eventType === 'customer.subscription.created' || eventType === 'customer.subscription.updated') {
      const subscription = dataObject as Stripe.Subscription
      const customerId = subscription.customer as string

      // Retrieve customer details from Stripe to get the email
      const customer = await stripe.customers.retrieve(customerId)
      if (!customer || customer.deleted) {
        throw new Error(`Stripe customer account ${customerId} not found.`)
      }

      const email = customer.email
      if (email) {
        const userId = await getUserIdByEmail(email)
        if (userId) {
          // Set membership status to active
          const { error } = await supabase
            .from('profiles')
            .update({ membership_status: 'active' })
            .eq('id', userId)

          if (error) {
            throw new Error(`Failed to set membership status to active: ${error.message}`)
          }
        }
      }
    }

    // Handle Subscription Deleted / Cancelled
    else if (eventType === 'customer.subscription.deleted') {
      const subscription = dataObject as Stripe.Subscription
      const customerId = subscription.customer as string

      const customer = await stripe.customers.retrieve(customerId)
      if (customer && !customer.deleted && customer.email) {
        const userId = await getUserIdByEmail(customer.email)
        if (userId) {
          // Set membership status to inactive
          const { error } = await supabase
            .from('profiles')
            .update({ membership_status: 'inactive' })
            .eq('id', userId)

          if (error) {
            throw new Error(`Failed to reset membership status to inactive: ${error.message}`)
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
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
