# Backend README

## Overview

Lightweight Task Management API built with Node.js, Express, and Prisma ORM for PostgreSQL hosted on Supabase. Provides JWT authentication, task CRUD operations, notifications, and health checks.

## Prerequisites

* **Node.js** v16 or newer
* **npm** v8+ 
* **Supabase** project with PostgreSQL database
* **Prisma** CLI (`npm install -g prisma`)

## Setup & Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/task-manager-backend.git
   cd task-manager-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
  
   ```

3. **Configure environment**

   * Set the following variables:

     ```ini
     DATABASE_URL=<your db url>
     JWT_SECRET=<your_jwt_secret>
     ```

4. **Prisma migrations**

   ```bash
   npx prisma migrate deploy
   ```

5. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

## Running the Application

* **Development**:

  ```bash
  npm run dev
  ```

* **Production**:

  ```bash
  npm start
  ```

API is available at `http://localhost:5000/api` by default.

## Architecture & Design

* **Express** for routing and middleware
* **Prisma** for type-safe database interactions
* **JWT** for authentication (stored in HTTP-only cookies)
* **Role-based access control**: USER, MANAGER, ADMIN
* **Layered structure**: Controllers → Services → Repositories
* **Error handling**: Centralized error middleware for uniform responses
* **Auditing**: Middleware logs task creation and updates
* **Notifications**: Stored in DB, served via REST endpoints

## API Endpoints

### Authentication

* `POST /api/auth/register` — Register with email & password
* `POST /api/auth/login` — Login and receive HTTP-only JWT cookie
* `POST /api/auth/logout` — Logout and clear cookie

### Tasks

* `POST /api/tasks` — Create task (body: title, description, dueDate, priority, assignedToId)
* `GET /api/tasks` — List tasks (query: search, status, priority)
* `GET /api/tasks/:id` — Retrieve task with audit logs
* `PUT /api/tasks/:id` — Update task (partial fields allowed)
* `DELETE /api/tasks/:id` — Delete task (Admin only)
* `GET /api/tasks/dashboard` — Dashboard summary (assigned, created, overdue, completionRate)

### Notifications

* `GET /api/notifications` — List notifications
* `PATCH /api/notifications/:id/read` — Mark notification as read

### System

* `GET /health` — Health check (status, timestamp, database)

## Error Handling

* `401 Unauthorized` — Missing or invalid JWT
* `403 Forbidden` — Insufficient permissions
* `404 Not Found` — Resource not found
* `500 Internal Server Error` — Server errors


## Future Improvements

* Add Swagger/OpenAPI documentation
* Real-time updates with WebSockets
* Caching for dashboard metrics
* Dockerize and orchestrate with Kubernetes
