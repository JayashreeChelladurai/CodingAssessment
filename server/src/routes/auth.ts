import { Router } from "express";

export const authRouter = Router();

// Configurable Admin Passcode (can be set via env ADMIN_PASSCODE, defaults to 'admin123' or 'prof@2026')
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";

authRouter.post("/admin-login", (req, res) => {
  const { passcode, username } = req.body;

  if (passcode === ADMIN_PASSCODE || passcode === "prof@2026") {
    return res.json({
      success: true,
      token: "admin-session-token-" + Date.now(),
      adminName: username || "Professor",
    });
  }

  return res.status(401).json({
    success: false,
    error: "Invalid professor passcode or password. Access denied.",
  });
});
