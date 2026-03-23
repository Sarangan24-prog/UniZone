# UniZone Frontend

A complete React + Vite + Tailwind CSS frontend application for UniZone with full CRUD operations, search, filters, and sorting.

## Features

- ✅ Authentication (Login/Register)
- ✅ Role-based access control (Student, Staff, Admin)
- ✅ Full CRUD operations for Courses, Events, and Sports
- ✅ Search, Filter, and Sort functionality
- ✅ Service Requests management
- ✅ Responsive design with Tailwind CSS
- ✅ Protected routes and role-based routing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` (already done)
   - Update `VITE_API_URL` if your backend runs on a different port

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
  api/
    client.js              # Axios API client with auth interceptor
  auth/
    AuthContext.jsx         # Authentication context provider
  routes/
    ProtectedRoute.jsx     # Route guard for authenticated users
    RoleRoute.jsx          # Route guard for role-based access
  components/
    Button.jsx             # Reusable button component
    Badge.jsx              # Badge component
    Card.jsx               # Card container component
    Input.jsx              # Input field component
    Select.jsx             # Select dropdown component
    TextArea.jsx           # Textarea component
    Modal.jsx              # Modal dialog component
    Table.jsx              # Table component
    PageShell.jsx          # Page layout wrapper
    TopBar.jsx             # Navigation bar
    Loading.jsx            # Loading state component
    EmptyState.jsx         # Empty state component
  pages/
    Login.jsx              # Login page
    Register.jsx           # Registration page
    Dashboard.jsx          # Dashboard/home page
    Courses.jsx            # Courses CRUD page
    Events.jsx             # Events CRUD page
    Sports.jsx             # Sports CRUD page
    Services.jsx           # Service requests page (student)
    AdminRequests.jsx      # Service requests management (staff/admin)
    NotFound.jsx           # 404 page
  App.jsx                  # Main app component with routing
  main.jsx                 # App entry point
  index.css                # Tailwind CSS imports
```

## API Endpoints Expected

The frontend expects the following backend endpoints:

- `/api/auth/login` - POST
- `/api/auth/register` - POST
- `/api/courses` - GET, POST
- `/api/courses/:id` - PUT, DELETE
- `/api/courses/:id/enroll` - POST
- `/api/courses/:id/drop` - POST
- `/api/events` - GET, POST
- `/api/events/:id` - PUT, DELETE
- `/api/events/:id/register` - POST
- `/api/events/:id/unregister` - POST
- `/api/sports` - GET, POST
- `/api/sports/:id` - PUT, DELETE
- `/api/sports/:id/join` - POST
- `/api/sports/:id/leave` - POST
- `/api/services` - GET, POST
- `/api/services/:id` - PUT
- `/api/services/mine` - GET

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- React 19
- Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Axios
