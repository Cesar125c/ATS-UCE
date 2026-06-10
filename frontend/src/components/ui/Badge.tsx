import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'cyan' | 'blue' | 'green' | 'red' | 'yellow'
  size?: 'sm' | 'md'
}

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
  }

  return (
    <span className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full font-semibold inline-block`}>
      {children}
    </span>
  )
}
