import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.slice(7))
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: caller } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (caller?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const { month, year } = req.body ?? {}
  if (!month || !year) return res.status(400).json({ error: 'month and year are required' })

  const { data: profiles } = await supabase.from('profiles').select('id')
  const users = profiles ?? []

  let backfilled = 0
  let generated  = 0

  for (const p of users) {
    // ── Backfill: assign recurring_group_id to untagged recurring rows ──
    for (const table of ['incomes', 'expenses']) {
      const { data: rows } = await supabase
        .from(table)
        .select('id, amount, category_id, description, date')
        .eq('user_id', p.id)
        .eq('is_recurring', true)
        .is('recurring_group_id', null)

      if (!rows?.length) continue

      const groups = new Map()
      for (const row of rows) {
        const day = new Date(row.date + 'T00:00:00Z').getUTCDate()
        const key = `${Number(row.amount).toFixed(2)}|${row.category_id ?? ''}|${(row.description ?? '').trim()}|${day}`
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key).push(row.id)
      }

      for (const ids of groups.values()) {
        const gid = crypto.randomUUID()
        await supabase.from(table).update({ recurring_group_id: gid }).in('id', ids).eq('user_id', p.id)
        backfilled += ids.length
      }
    }

    // ── Generate: project templates into the target month ──
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear  = month === 1 ? year - 1 : year
    const prevEnd   = lastDay(prevYear, prevMonth)
    const tFrom     = `${year}-${String(month).padStart(2, '0')}-01`
    const tTo       = lastDay(year, month)

    for (const table of ['incomes', 'expenses']) {
      const { data: source } = await supabase
        .from(table)
        .select('amount, description, category_id, date, recurring_group_id')
        .eq('user_id', p.id)
        .eq('is_recurring', true)
        .not('recurring_group_id', 'is', null)
        .lte('date', prevEnd)

      if (!source?.length) continue

      const templates = new Map()
      for (const row of source) {
        if (!templates.has(row.recurring_group_id)) templates.set(row.recurring_group_id, row)
      }

      for (const [gid, t] of templates) {
        const { data: existing } = await supabase
          .from(table).select('id')
          .eq('user_id', p.id).eq('recurring_group_id', gid)
          .gte('date', tFrom).lte('date', tTo)
          .maybeSingle()

        if (existing) continue

        const { error: insErr } = await supabase.from(table).insert({
          user_id:            p.id,
          amount:             t.amount,
          description:        t.description,
          category_id:        t.category_id,
          is_recurring:       true,
          recurring_group_id: gid,
          date:               projectDate(t.date, month, year),
        })

        if (!insErr) generated++
      }
    }
  }

  return res.status(200).json({
    ok: true,
    users:      users.length,
    backfilled,
    generated,
  })
}

function lastDay(year, month) {
  return new Date(year, month, 0).toISOString().split('T')[0]
}

function projectDate(sourceDateStr, targetMonth, targetYear) {
  const src = new Date(sourceDateStr + 'T00:00:00Z')
  const day = src.getUTCDate()
  const candidate = new Date(Date.UTC(targetYear, targetMonth - 1, day))
  if (candidate.getUTCMonth() !== targetMonth - 1) candidate.setUTCDate(0)
  return candidate.toISOString().split('T')[0]
}
