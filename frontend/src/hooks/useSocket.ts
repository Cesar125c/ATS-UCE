import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { addNotification } from "@/lib/notificationStore";
import { logger } from "@/lib/logger";

interface StatusChangeEvent {
  application_id: string;
  new_status: string;
  timestamp: string;
}

export function useSocket() {
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    let socket: Socket | null = null;
    let isActive = true;

    if (!isLoaded || isSignedIn !== true) {
      return () => {
        isActive = false;
        socket?.disconnect();
      };
    }

    const connect = async () => {
      const token = await getToken();
      if (!isActive || !token) return;

      socket = io(window.location.origin, {
        path: "/ws/socket.io",
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 10_000,
      });

      socket.on("connect", () => {
        logger.debug("Socket connected", {
          component: "Socket",
          operation: "socket_connect",
        });
      });

      socket.on("status_change", (data: StatusChangeEvent) => {
        logger.debug("Socket status change received", {
          component: "Socket",
          operation: "socket_status_change",
        });
        addNotification(data);
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      });

      socket.on("disconnect", (reason: string) => {
        logger.debug("Socket disconnected", {
          component: "Socket",
          operation: "socket_disconnect",
          errorType: reason,
        });
      });

      socket.on("connect_error", (err: Error) => {
        logger.warn("Socket connection error", {
          component: "Socket",
          operation: "socket_connection_error",
          errorType: err.name,
        });
      });
    };

    connect();

    return () => {
      isActive = false;
      socket?.disconnect();
    };
  }, [getToken, isLoaded, isSignedIn, queryClient]);
}
