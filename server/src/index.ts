import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketService } from "./services/socketService.js";
import { assessmentRouter } from "./routes/assessment.js";
import { studentRouter } from "./routes/student.js";
import { executionRouter } from "./routes/execution.js";
import { resultsRouter } from "./routes/results.js";
import { authRouter } from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../../client/dist");

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSocketService(io);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/assessments", assessmentRouter);
app.use("/api/student", studentRouter);
app.use("/api/execution", executionRouter);
app.use("/api/results", resultsRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Java Assessment Engine",
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend static assets from client/dist (for direct SEB & production access)
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Assessment Server running on http://0.0.0.0:${PORT}`);
});
