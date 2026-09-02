# Security Audit Report

## CodingAssessment

| Field | Value |
|---|---|
| Repository | `https://github.com/JayashreeChelladurai/CodingAssessment` |
| Audited commit | `979142e55a427e76176b88af6cf9e38a08dafcc0` |
| Audit date | 2 September 2026 |
| Audit mode | Full, daily-confidence security review |
| Review type | Static analysis, dependency review, git-history review, data-flow tracing, independent verification, and safe local validation |
| Overall status | **Critical risk — not safe for production or real assessments** |

## Executive Summary

The application has a fundamentally broken trust model. The browser displays an instructor login screen and stores a generated “admin token,” but the server never validates that token. Every administrative assessment and results API is publicly callable. The Socket.IO service similarly accepts instructor and student events from unauthenticated clients.

The most severe vulnerability is an unauthenticated code-execution endpoint that compiles and runs user-supplied Java, C, and C++ directly on the application host. The executed process inherits the server environment and is not contained by a container, operating-system sandbox, network boundary, or restricted service account. A harmless local verification program successfully read a canary environment variable from the server process, confirming host-level code execution.

The assessment integrity controls can also be bypassed. Students can impersonate other students using predictable roll numbers, discover correct MCQ answers by repeatedly submitting choices, modify attempts they do not own, control their remaining exam time, bypass Safe Exam Browser enforcement, and invoke unauthenticated instructor Socket.IO actions.

### Finding Totals

| Severity | Count |
|---|---:|
| Critical | 4 |
| High | 6 |
| Medium | 1 |
| **Total verified vulnerabilities** | **11** |

## Immediate Recommendation

Do not expose this application to the internet or use it for a real assessment in its current state.

Before deployment:

1. Disable the code-execution endpoints or place execution inside a properly isolated sandbox.
2. Add server-validated authentication and authorization to all instructor HTTP and Socket.IO operations.
3. Add authenticated, server-bound student attempt sessions.
4. Rotate and remove all hardcoded instructor passcodes.
5. Correct the assessment update transaction before allowing edits.
6. Treat all existing assessment content, passcodes, and results from an exposed deployment as potentially compromised.

## Scope and Methodology

The audit covered:

- Express routes and middleware
- Socket.IO connection and event handlers
- Student identity, attempt ownership, and state transitions
- Instructor authentication and authorization
- Assessment authoring, answer keys, hidden test cases, and results
- Java, C, and C++ compilation and execution
- Safe Exam Browser enforcement
- Prisma schema and database relationships
- CSV gradebook export
- Client-to-server API usage
- Git history and tracked secret patterns
- NPM lockfiles and dependency advisories
- Build configuration and production compilation
- CI/CD, container, infrastructure-as-code, webhooks, uploads, and AI/LLM surface

Only findings with a confidence score of at least 8/10 and a concrete attack path were included. Generic hardening suggestions, theoretical denial-of-service concerns, test-only behavior, ordinary CORS warnings, and unverified third-party binary concerns were excluded from the vulnerability count.

### Validation Performed

- The codebase was indexed and traced through its route, function, and data-flow relationships.
- Authentication middleware and authorization-header usage were searched across the complete application source.
- Administrative, student, Socket.IO, SEB, and CSV findings received independent source review.
- The code-execution finding was safely self-verified locally after the independent verifier was unavailable.
- `npm audit --package-lock-only` was run for the root, server, and client lockfiles.
- The client production build was executed successfully.
- The server production build was executed and failed with a reproducible TypeScript configuration error.
- Git history was scanned for known external-provider credential formats and suspicious credential terms.

No live third-party service, production environment, external credential, or real student record was accessed.

## Architecture and Trust Boundaries

The repository contains:

- A React/Vite browser client
- An Express API server
- A Socket.IO real-time proctoring service
- Prisma with a local SQLite database
- A Java/C/C++ code compilation and execution service
- Safe Exam Browser configuration generation and request detection
- A committed Windows compiler toolchain

The client calls the server directly through `/api/*` and Socket.IO. The server mounts all routers after only CORS and JSON-body middleware. There is no authentication or authorization middleware between the network and the assessment, results, execution, or Socket.IO handlers.

The main trust boundaries are:

