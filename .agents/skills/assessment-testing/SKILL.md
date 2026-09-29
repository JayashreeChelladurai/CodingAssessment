---
name: assessment-platform-testing
description: Comprehensive end-to-end testing skill and verification suite for the online assessment platform covering Professor authoring, Student attempt, multi-language coding (Java, C, C++), MCQ positive/negative scoring, time duration cut-offs, sandboxing, and concurrency.
---

# Assessment Platform – End-to-End Testing Skill

## Purpose

This document defines a comprehensive testing checklist for an online assessment platform that supports:

- Professor/Faculty assessment hosting
- Student assessment participation
- MCQ assessments
- Coding assessments
- Java, C, and C++ programming
- Automatic evaluation and scoring
- Timer and submission management
- Results and reporting
- Security, reliability, and concurrency testing

---

# 1. Professor/Admin End – Test Areas

## A. Login & Authentication

- [x] Professor login with valid credentials
- [x] Invalid username/password
- [x] Empty fields
- [x] Password visibility toggle
- [x] Logout
- [x] Session timeout
- [x] Browser refresh after login
- [x] Back-button behavior after logout

## B. Create Assessment

- [x] Create a new assessment
- [x] Enter assessment name
- [x] Add description/instructions
- [x] Set start date/time
- [x] Set end date/time
- [x] Set duration
- [x] Set total marks
- [x] Configure negative marking
- [x] Configure number of attempts
- [x] Save as draft
- [x] Publish assessment
- [x] Cancel/delete assessment

## C. MCQ Question Management

- [x] Create single-correct MCQ
- [x] Create multiple-correct MCQ
- [x] Add 2/3/4/5 options
- [x] Mark correct answer
- [x] Add marks
- [x] Add negative marks
- [x] Add explanation
- [x] Edit question
- [x] Delete question
- [x] Duplicate question
- [x] Reorder questions
- [x] Question without an option
- [x] Question without correct answer
- [x] Very long question
- [x] Special characters
- [x] Code snippets inside MCQ
- [x] Images inside questions

## D. Coding Question Management

### Java
- [x] Basic input/output
- [x] Arrays
- [x] Strings
- [x] OOP
- [x] Exception handling
- [x] Multiple test cases

### C
- [x] Basic input/output
- [x] Arrays
- [x] Pointers
- [x] Functions
- [x] Structures

### C++
- [x] Basic input/output
- [x] STL
- [x] Vectors
- [x] Strings
- [x] Classes
- [x] Multiple test cases

### Coding Question Configuration
- [x] Select programming language
- [x] Provide problem statement
- [x] Input format
- [x] Output format
- [x] Constraints
- [x] Sample input/output
- [x] Hidden test cases
- [x] Time limit
- [x] Memory limit
- [x] Starter code (Java, C, C++)
- [x] Expected function signature
- [x] Compilation configuration
- [x] Test case weighting
- [x] Partial scoring

## E. Assessment Configuration
- [x] MCQ only
- [x] Coding only
- [x] MCQ + Coding
- [x] Java-only coding test
- [x] C-only coding test
- [x] C++-only coding test
- [x] Java + C + C++ in same assessment
- [x] Different marks for different questions
- [x] Different difficulty levels
- [x] Question randomization
- [x] Option randomization

---

# 2. Student End – Test Areas

## A. Registration/Login
- [x] Valid login (Roll number + Name)
- [x] Invalid login / missing fields
- [x] Student not registered
- [x] Multiple students logging in simultaneously
- [x] Logout / SEB exit
- [x] Session expiration
- [x] Login from multiple browsers/devices

## B. Assessment Instructions
Verify that the student can see:
- [x] Assessment name
- [x] Duration
- [x] Number of questions
- [x] Marks
- [x] Negative marking
- [x] Languages allowed
- [x] Instructions
- [x] Start button

## C. MCQ Test
- [x] Select an answer
- [x] Change answer
- [x] Clear answer
- [x] Navigate next/previous
- [x] Jump to question
- [x] Mark for review
- [x] Unanswered questions
- [x] Submit assessment
- [x] Auto-save answer
- [x] Browser refresh
- [x] Browser back button
- [x] Network disconnection
- [x] Timer expiration

## D. Coding Test
For each language (Java, C, C++) test:
- [x] Compile valid code
- [x] Compilation error
- [x] Runtime error
- [x] Infinite loop (Time Limit Exceeded)
- [x] Wrong output
- [x] Correct output
- [x] Timeout
- [x] Memory limit
- [x] Multiple test cases
- [x] Hidden test cases
- [x] Large input
- [x] Empty input
- [x] Boundary values

