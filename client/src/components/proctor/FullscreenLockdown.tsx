import React, { useEffect, useState } from "react";
import { ShieldAlert, Maximize, AlertCircle } from "lucide-react";

interface FullscreenLockdownProps {
  isFullscreen: boolean;
  onEnterFullscreen: () => void;
  onViolation: (type: string, details?: string) => void;
  isLocked: boolean;
  isCompleted: boolean;
}

export const FullscreenLockdown: React.FC<FullscreenLockdownProps> = ({
  isFullscreen,
  onEnterFullscreen,
  onViolation,
  isLocked,
  isCompleted,
}) => {
  const [showWarningToast, setShowWarningToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowWarningToast(msg);
    setTimeout(() => {
      setShowWarningToast(null);
    }, 2500);
  };

  useEffect(() => {
    if (isLocked || isCompleted) return;

    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (!isCurrentlyFullscreen && isFullscreen) {
        onViolation("FULLSCREEN_EXIT", "Student exited full screen mode.");
      }
    };

    // 2. Visibility change (Tab switch / Minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation("TAB_SWITCH", "Document became hidden (switched tab or minimized window).");
      }
    };

    // 3. Window blur / Control Loss (Clicked outside, Alt+Tabbed, or clicked ChatGPT/overlay)
    const handleBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus() && !isLocked && !isCompleted) {
          onViolation("CONTROL_LOST", "Input control departed from exam window (interacted with external window/overlay).");
        }
      }, 100);
    };

    // 3b. Active Proactive Focus Poller (catches silent overlay focus steals every 200ms)
    const focusPoller = setInterval(() => {
      if (!document.hasFocus() && !isLocked && !isCompleted) {
        onViolation("CONTROL_LOST", "Active window focus was lost to an external overlay or background application.");
      }
    }, 200);

    // 4. Keyboard Shortcuts Interception & Copy/Paste/Screenshot Blocking
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen key
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        onViolation("SCREENSHOT_ATTEMPT", "Attempted to capture screen (PrintScreen).");
        return false;
      }

      // Block F11, F12, Escape
      if (e.key === "F11" || e.key === "F12" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "F12") {
          onViolation("DEVTOOLS_ATTEMPT", "Attempted to open browser Developer Tools (F12).");
        }
        return false;
      }

      const isCmdOrCtrl = e.ctrlKey || e.metaKey;

      // Block Screenshot Shortcuts: Win/Cmd + Shift + S / 3 / 4 / 5
      if ((isCmdOrCtrl && e.shiftKey && ["s", "S", "3", "4", "5"].includes(e.key)) || (e.shiftKey && e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        onViolation("SCREENSHOT_ATTEMPT", "Attempted to trigger screenshot snippet tool.");
        return false;
      }

      // Block Alt + Space (ChatGPT Companion Window / Window Menu shortcut)
      if (e.altKey && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
        e.stopPropagation();
        onViolation("OVERLAY_SHORTCUT", "Attempted to invoke floating companion overlay (Alt+Space).");
        return false;
      }

      // Block Ctrl/Cmd+Shift+I / Ctrl/Cmd+Shift+J / Ctrl/Cmd+Shift+C (DevTools)
      if (isCmdOrCtrl && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        onViolation("DEVTOOLS_ATTEMPT", "Attempted to open DevTools shortcut.");
        return false;
      }

      // Block Ctrl/Cmd+C (Copy), Ctrl/Cmd+V (Paste), Ctrl/Cmd+X (Cut), Ctrl/Cmd+A (Select All), Ctrl/Cmd+U, Ctrl/Cmd+P
      if (isCmdOrCtrl && ["c", "C", "v", "V", "x", "X", "a", "A", "u", "U", "p", "P"].includes(e.key)) {
        const target = e.target as HTMLElement;
        const isMonaco = target?.closest(".monaco-editor");

        if (!isMonaco || (isCmdOrCtrl && ["c", "C", "v", "V", "u", "U", "p", "P"].includes(e.key))) {
          e.preventDefault();
          e.stopPropagation();
          triggerToast("Clipboard copy and paste are disabled during this exam.");
          return false;
        }
      }

      // Block Ctrl/Cmd+W (close tab) / Ctrl/Cmd+R / F5 (reload) / Cmd+Q (Quit app on Mac)
      if (isCmdOrCtrl && ["w", "W", "r", "R"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block Alt+Tab or Alt+Left/Right / Cmd+Tab on Mac
      if (e.altKey || (e.metaKey && e.key === "Tab")) {
        e.preventDefault();
        e.stopPropagation();
        onViolation("SUSPICIOUS_KEY", "Application switching key combination attempted.");
        return false;
      }
    };

    // 5. Block context menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerToast("Right-click context menu is disabled.");
      return false;
    };

    // 6. Block Copy, Cut, Paste browser events
    const handleClipboardEvent = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerToast("Clipboard actions (copy/cut/paste) are strictly prohibited.");
      return false;
    };

    // 7. Block Drag & Drop of text
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleClipboardEvent, true);
    document.addEventListener("cut", handleClipboardEvent, true);
    document.addEventListener("paste", handleClipboardEvent, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      clearInterval(focusPoller);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleClipboardEvent, true);
      document.removeEventListener("cut", handleClipboardEvent, true);
      document.removeEventListener("paste", handleClipboardEvent, true);
      document.removeEventListener("dragstart", handleDragStart, true);
    };
  }, [isFullscreen, isLocked, isCompleted, onViolation]);

  return (
    <>
      {/* Toast Alert for Blocked Clipboard/Right-Click */}
      {showWarningToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-rose-400 animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>{showWarningToast}</span>
        </div>
      )}

      {/* Fullscreen Entry Modal if not yet entered */}
      {!isFullscreen && !isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Proctored Assessment Lockdown</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                This assessment enforces strict control tracking. Moving the cursor outside or switching to external applications will trigger an instant exam lock.
              </p>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-300 text-left space-y-2 border border-slate-700/50">
              <p className="font-semibold text-slate-200">Security Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Keep cursor and keyboard control inside the exam at all times.</li>
                <li>Do not press <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-200">Alt+Tab</kbd> or switch applications.</li>
                <li>Stay on the exam tab until final submission.</li>
              </ul>
            </div>

            <button
              onClick={onEnterFullscreen}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3.5 px-6 rounded-xl transition shadow-lg shadow-emerald-900/30"
            >
              <Maximize className="w-5 h-5" />
              <span>Enter Full Screen & Start Exam</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
