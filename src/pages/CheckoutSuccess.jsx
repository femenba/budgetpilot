import { CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">You're on Pro!</h1>
        <p className="text-sm text-gray-500 font-medium mb-6">
          Your subscription is active. All Pro features are now unlocked.
        </p>
        <Link
          to="/"
          className="block w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
