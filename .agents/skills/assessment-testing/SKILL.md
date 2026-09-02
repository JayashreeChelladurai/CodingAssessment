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
