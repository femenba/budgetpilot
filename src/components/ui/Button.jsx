const variants = {
  primary:   'bg-ink hover:bg-brand-700 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-surface hover:bg-canvas text-ink border border-line shadow-sm hover:border-gray-300',
  danger:    'bg-accent-red hover:bg-red-600 text-white shadow-sm hover:shadow-md',
  ghost:     'text-dim hover:text-ink hover:bg-canvas',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center gap-2 font-semibold rounded-xl
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
