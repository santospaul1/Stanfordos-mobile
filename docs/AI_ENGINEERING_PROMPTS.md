# AI Engineering Prompts and Working Rules

Use these prompts with an AI coding assistant when implementing Stanfordos Mobile. Provide the current repository state and relevant backend source whenever implementation depends on API details.

## Global engineering instructions
You are implementing Stanfordos Mobile, a React Native application using Expo, TypeScript and Expo Router. It is a separate sibling repository to the Spring Boot backend `MAROOTS/stanford-sms-lms`.

Non-negotiable decisions:
- Android and iOS.
- All backend-supported roles.
- Exact roles: `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `LIBRARIAN`, `ACCOUNTANT`, `PLATFORM_ADMIN`. Do not invent STAFF.
- Existing Spring Boot API and PostgreSQL remain the source of truth.
- Push notifications are required, but not end-to-end until backend device-token APIs exist.
- Offline is read-only. Never queue attendance, marks, fees, submissions or any mutation.
- Inspect controllers, services, DTOs, enums and security before changing API contracts.
- Never put secrets in `EXPO_PUBLIC_*` variables.
- Use Expo SDK-compatible package versions.
- Keep screens thin; use feature services/hooks.
- Backend authorization is authoritative; UI guards are supplementary.

Before editing:
1. Inspect current files and git diff.
2. Identify exact files to change.
3. Trace each backend route through controller, service, DTO and security.
4. Call out missing contracts and security gaps.
5. Implement a small coherent vertical slice.
6. Add tests and run typecheck, lint and relevant tests.
7. Report changed files, commands, results and remaining risks.

Never claim tests passed if they were not run. Never claim files or endpoints exist unless verified.

## Prompt 1 — Scaffold the app
Create the Expo Router + TypeScript foundation. Enable strict TypeScript, feature-first folders, environment config, theme tokens, shared UI primitives, TanStack Query, typed API client shell and SecureStore adapter. Add lint, format and test scripts. Add `.env.example`, ignore local secrets and document physical-device connectivity. Do not build screens against unverified contracts. Run checks and report results.

## Prompt 2 — Secure authentication
Inspect backend auth controller/service/DTOs and security configuration. Existing web login derives tenant from Origin; native login must use a public school identifier validated server-side. Do not spoof Origin or trust client-supplied school database IDs. Implement login, refresh rotation, logout, password recovery, verification and mandatory password change from actual contracts. Store tokens in SecureStore. Make refresh single-flight and clear caches on logout, tenant switch or refresh failure. Test invalid credentials, suspended tenant, wrong tenant, rotation and platform-admin behavior.

## Prompt 3 — Role-aware navigation
Use only the seven actual backend roles. Create centralized navigation/permission metadata. Do not infer API access from role names. Tie each screen to an audited capability and handle 403. Test all roles and unknown role values.

## Prompt 4 — Read-only offline
Cache only approved read models, partitioned by tenant, user and role. Show last-sync and stale/offline indicators. Disable all mutations offline and never enqueue writes. Clear user-scoped data on logout, account/tenant switch or invalid session. Test cache isolation and offline write blocking.

## Prompt 5 — Attendance
Inspect attendance DTOs/status enum/controller/service. Confirm teacher class ownership and student/parent read permissions. Implement entry sheet and online save plus permitted history. Require live connectivity; no write queue. Handle duplicate taps, validation, date/time zone and server errors. Add cross-school and unauthorized-class tests.

## Prompt 6 — Marks and results
Do not begin until MOB-BE-02 is fixed and tested. Implement teacher entry and student result reads only for permitted roles. Keep parent results hidden until explicit parent-linked endpoints exist. Test score validation and negative authorization.

## Prompt 7 — Fees
Inspect invoice, payment and receipt services. Confirm ownership for student/parent reads and receipt downloads. Distinguish accountant payment recording from online payment initiation. Do not invent M-Pesa/card routes. Test cross-student and cross-tenant denial.

## Prompt 8 — LMS and uploads
Inspect assignment/submission DTOs and storage. Confirm MIME allowlist, maximum size, multipart field names, ownership, duplicate submission and retry behavior. Implement only verified flows. Do not automatically retry non-idempotent uploads without backend idempotency. Show upload progress and recoverable errors.

## Prompt 9 — Push
Verify backend device-token registration/revocation first. If absent, create a backend task; do not claim push is complete. Implement permission UX, Expo token registration after login, rotation, logout revocation, foreground handling and deep links. Keep payloads privacy-safe and fetch details via authenticated APIs. Test invalid tokens and unauthorized deep links.

## Prompt 10 — Release audit
Review tenant isolation, role access, token handling, cache partitioning, offline writes, push privacy, deep links, file handling, accessibility, performance and low-bandwidth behavior. Run typecheck, lint, unit and staging integration tests. Produce severity-ranked findings. Do not mark production-ready while any P0 security issue remains.
