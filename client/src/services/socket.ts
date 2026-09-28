import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketAdminToken: string | null = null;
let socketAttemptToken: string | null = null;

function shouldReconnect(nextAdminToken: string | null, nextAttemptToken: string | null) {
  return (
    !!socket &&
    (socketAdminToken !== nextAdminToken || socketAttemptToken !== nextAttemptToken)
  );
}

export function getSocket(
  options?: { adminToken?: string | null; attemptToken?: string | null; }
): Socket {
  const nextAdminToken = options?.adminToken ?? null;
  const nextAttemptToken = options?.attemptToken ?? null;

  if (socket && shouldReconnect(nextAdminToken, nextAttemptToken)) {
    socket.disconnect();
    socket = null;
    socketAdminToken = null;
    socketAttemptToken = null;
  }

  if (!socket) {
    socket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      auth: {
        adminToken: nextAdminToken,
        attemptToken: nextAttemptToken,
      },
    });
    socketAdminToken = nextAdminToken;
    socketAttemptToken = nextAttemptToken;
  }
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
  }
  socket = null;
  socketAdminToken = null;
  socketAttemptToken = null;
}