1. Anonymous internet client to Express API
2. Anonymous Socket.IO client to instructor and student rooms
3. Student-controlled identifiers to Prisma database records
4. Student-supplied source code to native host processes
5. User-controlled spreadsheet fields to instructor-opened CSV exports
6. Spoofable HTTP headers to Safe Exam Browser enforcement

## Attack Surface

| Surface | Observed |
|---|---:|
| Public HTTP paths | 23 |
| Server-authenticated paths | 0 |
| Server-enforced instructor-only paths | 0 |
| API paths | 20 |
| Inbound Socket.IO event types | 5 |
| File uploads | 0 |
| Webhook receivers | 0 |
| Background jobs | 0 |
| External application integrations | 0 |
| CI/CD workflows | 0 |
| Application deployment configurations | 0 |
| Infrastructure-as-code configurations | 0 |
| LLM/AI integrations | 0 |

## Security Findings Summary

| ID | Severity | Confidence | Finding | Primary evidence |
|---:|---|---:|---|---|
| 1 | Critical | 10/10 | Administrative APIs are completely unauthenticated | `server/src/routes/assessment.ts:8` |
| 2 | Critical | 10/10 | Unauthenticated user code executes directly on the host | `server/src/routes/execution.ts:9` |
| 3 | Critical | 10/10 | MCQ oracle and unowned submissions permit grade manipulation | `server/src/routes/student.ts:254` |
| 4 | Critical | 10/10 | Socket.IO events have no authentication or authorization | `server/src/services/socketService.ts:5` |
| 5 | High | 9/10 | Predictable roll numbers enable student attempt takeover | `server/src/routes/student.ts:60` |
| 6 | High | 9/10 | Client-controlled drafts, answers, and timers overwrite server state | `server/src/routes/student.ts:217` |
| 7 | High | 10/10 | Safe Exam Browser enforcement trusts spoofable headers | `server/src/services/sebService.ts:13` |
| 8 | High | 9/10 | Universal instructor credentials are hardcoded | `server/src/routes/auth.ts:6` |
| 9 | High | 9/10 | Assessment updates delete dependent data before validation | `server/src/routes/assessment.ts:193` |
| 10 | High | 9/10 | Review mode exposes other students’ private records | `server/src/routes/student.ts:360` |
| 11 | Medium | 8/10 | Gradebook export permits stored CSV formula injection | `server/src/routes/results.ts:163` |

---

## Finding 1: Administrative APIs Are Completely Unauthenticated

**Severity:** Critical
**Confidence:** 10/10
**Status:** Verified
**Category:** OWASP A01 — Broken Access Control

### Evidence

- `server/src/index.ts:43-47` mounts the authentication, assessment, student, execution, and results routers directly.
- `server/src/routes/assessment.ts:8` exposes the assessment list.
- `server/src/routes/assessment.ts:37` exposes complete individual assessments.
- `server/src/routes/assessment.ts:103` creates assessments.
- `server/src/routes/assessment.ts:193` replaces assessments.
- `server/src/routes/assessment.ts:276` unlocks review mode.
- `server/src/routes/assessment.ts:293` deletes assessments.
- `server/src/routes/assessment.ts:303` clones assessments.
- `server/src/routes/results.ts:7` returns the complete gradebook.
- `server/src/routes/results.ts:107` exports the gradebook.
- `client/src/services/api.ts` sends no authentication header with instructor requests.

### Description

The login response creates a token-like string, but the server never stores, signs, parses, or validates it. The client keeps it in `localStorage` and uses it only to decide which screen to display. Direct requests to administrative endpoints bypass the login screen completely.

The assessment endpoints return full Prisma records. These include hidden test cases, expected outputs, MCQ correct answers, explanations, Safe Exam Browser quit passwords, attempts, violations, submissions, assessment codes, and internal UUIDs.

### Exploit Scenario

1. An anonymous attacker requests the assessment-list endpoint.
2. The response reveals assessment IDs, codes, questions, answer material, and attempt IDs.
3. The attacker requests an individual assessment to obtain hidden test cases and complete student attempt data.
4. The attacker downloads results or invokes create, update, review-unlock, clone, or delete operations without logging in.

### Impact

