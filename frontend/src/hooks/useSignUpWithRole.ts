import { useState } from 'react'
import { useSignUp } from '@clerk/react'
import { createUserWithRole } from '@/services/userService'

export function useSignUpWithRole() {
  const { signUp } = useSignUp()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signUpUser = async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'applicant' | 'human_resources' | 'authorities'
  }) => {
    try {
      setError(null)
      setIsLoading(true)
      const result = await createUserWithRole(signUp, data)
      return result
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error creating account'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { signUpUser, error, isLoading }
}
