import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import { ClerkProvider } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "./App.tsx";
import "./index.css";
import { queryClient } from "./lib/queryClient";
import { useSocket } from "./hooks/useSocket";

function SocketInitializer() {
  useSocket();
  return null;
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = (
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <QueryClientProvider client={queryClient}>
          <SocketInitializer />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-lg text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Incomplete configuration
          </h1>
          <p className="text-slate-600 leading-relaxed">
            The environment variable{" "}
            <code className="font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> is
            missing. Add this key to your{" "}
            <code className="font-mono">.env</code> file and restart the
            development server.
          </p>
        </div>
      </div>
    )}
  </StrictMode>
);

createRoot(document.getElementById('root')!).render(app)
