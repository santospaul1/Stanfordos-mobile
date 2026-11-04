# Backend API Audit and Mobile Contract

## Scope and confidence
This is a source-inspection snapshot of [MAROOTS/stanford-sms-lms](https://github.com/MAROOTS/stanford-sms-lms), covering authentication, roles, attendance, parents, marks, exams, fees, LMS, dashboard and notifications. It is not a generated OpenAPI specification. Verify DTO fields, pagination, error payloads and current branch behavior before implementing each screen.

## Authentication

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/refresh` | Refresh |
| POST | `/api/auth/logout` | Revoke refresh token |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Start password recovery |
| POST | `/api/auth/reset-password` | Complete password reset |
| GET | `/api/auth/verify-email?token=...` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification |
| GET | `/api/auth/sessions` | List sessions |
| DELETE | `/api/auth/sessions/{sessionId}` | Revoke session |

Inspected login request:

```ts
interface LoginRequest {
  username: string;
  password: string;
  remember: boolean;
}
```

Inspected login response:

```ts
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: BackendRole;
  firstName: string;
  mustChangePassword: boolean;
}
```

Registration response differs; do not assume it returns refresh tokens.

### P0 native tenant authentication gap
The inspected authentication service derives school/subdomain context from HTTP Origin and validates the user's school against it. Native apps do not have a school web Origin. Do not spoof Origin and do not trust an arbitrary client-supplied school ID.

Backend must accept an explicit public tenant identifier (for example a validated school slug), resolve it server-side, verify the user belongs to it and bind the tenant to the authenticated session/token. Define platform-admin behavior separately and apply tenant/account checks during refresh.

## Actual backend roles
```ts
type BackendRole =
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "LIBRARIAN"
  | "ACCOUNTANT"
  | "PLATFORM_ADMIN";
