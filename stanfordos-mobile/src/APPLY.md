# Stanfordos Mobile — Apply sources

Copy this folder’s contents into local `stanfordos-mobile/src/` (same relative paths). Overwrite when asked.

## Teacher section — complete (mock data)

| Module | Routes |
|--------|--------|
| My classes | `/(teacher)/classes`, `/(teacher)/classes/[classSectionId]` |
| Attendance | `/(teacher)/attendance`, `/(teacher)/attendance/[classSectionId]` |
| Marks entry | `/(teacher)/marks`, `/(teacher)/marks/entry` |
| Assignments | `/(teacher)/assignments`, `/(teacher)/assignments/[assignmentId]` |
| Timetable | `/(teacher)/timetable` |
| Announcements | `/(teacher)/announcements` |

All six tiles on the teacher dashboard navigate to working screens.

### Shared
- `components/ui/*` — Button, Card, Screen, Badge, EmptyState, ErrorBanner
- `constants/brand.ts`
- `hooks/use-online.ts` — online gate for saves

### Feature mocks
- `features/classes/*`
- `features/attendance/*`
- `features/marks/*`
- `features/assignments/*`
- `features/timetable/*`
- `features/announcements/*`

### Rules enforced
- Marks & attendance **save only while online** (no offline write queue)
- Marks UI is ready; **do not expose student/parent mark reads in production** until backend MOB-BE-02 ownership is fixed
- Status enums align with backend audit (attendance: PRESENT/LATE/ABSENT/EXCUSED)

## How to test teacher flow
1. Copy files → `npx expo start`
2. Login: `teacher@demo.com` / `password123`
3. Open each module from the dashboard:
   - **My classes** → class roster
   - **Attendance** → take & save
   - **Marks entry** → pick exam + class → enter scores → save
   - **Assignments** → list → submissions
   - **Timetable** → day chips
   - **Announcements** → list + compose (online)

## Demo accounts
Password for all: `password123`  
admin@demo.com · teacher@demo.com · student@demo.com · parent@demo.com · librarian@demo.com · accountant@demo.com · platform@demo.com

## Next (after teacher)
Student section, then parent, then finance/library.
