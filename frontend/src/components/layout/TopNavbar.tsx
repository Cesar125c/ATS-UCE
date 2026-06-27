import {
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="h-16 bg-[#0B5ED7] flex items-center justify-between px-8 shadow-sm">

      {/* Search */}
      <div className="flex items-center bg-white rounded-md px-3 py-2 w-[340px]">

        <Search
          size={18}
          className="text-gray-400"
        />

        <input
          type="text"
          placeholder="Search applicants..."
          className="ml-2 w-full outline-none text-sm"
        />

      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative">

          <Bell
            size={20}
            className="text-white"
          />

          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* User */}
        <button className="flex items-center gap-3">

          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="User"
            className="w-9 h-9 rounded-full object-cover border-2 border-white"
          />

          <div className="text-left">

            <p className="text-white text-sm font-semibold">
              HR Manager
            </p>

            <p className="text-blue-100 text-xs">
              Human Resources
            </p>

          </div>

          <ChevronDown
            size={18}
            className="text-white"
          />

        </button>

      </div>

    </header>
  );
}