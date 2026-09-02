import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../db.js";
import {
  verifyAdminSessionToken,
  verifyAttemptSessionToken,
} from "./auth.js";

type AdminClaims = {
  kind: "admin";
  username: string;
  issuedAt: number;
  expiresAt: number;
};

type AttemptClaims = {
  kind: "student-attempt";
  attemptId: string;
  assessmentId: string;
  rollNo: string;
  issuedAt: number;
  expiresAt: number;
};

type AuthenticatedSocket = Socket & {
  data: {
    adminSession?: AdminClaims;
    attemptSession?: AttemptClaims;
  };
};

function getAdminTokenFromSocket(socket: Socket): string | null {
  const rawAuth = socket.handshake.auth as { adminToken?: unknown } | undefined;
  const token = rawAuth?.adminToken;
  return typeof token === "string" ? token : null;
}

function getAttemptTokenFromSocket(socket: Socket): string | null {
  const rawAuth = socket.handshake.auth as { attemptToken?: unknown } | undefined;
  const token = rawAuth?.attemptToken;
  return typeof token === "string" ? token : null;
}

function emitAuthFailure(socket: Socket, message: string) {
  socket.emit("socket:auth_error", { message });
}

function resolveAdminSession(socket: AuthenticatedSocket): AdminClaims | null {
  if (socket.data.adminSession) return socket.data.adminSession;

  const token = getAdminTokenFromSocket(socket);
  if (!token) {
    return null;
  }

  const claims = verifyAdminSessionToken(token);
  if (!claims) {
    return null;
  }

  socket.data.adminSession = claims;
  return claims;
}

function resolveAttemptSession(socket: AuthenticatedSocket): AttemptClaims | null {
  if (socket.data.attemptSession) return socket.data.attemptSession;

  const token = getAttemptTokenFromSocket(socket);
  if (!token) {
    return null;
  }

  const claims = verifyAttemptSessionToken(token);
  if (!claims) {
    return null;
  }

  socket.data.attemptSession = claims;
  return claims;
}

function isAttemptMatch(claims: AttemptClaims | null, attemptId?: string) {
  if (!claims) return false;
  if (!attemptId) return false;
  return claims.attemptId === attemptId;
}

