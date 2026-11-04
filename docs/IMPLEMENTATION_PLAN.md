# Implementation Plan and Delivery Tracker

## Confirmed project decisions
- [x] Android and iOS.
- [x] All backend-supported roles.
- [x] React Native + Expo + TypeScript.
- [x] Expo Router.
- [x] Separate sibling repository.
- [x] Read-only offline behavior.
- [x] Push notifications as the target notification channel.
- [x] Core API audit for auth, roles, attendance, parents, marks, exams, fees, LMS, dashboards and notifications.
- [ ] Finish remaining backend authorization/upload audit.
- [ ] Scaffold app source code.

## Milestone 0 — Backend readiness
**Goal:** close critical API and authorization gaps before shipping sensitive workflows.

- [ ] MOB-BE-01: tenant-aware native login and refresh.
- [ ] MOB-BE-02: marks self/parent ownership checks.
- [ ] Add cross-tenant and cross-user negative tests for exposed endpoints.
- [ ] MOB-BE-08: receipt download ownership audit.
- [ ] MOB-BE-09: assignment upload MIME/size/retry contract.
- [ ] MOB-BE-10: LMS resource-level authorization audit.
- [ ] MOB-BE-05: push token registration/list/revocation.
- [ ] Decide parent marks/report-card access (MOB-BE-03/04).
- [ ] Define role-specific dashboards or permitted API compositions (MOB-BE-06).
- [ ] Confirm STAFF remains absent unless backend explicitly adds it (MOB-BE-07).

**Exit:** tenant and ownership tests pass; DTOs and errors documented; push APIs exist before push is called production-ready.

## Milestone 1 — Mobile foundation
- [ ] Create Expo Router + TypeScript app.
- [ ] Enable strict TypeScript, lint and formatting.
- [ ] Add environment config and API URL validation.
- [ ] Add theme tokens and shared UI primitives.
- [ ] Add typed HTTP client and normalized error model.
- [ ] Add SecureStore adapter and tests.
- [ ] Add TanStack Query provider and cache-clearing rules.
- [ ] Add connectivity/offline indicator.
- [ ] Add auth/app route groups and loading/error boundaries.
- [ ] Add CI for typecheck, lint and tests.

**Exit:** Android/iOS development builds boot; staging API connects from simulator and device; SecureStore tests pass; refresh is single-flight; caches clear on logout/identity change; no secrets in app bundle.

## Milestone 2 — Authentication and tenant selection
- [ ] School lookup/tenant selection using approved backend contract.
- [ ] Login, forgot-password and reset-password screens.
- [ ] Email verification/resend.
- [ ] Mandatory password-change route for `mustChangePassword`.
- [ ] Secure session restoration and refresh.
- [ ] Session list/revoke UI where useful.
- [ ] Role guards for the seven actual backend roles.
- [ ] Separate platform-admin flow.

**Exit:** tenant is validated server-side; session restore/refresh/logout work; client cannot switch tenant by editing local state.

## Milestone 3 — Read-only core and dashboards
- [ ] In-app notifications list/read/mark-all-read.
- [ ] Parent `my-children` picker.
- [ ] Permitted student/parent attendance history.
- [ ] Permitted fee invoice/payment history.
- [ ] Course and assignment browsing after service authorization audit.
- [ ] ADMIN/TEACHER dashboard summaries.
- [ ] Dashboard composition for other roles.
- [ ] Cached read-only mode and stale-data indicators.

**Exit:** role/ownership tests pass; offline cache is tenant/user scoped; no offline mutation possible.

## Milestone 4 — Teacher and administration
- [ ] Attendance entry sheet and online save.
- [ ] Attendance sessions/history.
- [ ] Marks entry sheet and online save.
- [ ] Exam browsing/management according to role.
- [ ] Course and assignment management.
- [ ] Submission review/grading.
- [ ] Test duplicate taps, interrupted network and server validation.

All writes require a live connection. No offline write queue.

## Milestone 5 — Student and parent
- [ ] Student learning and assignment views.
- [ ] Assignment submission with validated file upload and progress.
- [ ] Results/report cards only after ownership APIs are verified.
- [ ] Parent child-specific attendance and fees.
- [ ] Parent marks/report cards only after backend support.
- [ ] Test child switching and cross-child cache isolation.

## Milestone 6 — Finance and library
- [ ] Accountant invoice/payment workflows.
- [ ] Receipt download after ownership audit.
- [ ] Librarian workflows after library controller/service audit.
- [ ] Platform-admin features only where explicit endpoints exist.

## Milestone 7 — Push
- [ ] Configure EAS project and platform credentials.
- [ ] Permission UX and token registration.
- [ ] Token rotation and logout revocation.
- [ ] Foreground/background/cold-start response handling.
- [ ] Authorized deep links.
- [ ] Privacy-safe payloads and invalid-token cleanup.

## Milestone 8 — Quality and release
- [ ] Unit tests for API, auth, permissions and cache partitioning.
- [ ] Screen/component tests for core flows.
- [ ] Staging integration tests.
- [ ] Android physical-device tests.
- [ ] iOS simulator and physical-device tests.
- [ ] Accessibility/responsive layout review.
- [ ] Low-bandwidth/offline tests.
- [ ] Security review of storage, logs, notifications, links and files.
- [ ] App icons, splash, bundle IDs and versioning.
- [ ] EAS development, preview and production builds.
- [ ] Store privacy disclosures and release metadata.
- [ ] Crash monitoring and rollback plan.

## Suggested first sprint
| Order | Task | Priority |
|---:|---|---|
| 1 | Backend tenant-aware login contract | P0 |
| 2 | Backend marks ownership fix and tests | P0 |
| 3 | Expo Router TypeScript scaffold | P0 |
| 4 | SecureStore and typed API client | P0 |
| 5 | Auth/session and tenant selection | P0 |
| 6 | Seven-role navigation guards | P0 |
| 7 | Notifications API client/list | P1 |
| 8 | Cache partitioning/read-only offline | P1 |

## Definition of done
A feature is complete only when its backend route, DTO, role and resource ownership are confirmed; loading/empty/error/validation/offline states exist; secrets and sensitive data are protected; mutations require live connectivity; tests cover success, unauthorized access, wrong tenant and network failure; and documentation matches the actual backend.