- Complete compromise of exam confidentiality
- Student PII and grade disclosure
- Hidden-test and answer-key disclosure
- Assessment modification or deletion
- Unauthorized review unlocking
- Exposure of Safe Exam Browser quit passwords

### Recommendation

- Implement a real identity system or server-side instructor sessions.
- Issue signed, random, expiring, revocable session tokens.
- Require authentication and an instructor role on every administrative HTTP route.
- Authorize access to the specific institution/course/assessment, not merely the route.
- Return explicit response DTOs instead of entire Prisma records.
- Never return `correctAnswers`, hidden tests, or quit passwords from list endpoints.
- Add regression tests proving anonymous and student accounts receive `401` or `403`.

---

## Finding 2: Unauthenticated User Code Executes Directly on the Application Host

**Severity:** Critical
**Confidence:** 10/10
**Status:** Verified by safe local execution
**Category:** OWASP A03 — Injection / Remote Code Execution

### Evidence

- `server/src/routes/execution.ts:9-23` accepts arbitrary code and custom input without authentication.
- `server/src/services/codeRunner.ts:109-168` writes supplied Java, C, or C++ to a temporary directory.
- `server/src/services/codeRunner.ts:170-197` compiles and executes the resulting program.
- `server/src/services/codeRunner.ts:257-265` starts the process without an OS sandbox and passes the complete server environment.
- `server/src/services/javaRunner.ts:159-163` also executes Java directly as a host child process.

### Safe Verification Result

A local test server was started with a non-sensitive canary environment variable. An unauthenticated request submitted a harmless Java program that printed that variable. The endpoint returned HTTP 200 and the canary value in `stdout`.

This demonstrates that submitted programs execute with access to the server process environment. No external service or real credential was accessed.

### Exploit Scenario

1. An anonymous attacker submits a Java, C, or C++ program to `/api/execution/run`.
2. The server compiles it locally.
3. The binary executes under the application server’s operating-system account.
4. The program can read inherited environment variables and any filesystem location available to that account.
5. It can make network connections, alter application data, execute additional processes, or persist beyond the expected child process.

### Impact

- Remote code execution
- Environment-secret theft
- SQLite database theft or modification
- Source/configuration disclosure
- Internal-network access
- Host takeover under the application account
- Potential persistence through child/background processes

### Recommendation

The code runner must be treated as hostile workload infrastructure, not an ordinary child process.

- Disable public access immediately.
- Require a valid, active, authenticated attempt before accepting execution.
- Place every execution in a disposable VM-grade or hardened container sandbox.
- Run as a dedicated unprivileged UID with no host credentials.
- Provide a minimal allowlisted environment rather than copying `process.env`.
- Disable outbound network access.
- Use a read-only root filesystem and isolated temporary workspace.
- Apply syscall filtering, process-count limits, CPU/time limits, memory limits, output limits, and file-size limits.
- Do not mount the application source, database, Docker socket, cloud metadata credentials, or host directories.
- Terminate the entire process group, not only the immediate child.
- Destroy the execution environment after every run.
- Place the execution service on a separate host/account from the API and database.

---

## Finding 3: MCQ Oracle and Unowned Submissions Permit Grade Manipulation

**Severity:** Critical
**Confidence:** 10/10
**Status:** Verified
**Category:** OWASP A01 — Broken Access Control

### Evidence

- `server/src/routes/student.ts:254-277` accepts an arbitrary `attemptId`, `questionId`, and answer selection, then compares the selection with the secret answer.
- `server/src/routes/student.ts:279-312` returns the score and `ACCEPTED` or `WRONG_ANSWER` status.
- `server/src/routes/student.ts:284-313` updates or creates the submission without verifying attempt ownership.
- `server/src/routes/execution.ts:54-114` performs the same unowned write for coding submissions.
- Neither handler verifies that the question belongs to the attempt’s assessment.
- Neither handler requires the attempt to be active.

### Exploit Scenario

1. A student starts an assessment and receives question and option IDs.
2. The student submits one candidate answer or answer combination.
3. The API immediately reveals whether it is correct.
4. The student repeats until the endpoint returns `ACCEPTED` and retains the resulting score.
5. Alternatively, an attacker uses a disclosed victim attempt ID to overwrite that student’s MCQ or coding submission.

