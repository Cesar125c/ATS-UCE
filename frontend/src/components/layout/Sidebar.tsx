import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/human-resources" },
  { title: "Candidates", icon: Users, path: "/candidates" },
  { title: "Vacancies", icon: Briefcase, path: "/administrator" },
  { title: "Reports", icon: BarChart3, path: "/reports" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#071429] border-r border-white/10 text-white flex shrink-0 flex-col h-dvh transition-all duration-300 ${
        collapsed ? "w-16 sm:w-20" : "w-16 lg:w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 overflow-hidden border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#2797dc] flex items-center justify-center text-white font-bold shrink-0">
          ATS
        </div>
        {!collapsed && (
          <div className="ml-3 hidden lg:block whitespace-nowrap">
            <h1 className="text-white font-bold text-lg">ATS-UCE</h1>
            <p className="text-xs text-slate-400">Recruitment Portal</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden lg:flex items-center justify-center h-8 border-b border-white/10 hover:bg-white/5 text-slate-400"
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Menu */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `mx-2 lg:mx-3 mb-2 flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                  collapsed ? "justify-center" : "justify-center lg:justify-start"
                } ${
                  isActive
                    ? "bg-[#278fd0] text-white font-semibold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span className="hidden lg:inline">{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
