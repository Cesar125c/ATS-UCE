import { useRoleRedirect } from "./hooks/useRoleRedirect";
import ApiInitializer from "./components/ApiInitializer";
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
