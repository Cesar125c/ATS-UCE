import { useState, useEffect, useReducer, type ReactNode } from "react";
import { Bell, ChevronDown, GraduationCap, LogOut, Upload } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import TopNavbar from "./TopNavbar";
import { subscribe, getNotifications, getUnreadCount, markAllRead } from "@/lib/notificationStore";

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

interface PortalLayoutProps {
  children: ReactNode;
  applicant?: boolean;
}

export default function PortalLayout({ children, applicant = false }: PortalLayoutProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [notifOpen, setNotifOpen] = useState(false);

  const unread = getUnreadCount();
  const notifs = getNotifications().slice(0, 10);

  useEffect(() => subscribe(forceUpdate), []);

  const handleBellClick = () => {
    if (!notifOpen && unread > 0) markAllRead();
    setNotifOpen((o) => !o);
    setUserMenuOpen(false);
  };

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

        </aside>

        <div className="min-w-0 flex-1">
          <header className="h-16 bg-white border-b border-slate-200 px-5 lg:px-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Applicant Portal</p>
              <p className="text-[11px] text-slate-500">Upload your CV and follow your application</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={handleBellClick} className="relative">
                  <Bell size={18} className="text-slate-600" />
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-3"
                >
                  <img src={user?.imageUrl} alt="User" className="h-8 w-8 rounded-full bg-slate-200 object-cover" />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold">{user?.fullName || "Applicant"}</p>
                    <p className="text-[10px] text-slate-500">Applicant</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50">
                    <button
                      type="button"
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="px-4 py-7 sm:px-6 lg:px-10">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>
          {userMenuOpen && (
            <button
              type="button"
              aria-label="Close user menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => { setUserMenuOpen(false); setNotifOpen(false); }}
            />
          )}
          {notifOpen && !userMenuOpen && (
            <button
              type="button"
              aria-label="Close notifications"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setNotifOpen(false)}
            />
          )}
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
