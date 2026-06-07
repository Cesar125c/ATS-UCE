import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  fullWidth?: boolean
}

export default function Input({
  label,
  error,
  helpText,
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`
          w-full px-4 py-2 border border-slate-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
          transition placeholder-slate-400
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
    </div>
  )
}
