import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Badge from "./Badge";
import Button from "./Button";

export default function TopBar() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">UniZone</Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {!isAuthed ? (
            <>
              <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/login">Login</Link>
              <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/courses">Courses</Link>
              <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/events">Events</Link>
              <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/sports">Sports</Link>
              <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/services">Services</Link>
              {(user?.role === "admin" || user?.role === "staff") && (
                <Link className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200" to="/admin/requests">All Requests</Link>
              )}
              <Badge>{user?.role}</Badge>
              <Button variant="outline" onClick={onLogout}>Logout</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
