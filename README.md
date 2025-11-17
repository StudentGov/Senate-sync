
# Senate-sync

## Overview

**Senate-sync** is a comprehensive web platform designed for **Minnesota State University, Mankato's Student Government**. The platform integrates four core functionalities:

1. **Attorney Appointment Scheduler:**  
   Streamlines the scheduling of legal consultations, enabling students to book, manage, and track appointments with the campus attorney efficiently.

2. **Senate Voting System:**  
   Provides a secure and transparent platform for student government members to cast votes on motions, proposals, and resolutions. The system ensures role-based access control and accurate vote tallying with real-time updates.

3. **Events Calendar:**  
   Interactive calendar system for managing government events, meetings, and activities with role-based event creation and management.

4. **Resource & Archive Management:**  
   Centralized system for managing resources and historical archives accessible to all users.

This project leverages **Next.js 15** with TypeScript for a modern, server-rendered, and high-performance web application. We utilize **Clerk** for authentication integrated with our Turso database for role-based access control, ensuring a secure user experience. **Important**: Public sign-up is disabled - all user accounts must be created by administrators.

### User Roles:
- **Admin** - Full system access and user management
- **Coordinator** - Event coordination and content management (similar to admin)
- **Senator** - Senate voting, hour logging, and proposals
- **Attorney** - Legal appointment scheduling and availability management

**Note**: The "dev" role exists for developers but is rarely used. All users require accounts created by administrators.

For detailed authentication and authorization documentation, see [RBAC.md](RBAC.md).

---

## Features

### Attorney Appointment Scheduler
- Students can book attorney appointments through public interface
- Attorney dashboard for managing availability and viewing appointments
- Real-time availability checks
- Time slot management system
- Appointment confirmation and tracking

### Senate Voting System
- Role-based voting access for senate matters (senators, coordinators, admins)
- Secure voting mechanisms with one vote per user per agenda
- Real-time vote counting and result display via Pusher
- Agenda management with visibility controls
- Speaker/Coordinator dashboard for managing voting sessions
- Individual vote tracking and transparency
- Vote visualization with pie charts

### Events Calendar
- Interactive calendar with FullCalendar integration
- Month and week views
- Event types: Senate meetings, committee meetings, office hours, administrator events, miscellaneous
- Colored event blocks by type
- Click events to view detailed information
- Role-based event creation (admins, coordinators)
- Database-backed event management

### Resources & Archives
- Public resources listing for helpful links and documents
- Historical archives management
- Admin/Coordinator management interface for adding, updating, and deleting items
- Support for images and links

### User Management (Admin Only)
- Admin dashboard for user creation and role management
- Batch role updates
- User table with role assignment
- Account creation through admin panel (public sign-up disabled)

---

## Tech Stack

