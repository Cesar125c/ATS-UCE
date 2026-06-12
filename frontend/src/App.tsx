import { useRoleRedirect } from "./hooks/useRoleRedirect";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Authorities from "./pages/Authorities";
import Applicant from "./pages/Applicant";
import HumanResources from "./pages/HumanResources";

const normalizePath = (pathname: string) =>
  pathname.toLowerCase().replace(/\/$/, "");

function App() {
  useRoleRedirect();
  const currentPath = normalizePath(window.location.pathname);

  if (currentPath === "/sign-up") {
    return <SignUp />;
  }

  if (currentPath === "/applicant") {
    return <Applicant />;
  }

  if (currentPath === "/human-resources") {
    return <HumanResources />;
  }

  if (currentPath === "/administrator" || currentPath === "/authority") {
    return <Authorities />;
  }

  return <Home />;
}

export default App;
