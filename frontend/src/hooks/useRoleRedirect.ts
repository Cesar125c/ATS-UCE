import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { apiFetch } from "@/services/api";

const ROLE_PATH_MAP: Record<string, string> = {
  applicant: '/applicant',
  human_resources: '/human-resources',
  authorities: '/authority',
}

export function useRoleRedirect(): void {
  const { isLoaded, isSignedIn, user } = useUser()
  const [reloadTick, setReloadTick] = useState(0)
  const phase = useRef(0)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      phase.current = 0
      return
    }

    const run = async () => {
      const role = user?.publicMetadata?.role as string | undefined
      const clerkId = user?.id

      if (role) {
        phase.current = 0

        const targetPath = ROLE_PATH_MAP[role]
        if (targetPath) {
          const currentPath = window.location.pathname
          if (currentPath !== targetPath) {
            window.location.replace(targetPath)
          }
        }
        return
      }

      // Phase 0 → first reload attempt
      if (phase.current === 0) {
        phase.current = 1
        try {
          await user?.reload()
        } catch {
          // reload failed
        }
        setReloadTick((t) => t + 1)
        return
      }

      // Phase 1 → reload didn't help, try syncing from DB to Clerk
      if (phase.current === 1 && clerkId) {
        phase.current = 2
        console.log('sync-role: calling with clerkUserId =', clerkId)
        try {
          const data = await apiFetch<Record<string, unknown>>('/api/v1/users/sync-role', {
            method: 'POST',
            body: JSON.stringify({ clerkUserId: clerkId }),
          });
          console.log('sync-role response: 200', data)
        } catch {
          // sync failed
        }
        try {
          await user?.reload()
        } catch {
          // reload failed
        }
        setReloadTick((t) => t + 1)
        return
      }

      // Phase 2+ → gave up
      console.warn('useRoleRedirect: publicMetadata.role is not set for this user')
    }

    run()
  }, [isLoaded, isSignedIn, user, reloadTick])
}
