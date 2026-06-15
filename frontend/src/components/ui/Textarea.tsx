import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  fullWidth?: boolean
}

export default function Textarea({
  label,
  error,
  helpText,
  fullWidth = true,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={`
          w-full px-4 py-2 border border-slate-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
          transition placeholder-slate-400 resize-vertical
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
