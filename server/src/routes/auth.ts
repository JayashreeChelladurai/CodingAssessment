import { Router } from "express";
import { issueAdminSessionToken, verifyAdminSessionToken } from "../services/auth.js";

export const authRouter = Router();

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;
if (!ADMIN_PASSCODE) {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "⚠️ [SECURITY WARNING] ADMIN_PASSCODE environment variable is not configured! Defaulting to 'admin123'. Please set a strong ADMIN_PASSCODE in production."
  );
}
const EFFECTIVE_ADMIN_PASSCODE = ADMIN_PASSCODE || "admin123";

authRouter.post("/admin-login", (req, res) => {
  const { passcode, username } = req.body;
  const cleanPass = String(passcode || "").trim();

  // Validate strictly against configured ADMIN_PASSCODE (no backdoor bypasses)
  const isValid = cleanPass === EFFECTIVE_ADMIN_PASSCODE;

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
  } catch (err: any) {
    console.error("[Auth] Failed to generate admin session token:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error: unable to issue secure administrative token.",
    });
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
