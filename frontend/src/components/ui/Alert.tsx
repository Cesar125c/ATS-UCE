import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  children: ReactNode
  onClose?: () => void
  dismissible?: boolean
}

export default function Alert({
  type = 'info',
  title,
  children,
  onClose,
  dismissible = true,
}: AlertProps) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-500',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
      Icon: XCircle,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      Icon: Info,
    },
  }

  const style = styles[type]
  const Icon = style.Icon

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex gap-3`}>
      <Icon className={`${style.icon} flex-shrink-0 h-5 w-5 mt-0.5`} />

      <div className="flex-1">
        {title && (
          <h3 className={`font-semibold ${style.text}`}>{title}</h3>
        )}

        <div className={`${title ? 'mt-1' : ''} ${style.text}`}>
          {children}
        </div>
      </div>

      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.icon} hover:opacity-70 transition`}
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
