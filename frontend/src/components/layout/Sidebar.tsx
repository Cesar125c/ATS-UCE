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
      className={`bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-16 bg-[#0B5ED7] flex items-center px-4 overflow-hidden">
        <div className="w-9 h-9 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold shrink-0">
          ATS
        </div>
        {!collapsed && (
          <div className="ml-3 whitespace-nowrap">
            <h1 className="text-white font-bold text-lg">ATS-UCE</h1>
            <p className="text-xs text-blue-100">Recruitment Portal</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center h-8 border-b hover:bg-gray-50 text-gray-500"
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
                `mx-3 mb-2 flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
              title={collapsed ? item.title : undefined}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
