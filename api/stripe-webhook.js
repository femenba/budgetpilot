import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendProWelcomeEmail }    from './emails/pro-welcome.js'
import { sendRenewalEmail }       from './emails/renewal.js'
import { sendPaymentFailedEmail } from './emails/payment-failed.js'
import { sendCanceledEmail }      from './emails/canceled.js'

export const config = { api: { bodyParser: false } }

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end',  ()    => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// ── Shared helpers ───────────────────────────────────────────────

async function findProfile(supabase, { customerId, email }) {
  if (customerId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, plan, email, first_name, stripe_customer_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    if (data) return data
  }
  if (email) {
    const { data } = await supabase
      .from('profiles')
      .select('id, plan, email, first_name, stripe_customer_id')
      .eq('email', email)
      .maybeSingle()
    if (data) return data
  }
  return null
}

async function upgradeProfile(supabase, userId, { customerId, subscriptionId, status, renewalAt }) {
  const updates = { plan: 'pro' }
  if (customerId)     updates.stripe_customer_id     = customerId
  if (subscriptionId) updates.stripe_subscription_id = subscriptionId
  if (status)         updates.subscription_status    = status
  if (renewalAt)      updates.subscription_renewal_at = new Date(renewalAt * 1000).toISOString()

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw new Error(`DB upgrade failed: ${error.message}`)
}

async function updateSubscriptionFields(supabase, userId, { customerId, subscriptionId, status, renewalAt }) {
  const updates = {}
  if (customerId)     updates.stripe_customer_id     = customerId
  if (subscriptionId) updates.stripe_subscription_id = subscriptionId
  if (status)         updates.subscription_status    = status
  if (renewalAt)      updates.subscription_renewal_at = new Date(renewalAt * 1000).toISOString()

  if (Object.keys(updates).length === 0) return
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw new Error(`DB update failed: ${error.message}`)
}

async function sendEmailSafe(fn, label) {
  try {
    await fn()
    console.log(`[stripe-webhook] email sent: ${label}`)
  } catch (err) {
    console.error(`[stripe-webhook] email failed (${label}):`, err.message)
  }
}

// ── Event handlers ───────────────────────────────────────────────

async function handleCheckoutCompleted(stripe, supabase, obj) {
  const customerId     = obj.customer
  const subscriptionId = obj.subscription
  const email          = obj.customer_email
  const userId         = obj.client_reference_id

  // Resolve profile: prefer client_reference_id (most reliable)
  let profile = null
  if (userId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, plan, email, first_name')
      .eq('id', userId)
      .maybeSingle()
    profile = data
  }
  if (!profile) profile = await findProfile(supabase, { customerId, email })
  if (!profile) {
    console.warn('[stripe-webhook] checkout.session.completed: no profile found', { userId, email })
    return
  }

  // Store IDs only — welcome email comes from invoice.paid (billing_reason: subscription_create)
  await updateSubscriptionFields(supabase, profile.id, {
    customerId,
    subscriptionId,
    status: 'active',
  })
  console.log('[stripe-webhook] checkout.session.completed: stored IDs for', profile.id)
}

async function handleSubscriptionCreated(supabase, subscription) {
  const customerId = subscription.customer
  const profile    = await findProfile(supabase, { customerId })
  if (!profile) {
    console.warn('[stripe-webhook] subscription.created: no profile for customer', customerId)
    return
  }
  await updateSubscriptionFields(supabase, profile.id, {
    customerId,
    subscriptionId: subscription.id,
    status:         subscription.status,
    renewalAt:      subscription.current_period_end,
  })
  console.log('[stripe-webhook] subscription.created: updated', profile.id)
}

