import crypto from "crypto";

export interface SebConfigOptions {
  assessmentCode: string;
  startUrl: string;
  quitPassword?: string;
  title?: string;
}

/**
 * Check if the incoming request originates from Safe Exam Browser
 */
export function isSebRequest(req: any): boolean {
  const userAgent = req.headers["user-agent"] || "";
  const sebHeader = req.headers["x-safeexambrowser-requesthash"] || req.headers["x-safeexambrowser-configkeyhash"];

  if (
    userAgent.includes("SafeExamBrowser") ||
    userAgent.includes("SEB/") ||
    userAgent.includes("SEB ") ||
    sebHeader
  ) {
    return true;
  }
  return false;
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

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>originatorVersion</key>
    <string>SEB_Universal_3.x</string>
    <key>startURL</key>
    <string>${startUrl}</string>
    <key>title</key>
    <string>${title}</string>
    
    <!-- Quit & Password Policies -->
    <key>allowQuit</key>
    <true/>
    <key>hashedQuitPassword</key>
    <string>${hashedQuitPassword}</string>
    <key>quitURL</key>
    <string>seb://quit</string>
    
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
