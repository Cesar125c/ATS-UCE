type StatusChangePayload = {
  application_id: string;
  new_status: string;
  timestamp: string;
};

type Notification = StatusChangePayload & {
  id: string;
  read: boolean;
};

let notifications: Notification[] = [];
let listeners: Array<() => void> = [];

export function addNotification(payload: StatusChangePayload) {
  notifications = [{ ...payload, id: crypto.randomUUID(), read: false }, ...notifications];
  if (notifications.length > 50) notifications = notifications.slice(0, 50);
  listeners.forEach((l) => l());
}

export function getNotifications(): Notification[] {
  return notifications;
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function markAllRead(): void {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((x) => x !== listener);
  };
}
