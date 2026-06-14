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

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { user, isLoaded } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [isAssigningRole, setIsAssigningRole] = useState(false)

  // Handle OAuth after user is created
  useEffect(() => {
    if (!isLoaded || !user || isProcessing) return

    const processOAuthUser = async () => {
      try {
        setIsProcessing(true)

        // If user already has a role, they're already registered — just redirect
        const existingRole = user.publicMetadata?.role as string | undefined
        if (existingRole) {
          redirectByRole(existingRole)
          return
        }

        // Check if user has an OAuth provider
        const hasOAuthProvider = user.externalAccounts && user.externalAccounts.length > 0

        if (hasOAuthProvider) {
          const provider = user.externalAccounts[0].provider
          const email = user.emailAddresses?.[0]?.emailAddress

          // Microsoft + @uce.edu.ec -> Show role selection
          if (provider === 'oauth_microsoft' && email?.endsWith('@uce.edu.ec')) {
            setShowRoleSelection(true)
            setIsProcessing(false)
            return
          }

          // Other providers -> Auto-assign role
          const result = await handleOAuthUser(user)
          redirectByRole(result.role)
          return
        }

        // Fallback redirect (email/password sign-in with role already set)
        const role = user.publicMetadata?.role as string | undefined
        redirectByRole(role)
      } catch (error) {
        console.error('Error processing OAuth user:', error)
        setIsProcessing(false)
      }
    }

    processOAuthUser()
  }, [isLoaded, user, isProcessing])

  const redirectByRole = (role?: string) => {
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

  const handleRoleSelect = async (selectedRole: RoleOption) => {
    if (!user) return

    try {
      setIsAssigningRole(true)
      
      // Call backend to assign role
      const email = user?.emailAddresses?.[0]?.emailAddress || '';
      await assignUserRole(user.id, selectedRole, email)

      // Small delay to ensure backend updates Clerk
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect based on selected role
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
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Clerk SignIn */}
          <div className="p-6">
            <SignIn
              mode="embedded"
              afterSignInUrl="/"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0',
                },
              }}
              signUpUrl="/sign-up"
            />
          </div>
        </div>
      </div>

      {/* Role Selection Modal for Microsoft + @uce.edu.ec */}
      <SelectRoleModal
        isOpen={showRoleSelection}
        onRoleSelect={handleRoleSelect}
        isLoading={isAssigningRole}
      />
    </>
  )
}