### Impact

- Deterministic answer discovery
- Full-score cheating
- Cross-student submission modification
- Post-submission or post-lockout changes
- Cross-assessment record corruption

### Recommendation

- Derive the attempt ID from an authenticated server session.
- Check that the attempt belongs to the authenticated student.
- Verify that the question belongs to the same assessment.
- Reject changes unless the attempt is active and within its server-calculated time window.
- Do not reveal correctness during a live assessment unless the assessment policy explicitly allows it.
- Apply attempt/submission updates in a transaction with a database uniqueness constraint on `(attemptId, questionId)`.

---

## Finding 4: Socket.IO Events Have No Authentication or Authorization

**Severity:** Critical
**Confidence:** 10/10
**Status:** Verified
**Category:** OWASP A01 — Broken Access Control

### Evidence

- `server/src/index.ts:32-40` starts Socket.IO without authentication middleware.
- `server/src/services/socketService.ts:7-24` lets any client join an instructor room and returns all attempts.
- `server/src/services/socketService.ts:31-47` lets any client join any student room.
- `server/src/services/socketService.ts:54-71` accepts arbitrary heartbeat, timer, and draft data.
- `server/src/services/socketService.ts:78-119` creates violations, overwrites drafts, and locks attempts.
- `server/src/services/socketService.ts:126-164` performs instructor resume operations and accepts arbitrary extra time.

### Exploit Scenarios

An anonymous client can:

- Join `admin:<assessmentId>` and immediately receive the live roster, student names, roll numbers, attempts, drafts, submissions, violations, status, and timing.
- Join `student:<attemptId>` and receive private student lock/unlock events and drafts.
- Send a heartbeat for a victim attempt and overwrite its drafts or timer.
- Fabricate a violation, create a permanent misconduct record, overwrite the victim’s drafts, and lock the student.
- Emit `admin:resume_student`, resolve violations, change the attempt back to active, and grant arbitrary extra time.

### Impact

- Real-time student PII and answer disclosure
- Cross-student draft corruption
- False disciplinary records
- Unauthorized lockout and unlock actions
- Proctoring bypass
- Unlimited exam time

### Recommendation

- Authenticate the Socket.IO handshake using a server-validated session.
- Bind each socket to an immutable server-side identity and role.
- Authorize every room join and every event independently.
- Never trust `assessmentId`, `attemptId`, `rollNo`, or role claims from event payloads.
- Calculate room names and resource ownership on the server.
- Separate instructor and student event schemas.
- Validate every payload with a strict runtime schema.
- Record authenticated actor IDs for security-relevant actions.

---

## Finding 5: Predictable Roll Numbers Enable Student Attempt Takeover

**Severity:** High
**Confidence:** 9/10
**Status:** Verified
**Category:** OWASP A01 — Broken Access Control

### Evidence

- `server/src/routes/student.ts:60-70` accepts assessment code, roll number, and any nonempty student name.
- `server/src/routes/student.ts:116-124` finds an existing attempt using only assessment ID and roll number.
- `server/src/routes/student.ts:126-138` returns existing in-progress or locked attempts without validating the supplied name or another secret.
- `server/src/routes/student.ts:199-210` returns the attempt record to the caller.

The attempt includes drafts, MCQ responses, submissions, violations, remaining time, question ordering, and its otherwise-unpredictable UUID.

### Exploit Scenario

1. An attacker obtains the distributed assessment code.
2. The attacker enters a victim’s predictable roll number and any nonempty name.
3. The server looks up the existing attempt by roll number and ignores the supplied identity name.
4. The response gives the attacker the victim’s private attempt state and UUID.
5. That UUID enables the draft, submission, finish, and Socket.IO attacks described elsewhere.

### Impact

- Horizontal account/session takeover
- Student source-code and answer disclosure
- Violation and disciplinary-record disclosure
- Enabling identifier-dependent tampering attacks

### Recommendation

- Authenticate students through the institution identity provider or one-time signed invitations.
- Bind attempts to immutable student identities.
- Use short-lived, signed attempt sessions.
- Never use roll number plus public assessment code as authentication.
- Return a minimal response that excludes internal database records.

---