Also test:
- [x] Run code
- [x] Submit code
- [x] Edit code after running
- [x] Submit multiple times
- [x] Switch Java → C → C++
- [x] Switch C++ → Java
- [x] Code persistence when navigating questions
- [x] Code persistence after refresh
- [x] Syntax highlighting
- [x] Indentation
- [x] Copy/paste
- [x] Very large source code

---

# 3. Coding Evaluation Tests

## A. Compilation Testing
- [x] Syntax error
- [x] Missing semicolon
- [x] Undefined variable
- [x] Wrong class name
- [x] Missing main()
- [x] Invalid include/import
> Expected result: Compilation Error (`COMPILE_ERROR`), distinguished from Wrong Answer.

## B. Runtime Testing
- [x] Division by zero
- [x] Null pointer
- [x] Array index out of bounds
- [x] Stack overflow
- [x] Segmentation fault
> Expected result: Runtime Error (`RUNTIME_ERROR`).

## C. Time Limit Testing
- [x] Submit infinite loop `while(true){}` in Java, C, and C++.
> Expected result: Time Limit Exceeded (`TIME_LIMIT_EXCEEDED`).

## D. Correctness Testing
- [x] Sample test cases
- [x] Hidden test cases
- [x] Boundary values
- [x] Large inputs
- [x] Duplicate values
- [x] Negative values
- [x] Zero
- [x] Empty input
- [x] Single element
- [x] Maximum constraints

---

# 4. Professor – Evaluation & Results

## Results Dashboard
- [x] View all students
- [x] View individual student
- [x] MCQ score
- [x] Coding score
- [x] Total score
- [x] Percentage
- [x] Rank
- [x] Time taken
- [x] Questions attempted
- [x] Questions unanswered
- [x] Correct/incorrect MCQs
- [x] Coding submissions
- [x] Compilation errors
- [x] Runtime errors
- [x] Test cases passed

## Coding Details
- [x] View submitted code
- [x] View submission history
- [x] View language used
- [x] View test cases passed
- [x] View execution time
- [x] View memory usage
- [x] View final score

---

# 5. Assessment Lifecycle Testing
Complete end-to-end flow from creation to evaluation, submission, and gradebook.

---

# 6. Timer Testing
- [x] Timer starts correctly
- [x] Timer continues after refresh
- [x] Timer does not reset after logout/login
- [x] Timer survives network interruption
- [x] Timer reaches zero
- [x] Automatic submission at zero
- [x] Student cannot submit after expiry
- [x] Server time vs client time
- [x] Changing system clock (Server-controlled timestamp prevents client clock skew)
- [x] Multiple browser tabs

---

# 7. Browser & Device Testing
- [x] Chrome / Edge / Firefox / SEB
- [x] Desktop / Laptop / Tablet / Mobile layouts

---

# 8. Network Failure Testing
- [x] Disconnect internet
- [x] Reconnect internet
- [x] Refresh page during disconnection
- [x] Auto-save recovery from local storage + heartbeat sync

---

# 9. Security Testing
- [x] Student cannot access professor dashboard (JWT role isolation)
- [x] Student cannot create or modify questions
- [x] Student cannot access answer keys or hidden test cases
- [x] Coding sandbox process isolation and timeout enforcement

---

# 10. Concurrency Testing
- [x] Multiple students compiling and submitting simultaneously
- [x] Non-blocking execution queue

---

# 11. Scoring Validation
- [x] Standard institutional scoring: Positive marks for correct, negative penalties for wrong
- [x] Proportional weighted test case partial credit

---

# 12. Data Integrity
- [x] Submissions atomic and persisted in SQLite / PostgreSQL
- [x] Assessment data survives server restart

---

# 13. UI/UX & Authentication Guardrails & Verification Procedures

### 13.1 Undo Operation Isolation & Prevention
- [x] **Undo (Ctrl+Z / Cmd+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z) Disabled**: Monaco editor keybindings for undo/redo are explicitly unmounted or disabled in the student attempt interface.
- [x] **Model Path Isolation**: Every question and language pair has an isolated Monaco model path (`path="file:///inmemory_question_${questionId}_${language}"`) to prevent text state bleeding across questions.
- **Verification Procedure**:
  1. Type code in Question 1.
  2. Navigate to Question 2 via the Question Palette or Next button.
  3. Press `Ctrl+Z` / `Cmd+Z` multiple times.
  4. Verify that Question 2's code does not revert to or inherit Question 1's edits.

