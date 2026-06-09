import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/react'
<<<<<<< HEAD
import { Button } from '../ui'

export default function Header() {
  return (
    <header className="bg-blue-950 text-white shadow-lg">
=======

export default function Header() {
  return (
    <header className="bg-slate-900 text-white shadow-lg">
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
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
<<<<<<< HEAD
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
=======
              <button className="bg-cyan-500 hover:bg-cyan-600 px-5 py-2 rounded-xl font-semibold transition">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white px-5 py-2 rounded-xl font-semibold transition">
                Sign Up
              </button>
>>>>>>> 26642c6e8ba0b7939a0cdf07e40ff879e1be1b5b
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