## Finding 6: Client-Controlled Drafts, Answers, and Timers Overwrite Server State

**Severity:** High
**Confidence:** 9/10
**Status:** Verified
**Category:** OWASP A01 — Broken Access Control / Insecure Design

### Evidence

- `server/src/routes/student.ts:217-247` accepts arbitrary `attemptId`, `drafts`, `mcqResponses`, `flaggedQuestions`, and `remainingSeconds`.
- `server/src/services/socketService.ts:54-71` repeats the same behavior through Socket.IO.
- Neither path checks ownership, assessment membership, attempt status, elapsed server time, or the configured assessment duration.

### Exploit Scenario

1. A student sends a very large `remainingSeconds` value through save-draft or heartbeat.
2. The server stores that value without comparing it with the assessment duration or server timestamps.
3. The student repeats the operation to maintain effectively unlimited time.
4. Using another student’s attempt ID also permits overwriting that student’s drafts and recorded MCQ responses.

### Impact

- Exam time-limit bypass
- Cross-student answer and source-code corruption
- Invalid assessment state

### Recommendation

- Calculate remaining time exclusively from trusted server timestamps.
- Do not accept `remainingSeconds` from clients as authoritative.
- Require authenticated ownership for every attempt update.
- Use strict typed schemas and allowlist mutable fields.
- Enforce a server-side attempt state machine.

---

## Finding 7: Safe Exam Browser Enforcement Trusts Spoofable Headers

**Severity:** High
**Confidence:** 10/10
**Status:** Verified
**Category:** OWASP A07 — Identification and Authentication Failures

### Evidence

- `server/src/services/sebService.ts:13-25` accepts a request as SEB when:
  - the User-Agent contains `SafeExamBrowser`, `SEB/`, or `SEB `; or
  - either SEB-related header is merely nonempty.
- `server/src/routes/student.ts:93-100` relies on that boolean to permit a production assessment to start.

No cryptographic Browser Exam Key or Config Key validation occurs.

### Exploit Scenario

1. A student opens a normal unrestricted browser or HTTP client.
2. The student changes the User-Agent to include `SafeExamBrowser`, or sends any value in an accepted SEB header.
3. The server sets `isSeb` to true.
4. The student starts an assessment that is configured to require SEB.

### Impact

The application’s primary locked-browser control can be bypassed completely, allowing unrestricted browsing, screen tools, messaging, and other applications during an assessment.

### Recommendation

- Implement the documented SEB Browser Exam Key and Config Key verification protocol.
- Compare verified keys with the assessment-specific expected configuration.
- Bind verified SEB state to an authenticated attempt session.
- Do not trust User-Agent strings or header presence.
- Treat SEB as one control in a broader integrity model, not as student authentication.

---

## Finding 8: Universal Instructor Credentials Are Hardcoded

**Severity:** High
**Confidence:** 9/10
**Status:** Verified
**Category:** Secrets / OWASP A07

### Evidence

- `server/src/routes/auth.ts:6` defaults `ADMIN_PASSCODE` to `admin123`.
- `server/src/routes/auth.ts:11` always accepts `prof@2026`, even if `ADMIN_PASSCODE` is securely configured.
- `client/src/pages/AdminLogin.tsx:99-102` displays `admin123` to users.
- The credentials exist in public git history from commit `dbfea11a3899d1d7a78762a3d637c6e827de0a86`.

### Exploit Scenario

1. An attacker reads the public source.
2. The attacker submits `prof@2026` to the instructor login endpoint.
3. Every deployment accepts it regardless of environment configuration.
4. Deployments without an override also accept the publicly displayed `admin123` value.

### Impact

- Instructor impersonation
- Compromise of any future feature that begins trusting the login token
- False belief that environment configuration disables the source-controlled credential

### Recommendation

- Remove both hardcoded credentials and all fallback passcodes.
- Fail startup when no secure identity configuration is present.
- Prefer an established identity provider and MFA for instructors.
- If passwords must be supported, store only Argon2id or bcrypt verifiers.
- Issue cryptographically random, signed, expiring, server-validated sessions.
- Rotate the exposed credentials and audit access logs.

### Credential Incident Response

