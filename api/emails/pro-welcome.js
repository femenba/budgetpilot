import { Resend } from 'resend'

const FROM = 'BudgetPilot <support@budgetpilotapp.com>'
const SUPPORT = 'support@budgetpilotapp.com'
const APP_URL = 'https://budgetpilotapp.com'

function buildHtml(firstName) {
  const name = firstName || 'there'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to BudgetPilot Pro</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                BudgetPilot
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <p style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                Welcome to Pro, ${name}!
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                Your Pro plan is now active. You have full access to everything BudgetPilot has to offer.
              </p>

              <!-- Pro active badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 18px;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:#15803d;">
                      ✓ &nbsp;Pro is active on your account
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;">
                What's unlocked for you
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border-radius:10px;margin-bottom:8px;display:block;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">📊 &nbsp;Insights</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                      See your savings rate, top spending categories, and a 6-month balance trend at a glance.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border-radius:10px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">📄 &nbsp;Reports</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                      Deep-dive into monthly breakdowns and export your transactions to CSV anytime.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;border-radius:10px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">🎯 &nbsp;Budgets</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                      Set per-category monthly limits and track your progress with visual indicators.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Tips -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;">
                3 quick tips to get the most out of Pro
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 0 14px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="width:24px;height:24px;background:#0f172a;border-radius:50%;text-align:center;line-height:24px;">
                            <span style="font-size:12px;font-weight:700;color:#ffffff;">1</span>
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Add a few weeks of transactions first</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                            Insights and Reports are most useful once you have at least 2–3 weeks of data. The trends become meaningful quickly.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 14px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="width:24px;height:24px;background:#0f172a;border-radius:50%;text-align:center;line-height:24px;">
                            <span style="font-size:12px;font-weight:700;color:#ffffff;">2</span>
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Set budgets before the month starts</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                            Head to Budgets, set a limit for your top 3–5 categories, and let BudgetPilot alert you when you're getting close.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:12px;">
                          <div style="width:24px;height:24px;background:#0f172a;border-radius:50%;text-align:center;line-height:24px;">
                            <span style="font-size:12px;font-weight:700;color:#ffffff;">3</span>
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Export to CSV for your own records</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                            Under Reports, you can export any month as a CSV — useful for accountants, tax time, or just your own spreadsheet.
                          </p>
                        </td>
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

              <!-- Support -->
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Questions? Reply to this email or reach us at
                <a href="mailto:${SUPPORT}" style="color:#0f172a;font-weight:600;text-decoration:none;">${SUPPORT}</a>.
                We're happy to help.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                You're receiving this because you just upgraded to BudgetPilot Pro.<br />
                © ${new Date().getFullYear()} BudgetPilot · <a href="${APP_URL}/privacy" style="color:#94a3b8;">Privacy</a> · <a href="${APP_URL}/terms" style="color:#94a3b8;">Terms</a>
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

/**
 * Send the Pro welcome email.
 *
 * @param {string} email       - Recipient email address
 * @param {string} [firstName] - Recipient first name (falls back to "there")
 * @returns {Promise<void>}    - Resolves on success, rejects on hard failure
 */
export async function sendProWelcomeEmail(email, firstName) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to BudgetPilot Pro 🎉',
    html: buildHtml(firstName),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
