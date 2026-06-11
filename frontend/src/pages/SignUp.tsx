import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import RegisterForm from '../components/home/RegisterForm'

export default function SignUp() {
  return (
    <div className="bg-slate-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <RegisterForm />
      </main>

      <Footer />
    </div>
  )
}
