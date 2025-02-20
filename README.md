
# Senate-sync

## Overview

**Senate-sync** is a web platform designed for **Minnesota State University, Mankato's Student Government**, integrating two essential functionalities:

1. **Attorney Appointment Scheduler:**  
   Streamlines the scheduling of legal consultations, enabling students to book, manage, and track appointments with the campus attorney efficiently.

2. **Senate Voting System:**  
   Provides a secure and transparent platform for student government members to cast votes on motions, proposals, and resolutions. The system ensures role-based access control and accurate vote tallying.

This project leverages the power of **Next.js** for a modern, server-rendered, and high-performance web application. We utilize **Clerk** for authentication and role-based access control, ensuring a secure user experience for all roles :
- Student
- Attorney
- Senate Speaker
- Senate Member
- Super Admin

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
---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) for server-rendered React applications.
- **Authentication & Authorization:** [Clerk](https://clerk.dev) for role-based access control.
- **Database:** TBD.
- **Frontend:** React with Tailwind CSS for styling.
- **Backend:** Next.js API Routes.
---

## Getting Started

To get started with the development environment:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/senate-sync.git
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
   - Add necessary configuration variables as shown in `.env.example`.

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

5. **Open** [http://localhost:3000](http://localhost:3000) or where it says it is being deployed on localy with your browser to see the result. The application supports hot-reloading, so changes reflect in real-time.

---

## Directory Structure

```plaintext
will be displayed when we organize.
```

---

## Learn More

To learn more about the technologies used, visit:
- [Next.js Documentation](https://nextjs.org/docs) - Detailed guides on Next.js features and APIs.
- [Clerk Documentation](https://clerk.dev/docs) - Authentication and user management guides.
- [Vercel Deployment](https://vercel.com/docs) - Deployment platform for Next.js applications.

---

## Deployment
TBD