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

let ioInstance: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastStudentUnlocked(attemptId: string, assessmentId: string, data: any) {
  if (!ioInstance) return;
  // Strictly emit ONLY to the specific individual student room!
  // NEVER broadcast individual unlock events, drafts, or timers to the shared assessment room!
  ioInstance.to(`student:${attemptId}`).emit("student:unlocked", {
    ...data,
    attemptId,
  });
}

export function broadcastStudentUpdated(assessmentId: string, updatedAttempt: any) {
  if (!ioInstance) return;
  ioInstance.to(`admin:${assessmentId}`).emit("admin:student_updated", updatedAttempt);
}

export function broadcastStudentsList(assessmentId: string, attempts: any[]) {
  if (!ioInstance) return;
  ioInstance.to(`admin:${assessmentId}`).emit("admin:students_list", attempts);
}

export function setupSocketService(io: SocketIOServer) {
  ioInstance = io;
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

      // Strictly join ONLY the private student room! Students must NEVER join shared rooms.
      socket.join(studentRoom);

      console.log(`[Socket] Student ${rollNo} (${studentName}) joined ${studentRoom}`);

      const rawSocketIp = (socket.handshake.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || socket.handshake.address || "";
      const clientIp = rawSocketIp.replace(/^::ffff:/, "");
      if (clientIp && !attempt.ipAddress) {
        await prisma.studentAttempt.update({
          where: { id: attemptId },
          data: { ipAddress: clientIp },
        }).catch(() => {});
      }

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
        const attempt = await prisma.studentAttempt.findUnique({
          where: { id: attemptId },
          include: { assessment: { select: { durationMinutes: true } } },
        });

        // Reject writes to non-active attempts (e.g., SUBMITTED, TIME_EXPIRED, LOCKED_OUT)
        if (!attempt || attempt.status !== "IN_PROGRESS") {
          return;
        }

        const maxDurationSeconds = (attempt.assessment?.durationMinutes || 60) * 60;
        // Clamp remainingSeconds to never exceed assessment duration or increase
        const safeRemainingSeconds = Math.min(
          attempt.remainingSeconds,
          Math.min(maxDurationSeconds, Math.max(0, remainingSeconds))
        );

        const updateData: any = {
          lastHeartbeat: new Date(),
          remainingSeconds: safeRemainingSeconds,
        };
        if (rawDrafts) {
          const draftsStr = typeof rawDrafts === "string" ? rawDrafts : JSON.stringify(rawDrafts);
          if (draftsStr !== "{}" && draftsStr !== "" && draftsStr !== "null") {
            updateData.drafts = draftsStr;
          }
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

      // RULE 4 & 5: Raise violation ONLY if SEB is bypassed / closed, do not show violation for other cases.
      if (violationType !== "SEB_EXIT" && violationType !== "SEB_TAMPER") {
        console.log(`[VIOLATION IGNORED] Non-SEB event '${violationType}' ignored for attempt ${attemptId}.`);
        return;
      }

      try {
        console.log(`[VIOLATION] Attempt ${attemptId} triggered ${violationType}`);

        // Save current code draft first so student loses zero progress (only if non-empty)
        let draftsStr: string | undefined = undefined;
        if (currentDrafts) {
          const str = typeof currentDrafts === "string" ? currentDrafts : JSON.stringify(currentDrafts);
          if (str !== "{}" && str !== "" && str !== "null") {
            draftsStr = str;
          }
        }

        const rawSocketIp = (socket.handshake.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || socket.handshake.address || "";
        const clientIp = rawSocketIp.replace(/^::ffff:/, "");

        // Create violation record & lock attempt
        const violation = await prisma.violation.create({
          data: {
            attemptId,
            violationType,
            details: details || "Window focus lost or tab switched",
            ipAddress: clientIp || null,
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
          attemptId,
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
          include: { assessment: true },
        });

        if (!attempt) return;

        // Authoritative elapsed time calculation based on attempt.startedAt so timer NEVER resets to 60m
        const now = new Date();
        const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));
        const totalAllowed = (attempt.assessment?.durationMinutes || 60) * 60;
        const accurateRemaining = Math.max(0, totalAllowed - elapsedSeconds);
        // Grant extraMinutes if provided, but NEVER reset elapsed time back to 60m
        const newRemaining = Math.max(30, accurateRemaining + (extraMinutes * 60));

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

        // 1. Send unlock signal to student (only send drafts if DB has non-empty drafts!)
        io.to(`student:${attemptId}`).emit("student:unlocked", {
          attemptId,
          remainingSeconds: newRemaining,
          drafts: updatedAttempt.drafts && updatedAttempt.drafts !== "{}" ? updatedAttempt.drafts : undefined,
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
