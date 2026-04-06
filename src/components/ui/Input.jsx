export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <input
        className={`
          w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400
          placeholder:text-gray-300
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <select
        className={`
          w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-400
          disabled:bg-gray-50
          ${error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}
