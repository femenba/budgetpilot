import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Use of Service',
    body: (
      <p>
        BudgetPilot provides tools for personal financial tracking and analysis. You agree
        to use the service only for lawful purposes.
      </p>
    ),
  },
  {
    title: '2. Account Responsibility',
    body: (
      <>
        <p className="mb-2">You are responsible for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Maintaining the confidentiality of your account</li>
          <li>All activity under your account</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Payments and Subscriptions',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Payments are processed via Stripe</li>
        <li>Subscriptions may renew automatically unless cancelled</li>
        <li>Prices may change with notice</li>
      </ul>
    ),
  },
  {
    title: '4. No Financial Advice',
    body: (
      <p>
        BudgetPilot is a tool for tracking finances. We do NOT provide financial,
        investment, or legal advice.
      </p>
    ),
  },
  {
    title: '5. Limitation of Liability',
    body: (
      <>
        <p className="mb-2">We are not liable for:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Financial decisions made using the app</li>
          <li>Data loss or service interruptions</li>
          <li>Indirect or consequential damages</li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Termination',
    body: (
      <p>We may suspend or terminate accounts that violate these terms.</p>
    ),
  },
  {
    title: '7. Modifications',
    body: (
      <p>
        We may update these Terms at any time. Continued use means acceptance of changes.
      </p>
    ),
  },
  {
    title: '8. Governing Law',
    body: (
      <p>These terms are governed by the laws of the United Kingdom.</p>
    ),
  },
  {
    title: '9. Contact',
    body: (
      <p>
        For support:{' '}
        <a href="mailto:support@budgetpilotapp.com" className="text-brand-600 hover:underline">
          support@budgetpilotapp.com
        </a>
      </p>
    ),
  },
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">BudgetPilot</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-800 transition-colors">
              Privacy
            </Link>
            <Link
              to="/login"
              className="px-4 py-1.5 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 sm:px-10 py-10">
          <div className="mb-8 pb-6 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Legal</p>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: April 2026</p>
          </div>

          <p className="text-gray-700 mb-8">
            Welcome to BudgetPilot. By accessing or using our service, you agree to these Terms.
          </p>

          <div className="flex flex-col gap-8">
            {sections.map(({ title, body }) => (
              <section key={title}>
                <h2 className="text-base font-semibold text-gray-900 mb-2">{title}</h2>
                <div className="text-sm text-gray-600 leading-relaxed">{body}</div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} BudgetPilot &mdash;{' '}
          <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
          {' · '}
          <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
        </p>
      </footer>
    </div>
  )
}