1. Revoke `admin123` and `prof@2026` immediately.
2. Generate new credentials through a secure identity system.
3. Remove the values from current source and git history where practical.
4. Audit the exposure window beginning at commit `dbfea11a`.
5. Review deployment and proxy logs for successful login attempts using these values.
6. Do not reuse the replacement credentials in development, documentation, or tests.

---

## Finding 9: Assessment Updates Delete Dependent Data Before Validation

**Severity:** High
**Confidence:** 9/10
**Status:** Verified
**Category:** OWASP A04 — Insecure Design

### Evidence

- `server/src/routes/assessment.ts:193-210` accepts the replacement request.
- `server/src/routes/assessment.ts:212-214` deletes existing questions and sections immediately.
- `server/src/routes/assessment.ts:216-257` updates and recreates the assessment only after deletion.
- The independent Prisma operations are not wrapped in a transaction.
- Prisma cascade relationships delete test cases and submissions with their questions.

### Exploit Scenario

1. A request targets an existing assessment.
2. The server deletes all questions and sections.
3. The request contains an invalid or missing value, such as a value that makes `code.trim()` throw, or a later database operation fails.
4. The endpoint returns HTTP 500.
5. The earlier deletions remain committed, leaving exam content, test cases, and student submissions permanently removed.

This is directly exploitable through the unauthenticated API, but it would remain a serious integrity defect even after authentication is added.

### Impact

- Irrecoverable assessment-content deletion
- Hidden-test deletion
- Student-submission deletion
- Partial and inconsistent database state

### Recommendation

- Validate and normalize the entire payload before any write.
- Execute all replacement operations in one Prisma transaction.
- Roll back the transaction on any error.
- Prefer diff-based updates instead of delete-and-recreate.
- Retain audit history and recoverable backups.
- Add failure-injection tests proving existing data survives invalid requests and child-write failures.

---

## Finding 10: Review Mode Exposes Other Students’ Private Records

**Severity:** High
**Confidence:** 9/10
**Status:** Verified
**Category:** OWASP A01 — Broken Access Control

### Evidence

- `server/src/routes/student.ts:360-383` checks only whether review is globally unlocked.
- `server/src/routes/student.ts:394-407` looks up the requested attempt using assessment ID and URL-supplied roll number.
- `server/src/routes/student.ts:413-424` returns all questions, correct answers, hidden tests, and the complete selected attempt.

### Exploit Scenario

1. Review mode becomes globally available.
2. Anyone with the assessment code requests review data for a predictable roll number.
3. The server does not authenticate the requesting student.
4. The response contains the victim’s drafts, submissions, violations, and complete answer material.
5. The attacker enumerates additional roll numbers.

### Impact

- Cross-student privacy breach
- Source-code and answer disclosure
- Disciplinary-record disclosure
- Leakage of reusable questions and hidden test banks

### Recommendation

- Authenticate the requesting student.
- Derive roll number from the authenticated identity.
- Authorize access to the specific attempt.
- Return only data intended for that student.
- Keep reusable question banks and hidden tests out of ordinary review responses.

---

## Finding 11: Gradebook Export Permits Stored CSV Formula Injection

**Severity:** Medium
**Confidence:** 8/10
**Status:** Verified
**Category:** OWASP A03 — Injection

### Evidence

- `server/src/routes/student.ts:62-70` accepts student name and roll number.
- `server/src/routes/student.ts:166-175` stores those values without formula neutralization.
- `server/src/routes/results.ts:130-143` builds spreadsheet headers using assessment question titles.
- `server/src/routes/results.ts:163-176` inserts stored values directly into CSV cells.
- `server/src/routes/results.ts:179` concatenates the CSV manually and does not correctly escape embedded quotes.

Wrapping a value in double quotes does not prevent spreadsheet applications from interpreting a leading `=`, `+`, `-`, or `@` as a formula.

### Exploit Scenario

1. A student registers a name or roll number beginning with a spreadsheet formula marker.
2. The value is stored in the database.
3. An instructor exports the gradebook using the normal application interface.
4. The instructor opens the CSV in a spreadsheet application.
5. Depending on spreadsheet security policy, the formula executes, changes displayed content, or attempts an outbound request.

### Impact

- Misleading gradebook content
- Spreadsheet-context formula execution
- Possible outbound data disclosure depending on the spreadsheet client

