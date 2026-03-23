# UniZone - Project Design Document (PDD)

## 1. Executive Summary
UniZone is a comprehensive University Management System designed to streamline interactions between students, faculty (staff), and administrators. It provides a centralized platform for managing courses, events, sports activities, and campus service requests. The system is built using the MERN stack (MongoDB, Express.js, React, Node.js) to ensure scalability and a modern user experience.

## 2. System Architecture

### 2.1 Technology Stack
- **Frontend**: React (Vite), Tailwind CSS (Styling), Axios (API Client).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (with Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens) with role-based access control.

### 2.2 Directory Structure
- `client/`: React frontend application.
  - `src/components/`: Reusable UI components (Card, Button, etc.).
  - `src/pages/`: Main application pages (Dashboard, Courses, etc.).
  - `src/auth/`: Auth context and logic.
- `backend/`: Node.js API server.
  - `models/`: Mongoose schemas (User, Course, Event, etc.).
  - `controllers/`: Business logic for each module.
  - `routes/`: API endpoint definitions.
  - `middleware/`: Auth and validation middleware.

## 3. User Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full access. Can create/edit/delete Courses, Events, Sports. Can manage Service Requests. |
| **Staff** | Similar to Admin. Can manage academic and extracurricular content. |
| **Student** | Read-only access to content. Can Enroll in Courses, Register for Events, Join Sports, Submit Service Requests. |

## 4. Detailed User Flows

### 4.1 Authentication Flow
1.  **Registration**:
    - Users sign up via `/register`.
    - **Admin/Staff** must provide a secure `ROLE_CREATE_KEY` to verify their authority.
    - **Students** register freely.
2.  **Login**:
    - Users log in with Email/Password.
    - On success, a JWT is issued and stored.
    - User is redirected to the `Dashboard`.

### 4.2 Course Management Flow
- **Admin/Staff**:
    1.  Navigate to **Courses** page.
    2.  Click **New Course**. Fill in details (Title, Code, Capacity, Schedule).
    3.  Click **Save**. The course appears in the list.
    4.  Can click **Edit** to modify or **Delete** to remove a course.
- **Student**:
    1.  Navigate to **Courses** page.
    2.  Browse available courses.
    3.  Click **Enroll** to sign up (if seats are available).
    4.  Click **Drop** to leave a course.

### 4.3 Event Management Flow
- **Admin/Staff**:
    1.  Navigate to **Events**.
    2.  Create an Event with Date, Time, and Capacity.
- **Student**:
    1.  View upcoming events.
    2.  Click **Register** to attend.
    3.  Click **Unregister** to cancel.

### 4.4 Sports & Services Flow
- **Sports**: Students can join teams (e.g., Football, Cricket) up to a max player limit managed by Admins.
- **Services**: Students can submit requests (e.g., "Hostel Cleaning"). Admins view these requests in "All Requests" and manage them.

## 5. Database Schema Overview

- **User**: `name`, `email`, `password` (hashed), `role` (student/staff/admin).
- **Course**: `title`, `code`, `department`, `capacity`, `schedule`, `enrolledStudents` (Array of User IDs).
- **Event**: `title`, `location`, `dateTime`, `capacity`, `registeredUsers` (Array of User IDs).
- **Sport**: `name`, `maxPlayers`, `players` (Array of User IDs).
- **Service**: `category`, `description`, `status`, `userId` (Reference to User).

## 6. API Overview

The backend exposes RESTful endpoints at `http://localhost:3000/api`:

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Courses**: `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/enroll`
- **Events**: `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/register`
- **Sports**: `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/join`
- **Services**: `GET /`, `POST /` (Create request), `PUT /:id` (Update status)

## 7. Conclusion
UniZone is built to be modular and scalable. The clear separation of concerns between the frontend and backend, along with strict role-based access control, ensures a secure and efficient experience for all university stakeholders.