### 13.2 Submission Confirmation Response
- [x] **Instant Visual Toast / Badge**: Submitting code via 'Submit Solution' or finishing an assessment immediately renders a green confirmation notification ("Code Submitted Successfully!") with a checkmark icon.
- [x] **Auto-Dismissal**: The confirmation banner automatically fades after 3 seconds without blocking user interaction.
- **Verification Procedure**:
  1. Write and test a solution.
  2. Click the 'Submit Solution' button.
  3. Verify the floating green confirmation toast appears at the bottom-right and disappears smoothly.

### 13.3 Terminal Output Auto-Reset on Question Switch
- [x] **Console State Clearing**: Switching between coding questions automatically clears `codingResult`, `customResult`, and resets `customInput`.
- [x] **Zero Stale Output**: The terminal console never displays the stdout, stderr, or test case execution results of a previously compiled question.
- **Verification Procedure**:
  1. Click 'Run Sample Cases' or 'Submit Solution' on Question 1 -> Verify output is shown in the terminal.
  2. Click on Question 2 in the palette.
  3. Verify the terminal is cleared and ready for Question 2's execution.

### 13.4 Professor Authentication Security & Zero Credential Leakage
- [x] **No Password Hints in Error Responses**: The backend API endpoint (`POST /api/auth/admin-login`) returns a generic error (`"Invalid professor security passcode. Access denied."`) with zero suggestions, hints, or password samples.
- [x] **No Pre-filled Passcodes**: The professor login page never pre-fills passcodes or includes debug auto-fill helpers for unauthorized users.
- [x] **Strict Passcode Verification**: Enforce verification strictly against the server's configured `ADMIN_PASSCODE` / `prof@2026`.
- **Verification Procedure**:
  1. Enter an incorrect passcode (e.g., `invalid123`) on the Professor Login screen.
  2. Verify that login is rejected with a generic access denied message and no password values are exposed in the UI or network response.

---

# 14. Editor Form Guardrails, Section Shuffling & Imminent Timeout Alerts

### 14.1 Pre-Save Field Validation, Error Badges & Auto-Scroll
- [x] **Required Field Enforcement**: Validates assessment title, code, duration, section titles, question titles, positive marks, MCQ option text, and correct answer selections before submission.
- [x] **Contextual Error Highlighting**: Invalid inputs render glowing red borders (`border-rose-500 ring-1 ring-rose-500/50 bg-rose-950/20`) and inline error badges.
- [x] **Smooth Auto-Scroll to First Error**: Clicking 'Save Assessment' with missing fields smoothly scrolls the viewport directly to the first invalid field and focuses it.
- **Verification Procedure**:
  1. Open the Assessment Editor and clear the Assessment Title or leave an MCQ option blank.
  2. Click 'Save Assessment'.
  3. Verify the screen automatically scrolls to the first invalid field, highlights it in red with an error message, and displays a validation summary notice.

### 14.2 Pure Single-Click Additions for Sections, Questions & MCQ Options
- [x] **Pure Immutable Updates**: State handlers for adding sections, questions, and MCQ options use pure `.map()` updates, completely eliminating duplicate/double item entries on a single click.
- **Verification Procedure**:
  1. In the Assessment Editor, click '+ Add Section', '+ MCQ Question', '+ Coding Problem', or '+ Add Option'.
  2. Verify that exactly one item is created per click without duplicates.

### 14.3 Section-Constrained Question Sequence Shuffling
- [x] **Intra-Section Randomization Only**: When `shuffleQuestions` is enabled, candidate question sequence is randomized *only within* each specific section (Part-A questions stay in Part-A, Part-B questions stay in Part-B), strictly preserving the institutional section sequence.
- **Verification Procedure**:
  1. Create a multi-section exam with Part-A (MCQs) and Part-B (Coding) with `shuffleQuestions: true`.
  2. Start attempts for 2 different students.
  3. Verify that student question orders vary within Part-A and within Part-B, but Part-A questions never cross into Part-B.

### 14.4 Instructor Portal Save Confirmation Toast
- [x] **Save Success Banner**: Saving an assessment in the Professor Portal immediately displays an animated green confirmation toast ("Assessment saved successfully!").
- **Verification Procedure**:
  1. Edit or create an assessment and click 'Save Assessment'.
  2. Verify the green toast appears at the bottom-right before navigating back to the dashboard.

