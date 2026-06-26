import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/human-resources",
  },
  {
    title: "Candidates",
    icon: Users,
    path: "/applicant",
  },
  {
    title: "Vacancies",
    icon: Briefcase,
    path: "/administrator",
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/authorities",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="h-16 bg-[#0B5ED7] flex items-center px-5">
        <div className="w-9 h-9 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold">
          ATS
        </div>

        <div className="ml-3">
          <h1 className="text-white font-bold text-lg">ATS-UCE</h1>
          <p className="text-xs text-blue-100">Recruitment Portal</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                `mx-3 mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <Settings size={18} />
          Configuration
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
