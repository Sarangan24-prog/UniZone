# UniZone Backend API

Complete backend server for UniZone University Management System.

## Features

- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication
- ✅ Role-based access control (Student, Staff, Admin)
- ✅ RESTful API endpoints
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Error handling

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already created with:
- PORT=3000
- MONGODB_URI=mongodb://localhost:27017/unizone
- JWT_SECRET=unizone-secret-key-change-in-production-2025

### 3. Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

**Or run MongoDB manually:**
```bash
mongod
```

### 4. Start the Server

```bash
npm start
# or
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin/Staff)
- `PUT /api/courses/:id` - Update course (Admin/Staff)
- `DELETE /api/courses/:id` - Delete course (Admin/Staff)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)
- `POST /api/courses/:id/drop` - Drop course (Student)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (Admin/Staff)
- `PUT /api/events/:id` - Update event (Admin/Staff)
- `DELETE /api/events/:id` - Delete event (Admin/Staff)
- `POST /api/events/:id/register` - Register for event (Student)
- `POST /api/events/:id/unregister` - Unregister from event (Student)

### Sports
- `GET /api/sports` - Get all sports
- `POST /api/sports` - Create sport (Admin/Staff)
- `PUT /api/sports/:id` - Update sport (Admin/Staff)
- `DELETE /api/sports/:id` - Delete sport (Admin/Staff)
- `POST /api/sports/:id/join` - Join sport (Student)
- `POST /api/sports/:id/leave` - Leave sport (Student)

### Services
- `GET /api/services` - Get all service requests (Admin/Staff)
- `GET /api/services/mine` - Get my service requests (Student)
- `POST /api/services` - Create service request (Student)
- `PUT /api/services/:id` - Update service status (Admin/Staff)

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   ├── authController.js # Authentication logic
│   └── courseController.js
├── middleware/
│   └── auth.js          # JWT & role middleware
├── models/
│   ├── User.js          # User schema
│   ├── Course.js        # Course schema
│   ├── Event.js         # Event schema
│   ├── Sport.js         # Sport schema
│   └── Service.js        # Service schema
├── routes/
│   ├── authRoutes.js    # Auth routes
│   ├── courseRoutes.js  # Course routes
│   ├── eventRoutes.js   # Event routes
│   ├── sportRoutes.js   # Sport routes
│   └── serviceRoutes.js # Service routes
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── server.js           # Main server file
└── README.md
```

## Testing

Test the API with:

```bash
# Health check
curl http://localhost:3000/api/health

# Register (no auth required)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"student"}'
```

## Notes

- For admin/staff registration, you need to set `ROLE_CREATE_KEY` in `.env` or modify the validation in `authController.js`
- All passwords are hashed using bcrypt
- JWT tokens expire in 30 days
- MongoDB connection is required for the server to start
