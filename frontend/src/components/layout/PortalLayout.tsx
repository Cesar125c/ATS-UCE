import { ReactNode } from "react";
import TopNavbar from "./TopNavbar";

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopNavbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
