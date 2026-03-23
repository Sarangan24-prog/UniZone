# UniZone University Management System

UniZone is a full-stack MERN (MongoDB, Express, React, Node.js) application for university management. It features role-based access control (Admin, Staff, Student) and modules for Courses, Events, Sports, and Service Requests.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (Running locally on default port 27017)
- **Git**

## Setup Guide

Follow these steps to set up and run the application locally.

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    - Create a `.env` file in the `backend` directory (if it doesn't exist).
    - Add the following configuration:
      ```env
      PORT=3000
      MONGO_URI=mongodb://localhost:27017/unizone
      JWT_SECRET=your_super_secret_key_change_this
      ROLE_CREATE_KEY=admin123
      ```
      > **Note:** `ROLE_CREATE_KEY` is required to register Admin or Staff accounts.

4.  Start the Backend Server:
    ```bash
    npm run dev
    ```
    - The server should start on `http://localhost:3000`.
    - It will connect to your local MongoDB instance.

### 2. Frontend Setup

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the Frontend Application:
    ```bash
    npm run dev
    ```
    - The application will be available at `http://localhost:5173`.

## Usage

### User Registration

- **Admin/Staff**:
  - Go to the Register page.
  - Select "Admin" or "Staff" role.
  - Enter the strictly confidential `ROLE_CREATE_KEY` (default: `admin123`) when prompted.
- **Student**:
  - Register freely as a Student (no key required).

### Key Features

- **Courses**:
  - **Admin/Staff**: Create, Edit, Delete courses.
  - **Student**: View courses, Enroll, Drop.
- **Events**:
  - **Admin/Staff**: Create, Edit, Delete events.
  - **Student**: View events, Register interaction.
- **Sports**:
  - **Admin/Staff**: Manage sports teams.
  - **Student**: Join/Leave sports teams.
- **Services**:
  - **Student**: Submit service requests.
  - **Admin/Staff**: Manage and update request status.

## Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB service is running (`brew services start mongodb-community` on Mac).
- **Backend Port In Use**: Check if port 3000 is free or change `PORT` in `.env`.
