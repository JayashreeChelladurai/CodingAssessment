import { Router } from "express";
import { issueAdminSessionToken, verifyAdminSessionToken } from "../services/auth.js";

export const authRouter = Router();

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

authRouter.post("/admin-login", (req, res) => {
  const { passcode, username } = req.body;

  if (!ADMIN_PASSCODE) {
    console.warn("[SECURITY] ADMIN_PASSCODE is not configured; admin login is disabled.");
    return res.status(503).json({
      success: false,
      error: "Admin login is disabled until ADMIN_PASSCODE is configured.",
    });
  }

  if (passcode !== ADMIN_PASSCODE) {
    return res.status(401).json({
      success: false,
      error: "Invalid professor passcode or password. Access denied.",
    });
  }

  try {
    const token = issueAdminSessionToken(typeof username === "string" ? username : "Professor");
    return res.json({
      success: true,
      token,
      adminName: typeof username === "string" ? username : "Professor",
    });
  } catch {
    return res.status(503).json({
      success: false,
      error: "Authentication service is not configured.",
    });
  }
});

// Optional debug endpoint for checking token validity (non-production only)
authRouter.get("/admin-session/verify", (req, res) => {
  const token =
    (req.headers.authorization || "").toString().toLowerCase().startsWith("bearer ")
      ? req.headers.authorization?.slice(7)
      : (req.headers["x-admin-token"] as string | undefined);

  if (!verifyAdminSessionToken(token)) {
    return res.status(401).json({ success: false });
  }

  res.json({ success: true });
});
