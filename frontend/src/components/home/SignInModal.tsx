import { useState, useEffect } from 'react'
import { SignIn } from '@clerk/react'
import { useUser } from '@clerk/react'
import { handleOAuthUser, assignUserRole } from '@/services/userService'
import SelectRoleModal from './SelectRoleModal'
import type { RoleOption } from './SelectRoleModal'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

function redirectByRole(role?: string) {
  if (role === 'applicant') {
    window.location.assign('/applicant')
  } else if (role === 'human_resources') {
    window.location.assign('/human-resources')
  } else if (role === 'authorities') {
    window.location.assign('/authority')
  } else {
    window.location.assign('/')
  }
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { user, isLoaded } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [isAssigningRole, setIsAssigningRole] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user || isProcessing) return

    const processOAuthUser = async () => {
      try {
        setIsProcessing(true)
        const existingRole = user.publicMetadata?.role as string | undefined
        if (existingRole) {
          redirectByRole(existingRole)
          return
        }
        const hasOAuthProvider = user.externalAccounts && user.externalAccounts.length > 0
        if (hasOAuthProvider) {
          const provider = user.externalAccounts[0].provider
          const email = user.emailAddresses?.[0]?.emailAddress
          if (provider === 'microsoft' && email?.endsWith('@uce.edu.ec')) {
            setShowRoleSelection(true)
            setIsProcessing(false)
            return
          }
          const result = await handleOAuthUser(user)
          redirectByRole(result.role)
          return
        }
        const role = user.publicMetadata?.role as string | undefined
        redirectByRole(role)
      } catch (error) {
        console.error('Error processing OAuth user:', error)
        setIsProcessing(false)
      }
    }

    processOAuthUser()
  }, [isLoaded, user, isProcessing])

  const handleRoleSelect = async (selectedRole: RoleOption) => {
    if (!user) return
    try {
      setIsAssigningRole(true)
      const email = user?.emailAddresses?.[0]?.emailAddress || '';
      await assignUserRole(user.id, selectedRole, email)
      await new Promise(resolve => setTimeout(resolve, 500))
      redirectByRole(selectedRole)
    } catch (error) {
      console.error('Error assigning role:', error)
      setIsAssigningRole(false)
      setShowRoleSelection(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            <SignIn
              fallbackRedirectUrl="/"
              signUpUrl="/sign-up"
            />
          </div>
        </div>
      </div>

      <SelectRoleModal
        isOpen={showRoleSelection}
        onRoleSelect={handleRoleSelect}
        isLoading={isAssigningRole}
      />
    </>
  )
}
