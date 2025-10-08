# Clerk Authentication & Database Integration

## Overview

This application uses **Clerk** for authentication integrated with a **Turso (libSQL)** database. All users are automatically synced to the database on login, with role-based access control enforced at both the application and database levels.

## Final Role Structure

### 5 Roles Total

| Role | Access | Dashboard | Notes |
|------|--------|-----------|-------|
| **admin** | Full Access (all routes) | `/admin/dashboard` | System administrators |
| **dev** | Full Access (all routes) | `/admin/dashboard` | Developers with full access |
| **coordinator** | `/admin/*` routes | `/admin/dashboard` | Event coordinators |
| **senator** | `/senate/*` routes | `/senate/dashboard` | Senate members (default role) |
| **attorney** | `/attorney/*` routes | `/attorney/dashboard` | Legal assistance providers |

### Role Mapping (Auto-converted)

When syncing Clerk users, old roles are automatically converted:

```
student         → senator
tester          → senator
senate_member   → senator
senate_speaker  → coordinator
super_admin     → admin
(unknown/none)  → senator (default)
```

## Database Schema

### Tables Created

All tables with foreign key constraints:

1. **Users** - Central user table (Clerk ID as primary key)
   - Roles: `admin`, `dev`, `coordinator`, `senator`, `attorney`
   
2. **Events** - Calendar events
   - FK: `created_by` → `Users(id)` ON DELETE CASCADE

3. **Hours** - Time tracking
   - FK: `user_id` → `Users(id)` ON DELETE CASCADE
   - FK: `event_id` → `Events(id)` ON DELETE SET NULL

4. **Agendas** - Voting agendas
   - FK: `speaker_id` → `Users(id)` ON DELETE CASCADE

5. **Options** - Voting options
   - FK: `agenda_id` → `Agendas(id)` ON DELETE CASCADE

6. **Votes** - User votes
   - FK: `voter_id` → `Users(id)` ON DELETE CASCADE
   - FK: `agenda_id` → `Agendas(id)` ON DELETE CASCADE
   - FK: `option_id` → `Options(id)` ON DELETE CASCADE

7. **Availability** - Attorney availability slots
   - FK: `attorney_id` → `Users(id)` ON DELETE CASCADE
   - FK: `booked_by_student_id` → `Users(id)` ON DELETE SET NULL

8. **Appointments** - Scheduled appointments
   - FK: `student_id` → `Users(id)` ON DELETE CASCADE
   - FK: `slot_id` → `Availability(id)`

## How It Works

### User Registration Flow

```
1. User signs up via Clerk
2. User logs in
3. useAssignRole hook triggers
4. /api/assign-default-role is called
5. User is assigned "senator" role in Clerk
6. User is saved to database Users table
7. User can now access the application
```

### User Sync Flow

```
Existing Clerk User
    ↓
Login triggers /api/assign-default-role
    ↓
Check if user exists in database
    ↓
If not → Insert user with Clerk ID
    ↓
If yes → Sync role if different
    ↓
User ready to use app
```

### Role Updates

When an admin updates a user's role:
1. Role updated in Clerk publicMetadata
2. Role updated in database Users table
3. Changes take effect immediately

### User Deletion

When a user is deleted:
1. Deleted from database first (CASCADE removes all related records)
2. Deleted from Clerk
3. All user data cleaned up automatically

## API Endpoints

### Modified Endpoints

- **POST `/api/assign-default-role`**
  - Assigns "senator" role to new users
  - Syncs user to database

- **POST `/api/update-user-role`**
  - Updates role in both Clerk and database
  - Creates user in database if missing

- **DELETE `/api/delete-user`**
  - Deletes from database then Clerk
  - Cascades to all related records

- **GET `/api/get-all-users`**
  - Fetches from database (source of truth)
  - Enriches with Clerk data (name, email)

## Automatic User Management

Users are automatically managed with no manual intervention needed:

- **On Sign-Up:** User created in Clerk, assigned "senator" role
- **On First Login:** User synced to database with Clerk ID
- **On Subsequent Logins:** Role verified and synced if changed
- **On Role Update:** Both Clerk and database updated simultaneously
- **On Deletion:** Removed from database (CASCADE), then Clerk

## Middleware & Route Protection

### Admin Routes (`/admin/*`)
✅ Accessible by: `admin`, `dev`, `coordinator`

### Senate Routes (`/senate/*`)
✅ Accessible by: `admin`, `dev`, `senator`

### Attorney Routes (`/attorney/*`)
✅ Accessible by: `admin`, `dev`, `attorney`

### Public Routes
✅ Accessible by: Everyone

## Benefits Achieved

✅ **Referential Integrity** - Foreign keys prevent orphaned data  
✅ **Automatic Cleanup** - CASCADE deletes clean up related records  
✅ **Better Performance** - Fewer Clerk API calls, faster queries  
✅ **Data Consistency** - Database is source of truth for roles  
✅ **Auto-Sync** - Users synced on every login  
✅ **Simplified Roles** - 5 clear roles instead of 9  
✅ **Safe Defaults** - Unknown roles → senator  

## Key Files

```
Sync-Government/
├── db_schema/
│   ├── users-events-schema.sql       # Users, Events, Hours tables
│   ├── voting-schema.sql              # Agendas, Options, Votes tables
│   └── Schedule-schema.sql            # Availability, Appointments tables
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── assign-default-role/   # User sync endpoint
│   │   │   ├── update-user-role/      # Role management
│   │   │   ├── delete-user/           # User deletion
│   │   │   └── get-all-users/         # User list
│   │   ├── auth/redirect/             # Role-based redirects
│   │   └── hooks/
│   │       └── useAssignRole.ts       # Auto-assign role hook
│   ├── middleware.ts                  # Route protection
│   └── db.js                          # Database client
└── IMPLEMENTATION_SUMMARY.md          # This file
```

## Testing Checklist

- [x] Database tables created with foreign keys
- [x] Clerk users synced to database
- [x] Old roles converted to new roles
- [x] Admin users have full access
- [x] Dev users have full access
- [x] Coordinators access admin dashboard
- [x] Senators access senate dashboard
- [x] Attorneys access attorney dashboard
- [x] New users get "senator" role
- [x] Role updates work
- [x] User deletion cascades properly

## Maintenance

### Adding a New User Manually

```sql
INSERT INTO Users (id, username, role, created_at, updated_at)
VALUES ('clerk_user_id', 'username', 'senator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Updating a User Role

```sql
UPDATE Users 
SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
WHERE id = 'clerk_user_id';
```

### Checking Foreign Key Constraints

```sql
PRAGMA foreign_key_list(Agendas);
PRAGMA foreign_key_list(Votes);
PRAGMA foreign_key_list(Availability);
PRAGMA foreign_key_list(Appointments);
```

### Viewing All Users

```sql
SELECT id, username, role, created_at 
FROM Users 
ORDER BY created_at DESC;
```

## Admin Features

Admins can manage users through the admin dashboard:

- View all users with their roles
- Update user roles (syncs to both Clerk and database)
- Delete users (cascades to all related records)
- Monitor user activity

## Support

For issues:
1. Check application logs
2. Verify Users table has all users
3. Check Clerk metadata matches database roles
4. Review middleware logs for access issues
5. Refer to `CLERK_DATABASE_INTEGRATION.md` for details

---

**Status**: ✅ **Production Ready**  
**Last Updated**: October 8, 2024  
**Database Schema Version**: 1.0 (5 roles)

