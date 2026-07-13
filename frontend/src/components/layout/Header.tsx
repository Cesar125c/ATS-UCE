import { useState } from "react";
import { Show, UserButton, useClerk } from "@clerk/react";
import { Button } from "../ui";
import SignInModal from "../home/SignInModal";
import { GraduationCap } from "lucide-react";

export default function Header() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071429]/95 text-white shadow-lg backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        <a href="#inicio" className="flex min-w-0 items-center gap-3" aria-label="ATS-UCE home">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500"><GraduationCap size={22} /></span>
          <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">ATS-UCE</h1>
          <p className="hidden sm:block text-xs text-slate-300">
            Teacher Recruitment Management System
          </p>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-300" aria-label="Main navigation">
          <a className="hover:text-white transition" href="#inicio">Home</a>
          <a className="hover:text-white transition" href="#registro">Registration</a>
          <a className="hover:text-white transition" href="#beneficios">Benefits</a>
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsSignInOpen(true)}
            >
              Sign in
            </Button>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </Show>
        </div>
      </div>

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </header>
  );
}