```
There is no `STAFF` role in the inspected enum. Mobile must not add one.

## Attendance
| Method | Route | Inspected access |
|---|---|---|
| GET | `/api/class-sections/{classSectionId}/attendance/entry-sheet?date=YYYY-MM-DD` | TEACHER, ADMIN |
| POST | `/api/class-sections/{classSectionId}/attendance?date=YYYY-MM-DD` | TEACHER, ADMIN |
| GET | `/api/class-sections/{classSectionId}/attendance/sessions` | TEACHER, ADMIN |
| GET | `/api/students/{studentId}/class-attendance` | STUDENT, TEACHER, ADMIN, PARENT |

Services use class ownership and school checks. Student attendance reads validate own identity or linked-parent access. Inspect the attendance DTO/status enum before implementing entry UI; do not invent status values.

## Parent portal
| Method | Route | Inspected access |
|---|---|---|
| GET | `/api/parents` | ADMIN |
| GET | `/api/parents/{id}` | ADMIN or matching PARENT user |
| POST/PUT/DELETE | `/api/parents` | ADMIN |
| POST | `/api/parents/link` | ADMIN |
| DELETE | `/api/parents/{parentId}/unlink/{studentId}` | ADMIN |
| GET | `/api/parents/my-children` | PARENT |

Use `my-children` for the child picker. Parent-linked access is checked in attendance and fee services. Parent marks/report-card access was not enabled in the inspected controller paths.

## Marks, exams and report cards

Marks:
- GET `/api/marks/entry-sheet?examId=&subjectId=&classSectionId=`: TEACHER, ADMIN.
- POST `/api/marks`: TEACHER, ADMIN.
- GET `/api/marks/student/{studentId}/exam/{examId}`: STUDENT, TEACHER, ADMIN.

**P0 authorization defect:** inspected `MarkService.listByStudentAndExam` checks school ownership but does not verify that a STUDENT is requesting their own marks or that a parent is linked to the student. The controller TODO also identifies the missing ownership check. Fix and test before enabling student results.

Exams:
- POST/PUT/DELETE `/api/exams`: ADMIN.
- GET `/api/exams` and GET `/api/exams/{id}`: STUDENT, ADMIN, TEACHER.
- PARENT is not in the inspected read roles.

Report cards:
- GET `/api/report-cards/student/{studentId}/exam/{examId}`: STUDENT, TEACHER, ADMIN.
- Response is PDF bytes (`application/pdf`).
- PARENT is not included in the inspected controller roles. Service delegates to student-result logic with student self-ownership checks.

Do not expose parent marks or report cards until explicit parent-linked backend authorization is implemented and tested.

## Fees
| Method | Route | Inspected access |
|---|---|---|
| GET | `/api/fee-invoices/student/{studentId}` | STUDENT, ADMIN, ACCOUNTANT, PARENT |
| GET | `/api/fee-invoices/{invoiceId}/payments` | STUDENT, ADMIN, ACCOUNTANT, PARENT |
| GET | `/api/fee-invoices/{invoiceId}/payments/{paymentId}/receipt` | STUDENT, ADMIN, ACCOUNTANT, PARENT |
| POST | `/api/fee-invoices/{invoiceId}/payments` | ADMIN, ACCOUNTANT |

Invoice administration, term summaries, invoice generation and waivers are ADMIN/ACCOUNTANT workflows. Invoice and payment list services check student or linked-parent access and school ownership. Receipt download ownership needs a separate audit. The inspected payment POST records a payment administratively; it is not proof of a student-facing online payment initiation API.

## LMS
| Method | Route | Inspected access |
|---|---|---|
| POST | `/api/courses` | TEACHER |
| PUT/DELETE | `/api/courses/{courseId}` | TEACHER, ADMIN |
| GET | `/api/courses`, `/api/courses/{courseId}` | Authenticated; service access needs audit |
| POST | `/api/courses/{courseId}/assignments` | TEACHER, ADMIN |
| PUT/DELETE | `/api/assignments/{assignmentId}` | TEACHER, ADMIN |
| GET | `/api/assignments/{assignmentId}`, `/api/courses/{courseId}/assignments` | Authenticated; service access needs audit |
| POST | `/api/assignments/{assignmentId}/submissions` | STUDENT; multipart `textContent`, optional `file` |
| PUT | `/api/submissions/{submissionId}/grade` | TEACHER, ADMIN |
| GET | `/api/assignments/{assignmentId}/submissions` | TEACHER, ADMIN |
| GET | `/api/assignments/{assignmentId}/submissions/me` | STUDENT |

Before uploads, verify MIME allowlist, maximum file size, storage behavior, duplicate/retry semantics, enrollment and resource ownership. Controller-level authenticated access does not prove service-level authorization.

## Dashboard
- GET `/api/dashboard/summary`: ADMIN, TEACHER.
- GET `/api/dashboard/attendance-trend?range=WEEK&termId=`: ADMIN, TEACHER.

No role-specific dashboard route was confirmed for STUDENT, PARENT, ACCOUNTANT, LIBRARIAN or PLATFORM_ADMIN. Compose from permitted APIs or add purpose-built backend endpoints. Do not call the admin dashboard for other roles.

## Notifications
- GET `/api/notifications`: current user's notifications.
- PATCH `/api/notifications/{id}/read`: mark one read.
- POST `/api/notifications/mark-all-read`: mark all read.

Inspected service filters by current user, checks ownership on mark-read and returns up to 50 newest items. No device-token registration/revocation endpoint was found in the inspected controller/service.

## Backend work register
| ID | Priority | Work | Release gate |
|---|---|---|---|
| MOB-BE-01 | P0 | Tenant-aware native login and refresh | Tenant isolation tests pass |
| MOB-BE-02 | P0 | Marks self/parent ownership checks | Cross-user/school requests denied |
| MOB-BE-03 | P1 | Parent report-card access | Linked parent can read only linked child |
| MOB-BE-04 | P1 | Parent marks/results access | Linked parent can read only linked child |
| MOB-BE-05 | P1 | Push token register/list/revoke | Token scoped to user/device |
| MOB-BE-06 | P1 | Role-specific dashboards | No cross-role data exposure |
| MOB-BE-07 | P1 | Decide whether STAFF exists | Enum and policies agree; otherwise omit |
| MOB-BE-08 | P1 | Receipt download ownership audit | Own/linked invoice only |
| MOB-BE-09 | P1 | LMS upload contract | MIME, size, storage and retry verified |
| MOB-BE-10 | P1 | LMS read authorization audit | Tenant and resource scope enforced |

## Mobile API rules
- Centralize route paths and DTOs in `src/api`.
- Java Long IDs should not be assumed safe JS numbers without checking range; use string IDs if needed.
- Model login, registration and refresh responses separately.
- Normalize errors centrally while preserving status and field validation.
- Use multipart FormData only after upload contract is confirmed.
- Handle PDF responses as binary data with safe viewing/sharing.
- A 401 may trigger one coordinated refresh; failed refresh clears session.
- A 403 is an authorization result, not a reason to retry under another role or tenant.
- Add API contract and negative authorization tests for every released feature.
