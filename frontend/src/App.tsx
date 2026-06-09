import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import Home from "./pages/Home";
import Authorities from "./pages/Authorities";
import Applicant from "./pages/Applicant";
import HumanResources from "./pages/HumanResources";

type Role = "applicant" | "human_resources" | "authorities";

const normalizePath = (pathname: string) =>
  pathname.toLowerCase().replace(/\/$/, "");

const getRoleRedirect = (role?: string) => {
  switch (role) {
    case "applicant":
      return "/applicant";
    case "human_resources":
      return "/human-resources";
    case "authorities":
      return "/authorities";
    default:
      return undefined;
  }
};

async function fetchRoleFromBackend(getToken: any): Promise<Role | null> {
  try {
    const token = await getToken();
    const res = await fetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token || "dev"}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.role as Role;
  } catch {
    return null;
  }
}

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { currentPath } = { currentPath: normalizePath(window.location.pathname) };
  const [backendRole, setBackendRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const role = user?.publicMetadata?.role as Role | undefined;
    if (role) {
      const targetPath = getRoleRedirect(role);
      if (targetPath && window.location.pathname !== targetPath) {
        window.location.replace(targetPath);
      }
      return;
    }

    fetchRoleFromBackend(getToken).then((fetchedRole) => {
      if (fetchedRole) {
        setBackendRole(fetchedRole);
        const targetPath = getRoleRedirect(fetchedRole);
        if (targetPath && window.location.pathname !== targetPath) {
          window.location.replace(targetPath);
        }
      }
    });
  }, [isLoaded, isSignedIn, currentPath, user]);

  if (currentPath === "/applicant") {
    return <Applicant />;
  }

  if (currentPath === "/human-resources") {
    return <HumanResources />;
  }

  if (currentPath === "/authorities") {
    return <Authorities />;
  }

  return <Home />;
}

export default App;
