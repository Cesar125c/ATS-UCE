import type { ReactNode } from "react";
import { Bell, GraduationCap, LogOut, Upload } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import TopNavbar from "./TopNavbar";

interface PortalLayoutProps {
  children: ReactNode;
  applicant?: boolean;
}

export default function PortalLayout({ children, applicant = false }: PortalLayoutProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (applicant) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] text-slate-950 lg:flex">
        <aside className="hidden lg:flex w-60 shrink-0 bg-[#071429] text-white min-h-screen flex-col">
          <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10">
            <div className="h-9 w-9 rounded-lg bg-[#2797dc] flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="font-bold leading-tight">ATS-UCE</p>
              <p className="text-[11px] text-slate-400">Recruitment System</p>
            </div>
          </div>

          <div className="px-3 pt-6">
            <p className="px-3 mb-3 text-[10px] tracking-[0.18em] font-semibold text-slate-500">PORTAL</p>
            <div className="flex items-center gap-3 rounded-lg bg-[#278fd0] px-3 py-3">
              <Upload size={18} />
              <div>
                <p className="text-sm font-semibold">Applicant Portal</p>
                <p className="text-[10px] text-blue-100">CV upload and tracking</p>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-white/10 p-3">
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="h-16 bg-white border-b border-slate-200 px-5 lg:px-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Applicant Portal</p>
              <p className="text-[11px] text-slate-500">Upload your CV and follow your application</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-slate-600" />
              <img src={user?.imageUrl} alt="User" className="h-8 w-8 rounded-full bg-slate-200 object-cover" />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold">{user?.fullName || "Applicant"}</p>
                <p className="text-[10px] text-slate-500">Applicant</p>
              </div>
            </div>
          </header>
          <main className="px-4 py-7 sm:px-6 lg:px-10">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopNavbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
