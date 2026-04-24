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
import SportRosters from "./pages/SportRosters";
import NotFound from "./pages/NotFound";

export default function App() {
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("splash-seen");
  });

  if (loading) {
    return <Splash onFinish={() => {
      localStorage.setItem("splash-seen", "true");
      setLoading(false);
    }} />;
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

              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<CourseManagement />} />
              
              <Route path="/events" element={<Events />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/sports/equipment" element={<Equipment />} />
              <Route path="/services" element={<Services />} />
              <Route path="/profile" element={<Profile />} />

              <Route
                path="/admin/requests"
                element={
                  <AdminRequests />
                }
              />
              <Route
                path="/admin/sports/rosters"
                element={
                  <ProtectedRoute>
                    <RoleRoute roles={["admin", "staff"]}>
                      <SportRosters />
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