- **Framework:** [Next.js 15.5.4](https://nextjs.org) with App Router and TypeScript
- **Authentication & Authorization:** [Clerk](https://clerk.dev) for authentication with role-based access control (RBAC)
- **Database:** [Turso](https://turso.tech) (libSQL) for serverless SQLite database
- **Real-time:** [Pusher](https://pusher.com) for WebSocket-based real-time updates
- **Frontend:**
  - React 18 with TypeScript
  - Tailwind CSS for utility-first styling
  - CSS Modules for component-scoped styles
  - Material-UI (MUI) for charts and date pickers
  - Radix UI for accessible components
  - FullCalendar for calendar functionality
- **State Management:** Zustand for global client-side state
- **Backend:** Next.js API Routes (RESTful endpoints)
---

## Getting Started

To get started with the development environment:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/StudentGov/Senate-sync.git
   cd senate-sync
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file at the root of your project.
   - Add the following required variables:
     ```bash
     # Turso Database
     TURSO_DATABASE_URL=libsql://your-database.turso.io
     TURSO_AUTH_TOKEN=your-turso-token
     
     # Clerk Authentication
     CLERK_SECRET_KEY=sk_test_your-key
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
     NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
     NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
     
     # Pusher (Real-time updates)
     NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
     PUSHER_APP_ID=your-pusher-id
     PUSHER_SECRET=your-pusher-secret
     NEXT_PUBLIC_PUSHER_CLUSTER=us2
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application supports hot-reloading, so changes reflect in real-time.

## Database Setup

The database uses Turso (libSQL/SQLite) with schema files located in `db_schema/`. All tables use foreign key constraints for referential integrity with `ON DELETE CASCADE` for data consistency.

### Schema Files:
- **`users-events-schema.sql`** - Users, Events, Hours tables
- **`voting-schema.sql`** - Agendas, Options, Votes tables
- **`Schedule-schema.sql`** - Availability, Appointments tables
- **`resources-archives-schema.sql`** - Resources, Archives tables

### Key Tables:
- **Users** - Central user table (synced with Clerk, stores roles)
- **Events** - Calendar events with types and locations
- **Hours** - Senator hour tracking
- **Agendas, Options, Votes** - Voting system
- **Availability, Appointments** - Attorney scheduling
- **Resources** - Public resources
- **Archives** - Historical documents

### User Management:
**Important**: Public sign-up is disabled. All user accounts must be created by administrators through the admin dashboard (`/admin/dashboard`). Users are created in both Clerk and the database simultaneously with assigned roles.

For complete database schema details, see [db_schema/README.md](db_schema/README.md).  
For authentication and RBAC details, see [RBAC.md](RBAC.md).

---

## Directory Structure

```plaintext
Sync-Government/
├── db_schema/                    # Database schema definitions
│   ├── README.md                # Database schema documentation
│   ├── users-events-schema.sql  # Users, Events, Hours tables
│   ├── Schedule-schema.sql      # Attorney appointment scheduling
│   ├── voting-schema.sql        # Senate voting system
│   └── resources-archives-schema.sql  # Resources and Archives
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # REST API endpoints
│   │   │   ├── admin/              # Admin-only endpoints
│   │   │   ├── senate/             # Senator endpoints
│   │   │   ├── student/            # Public student endpoints
│   │   │   └── voting/             # Voting endpoints
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── attorney/            # Attorney dashboard pages
│   │   ├── senate/              # Senator pages
│   │   ├── student/             # Student pages (public)
│   │   ├── calendar/            # Calendar page
│   │   ├── resources/           # Resources page
│   │   ├── archives/            # Archives page
│   │   ├── voting/              # Public voting pages
│   │   ├── auth/                # Authentication pages
│   │   ├── components/          # Reusable React components
│   │   ├── lib/                 # Client utilities (Pusher, Zustand)
│   │   └── layout.tsx           # Root layout
│   ├── middleware.ts            # Route protection & RBAC
│   ├── db.js                    # Database connection (Turso)
│   ├── pusher.ts                # Server-side Pusher client
│   └── types/                   # TypeScript type definitions
├── public/                      # Static assets
├── scripts/                     # Utility scripts
├── RBAC.md                      # Role-based access control documentation
├── CODEBASE_OVERVIEW.md         # Detailed codebase structure guide
└── README.md                    # This file
```

**Key Documentation:**
- [RBAC.md](RBAC.md) - Complete authentication and authorization guide
- [db_schema/README.md](db_schema/README.md) - Database schema details
- [CODEBASE_OVERVIEW.md](CODEBASE_OVERVIEW.md) - Detailed codebase structure and architecture

---

## Development Notes

### Public Sign-Up Disabled
Public user registration is disabled. All accounts must be created by administrators through `/admin/dashboard`. The sign-up page (`/auth/sign-up`) redirects to `/unauthorized`.

### Role Management
- Roles are stored in both Clerk (`publicMetadata.role`) and the database (`Users.role`)
- Database is the source of truth for roles
- Use the admin dashboard to create users and manage roles
- After role changes, users must log out and log back in for changes to take effect

### Development Mode
Set `DISABLE_AUTH_FOR_DEV=true` in `.env.local` to disable authentication for local development (never use in production).

### Real-time Updates
Voting and agenda updates use Pusher for real-time synchronization across all connected clients.

---

## Learn More

To learn more about the technologies used, visit:
- [Next.js Documentation](https://nextjs.org/docs) - Detailed guides on Next.js features and APIs
- [Clerk Documentation](https://clerk.dev/docs) - Authentication and user management guides
- [Turso Documentation](https://docs.turso.tech) - Database documentation
- [Pusher Documentation](https://pusher.com/docs) - Real-time communication

---

## Deployment

Deployment configuration is currently pending. The application is built with Next.js and can be deployed to platforms like Vercel, which natively supports Next.js applications.
