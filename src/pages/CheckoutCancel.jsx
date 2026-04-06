import { XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <XCircle size={32} className="text-gray-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Checkout cancelled</h1>
        <p className="text-sm text-gray-500 font-medium mb-6">
          No charges were made. You can upgrade anytime from the Plans page.
        </p>
        <Link
          to="/plans"
          className="block w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-sm"
        >
          Back to Plans
        </Link>
      </div>
    </div>
  )
}
