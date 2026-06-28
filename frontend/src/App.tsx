import { useUser } from "@clerk/react";
import { useRoleRedirect } from "./hooks/useRoleRedirect";
import ApiInitializer from "./components/ApiInitializer";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Authorities from "./pages/Authorities";
import Applicant from "./pages/Applicant";
import HumanResources from "./pages/HumanResources";

const normalizePath = (pathname: string) =>
  pathname.toLowerCase().replace(/\/$/, "");

const ROLE_PATH_MAP: Record<string, string> = {
  applicant: "/applicant",
  human_resources: "/human-resources",
  authorities: "/authority",
};

const PATH_ROLE_MAP: Record<string, string> = {
  "/applicant": "applicant",
  "/human-resources": "human_resources",
  "/authority": "authorities",
  "/administrator": "authorities",
};

function App() {
  useRoleRedirect();
  const { isLoaded, isSignedIn, user } = useUser();
  const currentPath = normalizePath(window.location.pathname);
  const expectedRole = PATH_ROLE_MAP[currentPath];

  // Role-gated pages: block render until we confirm the user has the right role
  if (expectedRole && isLoaded && isSignedIn) {
    const userRole = user?.publicMetadata?.role as string | undefined;
    if (userRole && userRole !== expectedRole) {
      const target = ROLE_PATH_MAP[userRole] || "/";
      if (currentPath !== normalizePath(target)) {
        window.location.replace(target);
      }
      return null;
    }
    if (!userRole) {
      // Metadata still loading — show nothing, useRoleRedirect will handle it
      return null;
    }
  }

  return (
    <>
      <ApiInitializer />
      {currentPath === "/sign-up" && <SignUp />}
      {currentPath === "/applicant" && <Applicant />}
      {currentPath === "/human-resources" && <HumanResources />}
      {(currentPath === "/administrator" || currentPath === "/authority") && <Authorities />}
      {!["/sign-up", "/applicant", "/human-resources", "/administrator", "/authority"].includes(currentPath) && <Home />}
    </>
  );
}

export default App;
