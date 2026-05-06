import { Resend } from 'resend'

const FROM    = 'BudgetPilot <support@budgetpilotapp.com>'
const SUPPORT = 'support@budgetpilotapp.com'
const APP_URL = 'https://budgetpilotapp.com'

function formatDate(ts) {
  if (!ts) return null
  return new Date(ts * 1000).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function buildHtml(firstName, periodEnd) {
  const name    = firstName || 'there'
  const nextDate = formatDate(periodEnd)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BudgetPilot Pro renewed</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">BudgetPilot</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                Pro renewed, ${name}.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                Your BudgetPilot Pro subscription has been successfully renewed. You have continued access to everything Pro includes.
              </p>

              <!-- Receipt badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;width:100%;">
                <tr>
                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#15803d;">✓ &nbsp;Payment successful</p>
                          <p style="margin:0;font-size:13px;color:#16a34a;">BudgetPilot Pro · £5.00</p>
                        </td>
                        ${nextDate ? `<td style="text-align:right;">
                          <p style="margin:0;font-size:11px;color:#6b7280;">Next renewal</p>
                          <p style="margin:2px 0 0;font-size:13px;font-weight:600;color:#0f172a;">${nextDate}</p>
                        </td>` : ''}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#0f172a;border-radius:10px;">
                    <a href="${APP_URL}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Open BudgetPilot →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Want to manage your subscription? Visit your
                <a href="${APP_URL}/plans" style="color:#0f172a;font-weight:600;text-decoration:none;">billing settings</a>.
                Questions? Email us at
                <a href="mailto:${SUPPORT}" style="color:#0f172a;font-weight:600;text-decoration:none;">${SUPPORT}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                You're receiving this because your BudgetPilot Pro subscription renewed.<br />
                © ${new Date().getFullYear()} BudgetPilot ·
                <a href="${APP_URL}/privacy" style="color:#94a3b8;">Privacy</a> ·
                <a href="${APP_URL}/terms" style="color:#94a3b8;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendRenewalEmail(email, firstName, periodEnd) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: 'Your BudgetPilot Pro subscription has been renewed',
    html:    buildHtml(firstName, periodEnd),
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
