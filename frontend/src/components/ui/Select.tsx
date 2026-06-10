import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helpText?: string
  options: Array<{ value: string; label: string }>
  fullWidth?: boolean
}

export default function Select({
  label,
  error,
  helpText,
  options,
  fullWidth = true,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={`
          w-full px-4 py-2 border border-slate-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
          transition bg-white
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className || ''}
        `}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helpText}</p>
      )}
    </div>
  )
}
