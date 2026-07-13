import { useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import { apiFetch } from "@/services/api";

const ROLE_PATH_MAP: Record<string, string> = {
  applicant: "/applicant",
  human_resources: "/human-resources",
  authorities: "/authority",
};

const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  applicant: ["/applicant"],
  human_resources: [
    "/human-resources",
    "/administrator",
    "/candidates",
    "/reports",
  ],
  authorities: ["/authority"],
};

const REDIRECTABLE_PUBLIC_PATHS = ["/", "/sign-up"];

function normalizePath(pathname: string): string {
  return pathname.toLowerCase().replace(/\/$/, "") || "/";
}

export function normalizeRole(role?: string): string | undefined {
  return role?.trim().toLowerCase() || undefined;
}

export function getRoleTargetPath(role?: string): string | undefined {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? ROLE_PATH_MAP[normalizedRole] : undefined;
}

function shouldRedirectToRole(role: string, pathname: string): boolean {
  const currentPath = normalizePath(pathname);
  const allowedPaths = ROLE_ALLOWED_PATHS[role] ?? [];

  return REDIRECTABLE_PUBLIC_PATHS.includes(currentPath) || !allowedPaths.includes(currentPath);
}

function redirectToRole(role: string, pathname: string, navigate: NavigateFunction) {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return;

  const targetPath = ROLE_PATH_MAP[normalizedRole];
  const currentPath = normalizePath(pathname);
  const allowedPaths = ROLE_ALLOWED_PATHS[normalizedRole] ?? [];

  if (allowedPaths.includes(currentPath)) return;

  if (targetPath && currentPath !== targetPath) {
    navigate(targetPath, { replace: true });
  }
}

export function useRoleRedirect(): void {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const phase = useRef(0);
  const resolvedClerkId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      phase.current = 0;
      resolvedClerkId.current = null;
      return;
    }

    const clerkId = user?.id;
    if (!clerkId) return;

    if (resolvedClerkId.current !== clerkId) {
      phase.current = 0;
      resolvedClerkId.current = clerkId;
    }

    const run = async () => {
      const role = normalizeRole(user?.publicMetadata?.role as string | undefined);

      if (role) {
        phase.current = 0;
        if (shouldRedirectToRole(role, location.pathname)) {
          redirectToRole(role, location.pathname, navigate);
        }
        return;
      }

      if (phase.current >= 2) return;

      if (phase.current === 0) {
        phase.current = 1;
        try {
          await user?.reload();
        } catch {
          // Clerk metadata may be temporarily unavailable.
        }
        return;
      }

      if (phase.current === 1) {
        phase.current = 2;
        try {
          const data = await apiFetch<{ role: string }>("/api/v1/users/sync-role", {
            method: "POST",
            body: JSON.stringify({ clerkUserId: clerkId }),
          });
          const syncedRole = normalizeRole(data.role);
          if (syncedRole && shouldRedirectToRole(syncedRole, location.pathname)) {
            redirectToRole(syncedRole, location.pathname, navigate);
          }
        } catch {
          // Sync failed; avoid retry loops in the WebView.
        }
      }
    };

    run();
  }, [isLoaded, isSignedIn, user, location.pathname, navigate]);
}