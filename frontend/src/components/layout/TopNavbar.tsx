import { useEffect, useState, useReducer } from "react";
import { useUser, useClerk } from "@clerk/react";
import { Bell, Search, ChevronDown, LogOut } from "lucide-react";
import { subscribe, getNotifications, getUnreadCount, markAllRead } from "@/lib/notificationStore";

const ROLE_LABEL: Record<string, string> = {
  applicant: "Applicant",
  human_resources: "Human Resources",
  authorities: "Authorities",
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Received",
  PROCESSING_AI: "AI Analysis",
  HR_STAGE: "HR Review",
  DEAN_STAGE: "Dean Review",
  RECTOR_STAGE: "Rector Review",
  FINANCE_STAGE: "Finance Review",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export default function TopNavbar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const firstName = isLoaded ? user?.firstName || user?.fullName?.split(" ")[0] || "User" : "...";
  const lastName = isLoaded ? user?.lastName || "" : "";
  const role = (user?.publicMetadata?.role as string) || "";
  const roleLabel = ROLE_LABEL[role] || role || "";

  const unread = getUnreadCount();
  const notifs = getNotifications().slice(0, 10);

  useEffect(() => subscribe(forceUpdate), []);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  const handleBellClick = () => {
    if (!notifOpen && unread > 0) markAllRead();
    setNotifOpen((o) => !o);
    setMenuOpen(false);
  };

  const handleMenuClick = () => {
    setMenuOpen((o) => !o);
    setNotifOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <div className="flex items-center bg-slate-100 rounded-md px-3 py-2 w-[340px]">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search applicants..."
          className="ml-2 w-full outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative">
          <button onClick={handleBellClick} className="relative">
            <Bell size={20} className="text-slate-600" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={() => { markAllRead(); forceUpdate(); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400 text-center">No notifications yet</p>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b last:border-b-0 ${
                        n.read ? "" : "bg-blue-50/50"
                      }`}
                    >
                      <p className="text-sm text-slate-700">
                        Application <span className="font-mono text-xs text-slate-400">{n.application_id.slice(0, 8)}</span>{" "}
                        advanced to{" "}
                        <span className="font-semibold">{STATUS_LABEL[n.new_status] || n.new_status}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{timeAgo(n.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-3"
            onClick={handleMenuClick}
          >
            <img
              src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
              alt="User"
              className="w-9 h-9 rounded-full object-cover border-2 border-[#278fd0]"
            />
            <div className="text-left hidden sm:block">
              <p className="text-slate-900 text-sm font-semibold">
                {firstName} {lastName}
              </p>
              <p className="text-slate-500 text-xs">{roleLabel}</p>
            </div>
            <ChevronDown size={18} className="text-slate-500" />
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
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {(menuOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setMenuOpen(false); setNotifOpen(false); }}
        />
      )}
    </header>
  );
}
