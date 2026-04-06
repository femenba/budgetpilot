import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Disable Vercel's default body parser so we can read the raw bytes
// needed for Stripe signature verification.
export const config = {
  api: { bodyParser: false },
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Use the service role key so updates bypass RLS.
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    if (event.type === 'invoice.paid' || event.type === 'invoice_payment.paid') {
      const obj = event.data.object

      // invoice.paid      → object IS the invoice (has customer_email, subscription).
      // invoice_payment.paid → object is an InvoicePayment; fetch the linked invoice
      //                        to get customer_email and subscription_id.
      let customerId = obj.customer
      let subscriptionId = null
      let customerEmail = null

      if (event.type === 'invoice.paid') {
        subscriptionId = obj.subscription
        customerEmail = obj.customer_email
      } else {
        // invoice_payment.paid — retrieve the parent invoice for the extra fields.
        if (obj.invoice) {
          const invoice = await stripe.invoices.retrieve(obj.invoice)
          subscriptionId = invoice.subscription
          customerEmail = invoice.customer_email
        }
      }

      // Prefer looking up by stripe_customer_id (idempotent across renewals).
      let userId = null

      if (customerId) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()
        if (data) userId = data.id
      }

      // Fall back to email for the first payment (customer_id not yet stored).
      if (!userId && customerEmail) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle()
        if (data) userId = data.id
      }

      if (!userId) {
        console.warn(
          `[stripe-webhook] ${event.type}: no profile found for`,
          { customerId, customerEmail }
        )
        // Return 200 so Stripe doesn't retry — this event may not belong to us.
        return res.status(200).json({ received: true })
      }

      const updates = { plan: 'pro' }
      if (customerId) updates.stripe_customer_id = customerId
      if (subscriptionId) updates.stripe_subscription_id = subscriptionId

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) {
        console.error('[stripe-webhook] failed to upgrade profile:', error.message)
        return res.status(500).json({ error: error.message })
      }

      console.log(`[stripe-webhook] upgraded user to pro via ${event.type}:`, userId)
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer

      const { data, error: findError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()

      if (findError || !data) {
        console.warn(
          '[stripe-webhook] subscription.deleted: no profile found for customer',
          customerId
        )
        return res.status(200).json({ received: true })
      }

      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', data.id)

      if (error) {
        console.error('[stripe-webhook] failed to downgrade profile:', error.message)
        return res.status(500).json({ error: error.message })
      }

      console.log('[stripe-webhook] downgraded user to free:', data.id)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] unexpected error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
