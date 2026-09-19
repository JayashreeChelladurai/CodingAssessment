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
- [x] **Syntax & Test Matrix Telemetry**: Displays student's complete source code (with Copy Code button), execution status, compile error logs, and detailed breakdown for all 10 test cases (input, expected, actual stdout, stderr, execution ms).
- **Verification Procedure**:
  1. Open Gradebook for `Test2`.
  2. Click 'View Code' for a student.
  3. Inspect question tabs (Q1 to Q5) -> Verify code, syntax layout, copy button, and test case telemetry cards.




