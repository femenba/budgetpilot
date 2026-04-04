import { FileText } from 'lucide-react'
import { Layout } from '../components/layout/Layout'

export default function Reports() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <FileText size={18} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reports</h1>
            <p className="text-xs text-gray-400">Monthly summaries &amp; exports</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 text-sm">
          Reports coming soon.
        </div>
      </div>
    </Layout>
  )
}
