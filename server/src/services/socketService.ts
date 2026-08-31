import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../db.js";

export function setupSocketService(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    // 1. Join Admin Room for an Assessment
    socket.on("admin:join", async (assessmentId: string) => {
      const room = `admin:${assessmentId}`;
      socket.join(room);
      console.log(`[Socket] Admin joined room: ${room}`);

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
    socket.on("student:join", async ({ assessmentId, attemptId, rollNo, studentName }) => {
      const studentRoom = `student:${attemptId}`;
      const examRoom = `assessment:${assessmentId}`;
      socket.join(studentRoom);
      socket.join(examRoom);

      console.log(`[Socket] Student ${rollNo} (${studentName}) joined ${studentRoom}`);

      // Notify admin of student entry / presence
      try {
        const attempt = await prisma.studentAttempt.findUnique({
          where: { id: attemptId },
          include: { violations: true, submissions: true },
        });
        if (attempt) {
          io.to(`admin:${assessmentId}`).emit("admin:student_updated", attempt);
        }
      } catch (err) {
        console.error("Error notifying student join to admin:", err);
      }
    });

    // 3. Heartbeat & Draft Sync
    socket.on("student:heartbeat", async ({ attemptId, assessmentId, remainingSeconds, drafts }) => {
      try {
        const updateData: any = {
          lastHeartbeat: new Date(),
          remainingSeconds: Math.max(0, remainingSeconds),
        };
        if (drafts) {
          updateData.drafts = typeof drafts === "string" ? drafts : JSON.stringify(drafts);
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
    socket.on("student:violation", async ({ attemptId, assessmentId, violationType, details, currentDrafts }) => {
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
    socket.on("admin:resume_student", async ({ attemptId, assessmentId, extraMinutes = 0 }) => {
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
