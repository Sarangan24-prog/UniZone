# Backend Setup Guide

## ✅ Backend Code Created Successfully!

I've created a complete, production-ready backend with:
- ✅ Express.js server
- ✅ MongoDB with Mongoose
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ All CRUD endpoints
- ✅ Proper error handling

## 🚀 Quick Start

### Step 1: Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Or download from:** https://www.mongodb.com/try/download/community

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# If it works, you'll see a version number
```

### Step 3: Start the Backend Server

```bash
cd /Users/vinu/Downloads/backend
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 UniZone Backend Server
📡 Running on http://localhost:3000
```

### Step 4: Test Registration

Now go back to your frontend at `http://localhost:5173/register` and try registering!

## 📝 Important Notes

1. **MongoDB must be running** before starting the backend server
2. **Port 3000** is configured (matches frontend)
3. **Admin/Staff Registration**: Currently requires `ROLE_CREATE_KEY` environment variable. For testing, you can:
   - Register as "student" (no key needed)
   - Or modify `controllers/authController.js` to allow admin/staff without key for development

## 🔧 Troubleshooting

**MongoDB connection error?**
- Make sure MongoDB is installed and running
- Check: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)

**Port 3000 already in use?**
- Change PORT in `.env` to another port (e.g., 3001)
- Update frontend `.env` to match

**Can't connect from frontend?**
- Make sure backend is running: `curl http://localhost:3000/api/health`
- Check CORS is enabled (it is by default)

## 📁 Project Structure

```
backend/
├── config/database.js      # MongoDB connection
├── models/                  # Mongoose schemas
├── controllers/             # Business logic
├── routes/                  # API routes
├── middleware/              # Auth middleware
├── server.js               # Main server
└── .env                    # Configuration
```

## 🎯 Next Steps

1. Start MongoDB
2. Start backend: `npm start`
3. Test registration in frontend
4. Start using the app!
