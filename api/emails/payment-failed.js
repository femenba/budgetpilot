import { Resend } from 'resend'

const FROM    = 'BudgetPilot <support@budgetpilotapp.com>'
const SUPPORT = 'support@budgetpilotapp.com'
const APP_URL = 'https://budgetpilotapp.com'

function buildHtml(firstName) {
  const name = firstName || 'there'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment failed — action required</title>
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
                Action required, ${name}.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                We were unable to process your payment for BudgetPilot Pro. Your subscription is at risk of being cancelled if we can't collect payment.
              </p>

              <!-- Alert badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;width:100%;">
                <tr>
                  <td style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#dc2626;">⚠ &nbsp;Payment failed</p>
                    <p style="margin:0;font-size:13px;color:#ef4444;line-height:1.5;">
                      Your card was declined. Please update your payment method to continue enjoying Pro.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;">How to fix this</p>
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
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Update your payment method</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                            Visit your billing settings to add a new card or update the existing one.
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
                            <span style="font-size:12px;font-weight:700;color:#ffffff;">2</span>
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;font-weight:600;color:#0f172a;">Stripe will retry automatically</p>
                          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
                            Once updated, Stripe will attempt payment again. No action needed after that.
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
                  <td style="background:#dc2626;border-radius:10px;">
                    <a href="${APP_URL}/plans" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Update payment method →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Having trouble? Reply to this email or contact us at
                <a href="mailto:${SUPPORT}" style="color:#0f172a;font-weight:600;text-decoration:none;">${SUPPORT}</a>.
                We're happy to help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                You're receiving this because a payment for your BudgetPilot Pro subscription failed.<br />
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

export async function sendPaymentFailedEmail(email, firstName) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: 'Action required: payment failed for BudgetPilot Pro',
    html:    buildHtml(firstName),
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
