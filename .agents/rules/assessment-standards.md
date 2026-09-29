# Assessment Creation & Platform Standards

These rules are ALWAYS active across all assessment creation, modification, database seeding, and test execution on this platform. Every assessment created now and in the future must strictly comply with these specifications.

---

## 1. Problem & Test Case Standards (100-Testcase Rule)
- **100 Test Cases per Problem**: Every coding problem must include exactly 100 automated test cases covering correctness, boundary conditions, edge cases, and performance limits.
- **Corner & Edge Case Matrix**:
  - Sample & public test cases (basic examples from the description)
  - Extreme values (minimum and maximum integer constraints, large inputs)
  - Single elements, empty structures (where permitted), 0s, 1s, negative numbers, all-negative collections
  - Alternating values, duplicates, strictly increasing, strictly decreasing, and arbitrary permutations
  - Large-scale inputs to verify time complexity guarantees (e.g. O(N) or O(N log N) vs O(N^2))
- **Test Case Transparency**:
  - All test cases (or all evaluation cases) must have `isPublic: true` so students can see which test cases failed, even when several cases pass.
  - The test runner UI must display the exact input, expected output, and stdout/stderr failure diagnostics for each case.
- **Language Support**:
  - Java must always be supported with complete boilerplate:
    ```java
    import java.util.Scanner;

    public class Solution {
        public static void main(String[] args) {
            Scanner scanner = new Scanner(System.in);
            // I/O parsing
        }
    }
    ```

---

## 2. Content Formatting Standards (Zero Stray Symbols)
- **Zero Stray Symbols**: Question titles, descriptions, and explanations must NEVER contain stray or unformatted markdown/math symbols:
  - **NO raw asterisks (`*`)**: Never use `*` for multiplication; use `x` instead (e.g., `(-2) x 3 x (-4) = 24`). Do not leave raw markdown asterisks (`**` or `*`) in description text.
  - **NO dollar signs (`$`)**: Do not use LaTeX math delimiters (e.g., `$N \le 100$`). Write clear plain text: `N <= 100`, `O(N)`.
  - **NO markdown header hashes (`#`)**: Do not use `#`, `##`, `###` in descriptions. Use plain-text titled sections (`Problem Statement:`, `Input Format:`, `Output Format:`, `Examples:`).

---

## 3. Safe Exam Browser (SEB) Exclusivity & Violation Policy
- **SEB Exclusivity**:
  - All assessments must enforce SEB (`requireSeb: true`, `sebQuitPassword: "exit123"`).
  - DO NOT enforce non-SEB protection mechanisms inside the web client (no intrusive `<FullscreenLockdown />`, no blur lockouts, no text-selection blocking).
- **Strict Violation Policy**:
  - Violations and lockouts are raised **ONLY** when SEB is bypassed (`SEB_TAMPER`) or closed (`SEB_EXIT`).
  - All other events (tab blur, dual-monitor focus shift, window resize, devtools inspection) must be strictly ignored.
- **No Mid-Test Restarts**:
  - The test session, student draft code, and countdown timer must never be cleared, restarted, or reset for any reason during the test.

---

## 4. System Isolation & Timer Resilience
- **Individual Student Timers**:
  - The timer countdown begins individually for each student when they start their assessment (`attempt.startedAt`).
  - Remaining time is strictly computed as:
    `remainingSeconds = (durationMinutes * 60) - floor((Date.now() - startedAt) / 1000)`
  - The timer must NEVER restart or reset to full duration on page reload, network drop, or SEB restart.
- **Code & Socket Isolation**:
  - Students join ONLY their private socket room `student:${attemptId}`.
  - Students must NEVER join shared broadcast rooms (e.g., `exam:${assessmentId}`).
  - Cross-student code mingling or draft leakage is strictly prevented.
- **Auto-Submit & Automatic SEB Termination**:
  - When the timer reaches 0, the client automatically flushes all question drafts to the database via `api.saveDraft`.
  - Calls `api.finishAssessment` to finalize the attempt.
  - Automatically redirects to `${origin}/quit` and executes `window.close()` to cleanly terminate Safe Exam Browser without student interaction.
- **Student Audit & Device Logging**:
  - The student's IPv4 address (`ipAddress`) and hardware/browser metadata (`deviceInfo`) must be captured upon entry and on infractions, and displayed to the professor in the Gradebook Code Inspector and CSV exports.
