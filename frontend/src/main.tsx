import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ClerkProvider } from '@clerk/react'

import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const app = (
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-lg text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Configuración incompleta</h1>
          <p className="text-slate-600 leading-relaxed">
            Falta la variable de entorno <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code>. Agrega esta clave en tu archivo <code className="font-mono">.env</code> y reinicia el servidor de desarrollo.
          </p>
        </div>
      </div>
    )}
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(app)