### Recommendation

- Use a maintained CSV serialization library.
- Escape embedded quotes according to RFC 4180.
- Neutralize cells beginning with `=`, `+`, `-`, `@`, tab, carriage return, or line feed.
- Apply neutralization to headers and data fields.
- Prefer an XLSX library that explicitly stores untrusted content as string cells.

## Secrets Review

### Confirmed

- Hardcoded application passcodes: `admin123` and `prof@2026`
- The passcodes are present in public history.
- `.env` files are covered by the repository’s ignore rules.

### Not Found

No confirmed external-provider credentials matching common AWS, OpenAI, GitHub, or Slack token formats were found in the inspected source or history.

This does not prove that no secrets have ever existed. Credential providers and deployment environments should still be reviewed independently if the application has been deployed.

### Missing Preventive Controls

- No `.gitleaks.toml`
- No `.secretlintrc`
- No CI secret-scanning workflow

## Dependency and Supply-Chain Review

All three lockfiles are present and tracked:

- `package-lock.json`
- `server/package-lock.json`
- `client/package-lock.json`

### NPM Audit Results

| Project | Critical | High | Moderate | Low | Notes |
|---|---:|---:|---:|---:|---|
| Root | 0 | 0 | 0 | 0 | No advisories reported |
| Server | 0 | 3 advisory entries | 0 | 0 | Development-only Prisma chain through `deepmerge-ts`; no production call path established |
| Client | 0 | 0 | 1 | 1 | DOMPurify advisories through Monaco; no vulnerable application usage confirmed |

The server advisory was not counted as a High application vulnerability because Prisma is a development dependency and the vulnerable merge behavior was not shown to process attacker-controlled application data. It should nevertheless be updated.

### Committed Compiler Toolchain

The repository commits a large extracted Windows compiler toolchain and executable archive under `server/compilers/w64devkit`. Committing prebuilt executable dependencies creates repository-size, provenance, malware-scanning, and update-management concerns.

No malicious behavior was established, so this was not counted as a verified vulnerability. Recommended improvements:

- Build the compiler image from pinned source in CI.
- Verify source archives and released artifacts with recorded hashes/signatures.
- Generate an SBOM.
- Scan produced images and binaries.
- Store large artifacts in a verified artifact registry rather than git.
- Keep the compiler runtime separated from the API host.

## Other Serious Engineering Issues

### 1. Production Server Build Fails

**Severity:** High operational issue

Running `npm run build` in `server/` fails with:

```text
src/index.ts(15,34): error TS1470: The 'import.meta' meta-property is not allowed in files which will build into CommonJS output.
```

`server/tsconfig.json` uses `NodeNext`, but `server/package.json` does not declare `"type": "module"`. TypeScript therefore treats the source as CommonJS while `server/src/index.ts:15` uses `import.meta.url`.

The client production build succeeds.

### 2. No Enforced Automated Test or CI Pipeline

No GitHub Actions workflow is present, and the package manifests define no `test` command. The repository contains dogfood scripts, but they are not an automatically enforced regression suite.

This is especially risky because authentication, attempt ownership, grading, and destructive updates currently lack security regression tests.

### 3. Local Security Reports Are Not Ignored

`.gstack/` is not covered by `.gitignore`. Local audit reports may contain sensitive paths, evidence, or remediation details and could be committed unintentionally.

## Data Classification

### Restricted

- Instructor credentials and session material
- Student names and roll numbers
- Student answers and submitted source code
- Grades and per-question scores
- Violation and disciplinary records

### Confidential

- Assessment codes
- Correct MCQ answers
- Hidden test inputs and expected outputs
- Safe Exam Browser quit passwords and configuration
- Draft student work
- Server environment variables
- Internal database identifiers

### Internal

- Application errors and logs
- Assessment schedules and configuration
- Database schema and operational metadata

### Public

- Frontend assets
- Explicitly published assessment descriptions and sample tests
- Health status, if intentionally exposed

## STRIDE Threat Summary

