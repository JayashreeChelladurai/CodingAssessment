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

  if (userAgent.includes("SafeExamBrowser") || userAgent.includes("SEB/") || sebHeader) {
    return true;
  }
  return false;
}

/**
 * Generate official SEB (.seb) XML Plist Configuration File
 * Enforces CreateNewDesktop isolation, Screen Capture Protection, and Process Blocker
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
    <string>SEB_Win_3.x</string>
    <key>startURL</key>
    <string>${startUrl}</string>
    <key>title</key>
    <string>${title}</string>
    <key>allowQuit</key>
    <true/>
    <key>hashedQuitPassword</key>
    <string>${hashedQuitPassword}</string>
    <key>quitURL</key>
    <string>seb://quit</string>
    <key>browserViewMode</key>
    <integer>0</integer>
    <key>kioskMode</key>
    <string>CreateNewDesktop</string>
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
    <key>hideBrowserWindowToolbar</key>
    <true/>
    <key>showMenuBar</key>
    <false/>
    <key>showSideMenu</key>
    <false/>
    <key>clearClipboardOnStart</key>
    <true/>
    <key>clearClipboardOnExit</key>
    <true/>
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
    <key>enableRightMouse</key>
    <false/>
    <key>mainBrowserWindowWidth</key>
    <string>100%</string>
    <key>mainBrowserWindowHeight</key>
    <string>100%</string>
    <key>mainBrowserWindowPositioning</key>
    <integer>0</integer>
    <key>killProcessList</key>
    <array>
        <dict>
            <key>executable</key>
            <string>chrome.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>msedge.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>firefox.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>brave.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>opera.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>chatgpt.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>ChatGPT.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>WindowsSandbox.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>WindowsSandboxClient.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>SnippingTool.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>ScreenClippingHost.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>obs64.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>VirtualBoxVM.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>VBoxSVC.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>vmware.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>vmware-vmx.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>DeskPins.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>TurboTop.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>PowerToys.AlwaysOnTop.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>discord.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>telegram.exe</string>
        </dict>
        <dict>
            <key>executable</key>
            <string>whatsapp.exe</string>
        </dict>
    </array>
</dict>
</plist>`;
}
