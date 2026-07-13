import RegisterForm from '../components/home/RegisterForm'
import { ArrowLeft } from 'lucide-react'

export default function SignUp() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#071429] via-[#0b2445] to-[#123b64] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <RegisterForm />
      </div>
    </main>
  )
}
