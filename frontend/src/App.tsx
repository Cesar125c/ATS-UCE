import { useEffect } from "react";
import { useUser } from "@clerk/react";
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
  const currentPath = normalizePath(window.location.pathname);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (currentPath === "") {
      const role = user?.publicMetadata?.role as string | undefined;
      const targetPath = getRoleRedirect(role);
      if (targetPath && window.location.pathname !== targetPath) {
        window.location.replace(targetPath);
      }
    }
  }, [isLoaded, isSignedIn, currentPath, user]);

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
