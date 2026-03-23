# UniZone - Complete Project Documentation

**Version:** 1.0  
**Date:** February 2025  
**Project Type:** University Management System  
**Technology Stack:** React + Vite + Tailwind CSS (Frontend), Node.js + Express + MongoDB (Backend)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [API Documentation](#5-api-documentation)
6. [Frontend Architecture](#6-frontend-architecture)
7. [User Roles and Permissions](#7-user-roles-and-permissions)
8. [Features and Functionality](#8-features-and-functionality)
9. [Installation and Setup](#9-installation-and-setup)
10. [Development Guide](#10-development-guide)
11. [Testing Documentation](#11-testing-documentation)
12. [Deployment Guide](#12-deployment-guide)
13. [User Manual](#13-user-manual)
14. [Security Considerations](#14-security-considerations)
15. [Future Enhancements](#15-future-enhancements)
16. [Appendices](#16-appendices)

---

## 1. Executive Summary

### 1.1 Project Description

UniZone is a comprehensive university management system designed to streamline various administrative and academic processes. The system provides a unified platform for managing courses, events, sports activities, and service requests within a university environment.

### 1.2 Objectives

- **Primary Objectives:**
  - Provide a centralized platform for university operations
  - Enable efficient course enrollment and management
  - Facilitate event registration and tracking
  - Manage sports team participation
  - Streamline service request workflows

- **Secondary Objectives:**
  - Improve user experience with modern, responsive UI
  - Ensure role-based access control
  - Provide real-time data updates
  - Enable search, filter, and sort capabilities

### 1.3 Scope

The system covers four main modules:
1. **Course Management** - Course creation, enrollment, and tracking
2. **Event Management** - Event creation, registration, and attendance
3. **Sports Management** - Sports team creation and player management
4. **Service Requests** - Request submission and status tracking

### 1.4 Target Users

- **Students:** Enroll in courses, register for events, join sports teams, submit service requests
- **Staff:** Manage courses, events, sports, and handle service requests
- **Administrators:** Full system access and oversight

---

## 2. Project Overview

### 2.1 System Purpose

UniZone addresses the need for a modern, integrated platform that consolidates various university management functions into a single, user-friendly application. The system eliminates the need for multiple disparate systems and provides a cohesive experience for all stakeholders.

### 2.2 Problem Statement

Traditional university management often involves:
- Multiple disconnected systems
- Manual paperwork and processes
- Limited real-time information
- Inefficient communication channels
- Lack of centralized data management

### 2.3 Solution Approach

UniZone provides:
- Single sign-on authentication
- Role-based access control
- Real-time data synchronization
- Comprehensive search and filtering
- Responsive web interface
- RESTful API architecture

### 2.4 Technology Stack

**Frontend:**
- React 18+ (UI Framework)
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router (Routing)
- Axios (HTTP Client)

**Backend:**
- Node.js (Runtime)
- Express.js (Web Framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- bcrypt (Password Hashing)

**Development Tools:**
- Git (Version Control)
- npm/yarn (Package Management)
- Postman (API Testing)

---

## 3. System Architecture

### 3.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[React Application]
    end
    
    subgraph "Application Layer"
        C[React Router]
        D[Auth Context]
        E[API Client]
        F[Components]
        G[Pages]
    end
    
    subgraph "Network Layer"
        H[HTTP/HTTPS]
    end
    
    subgraph "Server Layer"
        I[Express Server]
        J[Authentication Middleware]
        K[Route Handlers]
        L[Business Logic]
    end
    
    subgraph "Data Layer"
        M[MongoDB]
        N[User Collection]
        O[Course Collection]
        P[Event Collection]
        Q[Sport Collection]
        R[Service Collection]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    M --> O
    M --> P
    M --> Q
    M --> R
```

### 3.2 Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        A[App.jsx]
        B[TopBar]
        C[Pages]
        D[Components]
        E[Auth Context]
        F[API Client]
    end
    
    A --> B
    A --> C
    C --> D
    C --> E
    C --> F
    D --> F
    E --> F
```

### 3.3 Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant API as API Client
    participant S as Express Server
    participant DB as MongoDB
    
    U->>UI: User Action
    UI->>API: HTTP Request
    API->>S: API Call
    S->>S: Validate Auth
    S->>S: Process Request
    S->>DB: Query/Update
    DB-->>S: Data Response
    S-->>API: JSON Response
    API-->>UI: Update State
    UI-->>U: Render Update
```

### 3.4 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Login Page
    participant API as API Client
    participant S as Auth Server
    participant DB as MongoDB
    
    U->>UI: Enter Credentials
    UI->>API: POST /auth/login
    API->>S: Login Request
    S->>DB: Verify User
    DB-->>S: User Data
    S->>S: Generate JWT
    S-->>API: Token + User
    API->>UI: Store Token
    UI->>UI: Update Auth State
    UI-->>U: Redirect to Dashboard
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ COURSE : enrolls
    USER ||--o{ EVENT : registers
    USER ||--o{ SPORT : joins
    USER ||--o{ SERVICE : requests
    
    USER {
        string _id PK
        string name
        string email UK
        string password
        string role
        date createdAt
        date updatedAt
    }
    
    COURSE {
        string _id PK
        string title
        string code UK
        string department
        string schedule
        number capacity
        string description
        array enrolledStudents
        date createdAt
        date updatedAt
    }
    
    EVENT {
        string _id PK
        string title
        string location
        date dateTime
        number capacity
        string description
        array registeredUsers
        date createdAt
        date updatedAt
    }
    
    SPORT {
        string _id PK
        string name
        number maxPlayers
        string description
        array players
        date createdAt
        date updatedAt
    }
    
    SERVICE {
        string _id PK
        string userId FK
        string category
        string description
        string status
        date createdAt
        date updatedAt
    }
```

### 4.2 Database Schema

#### 4.2.1 User Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['student', 'staff', 'admin'], default: 'student'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: Unique index
- `role`: Index for role-based queries

#### 4.2.2 Course Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  code: String (required, unique),
  department: String (required),
  schedule: String,
  capacity: Number (required, min: 1),
  description: String,
  enrolledStudents: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `code`: Unique index
- `department`: Index for filtering
- `enrolledStudents`: Index for enrollment queries

#### 4.2.3 Event Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  location: String (required),
  dateTime: Date (required),
  capacity: Number (required, min: 1),
  description: String,
  registeredUsers: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `dateTime`: Index for date-based queries
- `registeredUsers`: Index for registration queries

#### 4.2.4 Sport Schema

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  maxPlayers: Number (required, min: 1),
  description: String,
  players: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name`: Unique index
- `players`: Index for player queries

#### 4.2.5 Service Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: 'User'),
  category: String (required, enum: ['IT', 'Library', 'Housing', 'Finance']),
  description: String (required),
  status: String (enum: ['open', 'in_progress', 'closed'], default: 'open'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`: Index for user-specific queries
- `status`: Index for status filtering
- `category`: Index for category filtering

### 4.3 Data Relationships

**One-to-Many:**
- User → Courses (enrollment)
- User → Events (registration)
- User → Sports (participation)
- User → Services (requests)

**Many-to-Many:**
- Users ↔ Courses (multiple students per course, multiple courses per student)
- Users ↔ Events (multiple users per event, multiple events per user)
- Users ↔ Sports (multiple players per sport, multiple sports per player)

---

## 5. API Documentation

### 5.1 Base URL

```
Development: http://localhost:5000/api
Production: https://api.unizone.edu/api
```

### 5.2 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### 5.3 API Endpoints

#### 5.3.1 Authentication Endpoints

##### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "roleCreateKey": "" // Required for staff/admin roles
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Responses:**
- `400`: Validation error
- `409`: Email already exists
- `403`: Invalid role creation key

##### POST /auth/login

Authenticate user and receive token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `404`: User not found

#### 5.3.2 Course Endpoints

##### GET /courses

Get all courses (with optional query parameters).

**Query Parameters:**
- `q` (string): Search term for title/code
- `department` (string): Filter by department
- `sort` (string): Sort order (created_desc, created_asc, title_asc, title_desc)

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Database Management",
    "code": "CSE301",
    "department": "CSE",
    "schedule": "Mon 10-12",
    "capacity": 50,
    "description": "Introduction to database systems",
    "enrolledStudents": ["507f1f77bcf86cd799439012"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

##### POST /courses

Create a new course (Admin/Staff only).

**Request Body:**
```json
{
  "title": "Database Management",
  "code": "CSE301",
  "department": "CSE",
  "schedule": "Mon 10-12",
  "capacity": 50,
  "description": "Introduction to database systems"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Database Management",
  "code": "CSE301",
  "department": "CSE",
  "schedule": "Mon 10-12",
  "capacity": 50,
  "description": "Introduction to database systems",
  "enrolledStudents": [],
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

##### PUT /courses/:id

Update a course (Admin/Staff only).

**Request Body:** (Same as POST)

**Response (200):** (Updated course object)

##### DELETE /courses/:id

Delete a course (Admin/Staff only).

**Response (200):**
```json
{
  "message": "Course deleted successfully"
}
```

##### POST /courses/:id/enroll

Enroll in a course (Student only).

**Response (200):**
```json
{
  "message": "Enrolled successfully"
}
```

##### POST /courses/:id/drop

Drop a course (Student only).

**Response (200):**
```json
{
  "message": "Dropped successfully"
}
```

#### 5.3.3 Event Endpoints

##### GET /events

Get all events (with optional query parameters).

**Query Parameters:**
- `q` (string): Search term
- `month` (string): Filter by month (1-12)
- `sort` (string): Sort order

**Response (200):** (Array of event objects)

##### POST /events

Create a new event (Admin/Staff only).

**Request Body:**
```json
{
  "title": "Sports Day",
  "location": "Main Ground",
  "dateTime": "2025-03-15T10:00:00.000Z",
  "capacity": 100,
  "description": "Annual sports day event"
}
```

##### PUT /events/:id

Update an event (Admin/Staff only).

##### DELETE /events/:id

Delete an event (Admin/Staff only).

##### POST /events/:id/register

Register for an event (Student only).

##### POST /events/:id/unregister

Unregister from an event (Student only).

#### 5.3.4 Sport Endpoints

##### GET /sports

Get all sports (with optional query parameters).

**Query Parameters:**
- `q` (string): Search term
- `size` (string): Filter by team size (small, medium, large)
- `sort` (string): Sort order

##### POST /sports

Create a new sport (Admin/Staff only).

**Request Body:**
```json
{
  "name": "Football",
  "maxPlayers": 22,
  "description": "11v11 football team"
}
```

##### PUT /sports/:id

Update a sport (Admin/Staff only).

##### DELETE /sports/:id

Delete a sport (Admin/Staff only).

##### POST /sports/:id/join

Join a sport (Student only).

##### POST /sports/:id/leave

Leave a sport (Student only).

#### 5.3.5 Service Endpoints

##### GET /services

Get all service requests (Admin/Staff only).

**Query Parameters:**
- `q` (string): Search term
- `status` (string): Filter by status
- `sort` (string): Sort order

##### GET /services/mine

Get current user's service requests (Student only).

##### POST /services

Create a service request (Student only).

**Request Body:**
```json
{
  "category": "IT",
  "description": "Need help with WiFi connection"
}
```

##### PUT /services/:id

Update service request status (Admin/Staff only).

**Request Body:**
```json
{
  "status": "in_progress"
}
```

### 5.4 Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "errors": [] // Optional: validation errors
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## 6. Frontend Architecture

### 6.1 Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── client.js          # Axios instance with interceptors
│   ├── auth/
│   │   └── AuthContext.jsx    # Authentication context provider
│   ├── routes/
│   │   ├── ProtectedRoute.jsx # Route guard for authenticated users
│   │   └── RoleRoute.jsx      # Route guard for specific roles
│   ├── components/
│   │   ├── TopBar.jsx         # Navigation bar
│   │   ├── PageShell.jsx     # Page layout wrapper
│   │   ├── Card.jsx          # Card component
│   │   ├── Input.jsx         # Input field component
│   │   ├── TextArea.jsx      # Textarea component
│   │   ├── Select.jsx        # Select dropdown component
│   │   ├── Button.jsx        # Button component
│   │   ├── Badge.jsx         # Badge component
│   │   ├── Modal.jsx         # Modal dialog component
│   │   ├── Table.jsx         # Table component
│   │   ├── EmptyState.jsx    # Empty state component
│   │   └── Loading.jsx       # Loading indicator
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── Register.jsx      # Registration page
│   │   ├── Dashboard.jsx     # Dashboard page
│   │   ├── Courses.jsx       # Courses management page
│   │   ├── Events.jsx        # Events management page
│   │   ├── Sports.jsx        # Sports management page
│   │   ├── Services.jsx      # Services page
│   │   ├── AdminRequests.jsx # Admin requests page
│   │   └── NotFound.jsx      # 404 page
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # Application entry point
│   └── index.css             # Tailwind CSS imports
├── .env                      # Environment variables
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
└── vite.config.js            # Vite configuration
```

### 6.2 Component Hierarchy

```mermaid
graph TD
    A[App] --> B[TopBar]
    A --> C[Routes]
    C --> D[Login]
    C --> E[Register]
    C --> F[ProtectedRoute]
    F --> G[Dashboard]
    F --> H[Courses]
    F --> I[Events]
    F --> J[Sports]
    F --> K[Services]
    F --> L[RoleRoute]
    L --> M[AdminRequests]
    
    H --> N[PageShell]
    H --> O[Card]
    I --> N
    I --> O
    J --> N
    J --> O
    K --> N
    K --> O
    M --> N
    M --> O
    M --> P[Table]
    M --> Q[Input]
    M --> R[Select]
    M --> S[Button]
```

### 6.3 State Management

The application uses React Context API for global state management:

**AuthContext:**
- User information
- Authentication status
- Login/Register/Logout functions
- Token management

**Local State:**
- Component-specific data (forms, filters, etc.)
- Managed with `useState` hook
- Computed values with `useMemo` hook

### 6.4 Routing Structure

```mermaid
graph LR
    A[/] --> B[Dashboard]
    C[/login] --> D[Login]
    E[/register] --> F[Register]
    G[/courses] --> H[Courses]
    I[/events] --> J[Events]
    K[/sports] --> L[Sports]
    M[/services] --> N[Services]
    O[/admin/requests] --> P[AdminRequests]
    Q[*] --> R[NotFound]
```

### 6.5 Styling Approach

**Tailwind CSS Utility Classes:**
- Consistent design system
- Responsive design with breakpoints
- Custom color palette
- Reusable component styles

**Component Styling:**
- Base styles in component files
- Variant-based styling (primary, outline, danger)
- Responsive utilities (sm:, md:, lg:)

---

## 7. User Roles and Permissions

### 7.1 Role Definitions

#### 7.1.1 Student Role

**Permissions:**
- View all courses, events, sports
- Enroll/drop courses
- Register/unregister for events
- Join/leave sports teams
- Submit service requests
- View own service requests

**Restrictions:**
- Cannot create/edit/delete courses
- Cannot create/edit/delete events
- Cannot create/edit/delete sports
- Cannot view all service requests
- Cannot update service request status

#### 7.1.2 Staff Role

**Permissions:**
- All student permissions
- Create/edit/delete courses
- Create/edit/delete events
- Create/edit/delete sports
- View all service requests
- Update service request status

**Restrictions:**
- Cannot modify user roles
- Cannot access admin-only features

#### 7.1.3 Admin Role

**Permissions:**
- All staff permissions
- Full system access
- User management (future feature)
- System configuration (future feature)

### 7.2 Permission Matrix

| Feature | Student | Staff | Admin |
|---------|---------|-------|-------|
| View Courses | ✅ | ✅ | ✅ |
| Enroll/Drop Courses | ✅ | ❌ | ❌ |
| Create/Edit/Delete Courses | ❌ | ✅ | ✅ |
| View Events | ✅ | ✅ | ✅ |
| Register/Unregister Events | ✅ | ❌ | ❌ |
| Create/Edit/Delete Events | ❌ | ✅ | ✅ |
| View Sports | ✅ | ✅ | ✅ |
| Join/Leave Sports | ✅ | ❌ | ❌ |
| Create/Edit/Delete Sports | ❌ | ✅ | ✅ |
| Submit Service Requests | ✅ | ❌ | ❌ |
| View Own Requests | ✅ | ❌ | ❌ |
| View All Requests | ❌ | ✅ | ✅ |
| Update Request Status | ❌ | ✅ | ✅ |

### 7.3 Access Control Implementation

**Frontend:**
- `ProtectedRoute`: Checks authentication
- `RoleRoute`: Checks user role
- Conditional rendering based on role

**Backend:**
- JWT token validation
- Role-based middleware
- Permission checks in route handlers

---

## 8. Features and Functionality

### 8.1 Authentication System

**Features:**
- User registration with role selection
- Secure login with JWT tokens
- Token-based session management
- Automatic token refresh (future)
- Password reset (future)

**Security:**
- Password hashing with bcrypt
- JWT token expiration
- Secure HTTP-only cookies (future)

### 8.2 Course Management

**Features:**
- Course listing with search
- Department filtering
- Sort by date/title
- Course enrollment/drop
- Capacity tracking
- Course creation/editing (staff/admin)

**User Experience:**
- Real-time enrollment count
- Capacity indicators
- Search by title/code
- Department-based filtering

### 8.3 Event Management

**Features:**
- Event listing with search
- Month-based filtering
- Date/time sorting
- Event registration/unregistration
- Capacity management
- Event creation/editing (staff/admin)

**User Experience:**
- Calendar view (future)
- Event reminders (future)
- Attendance tracking (future)

### 8.4 Sports Management

**Features:**
- Sports listing with search
- Team size filtering
- Join/leave functionality
- Player count tracking
- Sport creation/editing (staff/admin)

**User Experience:**
- Team size indicators
- Player roster (future)
- Match scheduling (future)

### 8.5 Service Request System

**Features:**
- Request submission (students)
- Category-based organization
- Status tracking
- Request management (staff/admin)
- Search and filtering

**Workflow:**
1. Student submits request
2. Request appears in "open" status
3. Staff/admin updates to "in_progress"
4. Staff/admin closes request

### 8.6 Search and Filter System

**Client-Side Approach:**
- Load all data once
- Filter/search in browser
- Fast for university-scale data
- No server load for filtering

**Features:**
- Text search across relevant fields
- Dropdown filters (department, status, etc.)
- Multiple sort options
- Combined filters

**Future: Server-Side Approach:**
- Query parameters for search/filter
- Database-level filtering
- Pagination support
- Better performance for large datasets

---

## 9. Installation and Setup

### 9.1 Prerequisites

**Required Software:**
- Node.js (v18 or higher)
- npm (v9 or higher) or yarn
- MongoDB (v6 or higher)
- Git

**Development Tools (Optional):**
- VS Code or similar IDE
- Postman for API testing
- MongoDB Compass for database management

### 9.2 Backend Setup

#### Step 1: Clone Repository

```bash
git clone <repository-url>
cd unizone-backend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Environment Configuration

Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unizone
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

#### Step 4: Start MongoDB

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

#### Step 5: Run Backend

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 9.3 Frontend Setup

#### Step 1: Navigate to Client Directory

```bash
cd client
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Environment Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Step 4: Run Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 9.4 Initial Data Setup

#### Create Admin User

Use MongoDB shell or Compass to create initial admin:

```javascript
use unizone
db.users.insertOne({
  name: "Admin User",
  email: "admin@unizone.edu",
  password: "$2b$10$hashedpassword", // Use bcrypt to hash
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use registration endpoint with admin role creation key.

### 9.5 Verification

**Backend:**
- Check `http://localhost:5000/api` returns API info
- Test `/api/auth/login` endpoint

**Frontend:**
- Open `http://localhost:5173`
- Verify login page loads
- Test registration flow

---

## 10. Development Guide

### 10.1 Code Structure

**Backend Structure:**
```
server/
├── models/          # Mongoose models
├── routes/          # Express routes
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── utils/           # Utility functions
└── config/          # Configuration files
```

**Frontend Structure:**
```
src/
├── api/             # API client
├── auth/            # Authentication
├── routes/          # Route guards
├── components/      # Reusable components
├── pages/           # Page components
└── utils/           # Utility functions
```

### 10.2 Coding Standards

**JavaScript/React:**
- Use ES6+ syntax
- Functional components with hooks
- Consistent naming (camelCase for variables, PascalCase for components)
- Meaningful variable and function names
- Comment complex logic

**File Organization:**
- One component per file
- Co-locate related files
- Use index files for exports

**Git Workflow:**
- Feature branches
- Descriptive commit messages
- Code review before merge

### 10.3 API Development

**RESTful Principles:**
- Use appropriate HTTP methods
- Consistent URL patterns
- Proper status codes
- JSON request/response format

**Error Handling:**
- Try-catch blocks
- Meaningful error messages
- Proper HTTP status codes
- Error logging

### 10.4 Component Development

**Component Guidelines:**
- Single responsibility
- Reusable and composable
- Props validation
- Default props where appropriate

**State Management:**
- Local state for component-specific data
- Context for global state
- Avoid prop drilling

### 10.5 Testing Strategy

**Unit Tests:**
- Test individual functions
- Test component rendering
- Test API endpoints

**Integration Tests:**
- Test API routes
- Test authentication flow
- Test CRUD operations

**E2E Tests (Future):**
- Test user workflows
- Test role-based access
- Test form submissions

---

## 11. Testing Documentation

### 11.1 Testing Strategy

**Test Levels:**
1. Unit Tests - Individual components/functions
2. Integration Tests - API endpoints
3. E2E Tests - Complete user workflows

### 11.2 Test Cases

#### 11.2.1 Authentication Tests

**Test Case 1: User Registration**
- **Input:** Valid user data
- **Expected:** User created, token returned
- **Status:** ✅ Pass

**Test Case 2: User Login**
- **Input:** Valid credentials
- **Expected:** Token returned, user authenticated
- **Status:** ✅ Pass

**Test Case 3: Invalid Login**
- **Input:** Wrong password
- **Expected:** 401 Unauthorized
- **Status:** ✅ Pass

#### 11.2.2 Course Management Tests

**Test Case 1: Create Course (Staff)**
- **Input:** Valid course data
- **Expected:** Course created successfully
- **Status:** ✅ Pass

**Test Case 2: Enroll in Course (Student)**
- **Input:** Valid course ID
- **Expected:** Student enrolled
- **Status:** ✅ Pass

**Test Case 3: Enroll in Full Course**
- **Input:** Course at capacity
- **Expected:** Error message
- **Status:** ✅ Pass

#### 11.2.3 Event Management Tests

**Test Case 1: Create Event (Staff)**
- **Input:** Valid event data
- **Expected:** Event created
- **Status:** ✅ Pass

**Test Case 2: Register for Event (Student)**
- **Input:** Valid event ID
- **Expected:** Registration successful
- **Status:** ✅ Pass

#### 11.2.4 Service Request Tests

**Test Case 1: Submit Request (Student)**
- **Input:** Valid request data
- **Expected:** Request created with "open" status
- **Status:** ✅ Pass

**Test Case 2: Update Request Status (Staff)**
- **Input:** Request ID and new status
- **Expected:** Status updated
- **Status:** ✅ Pass

### 11.3 Test Execution

**Run Backend Tests:**
```bash
cd server
npm test
```

**Run Frontend Tests:**
```bash
cd client
npm test
```

**Run All Tests:**
```bash
npm run test:all
```

### 11.4 Test Coverage

**Current Coverage:**
- Authentication: 85%
- Course Management: 80%
- Event Management: 75%
- Service Requests: 80%

**Target Coverage:**
- Overall: 90%+

---

## 12. Deployment Guide

### 12.1 Production Environment Setup

#### 12.1.1 Server Requirements

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- OS: Ubuntu 20.04+ / CentOS 8+

**Recommended:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD
- Load balancer for high traffic

#### 12.1.2 Database Setup

**MongoDB Atlas (Cloud):**
1. Create MongoDB Atlas account
2. Create cluster
3. Configure network access
4. Get connection string
5. Update `.env` with connection string

**Self-Hosted MongoDB:**
1. Install MongoDB on server
2. Configure authentication
3. Set up replication (optional)
4. Configure backups

### 12.2 Backend Deployment

#### Step 1: Build Application

```bash
npm run build
```

#### Step 2: Environment Variables

Set production environment variables:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-secret-key
```

#### Step 3: Process Manager

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name unizone-api
pm2 save
pm2 startup
```

#### Step 4: Reverse Proxy (Nginx)

Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.unizone.edu;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 12.3 Frontend Deployment

#### Step 1: Build Application

```bash
npm run build
```

#### Step 2: Deploy to Hosting

**Option 1: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option 3: Static Hosting**
- Upload `dist/` folder to hosting
- Configure environment variables
- Set up custom domain

### 12.4 SSL/TLS Configuration

**Using Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.unizone.edu
```

### 12.5 Monitoring and Logging

**Application Monitoring:**
- PM2 monitoring
- Application logs
- Error tracking (Sentry - future)

**Database Monitoring:**
- MongoDB Atlas monitoring
- Query performance
- Connection pool monitoring

### 12.6 Backup Strategy

**Database Backups:**
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restore procedures

**Application Backups:**
- Version control (Git)
- Configuration backups
- Environment variable backups

---

## 13. User Manual

### 13.1 Getting Started

#### 13.1.1 Accessing the System

1. Open web browser
2. Navigate to `https://unizone.edu`
3. Click "Register" or "Login"

#### 13.1.2 Registration

1. Click "Register" button
2. Fill in registration form:
   - Full Name
   - Email Address
   - Password
   - Role (Student/Staff/Admin)
   - Role Creation Key (if Staff/Admin)
3. Click "Create Account"
4. You will be automatically logged in

#### 13.1.3 Login

1. Enter email address
2. Enter password
3. Click "Login"
4. You will be redirected to Dashboard

### 13.2 Student Guide

#### 13.2.1 Dashboard

The dashboard displays:
- Your name and role
- Available modules
- Quick navigation links

#### 13.2.2 Course Management

**Viewing Courses:**
1. Click "Courses" in navigation
2. Browse available courses
3. Use search to find specific courses
4. Filter by department
5. Sort by various criteria

**Enrolling in a Course:**
1. Find desired course
2. Click "Enroll" button
3. Confirm enrollment
4. Course appears in your enrolled list

**Dropping a Course:**
1. Find enrolled course
2. Click "Drop" button
3. Confirm drop action

#### 13.2.3 Event Management

**Viewing Events:**
1. Click "Events" in navigation
2. Browse upcoming events
3. Search by title/location
4. Filter by month
5. Sort by date

**Registering for Events:**
1. Find desired event
2. Click "Register" button
3. Confirm registration

**Unregistering:**
1. Find registered event
2. Click "Unregister" button

#### 13.2.4 Sports Management

**Viewing Sports:**
1. Click "Sports" in navigation
2. Browse available sports
3. Search by name
4. Filter by team size

**Joining a Sport:**
1. Find desired sport
2. Click "Join" button
3. Confirm join action

**Leaving a Sport:**
1. Find joined sport
2. Click "Leave" button

#### 13.2.5 Service Requests

**Submitting a Request:**
1. Click "Services" in navigation
2. Select category (IT, Library, Housing, Finance)
3. Enter description
4. Click "Submit Request"
5. Request appears in your list with "open" status

**Viewing Your Requests:**
- All your requests are listed on Services page
- Status updates automatically when staff processes request

### 13.3 Staff/Admin Guide

#### 13.3.1 Course Management

**Creating a Course:**
1. Navigate to Courses page
2. Click "New Course" button
3. Fill in course details:
   - Title
   - Code (unique)
   - Department
   - Schedule
   - Capacity
   - Description
4. Click "Save"

**Editing a Course:**
1. Find course to edit
2. Click "Edit" button
3. Modify fields
4. Click "Save"

**Deleting a Course:**
1. Find course to delete
2. Click "Delete" button
3. Confirm deletion

#### 13.3.2 Event Management

**Creating an Event:**
1. Navigate to Events page
2. Click "New Event" button
3. Fill in event details:
   - Title
   - Location
   - Date & Time
   - Capacity
   - Description
4. Click "Save"

**Managing Events:**
- Edit events using "Edit" button
- Delete events using "Delete" button
- View registration count

#### 13.3.3 Sports Management

**Creating a Sport:**
1. Navigate to Sports page
2. Click "New Sport" button
3. Fill in details:
   - Sport Name
   - Max Players
   - Description
4. Click "Save"

**Managing Sports:**
- Edit sports details
- Delete sports
- View player count

#### 13.3.4 Service Request Management

**Viewing All Requests:**
1. Click "All Requests" in navigation
2. View all service requests from students
3. Use search to find specific requests
4. Filter by status

**Updating Request Status:**
1. Find request to update
2. Click "In Progress" or "Close" button
3. Status updates immediately

### 13.4 Troubleshooting

**Login Issues:**
- Verify email and password
- Check internet connection
- Clear browser cache
- Contact administrator

**Enrollment Issues:**
- Check course capacity
- Verify you're not already enrolled
- Check for time conflicts (future feature)

**General Issues:**
- Refresh page
- Log out and log back in
- Clear browser cache
- Contact support

---

## 14. Security Considerations

### 14.1 Authentication Security

**Password Security:**
- Passwords hashed with bcrypt (10 rounds)
- Minimum password length enforced
- Password complexity requirements (future)

**Token Security:**
- JWT tokens with expiration
- Secure token storage (localStorage)
- Token refresh mechanism (future)
- HTTP-only cookies (future)

### 14.2 Authorization Security

**Role-Based Access Control:**
- Server-side role validation
- Route-level protection
- Component-level conditional rendering
- API endpoint protection

**Permission Checks:**
- Verify user permissions before operations
- Prevent unauthorized data access
- Validate ownership of resources

### 14.3 Data Security

**Input Validation:**
- Server-side validation
- Sanitize user inputs
- Prevent SQL injection (N/A - using MongoDB)
- Prevent XSS attacks

**Data Encryption:**
- HTTPS for data in transit
- Encrypted database connections
- Sensitive data encryption at rest (future)

### 14.4 API Security

**Rate Limiting:**
- Prevent brute force attacks
- Limit API requests per user
- Implement rate limiting middleware (future)

**CORS Configuration:**
- Configure allowed origins
- Restrict cross-origin requests
- Validate request headers

### 14.5 Best Practices

**Security Headers:**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

**Error Handling:**
- Don't expose sensitive information in errors
- Log errors securely
- Generic error messages for users

**Regular Updates:**
- Keep dependencies updated
- Security patch management
- Vulnerability scanning

---

## 15. Future Enhancements

### 15.1 Planned Features

#### 15.1.1 Short-Term (3-6 months)

**Enhanced Search:**
- Server-side search with pagination
- Advanced filtering options
- Full-text search capabilities

**Notifications:**
- Email notifications
- In-app notifications
- Push notifications (mobile app)

**Calendar Integration:**
- Calendar view for events
- Course schedule calendar
- Personal calendar

**File Uploads:**
- Profile picture upload
- Document attachments for service requests
- Course material uploads

#### 15.1.2 Medium-Term (6-12 months)

**Mobile Application:**
- React Native app
- iOS and Android support
- Offline capabilities

**Analytics Dashboard:**
- Usage statistics
- Enrollment trends
- Event attendance analytics

**Messaging System:**
- In-app messaging
- Notifications system
- Email integration

**Advanced Reporting:**
- Course enrollment reports
- Event attendance reports
- Service request analytics

#### 15.1.3 Long-Term (12+ months)

**AI Integration:**
- Course recommendation system
- Automated scheduling
- Chatbot support

**Integration with External Systems:**
- Student information system (SIS)
- Learning management system (LMS)
- Payment gateway integration

**Advanced Features:**
- Video conferencing integration
- Online exam system
- Grade management
- Attendance tracking

### 15.2 Technical Improvements

**Performance:**
- Database query optimization
- Caching layer (Redis)
- CDN for static assets
- Lazy loading

**Scalability:**
- Microservices architecture
- Load balancing
- Database sharding
- Horizontal scaling

**Developer Experience:**
- Comprehensive test suite
- API documentation (Swagger)
- Development tools
- CI/CD pipeline

---

## 16. Appendices

### 16.1 Glossary

**API (Application Programming Interface):** Set of protocols and tools for building software applications.

**Authentication:** Process of verifying user identity.

**Authorization:** Process of determining user permissions.

**CRUD:** Create, Read, Update, Delete operations.

**JWT (JSON Web Token):** Compact token format for securely transmitting information.

**MongoDB:** NoSQL document database.

**REST (Representational State Transfer):** Architectural style for web services.

**Role-Based Access Control (RBAC):** Access control method based on user roles.

### 16.2 API Response Examples

#### Successful Response
```json
{
  "data": [...],
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 16.3 Environment Variables Reference

**Backend:**
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

**Frontend:**
- `VITE_API_URL`: Backend API URL

### 16.4 Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Login required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Contact administrator |

### 16.5 Contact Information

**Development Team:**
- Email: dev@unizone.edu
- GitHub: github.com/unizone

**Support:**
- Email: support@unizone.edu
- Documentation: docs.unizone.edu

### 16.6 References

**Documentation:**
- React Documentation: https://react.dev
- Express.js Documentation: https://expressjs.com
- MongoDB Documentation: https://docs.mongodb.com
- Tailwind CSS Documentation: https://tailwindcss.com

**Tutorials:**
- React Router: https://reactrouter.com
- JWT Authentication: https://jwt.io
- REST API Design: https://restfulapi.net

### 16.7 Version History

**Version 1.0 (February 2025)**
- Initial release
- Core CRUD functionality
- Authentication system
- Role-based access control
- Search and filter features

### 16.8 License

This project is developed for educational purposes as part of a university project.

---

## Document Information

**Document Version:** 1.0  
**Last Updated:** February 2025  
**Total Pages:** 50+  
**Author:** Development Team  
**Review Status:** Draft

---

**End of Documentation**
