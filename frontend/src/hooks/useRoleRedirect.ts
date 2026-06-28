import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { apiFetch } from "@/services/api";

const ROLE_PATH_MAP: Record<string, string> = {
  applicant: '/applicant',
  human_resources: '/human-resources',
  authorities: '/authority',
}

function redirectToRole(role: string) {
  const targetPath = ROLE_PATH_MAP[role];
  if (targetPath && window.location.pathname !== targetPath) {
    window.location.replace(targetPath);
  }
}

export function useRoleRedirect(): void {
  const { isLoaded, isSignedIn, user } = useUser()
  const phase = useRef(0)
  const resolvedClerkId = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      phase.current = 0
      resolvedClerkId.current = null
      return
    }

    const clerkId = user?.id
    if (!clerkId) return

    const run = async () => {
      const role = user?.publicMetadata?.role as string | undefined

      if (role) {
        phase.current = 0
        redirectToRole(role)
        return
      }

      // Already gave up for this user — don't retry
      if (phase.current >= 2) return

      // Phase 0: reload once in case metadata just arrived
      if (phase.current === 0) {
        phase.current = 1
        try { await user?.reload() } catch { /* CDN may be down */ }
        return
      }

      // Phase 1: sync from DB to Clerk, then redirect using the returned role
      if (phase.current === 1) {
        phase.current = 2
        try {
          const data = await apiFetch<{ role: string }>('/api/v1/users/sync-role', {
            method: 'POST',
            body: JSON.stringify({ clerkUserId: clerkId }),
          });
          if (data.role) {
            redirectToRole(data.role)
          }
        } catch {
          // sync failed — give up, no more retries
        }
        return
      }
    }

    run()
  }, [isLoaded, isSignedIn, user])
}
