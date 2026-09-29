# Assessment Platform Rules & Guidelines

These rules apply to all AI agents and developers operating in this codebase. They must be followed whenever creating, seeding, or modifying assessments.

## Mandatory Assessment Criteria (Always Enforce)

### 1. 100 Test Cases per Problem
- Every coding challenge must include **100 automated test cases** covering the full spectrum of edge cases:
  - Minimum and maximum constraints
  - Zero, one, negative numbers, all-negative cases
  - Alternating signs, duplicates, sorted, reverse-sorted
  - Performance/time limit stress inputs
- All test cases must have `isPublic: true` so students can see which test cases failed, even when several cases pass.

### 2. Clean Content Formatting (Zero Stray Symbols)
- Descriptions, titles, and explanations must contain **NO** stray formatting symbols:
  - **No `*`**: Use `x` for multiplication (e.g., `2 x 3 = 6`). Do not use markdown `*` or `**` in problem descriptions.
  - **No `$`**: Do not use LaTeX math delimiters like `$N \le 100$`. Use plain text: `N <= 100`.
  - **No `#`**: Do not use markdown heading symbols (`#`, `##`). Use plain-text section titles.

### 3. Safe Exam Browser (SEB) Exclusivity
- SEB is mandatory: `requireSeb: true`, `sebQuitPassword: "exit123"`.
- Do NOT enforce any browser-level fullscreen lockdown or blur restrictions.
- Raise violations **ONLY** if SEB is closed (`SEB_EXIT`) or bypassed (`SEB_TAMPER`). Discard all other events.
- Never restart or clear the exam mid-test for any reason.

### 4. Timer & Code Isolation
- Individual student timers: countdown starts from `attempt.startedAt` for each student individually.
- The timer must never reset on page refresh or reconnection.
- Students must only join private socket rooms (`student:${attemptId}`). Never broadcast student code or allow cross-student code mingling.
- Auto-submit: When the countdown reaches 0, auto-save all code drafts, submit the assessment, and automatically redirect to `/quit` to terminate SEB.
- Track student IP address and device information (`deviceInfo`) on entry and violations.
