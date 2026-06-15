import type { InputHTMLAttributes } from 'react'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export default function Radio({
  label,
  error,
  helpText,
  className,
  id,
  ...props
}: RadioProps) {
  const radioId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={radioId}
          type="radio"
          className={`
            w-4 h-4 border border-slate-300 rounded-full 
            focus:outline-none focus:ring-2 focus:ring-cyan-500
            cursor-pointer
            ${error ? 'border-red-500' : ''}
            ${className || ''}
          `}
          {...props}
        />
      </div>

      {label && (
        <div className="ml-3 text-sm flex-1">
          <label htmlFor={radioId} className="font-medium text-slate-700 cursor-pointer">
            {label}
          </label>

          {error && (
            <p className="text-red-600 text-xs mt-1">{error}</p>
          )}

          {helpText && !error && (
            <p className="text-slate-500 text-xs mt-1">{helpText}</p>
          )}
        </div>
      )}
    </div>
  )
}
