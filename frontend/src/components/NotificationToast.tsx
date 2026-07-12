import { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { subscribe, getNotifications } from "@/lib/notificationStore";

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

type Notification = {
  id: string;
  new_status: string;
  application_id: string;
  timestamp: string;
};

export default function NotificationToast() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const lastShownIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showNotification = useCallback((notif: Notification) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setNotification(notif);
    setVisible(true);
    lastShownIdRef.current = notif.id;

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, 5000);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const notifs = getNotifications();
      if (notifs.length === 0) return;
      
      const latest = notifs[0];
      if (latest.id !== lastShownIdRef.current) {
        showNotification(latest);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showNotification]);

  const handleClose = () => {
    setVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if (!visible || !notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-4 py-3 max-w-sm flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-slate-700">
            Your application advanced to{" "}
            <strong className="font-semibold text-slate-900">
              {STATUS_LABEL[notification.new_status] || notification.new_status}
            </strong>
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
