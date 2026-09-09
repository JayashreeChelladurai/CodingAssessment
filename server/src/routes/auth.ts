import { Router } from "express";
import { issueAdminSessionToken, verifyAdminSessionToken } from "../services/auth.js";

export const authRouter = Router();

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";

authRouter.post("/admin-login", (req, res) => {
  const { passcode, username } = req.body;
  const cleanPass = String(passcode || "").trim();

  // Check configured ADMIN_PASSCODE or prof@2026 / admin123
  const isValid =
    cleanPass === ADMIN_PASSCODE ||
    cleanPass === "prof@2026" ||
    cleanPass === "admin123";

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: "Invalid professor security passcode. Access denied.",
    });
  }

  const adminName = typeof username === "string" && username.trim() ? username.trim() : "Professor";
  let token: string;
  try {
    token = issueAdminSessionToken(adminName);
  } catch {
    token = "admin-session-token-" + Date.now();
  }

  return res.json({
    success: true,
    token,
    adminName,
  });
});

// Debug endpoint for checking token validity
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
