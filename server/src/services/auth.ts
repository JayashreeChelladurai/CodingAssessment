import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

interface AdminSessionClaims {
  kind: "admin";
  username: string;
  issuedAt: number;
  expiresAt: number;
}

interface AttemptSessionClaims {
  kind: "student-attempt";
  attemptId: string;
  assessmentId: string;
  rollNo: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthenticatedRequest extends Request {
  adminSession?: AdminSessionClaims;
  attemptSession?: AttemptSessionClaims;
}

const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || process.env.SESSION_SECRET || "assessment-platform-admin-default-secret-2026";
const ATTEMPT_SESSION_SECRET = process.env.ATTEMPT_SESSION_SECRET || ADMIN_SESSION_SECRET;

const ADMIN_SESSION_TTL_SECONDS = Math.max(1, Number(process.env.ADMIN_SESSION_TTL_SECONDS || "3600"));
const ATTEMPT_SESSION_TTL_SECONDS = Math.max(60, Number(process.env.ATTEMPT_SESSION_TTL_SECONDS || "43200"));

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signToken(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function buildSignedToken(payload: object, secret: string): string {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signToken(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function parseSignedToken(token: string, secret: string): object | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expected = signToken(encodedPayload, secret);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    return payload;
  } catch {
    return null;
  }
}

function isExpired(expiresAt: number): boolean {
  return expiresAt <= nowInSeconds();
}

function canSignAdminTokens(): boolean {
  return !!ADMIN_SESSION_SECRET;
}

function canSignAttemptTokens(): boolean {
  return !!ATTEMPT_SESSION_SECRET;
}

function getAdminSessionSecret(): string {
  if (!ADMIN_SESSION_SECRET) {
    throw new Error("Admin session signing secret is not configured.");
  }
  return ADMIN_SESSION_SECRET;
}

function getAttemptSessionSecret(): string {
  if (!ATTEMPT_SESSION_SECRET) {
    throw new Error("Attempt session signing secret is not configured.");
  }
  return ATTEMPT_SESSION_SECRET;
}

export function issueAdminSessionToken(username: string): string {
  if (!canSignAdminTokens()) {
    throw new Error("Admin session signing secret is not configured.");
  }

  const claims: AdminSessionClaims = {
    kind: "admin",
    username,
    issuedAt: nowInSeconds(),
    expiresAt: nowInSeconds() + ADMIN_SESSION_TTL_SECONDS,
  };

  return buildSignedToken(claims, getAdminSessionSecret());
}

export function verifyAdminSessionToken(token?: string): AdminSessionClaims | null {
  if (!canSignAdminTokens()) {
    return null;
  }

  if (!token || typeof token !== "string") return null;

  const payload = parseSignedToken(token, getAdminSessionSecret());
  if (!payload || typeof payload !== "object") return null;

  const claims = payload as AdminSessionClaims;
  if (claims.kind !== "admin" || !claims.username || typeof claims.expiresAt !== "number") {
    return null;
  }

  if (isExpired(claims.expiresAt)) {
    return null;
  }

  return claims;
}

export function extractAdminToken(req: Request): string | undefined {
  const fromAuthHeader = req.headers.authorization;
  if (typeof fromAuthHeader === "string" && fromAuthHeader.toLowerCase().startsWith("bearer ")) {
    return fromAuthHeader.slice(7).trim();
  }

  const legacy = req.headers["x-admin-token"];
  if (Array.isArray(legacy)) return legacy[0];
  if (typeof legacy === "string") return legacy;
  return undefined;
}

export function issueAttemptSessionToken(attemptId: string, assessmentId: string, rollNo: string): string {
  if (!canSignAttemptTokens()) {
    throw new Error("Attempt signing secret is not configured.");
  }

  const claims: AttemptSessionClaims = {
    kind: "student-attempt",
    attemptId,
    assessmentId,
    rollNo: rollNo.toUpperCase(),
    issuedAt: nowInSeconds(),
    expiresAt: nowInSeconds() + ATTEMPT_SESSION_TTL_SECONDS,
  };

  return buildSignedToken(claims, getAttemptSessionSecret());
}

export function verifyAttemptSessionToken(token?: string): AttemptSessionClaims | null {
  if (!canSignAttemptTokens()) {
    return null;
  }

  if (!token || typeof token !== "string") return null;

  const payload = parseSignedToken(token, getAttemptSessionSecret());
  if (!payload || typeof payload !== "object") return null;

  const claims = payload as AttemptSessionClaims;
  if (
    claims.kind !== "student-attempt" ||
    !claims.attemptId ||
    !claims.assessmentId ||
    !claims.rollNo ||
    typeof claims.expiresAt !== "number"
  ) {
    return null;
  }

  if (isExpired(claims.expiresAt)) {
    return null;
  }

  return claims;
}

export function extractAttemptToken(req: Request): string | undefined {
  const headerToken = req.headers["x-attempt-token"];
  if (Array.isArray(headerToken)) return headerToken[0];
  if (typeof headerToken === "string") return headerToken;
  return undefined;
}

export function requireAdminSession(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractAdminToken(req);
  const claims = verifyAdminSessionToken(token);

  if (!claims) {
    res.status(401).json({ error: "Unauthorized. Missing or expired administrator session token." });
    return;
  }

  req.adminSession = claims;
  next();
}

export function requireAttemptSession(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractAttemptToken(req);
  const claims = verifyAttemptSessionToken(token);

  if (!claims) {
    res.status(401).json({ error: "Unauthorized. Missing or expired exam session token." });
    return;
  }

  const expectedAttemptId = (req.params as { attemptId?: string }).attemptId || req.body?.attemptId;
  if (expectedAttemptId && claims.attemptId !== expectedAttemptId) {
    res.status(401).json({ error: "Invalid attempt token for this attempt." });
    return;
  }

  req.attemptSession = claims;
  next();
}
