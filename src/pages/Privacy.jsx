import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Information We Collect',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Personal information (name, email address)</li>
        <li>Financial data entered by the user (income, expenses)</li>
        <li>Usage data (how you use the app)</li>
        <li>Payment information (processed securely via Stripe — we do NOT store card details)</li>
      </ul>
    ),
  },
  {
    title: '2. How We Use Your Information',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Provide and improve our services</li>
        <li>Manage your account</li>
        <li>Process payments</li>
        <li>Communicate with you (support, updates)</li>
      </ul>
    ),
  },
  {
    title: '3. Data Storage and Security',
    body: (
      <p>
        Your data is stored securely using industry-standard practices. We take appropriate
        measures to protect your data from unauthorized access.
      </p>
    ),
  },
  {
    title: '4. Third-Party Services',
    body: (
      <>
        <p className="mb-2">We use trusted third parties:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Stripe (payment processing)</li>
          <li>Hosting providers (e.g. Vercel)</li>
        </ul>
        <p className="mt-2">
          These providers process data in accordance with their own privacy policies.
        </p>
      </>
    ),
  },
  {
    title: '5. Your Rights',
    body: (
      <>
        <p className="mb-2">You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent</li>
        </ul>
        <p className="mt-2">
          To do so, contact:{' '}
          <a href="mailto:support@budgetpilotapp.com" className="text-brand-600 hover:underline">
            support@budgetpilotapp.com
          </a>
        </p>
      </>
    ),
  },
  {
    title: '6. Cookies',
    body: <p>We may use cookies to improve user experience and analytics.</p>,
  },
  {
    title: '7. Changes to This Policy',
    body: (
      <p>
        We may update this policy from time to time. Changes will be posted on this page.
      </p>
    ),
  },
  {
    title: '8. Contact',
    body: (
      <p>
        If you have any questions:{' '}
        <a href="mailto:support@budgetpilotapp.com" className="text-brand-600 hover:underline">
          support@budgetpilotapp.com
        </a>
      </p>
    ),
  },
]

export default function Privacy() {
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
            <Link to="/terms" className="text-gray-500 hover:text-gray-800 transition-colors">
              Terms
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
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mt-2">Last updated: April 2026</p>
          </div>

          <p className="text-gray-700 mb-8">
            Welcome to BudgetPilot ("we", "our", "us"). We respect your privacy and are
            committed to protecting your personal data.
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
