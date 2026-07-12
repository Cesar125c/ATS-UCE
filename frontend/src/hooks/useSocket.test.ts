import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const socketTestState = vi.hoisted(() => ({
  auth: {
    isLoaded: true,
    isSignedIn: true,
    getToken: vi.fn<() => Promise<string | null>>(),
  },
  cleanups: [] as Array<undefined | (() => void)>,
  io: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("react", () => ({
  useEffect: (effect: () => void | (() => void)) => {
    socketTestState.cleanups.push(effect() ?? undefined);
  },
}));

vi.mock("@clerk/react", () => ({
  useAuth: () => socketTestState.auth,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: socketTestState.invalidateQueries,
  }),
}));

vi.mock("socket.io-client", () => ({
  io: socketTestState.io,
}));

vi.mock("@/lib/notificationStore", () => ({
  addNotification: vi.fn(),
}));

import { useSocket } from "./useSocket";

type SocketHandler = (...args: unknown[]) => void;

function createSocket() {
  const handlers = new Map<string, SocketHandler>();
  const socket = {
    on: vi.fn((event: string, handler: SocketHandler) => {
      handlers.set(event, handler);
      return socket;
    }),
    disconnect: vi.fn(),
    handlers,
  };
  return socket;
}

async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("useSocket", () => {
  beforeEach(() => {
    socketTestState.auth.isLoaded = true;
    socketTestState.auth.isSignedIn = true;
    socketTestState.auth.getToken.mockResolvedValue("socket-token");
    socketTestState.io.mockReturnValue(createSocket());
    socketTestState.cleanups = [];
    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:5173",
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not connect when Clerk is not loaded", async () => {
    socketTestState.auth.isLoaded = false;

    useSocket();
    await flushPromises();

    expect(socketTestState.auth.getToken).not.toHaveBeenCalled();
    expect(socketTestState.io).not.toHaveBeenCalled();
  });

  it("does not connect when the user is not signed in", async () => {
    socketTestState.auth.isSignedIn = false;

    useSocket();
    await flushPromises();

    expect(socketTestState.auth.getToken).not.toHaveBeenCalled();
    expect(socketTestState.io).not.toHaveBeenCalled();
  });

  it("connects once when Clerk is loaded, user is signed in, and token exists", async () => {
    useSocket();
    await flushPromises();

    expect(socketTestState.io).toHaveBeenCalledTimes(1);
    expect(socketTestState.io).toHaveBeenCalledWith("http://localhost:5173", {
      path: "/ws/socket.io",
      auth: { token: "socket-token" },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
    });
  });

  it("does not connect when getToken returns null", async () => {
    socketTestState.auth.getToken.mockResolvedValue(null);

    useSocket();
    await flushPromises();

    expect(socketTestState.auth.getToken).toHaveBeenCalledTimes(1);
    expect(socketTestState.io).not.toHaveBeenCalled();
  });

  it("disconnects on unmount or sign out cleanup", async () => {
    const socket = createSocket();
    socketTestState.io.mockReturnValue(socket);

    useSocket();
    await flushPromises();
    socketTestState.cleanups[0]?.();

    expect(socket.disconnect).toHaveBeenCalledTimes(1);

    socketTestState.auth.isSignedIn = false;
    useSocket();
    await flushPromises();

    expect(socketTestState.io).toHaveBeenCalledTimes(1);
  });

  it("does not log the token", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const socket = createSocket();
    socketTestState.io.mockReturnValue(socket);

    useSocket();
    await flushPromises();
    socket.handlers.get("connect_error")?.(new Error("connection rejected"));

    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain("socket-token");
  });
});
