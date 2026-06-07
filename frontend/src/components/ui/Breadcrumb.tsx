import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
            )}

            {item.href ? (
              <a
                href={item.href}
                className="text-cyan-600 hover:text-cyan-700 font-medium transition"
              >
                {item.label}
              </a>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-cyan-600 hover:text-cyan-700 font-medium transition"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-slate-700 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