async function handleSubscriptionUpdated(supabase, subscription) {
  const customerId = subscription.customer
  const profile    = await findProfile(supabase, { customerId })
  if (!profile) {
    console.warn('[stripe-webhook] subscription.updated: no profile for customer', customerId)
    return
  }
  await updateSubscriptionFields(supabase, profile.id, {
    customerId,
    subscriptionId: subscription.id,
    status:         subscription.status,
    renewalAt:      subscription.current_period_end,
  })
  // If subscription becomes active again after being past_due, restore pro plan
  if (subscription.status === 'active' && profile.plan !== 'pro') {
    await supabase.from('profiles').update({ plan: 'pro' }).eq('id', profile.id)
    console.log('[stripe-webhook] subscription.updated: restored pro for', profile.id)
  }
}

async function handleSubscriptionDeleted(supabase, subscription) {
  const customerId = subscription.customer
  const profile    = await findProfile(supabase, { customerId })
  if (!profile) {
    console.warn('[stripe-webhook] subscription.deleted: no profile for customer', customerId)
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ plan: 'free', subscription_status: 'canceled' })
    .eq('id', profile.id)

  if (error) throw new Error(`DB downgrade failed: ${error.message}`)
  console.log('[stripe-webhook] subscription.deleted: downgraded', profile.id)

  const recipient = profile.email
  if (recipient) {
    await sendEmailSafe(
      () => sendCanceledEmail(recipient, profile.first_name),
      `canceled → ${recipient}`
    )
  }
}

async function handleInvoicePaid(stripe, supabase, obj) {
  const customerId     = obj.customer
  const subscriptionId = obj.subscription
  const email          = obj.customer_email
  const billingReason  = obj.billing_reason // subscription_create | subscription_cycle | ...
  const periodEnd      = obj.period_end      // Unix timestamp of next renewal

  const profile = await findProfile(supabase, { customerId, email })
  if (!profile) {
    console.warn('[stripe-webhook] invoice.paid: no profile found', { customerId, email })
    return
  }

  // Always ensure plan is pro and IDs are stored
  await upgradeProfile(supabase, profile.id, {
    customerId,
    subscriptionId,
    status: 'active',
    renewalAt: periodEnd,
  })
  console.log('[stripe-webhook] invoice.paid: upgraded/confirmed pro for', profile.id)

  const recipient = profile.email || email
  if (!recipient) return

  if (billingReason === 'subscription_create') {
    // First payment — send welcome email
    await sendEmailSafe(
      () => sendProWelcomeEmail(recipient, profile.first_name),
      `pro-welcome → ${recipient}`
    )
  } else if (billingReason === 'subscription_cycle') {
    // Renewal — send renewal confirmation
    await sendEmailSafe(
      () => sendRenewalEmail(recipient, profile.first_name, periodEnd),
      `renewal → ${recipient}`
    )
  }
}

async function handleInvoicePaymentFailed(supabase, obj) {
  const customerId = obj.customer
  const email      = obj.customer_email

  const profile = await findProfile(supabase, { customerId, email })
  if (!profile) {
    console.warn('[stripe-webhook] invoice.payment_failed: no profile found', { customerId, email })
    return
  }

  // Mark subscription as past_due
  await updateSubscriptionFields(supabase, profile.id, {
    customerId,
    status: 'past_due',
  })
  console.log('[stripe-webhook] invoice.payment_failed: marked past_due for', profile.id)

  const recipient = profile.email || email
  if (recipient) {
    await sendEmailSafe(
      () => sendPaymentFailedEmail(recipient, profile.first_name),
      `payment-failed → ${recipient}`
    )
  }
}

// ── Main handler ─────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig     = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log(`[stripe-webhook] received: ${event.type} (${event.id})`)

  try {
    const obj = event.data.object

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripe, supabase, obj)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, obj)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, obj)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, obj)
        break

      case 'invoice.paid':
        await handleInvoicePaid(stripe, supabase, obj)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabase, obj)
        break

      case 'invoice.upcoming':
        // Stripe fires this 7 days before renewal — no action needed currently
        console.log('[stripe-webhook] invoice.upcoming: noted for customer', obj.customer)
        break

      default:
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('[stripe-webhook] handler error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
