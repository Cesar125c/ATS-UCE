import { useLocation } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useRoleRedirect } from "./hooks/useRoleRedirect";
import ApiInitializer from "./components/ApiInitializer";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Authorities from "./pages/Authorities";
import Applicant from "./pages/Applicant";
import HumanResources from "./pages/HumanResources";
import Candidates from "./pages/Candidates";
import Reports from "./pages/Reports";
import Administration from "./pages/Administrator";

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
  "/administrator": "human_resources",
  "/candidates": "human_resources",
  "/reports": "human_resources",
};

function App() {
  useRoleRedirect();
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);
  const expectedRole = PATH_ROLE_MAP[currentPath];

  // Redirect if user has a different role than the page they're trying to access.
  if (expectedRole && isLoaded && isSignedIn) {
    const userRole = user?.publicMetadata?.role as string | undefined;
    if (userRole && userRole !== expectedRole) {
      const target = ROLE_PATH_MAP[userRole] || "/";
      if (currentPath !== normalizePath(target)) {
        window.location.replace(target);
      }
      return null;
    }
  }

  const knownPaths = ["/sign-up", "/applicant", "/human-resources", "/administrator", "/authority", "/candidates", "/reports"];

  return (
    <>
      <ApiInitializer />
      {currentPath === "/sign-up" && <SignUp />}
      {currentPath === "/applicant" && <Applicant />}
      {currentPath === "/human-resources" && <HumanResources />}
      {currentPath === "/candidates" && <Candidates />}
      {currentPath === "/reports" && <Reports />}
      {currentPath === "/administrator" && <Administration />}
      {currentPath === "/authority" && <Authorities />}
      {!knownPaths.includes(currentPath) && <Home />}
    </>
  );
}

export default App;
