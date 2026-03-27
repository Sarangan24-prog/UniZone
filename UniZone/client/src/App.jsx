import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import TopBar from "./components/TopBar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Sports from "./pages/Sports";
import Services from "./pages/Services";
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
        <TopBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />

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
      </BrowserRouter>
    </AuthProvider>
  );
}
