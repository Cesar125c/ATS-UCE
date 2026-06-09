import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/react'
import { Button } from '../ui'

export default function Header() {
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
            <SignInButton mode="modal">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button 
                variant="outline" 
                size="sm"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </Show>

        </div>
      </div>
    </header>
  )
}