### 14.5 Instructor Logout Confirmation Modal
- [x] **Accidental Logout Prevention**: Clicking 'Logout' in the Instructor Portal opens a confirmation modal ("Confirm Instructor Logout?") asking the user to confirm before clearing the session token.
- **Verification Procedure**:
  1. On the Professor Dashboard, click 'Logout'.
  2. Verify a confirmation dialog appears.
  3. Click 'Cancel' -> Verify session remains active. Click 'Yes, Log Out' -> Verify session is terminated and redirected.

### 14.6 Enhanced Final-Minutes Urgency Timer & Alerts
- [x] **$< 5$ Minutes (Warning Alert)**: Glowing amber badge with animated pulse and 'Ending Soon' indicator.
- [x] **$< 2$ Minutes (Critical Urgency Alert)**: Deep crimson bouncing glow with spinning clock icon, 'Ending' badge, and a top-bar warning banner: `⚠️ Final Cut-off Warning: Less than 2 minutes remaining! All work will auto-submit at 00:00.`
- **Verification Procedure**:
  1. Launch a student attempt and fast-forward the remaining time to 110 seconds.
  2. Verify the top urgency alert banner appears and the navbar countdown transitions to a pulsating crimson emergency theme.

### 14.7 Auto-Submission on Timeout & Finalization for All Drafted Questions
- [x] **Full Draft Auto-Evaluation**: When timer reaches 00:00 (or on manual test finish), all draft code written across all coding questions (and selected MCQ options) is automatically evaluated against all test cases and submitted as official `Submission` records.
- [x] **Zero Lost Work**: Candidates receive full credit for whatever logic they have completed even if they forgot to click 'Submit Solution' on individual questions before the cutoff.
- **Verification Procedure**:
  1. Start an attempt, type partial/complete solutions in Q1 and Q2 in draft mode without clicking 'Submit Solution'.
  2. Allow the timer to expire or click 'Finish Test'.
  3. Verify in Instructor Gradebook that Q1 and Q2 are automatically graded with corresponding test case scores and submitted source code.

### 14.8 Instructor Submitted Code & Telemetry Inspector
- [x] **1-Click Code Inspection**: Clicking 'View Code' or clicking any question mark pill in the Gradebook opens the interactive Code Inspector Modal.
- [x] **Syntax & Test Matrix Telemetry**: Displays student's complete source code (with Copy Code button), execution status, compile error logs, and detailed breakdown for all test cases (input, expected, actual stdout, stderr, execution ms).
- **Verification Procedure**:
  1. Open Gradebook for assessment.
  2. Click 'View Code' for a student.
  3. Inspect question tabs -> Verify code, syntax layout, copy button, and test case telemetry cards.

---

# 15. Assessment Conduction & Hardening Standards (100-Testcase Rule & SEB Exclusivity)

### 15.1 100-Testcase Rule & Corner Condition Matrix
- [x] **100 Automated Test Cases per Problem**: Every coding question includes exactly 100 test cases verified against canonical reference solutions.
- [x] **Corner Condition Coverage**:
  - Sample / standard cases (1-10)
  - Single elements and boundary extremes (11-20)
  - Zeros, ones, negative numbers, all-negative values (21-40)
  - Alternating signs, duplicates, sorted, reverse-sorted sequences (41-60)
  - Scale limits & stress test cases (61-100) verifying algorithmic time complexity.
- [x] **Test Case Transparency**: All test cases have `isPublic: true` so students can see which test case failed even when several pass.
- **Verification Procedure**:
  1. Submit partially correct code (e.g., handles positive numbers but fails on negative or zero values).
  2. In `TestResultViewer`, filter by "Failed".
  3. Click on the failed test case pills -> Verify the student sees the exact input, expected output, and stdout/stderr failure logs.

### 15.2 Clean Content Formatting (Zero Stray Symbols)
- [x] **No Raw Asterisks (`*`)**: Mathematical multiplications use `x` (e.g., `(-2) x 3 x (-4) = 24`). No raw markdown formatting asterisks in question text.
- [x] **No Dollar Signs (`$`)**: No LaTeX math delimiters (e.g., `$N \le 100$`). Written in clean plain text: `N <= 100`.
- [x] **No Markdown Header Hashes (`#`)**: Section titles use plain-text headers without `#` or `##`.
- [x] **Backend Sanitizer**: `sanitizeQuestionContent()` automatically cleans question text on create and update.
- **Verification Procedure**:
  1. Inspect the student view for any question.
  2. Verify zero occurrences of `*`, `$`, or `#` in titles, descriptions, and examples.

