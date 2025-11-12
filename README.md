# Smart Office Asset & Resource Management System

A modern, multi-organizational, full-stack application for managing office assets, booking shared resources, and tracking maintenance workflows. Built with Next.js, PostgreSQL, Prisma, and NextAuth.js.

## About The Project

This project provides a centralized, web-based platform for companies to manage their physical and virtual assets. It is built with a multi-tenant architecture, allowing multiple independent organizations to use the system securely. Each organization has its own members, assets, resources, and data, completely isolated from others.

The system streamlines common office management tasks, including:

- Tracking the lifecycle of company assets (e.g., laptops, monitors).
- Managing user requests and assignments for those assets.
- Booking shared resources (e.g., meeting rooms, company vehicles) with a time-based calendar system.
- A complete maintenance workflow for reporting, assigning, and resolving issues with any item.

## Built With

- **[Next.js](https://nextjs.org/)** - Full-Stack React Framework
- **[PostgreSQL](https://www.postgresql.org/)** - Relational Database
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-First CSS Framework
- **[Recharts](https://recharts.org/)** - Composable Charting Library
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password Hashing

## Features

### Core Architecture

- **Multi-Tenancy:** The system is designed to support multiple organizations. Users can create or be invited to organizations, with all data scoped to the specific organization they are interacting with.
- **Role-Based Access Control (RBAC):** Three distinct user roles with different permissions:
  - **ADMIN:** Full control over the organization's members, assets, resources, and settings.
  - **EMPLOYEE:** Can view and request assets/resources, report maintenance issues, and manage their own bookings.
  - **MAINTENANCE_STAFF:** Can be assigned to and complete maintenance tasks.

### Asset Management

- **Full CRUD Operations:** Admins can create, read, update, and delete assets.
- **User Request Workflow:** Employees can submit requests for available assets with optional notes.
- **Admin Approval System:** Admins can view all pending asset requests in a centralized modal and approve a single user, which automatically rejects other requests for the same asset.
- **Admin Auto-Assignment:** Admins can assign assets to themselves directly, bypassing the request process.
- **Asset Release:** Assigned users (or admins) can release an asset, updating its condition and making it available again.

### Resource Booking

- **Time-Based Booking:** Users can book resources (both `PHYSICAL` and `VIRTUAL`) for specific time slots.
- **Conflict Prevention:** The system automatically prevents double-bookings by checking for time overlaps on approved requests.
- **Admin Approval Workflow:** All booking requests are sent to an admin for approval or rejection.
- **Admin Auto-Booking:** Admins can book resources for themselves, which are approved automatically.
- **Secure Link Access:** For `VIRTUAL` resources, the access URL is only visible to the user who booked it, and only during their scheduled booking time.
- **User Cancellation & Release:** Users can cancel their pending or approved bookings. Users or admins can also "release" an active booking, ending it early.

### Maintenance Workflow

- **Issue Reporting:** Any user can report an issue with any asset or resource, providing details.
- **Automatic State Change:** When an item is reported, its condition is immediately set to `DAMAGED`, and all active/pending assignments or bookings for it are automatically deleted, preventing further use.
- **Maintenance Dashboard:** A central view for admins and staff.
  - Admins see all `REPORTED`, `ASSIGNED`, and `COMPLETED` tasks and can assign `MAINTENANCE_STAFF` to reported issues.
  - Staff members see a simplified view of only the tasks assigned to them.
- **Task Completion:** The assigned staff member can complete the task, update the resolution details, add costs, and set the item's condition back to `GOOD`, making it available again.

### Dashboard & Analytics

- **Dynamic Overview:** The main dashboard provides a real-time overview of recent organization activity.
- **Time-Filtered Statistics:** Admins can filter statistics to show activity within the last hour, 24 hours, or 7 days.
- **Data Visualization:** Key metrics (new members, total requests, maintenance reports) are visualized in stat cards and a summary bar chart powered by Recharts.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (or your preferred package manager like npm/yarn)
- A running [PostgreSQL](https://www.postgresql.org/download/) database instance.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://your-repository-url.com/project-name.git
    cd project-name
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add the following variables. Replace the placeholder values with your own.

    ```bash
    # .env

    # 1. Your PostgreSQL connection string.
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    DATABASE_URL="postgresql://postgres:password@localhost:5432/my-office-db"

    # 2. A secret key for NextAuth.js session encryption.
    # You can generate a strong secret by running: openssl rand -base64 32
    NEXTAUTH_SECRET="your-super-secret-key-here"
    ```

4.  **Run the database migration:**
    This command will sync your Prisma schema with your PostgreSQL database, creating all the necessary tables and columns.

    ```bash
    pnpm prisma migrate dev
    ```

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Structure

The API follows a RESTful, nested structure organized by organization.
![alt text](image.png)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
