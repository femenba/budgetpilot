export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">{label}</label>
      )}
      <input
        className={`
          w-full px-3.5 py-2.5 rounded-xl border text-sm bg-surface
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink
          placeholder:text-gray-400
          disabled:bg-canvas disabled:text-dim
          ${error ? 'border-accent-red bg-red-50/20' : 'border-line hover:border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-accent-red font-medium">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">{label}</label>
      )}
      <select
        className={`
          w-full px-3.5 py-2.5 rounded-xl border text-sm bg-surface
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink
          disabled:bg-canvas
          ${error ? 'border-accent-red' : 'border-line hover:border-gray-300'}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-accent-red font-medium">{error}</p>}
    </div>
  )
}
