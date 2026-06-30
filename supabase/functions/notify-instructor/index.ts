// supabase/functions/notify-instructor/index.ts
// Supabase Edge Function to notify instructors about confirmed bookings.
// Primary: Transactional Email (Resend)
// Secondary: Facebook Messenger (optional, Page-Scoped ID check)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id } = await req.json()
    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Missing booking_id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 1. Initialize Supabase client with Service Role Key to bypass RLS controls
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ""
    const fbAccessToken = Deno.env.get('FB_PAGE_ACCESS_TOKEN') ?? ""

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Fetch booking details along with customer, class, and instructor profile data
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .select(`
        id,
        spot_number,
        payment_method,
        customers (
          name,
          email
        ),
        classes (
          title,
          start_time,
          instructors (
            name,
            profiles (
              email,
              fb_psid
            )
          )
        )
      `)
      .eq('id', booking_id)
      .single()

    if (dbError || !booking) {
      throw new Error(`Database error or booking not found: ${dbError?.message || 'Empty result'}`)
    }

    const customerName = booking.customers?.name || "Client"
    const classTitle = booking.classes?.title || "Yoga Session"
    const startTimeStr = booking.classes?.start_time
    const instructorName = booking.classes?.instructors?.name || "Coach"
    const instructorEmail = booking.classes?.instructors?.profiles?.email
    const instructorFbPsid = booking.classes?.instructors?.profiles?.fb_psid

    // Format start time in Asia/Manila (UTC+8) time zone
    const manilaTime = new Date(startTimeStr).toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })

    const messageText = `Hi ${instructorName}, ${customerName} has booked Spot #${booking.spot_number} for your class: "${classTitle}" on ${manilaTime} (Manila Time).`

    // Log tracking structures
    const notificationLogs = []

    // 3. Dispatch Email Notification (Resend)
    if (instructorEmail) {
      if (!resendApiKey) {
        notificationLogs.push({
          booking_id,
          channel: 'email',
          status: 'failed',
          provider_response: 'Resend API key missing in edge function environment.'
        })
      } else {
        const portalLink = `${Deno.env.get('PUBLIC_APP_URL') ?? 'https://evolve.studio'}/portal`
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px; background-color: #121212; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #FF5E62; margin-bottom: 20px;">New Booking Confirmed</h2>
            <p>Hi <strong>${instructorName}</strong>,</p>
            <p>${customerName} has successfully booked <strong>Spot #${booking.spot_number}</strong> for your upcoming session:</p>
            <div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #FF9966;">
              <p style="margin: 5px 0;"><strong>Class:</strong> ${classTitle}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${manilaTime} (PST/Manila)</p>
            </div>
            <p style="margin-top: 30px;">
              <a href="${portalLink}" style="background-color: #FF5E62; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Admin Portal</a>
            </p>
          </div>
        `

        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Evolve Studio <notifications@updates.evolve.studio>',
              to: [instructorEmail],
              subject: `Class Booking Alert: ${customerName} - Spot #${booking.spot_number}`,
              html: emailHtml
            })
          })

          const resData = await res.json()
          if (res.ok) {
            notificationLogs.push({
              booking_id,
              channel: 'email',
              status: 'sent',
              provider_response: JSON.stringify(resData)
            })
          } else {
            notificationLogs.push({
              booking_id,
              channel: 'email',
              status: 'failed',
              provider_response: `Resend error: ${JSON.stringify(resData)}`
            })
          }
        } catch (err) {
          notificationLogs.push({
            booking_id,
            channel: 'email',
            status: 'failed',
            provider_response: `Fetch error sending email: ${err.message}`
          })
        }
      }
    } else {
      notificationLogs.push({
        booking_id,
        channel: 'email',
        status: 'failed',
        provider_response: 'No email address registered for this instructor profile.'
      })
    }

    // 4. Dispatch Facebook Messenger Notification if instructor is opted-in
    if (instructorFbPsid) {
      if (!fbAccessToken) {
        notificationLogs.push({
          booking_id,
          channel: 'messenger',
          status: 'failed',
          provider_response: 'Facebook Access Token missing in edge function environment.'
        })
      } else {
        try {
          const res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${fbAccessToken}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipient: { id: instructorFbPsid },
              message: { text: messageText }
            })
          })

          const resData = await res.json()
          if (res.ok) {
            notificationLogs.push({
              booking_id,
              channel: 'messenger',
              status: 'sent',
              provider_response: JSON.stringify(resData)
            })
          } else {
            notificationLogs.push({
              booking_id,
              channel: 'messenger',
              status: 'failed',
              provider_response: `FB API error: ${JSON.stringify(resData)}`
            })
          }
        } catch (err) {
          notificationLogs.push({
            booking_id,
            channel: 'messenger',
            status: 'failed',
            provider_response: `Fetch error sending FB message: ${err.message}`
          })
        }
      }
    }

    // 5. Bulk insert notification logs in database (runs client-agnostically)
    if (notificationLogs.length > 0) {
      await supabase.from('notification_log').insert(notificationLogs)
    }

    return new Response(JSON.stringify({ success: true, logged_channels: notificationLogs.length }), {
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
