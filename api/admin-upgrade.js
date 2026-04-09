import { createClient } from '@supabase/supabase-js'
import { sendProWelcomeEmail } from './emails/pro-welcome.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = authHeader.slice(7)

  // Use service role for all DB operations so RLS doesn't interfere.
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Verify the caller is a real, authenticated admin.
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { userId, newPlan } = req.body ?? {}
  const plan = newPlan
  if (!userId || !plan) {
    return res.status(400).json({ error: 'Missing userId or newPlan' })
  }

  // Fetch the target user's current state before updating.
  const { data: target, error: fetchError } = await supabase
    .from('profiles')
    .select('plan, email, first_name')
    .eq('id', userId)
    .single()

  if (fetchError || !target) {
    return res.status(404).json({ error: 'User not found' })
  }

  const wasAlreadyPro = target.plan === 'pro'

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('id', userId)

  if (updateError) {
    console.error('[admin-upgrade] failed to update plan:', updateError.message)
    return res.status(500).json({ error: updateError.message })
  }

  console.log(`[admin-upgrade] set plan=${plan} for user ${userId}`)

  // Send welcome email only on the first free → pro upgrade.
  if (plan === 'pro' && !wasAlreadyPro && target.email) {
    try {
      await sendProWelcomeEmail(target.email, target.first_name)
      console.log('[admin-upgrade] pro welcome email sent to:', target.email)
    } catch (emailErr) {
      // Non-fatal — the plan update succeeded; log and continue.
      console.error('[admin-upgrade] welcome email failed:', emailErr.message)
    }
  }

  return res.status(200).json({ ok: true })
}
