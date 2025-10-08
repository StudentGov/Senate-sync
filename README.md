
# Senate-sync

## Overview

**Senate-sync** is a web platform designed for **Minnesota State University, Mankato's Student Government**, integrating two essential functionalities:

1. **Attorney Appointment Scheduler:**  
   Streamlines the scheduling of legal consultations, enabling students to book, manage, and track appointments with the campus attorney efficiently.

2. **Senate Voting System:**  
   Provides a secure and transparent platform for student government members to cast votes on motions, proposals, and resolutions. The system ensures role-based access control and accurate vote tallying.

This project leverages the power of **Next.js** for a modern, server-rendered, and high-performance web application. We utilize **Clerk** for authentication integrated with our database for role-based access control, ensuring a secure user experience for all roles:
- **Admin** - Full system access
- **Dev** - Full system access (developers)
- **Coordinator** - Event coordination and admin access
- **Senator** - Senate voting and proposals (default role)
- **Attorney** - Legal appointment scheduling

See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for complete authentication and database integration details.

---

## Features

### Attorney Appointment Scheduler
- Book and manage attorney appointments.
- Real-time availability checks.
- Email notifications and reminders for scheduled appointments.
- Admin dashboard for managing appointments and user interactions.

### Senate Voting System
- Role-based voting access for senate matters.
- Secure voting mechanisms to maintain confidentiality.
- Transparent vote counting and result display.
- Speaker dashboard for managing the display of votes.

### Events Calendar
- Interactive calendar with month and week views.
- Colored event blocks with customizable styling.
- Click events to view detailed information in a popover.
- Database-backed event management.
- Fixed height design for consistent user experience.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) for server-rendered React applications.
- **Authentication & Authorization:** [Clerk](https://clerk.dev) for role-based access control.
- **Database:** [Turso](https://turso.tech) (libSQL) for serverless SQLite.
- **Frontend:** React with Tailwind CSS for styling.
- **Backend:** Next.js API Routes.
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

The database schema is automatically created when needed. All tables use foreign key constraints for referential integrity.

**Tables:**
- **Users** - Central user table (synced with Clerk)
- **Events** - Calendar events
- **Hours** - Time tracking
- **Agendas, Options, Votes** - Voting system
- **Availability, Appointments** - Attorney scheduling

Users are automatically synced to the database on their first login. New users receive the "senator" role by default.

For complete database and authentication details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).

---

## Directory Structure

```plaintext
Sync-Government/
├── db_schema/                    # Database schema definitions
│   ├── README.md                # Database schema documentation
│   ├── users-events-schema.sql  # Users, Events, Hours tables
│   ├── Schedule-schema.sql      # Attorney appointment scheduling
│   └── voting-schema.sql        # Senate voting system
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js API routes
│   │   │   ├── assign-default-role/  # User sync endpoint
│   │   │   ├── update-user-role/     # Role management
│   │   │   └── ...
│   │   ├── auth/                # Authentication pages
│   │   ├── calendar/            # Calendar page and components
│   │   ├── components/          # Reusable React components
│   │   └── hooks/
│   │       └── useAssignRole.ts # Auto-assign role hook
│   ├── middleware.ts            # Route protection
│   └── db.js                    # Database connection setup
├── IMPLEMENTATION_SUMMARY.md    # Clerk + Database integration guide
└── ...
```

**Key Documentation:**
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Complete Clerk authentication and database integration guide
- [db_schema/README.md](db_schema/README.md) - Database schema details

---

## Learn More

To learn more about the technologies used, visit:
- [Next.js Documentation](https://nextjs.org/docs) - Detailed guides on Next.js features and APIs.
- [Clerk Documentation](https://clerk.dev/docs) - Authentication and user management guides.
- [Vercel Deployment](https://vercel.com/docs) - Deployment platform for Next.js applications.

---

## Deployment
TBD
