const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:border-gray-300',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
  ghost:     'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  purple:    'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md',
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
        focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
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
