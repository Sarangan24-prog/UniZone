import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/course/CourseManagement";
import CourseManagement from "./pages/course/CourseManagement";
import Events from "./pages/Events";
import Sports from "./pages/Sports";
import Equipment from "./pages/Equipment";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import AdminRequests from "./pages/AdminRequests";
import NotFound from "./pages/NotFound";

export default function App() {
  const [loading, setLoading] = useState(true);

if (loading) {
  return <Splash onFinish={() => setLoading(false)} />;
}
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <TopBar />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><CourseManagement /></ProtectedRoute>} />
              
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
              <Route path="/sports/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              <Route
                path="/admin/requests"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["admin", "staff"]}>
                      <AdminRequests />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

