import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { addNotification } from "@/lib/notificationStore";

interface StatusChangeEvent {
  application_id: string;
  new_status: string;
  timestamp: string;
}

export function useSocket() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  useEffect(() => {
    let socket: Socket | null = null;

    const connect = async () => {
      const token = await getToken();
      if (!token) return;

      socket = io(window.location.origin, {
        path: "/ws/socket.io",
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 10_000,
      });

      socket.on("connect", () => {
        console.debug("[WS] connected", socket?.id);
      });

      socket.on("status_change", (data: StatusChangeEvent) => {
        console.debug("[WS] status_change", data);
        addNotification(data);
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      });

      socket.on("disconnect", (reason: string) => {
        console.debug("[WS] disconnected", reason);
      });

      socket.on("connect_error", (err: Error) => {
        console.warn("[WS] connection error", err.message);
      });
    };

    connect();

    return () => {
      socket?.disconnect();
    };
  }, [getToken, queryClient]);
}
