# Stanfordos Mobile — Apply sources

Copy into local `stanfordos-mobile/src/` (same paths). Also copy `.env.example` to project root as `.env`.

## Design choice (GPT screens vs current UI)

**Recommendation: keep our structure, borrow their UX patterns.**

| GPT mockups | Our app |
|-------------|---------|
| Bright consumer tiles, bottom tabs, per-screen themes | One brand system across 7 roles |
| Strong on student/parent home | Strong on role coverage + consistency |

What we took from the mockups:
- Search bars on list screens
- Clearer empty states with icon + optional action
- Status chips for attendance / badges
- Colored summary cards already present on dashboards

What we did **not** do (on purpose):
- Full visual redesign to purple gradients / multi-color tile grids
- Bottom-tab shell for every role (can add later per role)

Rebranding to match those images is a separate design pass after flows are solid.

## New this slice

### UX
- `components/ui/SearchBar.tsx`
- `components/ui/StatusChip.tsx`
- Improved `EmptyState` (icon + optional action button)
- Search wired on teacher attendance, admin students, librarian catalogue

### Real API client layer
- `config/env.ts` — `USE_MOCK_AUTH` / `USE_MOCK_DATA` flags
- `api/client.ts` — Axios instance, bearer token, single-flight refresh
- `api/errors.ts` — normalized `ApiError`
- `api/endpoints.ts` — audited backend paths only
- `api/auth.api.ts` — login/logout/sessions
- `features/auth/backend-auth.repository.ts` — production auth adapter

Switch auth:
```
EXPO_PUBLIC_USE_MOCK_AUTH=false
```
Only after backend supports tenant-aware native login (MOB-BE-01). Until then keep mock auth.

## All role modules (mock data)
Teacher · Student · Parent · Accountant · Librarian · Admin · Platform admin — every dashboard tile has a screen.

## Demo logins
Password: `password123`  
teacher@demo.com · student@demo.com · parent@demo.com · accountant@demo.com · librarian@demo.com · admin@demo.com · platform@demo.com
