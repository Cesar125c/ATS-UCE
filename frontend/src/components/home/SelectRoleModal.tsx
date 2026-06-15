import { useState } from 'react'
import { Button, Card } from '../ui'

export type RoleOption = 'applicant' | 'human_resources' | 'authorities'

interface SelectRoleModalProps {
  isOpen: boolean
  onRoleSelect: (role: RoleOption) => void
  isLoading?: boolean
}

const ROLE_CONFIG = {
  applicant: {
    label: 'Applicant',
    description: 'Apply for teaching positions',
    icon: '👤',
  },
  human_resources: {
    label: 'Human Resources',
    description: 'Manage recruitment process and candidates',
    icon: '👥',
  },
  authorities: {
    label: 'Authorities',
    description: 'Review and approve applications',
    icon: '✓',
  },
}

export default function SelectRoleModal({
  isOpen,
  onRoleSelect,
  isLoading = false,
}: SelectRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="rounded-3xl shadow-2xl w-full max-w-2xl p-10 mx-4">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-slate-800">Select Your Role</h3>
          <p className="text-slate-500 mt-2">
            Choose how you'll use the ATS-UCE platform
          </p>
        </div>

        {/* Role Options */}
        <div className="space-y-4 mb-8">
          {(Object.keys(ROLE_CONFIG) as RoleOption[]).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedRole === role
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{ROLE_CONFIG[role].icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">
                    {ROLE_CONFIG[role].label}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {ROLE_CONFIG[role].description}
                  </p>
                </div>
                {selectedRole === role && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={!selectedRole || isLoading}
            isLoading={isLoading}
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  )
}
