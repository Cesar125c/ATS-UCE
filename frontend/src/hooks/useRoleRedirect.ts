import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/react'

const ROLE_PATH_MAP: Record<string, string> = {
  applicant: '/applicant',
  human_resources: '/human-resources',
  authorities: '/authority',
}

export function useRoleRedirect(): void {
  const { isLoaded, isSignedIn, user } = useUser()
  const [reloadTick, setReloadTick] = useState(0)
  const hasReloaded = useRef(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      hasReloaded.current = false
      return
    }

    const run = async () => {
      const role = user?.publicMetadata?.role as string | undefined

      if (role) {
        hasReloaded.current = false

        const targetPath = ROLE_PATH_MAP[role]
        if (targetPath) {
          const currentPath = window.location.pathname
          if (currentPath !== targetPath) {
            window.location.replace(targetPath)
          }
        }
        return
      }

      if (!hasReloaded.current) {
        hasReloaded.current = true
        try {
          await user?.reload()
        } catch {
          // reload failed
        }
        setReloadTick((t) => t + 1)
        return
      }

      // Role still missing after reload — warn but don't block the user
      console.warn('useRoleRedirect: publicMetadata.role is not set for this user')
    }

    run()
  }, [isLoaded, isSignedIn, user, reloadTick])
}