| Threat | Confirmed exposure |
|---|---|
| Spoofing | Instructor credentials are universal; student identity relies on roll number; SEB identity relies on spoofable headers |
| Tampering | Anonymous clients can edit/delete assessments, overwrite submissions/drafts, change timers, and alter violations |
| Repudiation | Socket actions are unauthenticated, so malicious changes cannot be attributed reliably |
| Information disclosure | Answer keys, hidden tests, student records, gradebooks, drafts, and process environment are exposed |
| Denial of service | Assessment deletion, forced lockouts, destructive partial updates, and arbitrary host code execution can disrupt service |
| Elevation of privilege | Anonymous clients can perform instructor actions and submitted programs execute with the server account’s privileges |

## Remediation Roadmap

### Phase 0: Emergency Containment

- Remove public network access.
- Disable `/api/execution/run` and `/api/execution/submit`.
- Rotate instructor credentials.
- Preserve and review access logs.
- Back up the database and assessment content.
- Assume exposed answer banks and SEB passwords require replacement.

### Phase 1: Identity and Authorization

- Implement real instructor authentication, MFA, sessions, and role checks.
- Implement authenticated student identity and signed attempt sessions.
- Protect all HTTP and Socket.IO operations.
- Add resource-level ownership checks.
- Replace broad Prisma-record responses with least-privilege DTOs.

### Phase 2: Execution Isolation

- Move code execution to a separate service and host/account.
- Use disposable sandbox instances with no network or host secrets.
- Add syscall, filesystem, process, CPU, memory, and time restrictions.
- Validate supported language and per-question execution policy.
- Add malicious-workload sandbox tests.

### Phase 3: Assessment Integrity

- Calculate time on the server.
- Enforce an attempt state machine.
- Eliminate the MCQ correctness oracle.
- Validate question/attempt/assessment relationships.
- Make assessment updates transactional.
- Add database constraints and security regression tests.

### Phase 4: Defense in Depth

- Correct SEB cryptographic validation.
- Neutralize CSV formulas and use a serializer.
- Upgrade vulnerable development and client dependencies.
- Add CI for build, tests, dependency review, secret scanning, and static analysis.
- Add centralized security logging for authenticated administrative actions.
- Move compiler binaries to a verified artifact pipeline.

## Minimum Security Test Matrix

The following tests should pass before deployment:

- Anonymous callers receive `401` on every instructor API.
- Authenticated students receive `403` on instructor APIs and instructor Socket.IO events.
- One student cannot load or mutate another student’s attempt.
- Attempt and question IDs from different assessments are rejected.
- Submitted, expired, or locked attempts cannot submit or change drafts unless policy explicitly permits it.
- The server ignores client-provided remaining-time claims.
- Incorrect MCQ submissions do not reveal correctness during a live exam.
- SEB-required assessments reject forged User-Agent and arbitrary SEB headers.
- Invalid assessment updates leave all existing records unchanged.
- CSV exports treat all untrusted cells as text.
- Sandbox workloads cannot read server environment variables, application files, database files, cloud metadata, or the network.
- Sandbox child processes cannot persist after timeout.
- Both client and server production builds succeed in CI.

## Audit Limitations

- The review was performed against one repository snapshot and may not reflect later commits or deployment-only configuration.
- No production environment, reverse proxy, cloud account, external database, identity provider, or live student dataset was tested.
- The committed compiler executables were not reverse-engineered or independently reproduced byte-for-byte.
- Dependency advisories can change after the audit date.
- Complex sandbox escapes and operating-system-specific behavior require dedicated penetration testing.

## Conclusion

The application should currently be considered **unsafe for production assessments**. Its browser interface gives the appearance of instructor authentication and proctoring, but the server does not enforce those boundaries. Anonymous administrative access and unsandboxed host code execution independently justify immediate containment. The student identity, grading, timer, review, Socket.IO, and SEB failures further mean assessment confidentiality and integrity cannot be trusted.

Remediation should begin with network containment, removal of public code execution, and server-side identity enforcement. Fixing only the visible login screen or changing the default passcode will not secure the system.

---

## Disclaimer

This AI-assisted security review is a first pass, not a substitute for a professional penetration test. Security tools and language models can miss subtle vulnerabilities, deployment-specific weaknesses, and sophisticated sandbox escapes. Any production system handling student identities, grades, assessment content, or executable code should receive an independent professional security assessment before use.
