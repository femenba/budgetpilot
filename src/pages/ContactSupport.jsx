import { HelpCircle, Mail, MessageSquare } from 'lucide-react'
import { Layout } from '../components/layout/Layout'

const SUPPORT_EMAIL = 'support@budgetpilotapp.com'

const FAQS = [
  {
    q: 'How do I upgrade to Pro?',
    a: "Go to the Plans page and click Upgrade to Pro. You'll be redirected to a secure Stripe checkout.",
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: "Yes. Open Plans, click Manage Billing, and cancel from your billing portal. You'll keep Pro access until the end of the billing period.",
  },
  {
    q: 'How do recurring transactions work?',
    a: 'When you add a transaction with Recurring enabled, BudgetPilot automatically creates it for the next 12 months so it appears in each future month.',
  },
  {
    q: "I didn't receive my renewal email. What do I do?",
    a: "Check your spam folder first. If it's not there, contact us at support@budgetpilotapp.com and we'll resend it.",
  },
  {
    q: 'My payment failed. What happens next?',
    a: 'Stripe will retry automatically. You will receive an email with a link to update your payment method. Your Pro access continues during retries.',
  },
  {
    q: 'How do I export my transactions?',
    a: 'Go to Reports (Pro only) and use the Export to CSV button. You can filter by month before exporting.',
  },
]

export default function ContactSupport() {
  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0">
            <HelpCircle size={17} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Contact Support</h1>
            <p className="text-xs text-dim">We typically reply within 24 hours</p>
          </div>
        </div>

        {/* Contact card */}
        <div className="bg-surface rounded-2xl border border-line p-5 space-y-3">
          <p className="text-sm font-semibold text-ink">Get in touch</p>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-canvas hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center shrink-0">
              <Mail size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Email support</p>
              <p className="text-xs text-dim">{SUPPORT_EMAIL}</p>
            </div>
          </a>

          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-canvas">
            <div className="w-9 h-9 rounded-xl bg-line flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-dim" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Response time</p>
              <p className="text-xs text-dim">Mon-Fri, usually within 24 hours</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-surface rounded-2xl border border-line p-5">
          <p className="text-sm font-semibold text-ink mb-4">Frequently asked questions</p>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <p className="text-sm font-semibold text-ink mb-1">{q}</p>
                <p className="text-sm text-dim leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
