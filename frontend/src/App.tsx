import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/react";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Administrator from "./pages/Administrator";
import Applicant from "./pages/Applicant";
import HumanResources from "./pages/HumanResources";

const normalizePath = (pathname: string) =>
  pathname.toLowerCase().replace(/\/$/, "");

const getRoleRedirect = (role?: string) => {
  switch (role) {
    case "applicant":
      return "/applicant";
    case "human_resources":
      return "/human-resources";
    case "authorities":
      return "/administrator";
    default:
      return undefined;
  }
};

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [roleResolved, setRoleResolved] = useState(false);
  const currentPath = normalizePath(window.location.pathname);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || roleResolved) return;

    if (currentPath === "") {
      const clerkRole = user?.publicMetadata?.role as string | undefined;

      if (clerkRole) {
        const targetPath = getRoleRedirect(clerkRole);
        if (targetPath && window.location.pathname !== targetPath) {
          window.location.replace(targetPath);
        }
        setRoleResolved(true);
        return;
      }

      (async () => {
        try {
          const token = await getToken();
          const res = await fetch("/api/v1/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const targetPath = getRoleRedirect(data.role);
            if (targetPath && window.location.pathname !== targetPath) {
              window.location.replace(targetPath);
            }
          }
        } catch {
          // role not available — stay on home
        }
        setRoleResolved(true);
      })();
    }
  }, [isLoaded, isSignedIn, currentPath, user, getToken, roleResolved]);

  if (currentPath === "/sign-up") {
    return <SignUp />;
  }

  if (currentPath === "/applicant") {
    return <Applicant />;
  }

  if (currentPath === "/human-resources") {
    return <HumanResources />;
  }

  if (currentPath === "/administrator") {
    return <Administrator />;
  }

  return <Home />;
}

export default App;
