import { useState } from "react";
import { useUser, useClerk } from "@clerk/react";
import { Bell, Search, ChevronDown, LogOut } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  applicant: "Postulante",
  human_resources: "Recursos Humanos",
  authorities: "Autoridades",
};

export default function TopNavbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = isLoaded ? user?.firstName || user?.fullName?.split(" ")[0] || "Usuario" : "...";
  const lastName = isLoaded ? user?.lastName || "" : "";
  const role = (user?.publicMetadata?.role as string) || "";
  const roleLabel = ROLE_LABEL[role] || role || "";

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="h-16 bg-[#0B5ED7] flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center bg-white rounded-md px-3 py-2 w-[340px]">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search applicants..."
          className="ml-2 w-full outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative">
          <Bell size={20} className="text-white" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-3"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <img
              src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
              alt="User"
              className="w-9 h-9 rounded-full object-cover border-2 border-white"
            />
            <div className="text-left hidden sm:block">
              <p className="text-white text-sm font-semibold">
                {firstName} {lastName}
              </p>
              <p className="text-blue-100 text-xs">{roleLabel}</p>
            </div>
            <ChevronDown size={18} className="text-white" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b sm:hidden">
                <p className="text-sm font-semibold text-slate-800">{firstName} {lastName}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
