import { useState } from "react";
import { Show, UserButton } from "@clerk/react";
import { Button } from "../ui";
import SignInModal from "../home/SignInModal";

export default function Header() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <header className="bg-blue-950 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold">ATS-UCE</h1>

          <p className="text-sm text-slate-300">
            Teacher Recruitment Management System
          </p>
        </div>

        {/* Clerk Authentication */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSignInOpen(true)}
            >
              Sign In
            </Button>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </Show>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </header>
  );
}
