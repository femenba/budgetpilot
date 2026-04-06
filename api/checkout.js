import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email } = req.body ?? {}
  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email are required' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const origin = req.headers.origin || `https://${req.headers.host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
