# Verified Serious Vulnerabilities Report

**Repository:** `https://github.com/JayashreeChelladurai/CodingAssessment`  
**Branch:** `codex/security-audit-report`  
**Review date:** 2 September 2026  
**Scope:** Verified vulnerabilities with reproducible exploit path and confidence >= 8/10.

This report publishes the critical security issues discovered during the repository review.

| ID | Severity | Confidence | Finding |
|---|---:|---:|---|
| V1 | 10/10 | 10/10 | Unauthenticated administrative API access |
| V2 | 9/10 | 9/10 | Non-atomic destructive assessment update |
| V3 | 9/10 | 9/10 | Hardcoded or weak administrative credentials |
| V4 | 8/10 | 8/10 | Stored CSV formula injection in results export |

---

## V1 — Unauthenticated administrative API access (10/10)

### Why this is a finding

`assessmentRouter` and `resultsRouter` are reachable without any verified admin authorization.

- **Server mount points:** `server/src/index.ts:43-47`
- **Assessment routes:** `server/src/routes/assessment.ts:8, 37, 103, 193, 276, 293, 303`
- **Results routes:** `server/src/routes/results.ts:7, 107`
- `server/src/routes/auth.ts` issues an admin token-like value, but those routes do not validate it.
- `client/src/services/api.ts` does not send any Authorization header for admin endpoints.

### Verified impact path

An unauthenticated user can perform all of these actions:

- read all assessments: `GET /api/assessments`
- read full assessment content and secret fields: `GET /api/assessments/:id`
- create an assessment: `POST /api/assessments`
- replace assessment data: `PUT /api/assessments/:id`
- toggle review mode: `PATCH /api/assessments/:id/review-mode`
- delete assessments: `DELETE /api/assessments/:id`
- clone assessments: `POST /api/assessments/:id/clone`
- read/export all student results: `GET /api/results/:assessmentId` and `GET /api/results/:assessmentId/export`

### Impact

- Full compromise of exam integrity and confidentiality (answer keys, hidden test cases, expected outputs, quit passwords, attempts).
- Student data disclosure (PII + marks + violations + submissions).
- Unauthorized destructive/unauthorized tampering with active assessments.

### Recommended fix

- Add server-side admin authentication middleware and apply it to all instructor routes.
- Use signed, short-lived, revocable admin tokens (header or secure cookie).
- Return minimal DTOs from listing endpoints; never expose secret/answer fields.

---

## V2 — Non-atomic destructive assessment update (9/10)

### Why this is a finding

`updateAssessment` deletes assessment child records before all validation and child reconstruction is complete.

- **File/lines:** `server/src/routes/assessment.ts:193-231`

### Verified impact path

- Send malformed payload (for example `{}` or `{"code":null}`) to `PUT /api/assessments/:id`.
- Existing questions/sections are deleted first.
- Later validation fails (e.g. `code.trim()` path), throwing an error.
- Response fails, but destructive deletes are already committed.

### Impact

- Irrecoverable deletion of assessment content and dependent records.

### Recommended fix

- Validate request body before mutating existing records.
- Execute delete/recreate/update inside one DB transaction (`prisma.$transaction(...)`).
- Add regression tests for rollback on invalid requests.

---

## V3 — Hardcoded or weak administrative credentials (9/10)

### Why this is a finding

Admin auth logic accepts universal/passcode fallbacks.

- **File/lines:** `server/src/routes/auth.ts:6, 11`

### Verified impact path

- Known values can be accepted without required secure credential management, granting instructor-like access in plain login flow.

### Impact

- Instructor access can be obtained without organizational secret controls.

### Recommended fix

- Remove fallback credentials completely.
- Fail closed when secure admin secret is not explicitly configured.
- Add per-IP throttling and login attempt lockout/auditing.

---

## V4 — Stored CSV formula injection in gradebook export (8/10)

### Why this is a finding

User-controlled values are exported to CSV with weak sanitization only.

- **File/lines:** `server/src/routes/results.ts:107, 130-179`

### Verified impact path

- Start a student attempt with `studentName` or `rollNo` beginning with `=`, `+`, `-`, or `@`.
- Export gradebook via admin flow.
- Opening CSV in spreadsheet clients can evaluate attacker-controlled formula-like payloads.

### Impact

- Spreadsheet-level payload behavior and potential data leakage/manipulation in instructor environment.

### Recommended fix

- Prefix dangerous leading characters (`=`, `+`, `-`, `@`) before CSV field output.
- Properly escape embedded quotes and newline characters.

---

## Notes

- This is the “serious findings only” publishable list for the repository.
- Additional lower-severity hardening tasks remain outside this severity gate.
