import crypto from "crypto";

export interface SebConfigOptions {
  assessmentCode: string;
  startUrl: string;
  quitPassword?: string;
  title?: string;
}

const SEB_HMAC_SECRET = process.env.SEB_HMAC_SECRET || process.env.JWT_SECRET || "seb-assessment-hmac-secret-2026";

/**
 * Generate a cryptographically signed HMAC token bound to the specific assessment code.
 */
export function generateSebToken(assessmentCode: string): string {
  const cleanCode = assessmentCode.trim().toUpperCase();
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${cleanCode}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", SEB_HMAC_SECRET).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

/**
 * Verify that the SEB token is valid, matches the assessment code, and hasn't been forged.
 */
export function verifySebToken(token?: string, assessmentCode?: string): boolean {
  if (!token || typeof token !== "string" || !assessmentCode) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [code, timestampStr, hmac] = parts;

  if (code.toUpperCase() !== assessmentCode.trim().toUpperCase()) {
    return false;
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const expectedHmac = crypto.createHmac("sha256", SEB_HMAC_SECRET).update(`${code}:${timestamp}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

/**
 * Check if the incoming request originates from Safe Exam Browser and passes HMAC token verification
 */
export function isSebRequest(req: any, assessmentCode?: string): boolean {
  if (!req || !req.headers) return false;
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();
  const sebHeader =
    req.headers["x-safeexambrowser-requesthash"] ||
    req.headers["x-safeexambrowser-configkeyhash"] ||
    req.headers["x-seb-request-hash"] ||
    req.headers["x-seb-config-key-hash"];

  const hasSebHeadersOrAgent =
    userAgent.includes("safeexambrowser") ||
    userAgent.includes("seb/") ||
    userAgent.includes("seb ") ||
    userAgent.includes("seb_") ||
    Boolean(sebHeader);

  if (!hasSebHeadersOrAgent) {
    return false;
  }

  // If candidate token is provided, cryptographically verify it matches this assessment
  const candidateToken =
    (req.headers["x-seb-token"] as string | undefined) ||
    (req.query?.sebToken as string | undefined) ||
    (req.body?.sebToken as string | undefined);

  if (candidateToken && candidateToken.trim() !== "" && candidateToken !== "undefined" && candidateToken !== "null") {
    return verifySebToken(candidateToken, assessmentCode);
  }

  // If no candidate token was provided, but client is confirmed running inside Safe Exam Browser
  return true;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Accurately resolve client host and protocol for LAN and proxy setups
 * Prevents loopback 127.0.0.1 leakage when students access over LAN (e.g., 10.1.25.20:3003)
 */
export function resolveRequestHost(req: any): { host: string; protocol: string } {
  const clientHostQuery = req.query?.clientHost as string | undefined;
  const clientProtocolQuery = req.query?.clientProtocol as string | undefined;

  const forwardedHost = (req.headers?.["x-forwarded-host"] as string)?.split(",")[0]?.trim();
  const forwardedProto = (req.headers?.["x-forwarded-proto"] as string)?.split(",")[0]?.trim();

  let host = clientHostQuery || forwardedHost || req.get?.("host") || "localhost:3000";
  let protocol = clientProtocolQuery || forwardedProto || req.protocol || "http";

  // If host is explicitly loopback (127.0.0.1 / localhost), but the client accessed from LAN via a referer:
  const referer = (req.headers?.["referer"] || req.headers?.["referrer"]) as string | undefined;
  if (referer && (host.startsWith("127.0.0.1") || host.startsWith("localhost"))) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.host && !refUrl.host.startsWith("127.0.0.1") && !refUrl.host.startsWith("localhost")) {
        host = refUrl.host;
        protocol = refUrl.protocol.replace(":", "");
      }
    } catch {
      // ignore
    }
  }

  return { host, protocol };
}

/**
 * Generate Universal Cross-Platform SEB (.seb) XML Plist Configuration File
 * Compatible with macOS (Sonoma, Ventura, Monterey, Big Sur) and Windows (10, 11)
 */
export function generateSebConfig(options: SebConfigOptions): string {
  const { startUrl, quitPassword = "exit123", title = "ProctorExam Assessment" } = options;

  // SHA256 hash of quit password
  const hashedQuitPassword = crypto
    .createHash("sha256")
    .update(quitPassword, "utf-8")
    .digest("hex");

  let quitUrl = "http://localhost:3000/quit";
  try {
    const parsed = new URL(startUrl);
    quitUrl = `${parsed.protocol}//${parsed.host}/quit`;
  } catch {
    quitUrl = "http://localhost:3000/quit";
  }

  const xmlStartUrl = escapeXml(startUrl);
  const xmlTitle = escapeXml(title);
  const xmlQuitUrl = escapeXml(quitUrl);

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>originatorVersion</key>
    <string>SEB_Universal_3.x</string>
    <key>startURL</key>
    <string>${xmlStartUrl}</string>
    <key>title</key>
    <string>${xmlTitle}</string>
    
    <!-- Quit & Password Policies -->
    <key>allowQuit</key>
    <true/>
    <key>hashedQuitPassword</key>
    <string>${hashedQuitPassword}</string>
    <key>quitURL</key>
    <string>${xmlQuitUrl}</string>
    <key>quitURLConfirm</key>
    <false/>
    
    <!-- Universal Fullscreen & Kiosk Policies -->
    <key>browserViewMode</key>
    <integer>0</integer>
    <key>openInWindow</key>
    <false/>
    <key>showTaskBar</key>
    <true/>
    <key>taskBarNotificationArea</key>
    <false/>
    <key>showTime</key>
    <false/>
    <key>showInputLanguage</key>
    <false/>
    <key>showReloadButton</key>
    <false/>
    <key>showNavigationButtons</key>
    <false/>
    <key>hideBrowserWindowToolbar</key>
    <true/>
    <key>showMenuBar</key>
    <false/>
    <key>showSideMenu</key>
    <false/>
    
    <!-- Security & Hardware Lockdown -->
    <key>allowPreferencesWindow</key>
    <false/>
    <key>allowDeveloperConsole</key>
    <false/>
    <key>allowSpellCheck</key>
    <false/>
    <key>allowDownUploads</key>
    <false/>
    <key>allowFlashFullscreen</key>
    <false/>
    <key>allowDictionaryLookup</key>
    <false/>
    <key>allowVirtualMachine</key>
    <false/>
    <key>allowDisplayMirroring</key>
    <false/>
    <key>allowScreenCapture</key>
    <false/>
    <key>allowVideoCapture</key>
    <false/>
    <key>enableScreenCaptureProtection</key>
    <true/>
    <key>enablePrintScreen</key>
    <false/>
    <key>enableScreenSharing</key>
    <false/>
    <key>allowScreenSharing</key>
    <false/>
    <key>clearClipboardOnStart</key>
    <true/>
    <key>clearClipboardOnExit</key>
    <true/>
    <key>enableRightMouse</key>
    <false/>
    
    <!-- Windows-Specific Keys -->
    <key>enableAltEsc</key>
    <false/>
    <key>enableAltF4</key>
    <false/>
    <key>enableAltTab</key>
    <false/>
    <key>enableCtrlEsc</key>
    <false/>
    <key>enableEsc</key>
    <false/>
    <key>enableStartMenu</key>
    <false/>
    <key>enableSystemKey</key>
    <false/>
    <key>hookKeys</key>
    <true/>
    <key>enableAltSpace</key>
    <false/>
    <key>allowWindowMaximize</key>
    <false/>
    <key>allowWindowMinimize</key>
    <false/>
    <key>allowWindowResize</key>
    <false/>
    <key>browserWindowAllowMinimize</key>
    <false/>
    <key>browserWindowAllowMaximize</key>
    <false/>
    <key>browserWindowAllowClose</key>
    <false/>
    <key>browserWindowShowURL</key>
    <false/>
    <key>browserWindowShowTitle</key>
    <false/>

    <!-- macOS-Specific Keys -->
    <key>enableCmdTab</key>
    <false/>
    <key>enableCmdEsc</key>
    <false/>
    <key>enableSpotlight</key>
    <false/>
    <key>enableForceQuit</key>
    <false/>
    <key>enableAppSwitcherCheck</key>
    <true/>
    <key>allowUserSwitching</key>
    <false/>
    <key>allowSiri</key>
    <false/>
    <key>allowDictation</key>
    <false/>
    <key>enableTouchBar</key>
    <false/>
    
    <!-- Window Dimensions -->
    <key>mainBrowserWindowWidth</key>
    <string>100%</string>
    <key>mainBrowserWindowHeight</key>
    <string>100%</string>
    <key>mainBrowserWindowPositioning</key>
    <integer>0</integer>
    
    <!-- Prohibited Process Blacklist (Windows & macOS) -->
    <key>killProcessList</key>
    <array>
        <!-- Windows Processes -->
        <dict>
            <key>executable</key>
            <string>chrome.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>msedge.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>firefox.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>chatgpt.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>ChatGPT.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>WindowsSandbox.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>SnippingTool.exe</string>
            <key>os</key>
            <integer>1</integer>
        </dict>
        
        <!-- macOS Processes -->
        <dict>
            <key>executable</key>
            <string>Google Chrome</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>Safari</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>ChatGPT</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>Discord</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>Telegram</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>WhatsApp</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
        <dict>
            <key>executable</key>
            <string>Slack</string>
            <key>os</key>
            <integer>2</integer>
        </dict>
    </array>
</dict>
</plist>`;
}