export function setupSocketService(io: SocketIOServer) {
  io.on("connection", (socket) => {
    const authSocket = socket as AuthenticatedSocket;

    // 1. Join Admin Room for an Assessment
    socket.on("admin:join", async (payload: unknown) => {
      const claims = resolveAdminSession(authSocket);
      if (!claims) {
        emitAuthFailure(authSocket, "Admin session token missing or invalid.");
        return;
      }

      const assessmentId = typeof payload === "string" ? payload : payload && (payload as { assessmentId?: unknown }).assessmentId;
      if (typeof assessmentId !== "string" || !assessmentId.trim()) {
        authSocket.emit("admin:error", { message: "Assessment id is required." });
        return;
      }

      authSocket.join(`admin:${assessmentId}`);
      const room = `admin:${assessmentId}`;
      socket.join(room);
      console.log(`[Socket] Admin ${claims.username} joined room: ${room}`);

      // Send initial live student list to admin
      try {
        const attempts = await prisma.studentAttempt.findMany({
          where: { assessmentId },
          include: {
            violations: {
              orderBy: { timestamp: "desc" },
            },
            submissions: true,
          },
          orderBy: { startedAt: "desc" },
        });
        socket.emit("admin:students_list", attempts);
      } catch (err) {
        console.error("Error fetching initial students for admin:", err);
      }
    });

    // 2. Join Student Room
    socket.on("student:join", async (payload: { assessmentId?: unknown; attemptId?: unknown; rollNo?: unknown; studentName?: unknown }) => {
      const attemptClaims = resolveAttemptSession(authSocket);
      const assessmentId = typeof payload.assessmentId === "string" ? payload.assessmentId : undefined;
      const attemptId = typeof payload.attemptId === "string" ? payload.attemptId : undefined;
      if (!isAttemptMatch(attemptClaims, attemptId)) {
        emitAuthFailure(authSocket, "Attempt session token missing or invalid.");
        return;
      }
      if (!attemptClaims) {
        emitAuthFailure(authSocket, "Attempt session token missing or invalid.");
        return;
      }
      if (attemptClaims && attemptId && attemptClaims.assessmentId !== assessmentId) {
        emitAuthFailure(authSocket, "Attempt token does not match assessment.");
        return;
      }
      if (!assessmentId || !attemptId) {
        authSocket.emit("student:error", { message: "Assessment id and attempt id are required." });
        return;
      }

      const studentRoom = `student:${attemptId}`;
      const examRoom = `assessment:${assessmentId}`;
      const rollNo = typeof payload.rollNo === "string" ? payload.rollNo : "";
      const studentName = typeof payload.studentName === "string" ? payload.studentName : "";

      const attempt = await prisma.studentAttempt.findUnique({
        where: { id: attemptId },
      });
      if (!attempt || attempt.assessmentId !== assessmentId || attempt.rollNo !== attemptClaims.rollNo) {
        authSocket.emit("student:error", { message: "Attempt credentials are invalid." });
        return;
      }

      socket.join(studentRoom);
      socket.join(examRoom);

      console.log(`[Socket] Student ${rollNo} (${studentName}) joined ${studentRoom}`);

      // Notify admin of student entry / presence
      try {
        const attemptWithContext = await prisma.studentAttempt.findUnique({
          where: { id: attemptId },
          include: { violations: true, submissions: true },
        });
        if (attemptWithContext) {
          io.to(`admin:${assessmentId}`).emit("admin:student_updated", attemptWithContext);
        }
      } catch (err) {
        console.error("Error notifying student join to admin:", err);
      }
    });

    // 3. Heartbeat & Draft Sync
    socket.on("student:heartbeat", async (payload: { attemptId?: unknown; assessmentId?: unknown; remainingSeconds?: unknown; drafts?: unknown }) => {
      const attemptClaims = resolveAttemptSession(authSocket);
      const attemptId = typeof payload.attemptId === "string" ? payload.attemptId : undefined;
      const assessmentId = typeof payload.assessmentId === "string" ? payload.assessmentId : undefined;
      if (!isAttemptMatch(attemptClaims, attemptId)) {
        emitAuthFailure(authSocket, "Attempt session token missing or invalid.");
        return;
      }
      if (attemptClaims && attemptClaims.assessmentId !== assessmentId) {
        emitAuthFailure(authSocket, "Attempt session and assessment mismatch.");
        return;
      }

      const rawDrafts = payload.drafts;
      const remainingSeconds = typeof payload.remainingSeconds === "number" ? payload.remainingSeconds : 0;
      if (!attemptId || !assessmentId) {
        return;
      }

      try {
        const updateData: any = {
          lastHeartbeat: new Date(),
          remainingSeconds: Math.max(0, remainingSeconds),
        };
        if (rawDrafts) {
          updateData.drafts = typeof rawDrafts === "string" ? rawDrafts : JSON.stringify(rawDrafts);
        }

        const updated = await prisma.studentAttempt.update({
          where: { id: attemptId },
          data: updateData,
          include: { violations: true, submissions: true },
        });

        // Broadcast to admin room
        io.to(`admin:${assessmentId}`).emit("admin:student_updated", updated);
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    });

    // 4. Student Violation Event (Tab switch, Fullscreen exit, Focus loss)
    socket.on("student:violation", async (payload: {
      attemptId?: unknown;
      assessmentId?: unknown;
      violationType?: unknown;
      details?: unknown;
      currentDrafts?: unknown;
    }) => {
      const attemptClaims = resolveAttemptSession(authSocket);
      const attemptId = typeof payload.attemptId === "string" ? payload.attemptId : undefined;
      const assessmentId = typeof payload.assessmentId === "string" ? payload.assessmentId : undefined;
      const violationType = typeof payload.violationType === "string" ? payload.violationType : "unauthorized";
      const details = typeof payload.details === "string" ? payload.details : undefined;
      const currentDrafts = payload.currentDrafts;
      if (!isAttemptMatch(attemptClaims, attemptId)) {
        emitAuthFailure(authSocket, "Attempt session token missing or invalid.");
        return;
      }
      if (attemptClaims && attemptClaims.assessmentId !== assessmentId) {
        emitAuthFailure(authSocket, "Attempt session and assessment mismatch.");
        return;
      }
      if (!attemptId || !assessmentId) return;

      try {
        console.log(`[VIOLATION] Attempt ${attemptId} triggered ${violationType}`);

        // Save current code draft first so student loses zero progress
        const draftsStr = currentDrafts ? (typeof currentDrafts === "string" ? currentDrafts : JSON.stringify(currentDrafts)) : undefined;

        // Create violation record & lock attempt
        const violation = await prisma.violation.create({
          data: {
            attemptId,
            violationType,
            details: details || "Window focus lost or tab switched",
          },
        });

        const updatedAttempt = await prisma.studentAttempt.update({
          where: { id: attemptId },
          data: {
            status: "LOCKED_OUT",
            violationCount: { increment: 1 },
            ...(draftsStr ? { drafts: draftsStr } : {}),
          },
          include: {
            violations: { orderBy: { timestamp: "desc" } },
            submissions: true,
          },
        });

        // 1. Tell student they are locked
        io.to(`student:${attemptId}`).emit("student:lockout", {
          reason: violationType,
          message: "Assessment locked due to tab-switch or window focus loss. Contact professor to resume.",
          violationId: violation.id,
        });

        // 2. Alert Admin in real-time
        io.to(`admin:${assessmentId}`).emit("admin:violation_alert", {
          attempt: updatedAttempt,
          violation,
        });
        io.to(`admin:${assessmentId}`).emit("admin:student_updated", updatedAttempt);
      } catch (err) {
        console.error("Error processing violation:", err);
      }
    });

    // 5. Admin Resumes / Unlocks Student
    socket.on("admin:resume_student", async (payload: { attemptId?: unknown; assessmentId?: unknown; extraMinutes?: unknown }) => {
      const claims = resolveAdminSession(authSocket);
      const attemptId = typeof payload.attemptId === "string" ? payload.attemptId : undefined;
      const assessmentId = typeof payload.assessmentId === "string" ? payload.assessmentId : undefined;
      const extraMinutes = typeof payload.extraMinutes === "number" ? payload.extraMinutes : 0;

      if (!claims) {
        emitAuthFailure(authSocket, "Admin session token missing or invalid.");
        return;
      }
      if (!attemptId || !assessmentId) {
        return;
      }

      try {
        console.log(`[ADMIN RESUME] Unlocking attempt ${attemptId}`);

        const attempt = await prisma.studentAttempt.findUnique({
          where: { id: attemptId },
        });

        if (!attempt) return;

        const newRemaining = Math.max(30, attempt.remainingSeconds + (extraMinutes * 60));

        // Mark latest violations as resolved
        await prisma.violation.updateMany({
          where: { attemptId, resolved: false },
          data: { resolved: true, resolvedAt: new Date() },
        });

        const updatedAttempt = await prisma.studentAttempt.update({
          where: { id: attemptId },
          data: {
            status: "IN_PROGRESS",
            remainingSeconds: newRemaining,
          },
          include: {
            violations: { orderBy: { timestamp: "desc" } },
            submissions: true,
          },
        });

        // 1. Send unlock signal to student
        io.to(`student:${attemptId}`).emit("student:unlocked", {
          remainingSeconds: newRemaining,
          drafts: updatedAttempt.drafts,
          message: "Your exam has been resumed by the instructor.",
        });

        // 2. Notify all admins
        io.to(`admin:${assessmentId}`).emit("admin:student_updated", updatedAttempt);
      } catch (err) {
        console.error("Error resuming student:", err);
      }
    });

    socket.on("disconnect", () => {
      // Disconnected
    });
  });
}
