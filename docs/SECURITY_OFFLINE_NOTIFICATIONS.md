# Security, Offline Data and Push Notifications

## 1. Security model
The Spring Boot backend remains authoritative for authentication, tenant isolation, authorization and business validation. Mobile UI guards improve usability but never replace backend checks.

### Session handling
- Store access/refresh tokens with `expo-secure-store`, never AsyncStorage or plain files.
- Never log tokens, passwords, reset tokens, authorization headers or sensitive student data.
- Coordinate concurrent refresh requests; perform one refresh operation at a time.
- On failed refresh, logout, account switch or tenant switch, clear SecureStore and all user-scoped query/local caches.
- Honor `mustChangePassword` before normal app navigation.
- Do not persist passwords or credentials in query cache.

### Tenant isolation
The current web login derives school context from HTTP Origin. A native app cannot safely reproduce that. Backend must accept a public school identifier (for example a school slug), resolve it server-side and verify that the user belongs to that tenant. Do not spoof Origin or trust arbitrary client school database IDs. Bind tenant context to the server session/token and revalidate on refresh and protected resource operations. Define platform-admin behavior separately.

### Sensitive information
Student records, attendance, marks, parent contacts, financial information and documents are sensitive. Minimize local persistence. Avoid sensitive notification previews on lock screens. Treat push payloads and deep-link parameters as untrusted.

## 2. Offline policy: read-only
**Offline use is read-only.** Previously fetched, permitted data may be displayed, but offline writes must never be queued for later replay.

Allowed:
- View cached dashboards, timetable, courses, assignments, attendance history, results or fee records only if previously fetched and authorized.
- Show a clear offline/stale indicator and last successful refresh time.
- Search and navigate within already cached records.

Forbidden offline:
- Attendance marking/check-in.
- Marks entry or editing.
- Invoice/payment/fee recording.
- Assignment submissions or file uploads.
- Creating, editing or deleting courses, assignments, users or settings.
- Password/account changes, parent linking and all other server mutations.

Disable mutation controls while offline and explain that a live connection is required. Check connectivity before sending a write, but still handle network loss because connectivity indicators can be stale. Never create a background write queue.

## 3. Cache design
- TanStack Query owns remote request lifecycle.
- Persist only approved read models.
- Namespace cached data by tenant, user and role.
- Apply expiry/maximum-age rules by data category.
- Never store tokens in query cache.
- Clear user-scoped data on logout, account/tenant switch or invalid session.
- Show stale data as stale; do not imply it is live.
- For sensitive resources, require online revalidation when permissions may have changed.

Example metadata:

```ts
interface CachedRecord<T> {
  data: T;
  tenantKey: string;
  userKey: string;
  fetchedAt: string;
  schemaVersion: number;
}
```

This is cache hygiene, not a security boundary.

## 4. Push notification architecture
Push is a target capability but is not yet end-to-end complete. The inspected backend notification controller supports list/read operations, but no device-token registration/revocation route was found.

### Required backend API (proposed, not existing verified routes)
- POST `/api/devices/push-tokens`: register or refresh token for authenticated user.
- GET `/api/devices/push-tokens`: list current user's devices if device management is required.
- DELETE `/api/devices/push-tokens/{id}`: revoke one owned token.

Backend must scope tokens to authenticated principal, tenant and device; prevent cross-user revocation; handle duplicate/rotated tokens; and remove invalid tokens based on provider feedback.

### Mobile lifecycle
1. Ask notification permission in context, not on first launch without explanation.
2. Register only on a physical device and after authentication.
3. Obtain Expo push token using configured EAS project.
4. Send token, platform and minimal device metadata to authenticated backend.
5. Re-register on token rotation.
6. Revoke/unregister on logout where possible.
7. Handle foreground, background and cold-start notification responses.
8. Deep-link only to routes the current role may open; fetch protected content from the API after navigation.

### Privacy
Payloads should contain notification ID/category and minimal routing metadata. Do not put student names, grades, attendance details, balances, parent phone numbers or other sensitive content in visible push text. Fetch details through authenticated APIs.

### In-app notification centre
Use existing endpoints:
- GET `/api/notifications`
- PATCH `/api/notifications/{id}/read`
- POST `/api/notifications/mark-all-read`

Backend notification records remain the source of truth. Push is a delivery channel. Make duplicate push delivery idempotent in the UI.

## 5. Network protections
- HTTPS outside local development.
- Never disable TLS validation in production.
- Use timeouts and bounded retries.
- Do not automatically retry non-idempotent mutations unless backend idempotency is supported.
- Do not retry 400, 401, 403 or validation errors as if they were network failures.
- Avoid exposing backend stack traces.
- Validate downloaded file type and size.
- Request native permissions only when required.

## 6. Security acceptance checklist
- [ ] Tenant cannot be switched by editing client-side state.
- [ ] Refresh rotation/revocation is enforced.
- [ ] Logout clears credentials and user cache.
- [ ] Student cannot read another student's marks, attendance or fees.
- [ ] Parent can access only linked children and permitted routes.
- [ ] Teacher cannot access unauthorized classes/resources.
- [ ] Push token cannot be registered/revoked for another user.
- [ ] Push deep links do not bypass API authorization.
- [ ] Offline mode has no mutation path or write queue.
- [ ] Tenant/account switch clears all previous cached data.