### 15.3 Safe Exam Browser (SEB) Exclusivity & Violation Guardrails
- [x] **SEB Mandatory**: `requireSeb: true`, `sebQuitPassword: "exit123"`.
- [x] **No In-Browser Lockdown Shields**: `<FullscreenLockdown />` and `select-none` text blocking unmounted.
- [x] **Strict Violation Filter**: Violations are triggered **ONLY** if SEB is closed (`SEB_EXIT`) or bypassed (`SEB_TAMPER`).
- [x] **Zero False Lockouts**: Window blur, dual-screen focus shifts, and devtools checks are completely ignored.
- [x] **No Mid-Test Restarts**: Exam sessions, draft code, and countdowns never reload or clear mid-exam.
- **Verification Procedure**:
  1. Click outside the browser window or switch displays inside SEB.
  2. Verify that no violation warning or lockout overlay appears and the test does not reload.

### 15.4 Anti-Reset Timer Architecture
- [x] **Authoritative Server Timer**: Starts from server's calculated `attempt.remainingSeconds`.
- [x] **Monotonic Client Delta**: Active countdown computed from local monotonic anchor (`Date.now() - anchor.startedAtMs`), immune to server/client clock differences, timezone discrepancies, and interval sleep drift.
- [x] **Immutability on Refresh**: Refreshing the browser or reconnecting never resets the timer to 60:00.
- **Verification Procedure**:
  1. Start an assessment and wait 2 minutes (timer shows 58:00).
  2. Refresh the browser page (`F5` or `Ctrl+R`).
  3. Verify the timer resumes from ~57:58 and does NOT reset to 60:00 or evaluate to 00:00.

### 15.5 Student Socket & Draft Isolation
- [x] **Private Room Join**: Students join ONLY `student:${attemptId}`, never shared exam broadcast rooms.
- [x] **Zero Cross-Student Code Leaks**: Code drafts and broadcasts remain strictly point-to-point.
- **Verification Procedure**:
  1. Open two concurrent student sessions (Student A and Student B).
  2. Type code in Student A's editor.
  3. Verify that Student B's editor remains completely unaffected.

### 15.6 Auto-Submit & Automatic SEB Termination
- [x] **Storage Eviction on Submit**: `handleAutoSubmit()`, `handleFinalSubmit()`, and `handleExitSeb()` immediately purge `active_attempt`, `active_assessment`, `active_view`, and the session token from `localStorage` and `sessionStorage`.
- [x] **Auto-Save on Expiry**: When timer reaches 00:00, all unsaved drafts are flushed to SQLite via `api.saveDraft`.
- [x] **Finalization**: Calls `api.finishAssessment` to mark attempt completed.
- [x] **SEB Auto-Quit**: Redirects to `${origin}/quit` and executes `window.close()` after 3 seconds to cleanly terminate SEB without student confirmation.
- **Verification Procedure**:
  1. Let the countdown timer reach 00:00.
  2. Verify drafts are saved and the browser navigates to `/quit`, closing SEB.
  3. Check browser `localStorage` and verify that `active_attempt` and `active_view` have been deleted.

### 15.7 Student IP Address & Device Audit Logging
- [x] **Client Metadata Detection**: `getClientDeviceInfo()` captures OS, platform, browser, and screen resolution.
- [x] **IPv4 Extraction**: Server captures client IPv4 address from connection headers.
- [x] **Gradebook Display**: IP address and device details are displayed in the Code Inspector and exported to CSV.
- **Verification Procedure**:
  1. Submit an attempt.
  2. Open Professor Gradebook -> Click 'View Code'.
  3. Verify the student's IP address and device specifications are visible in the inspector header.

### 15.8 SEB Reopen & Stale Session Guard Testing
- [x] **No Infinite Closing Loop**: Relaunching Safe Exam Browser after an assessment has completed or expired always loads the clean Student Login page rather than re-entering an expired test and immediately closing.
- [x] **Attempt Validity Filter**: `isAttemptValid(attempt, assessment)` rejects any attempt that is `SUBMITTED`, `TIME_EXPIRED`, or has `remainingSeconds <= 0`.
- [x] **URL Test Code Synchronization**: If SEB launches with `?code=B3` while storage contains an attempt for another test code, old attempt storage is purged immediately.
- **Verification Procedure**:
  1. Launch SEB for an assessment and complete or let the test expire.
  2. After SEB terminates, reopen SEB manually.
  3. Verify that SEB lands smoothly on the Student Login screen with empty fields and does NOT show 00:00 or enter a rapid close/reopen loop.
