import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top Navigation */}
        <TopNavbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F9FC] p-8">
          <div className="max-w-[1500px] mx-auto">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}