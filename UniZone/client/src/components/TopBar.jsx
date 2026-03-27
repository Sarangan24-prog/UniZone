import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Badge from "./Badge";
import Button from "./Button";

export default function TopBar() {
  const { user, isAuthed, logout } = useAuth();
  const nav = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
    nav("/login");
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-xl">U</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hidden sm:inline tracking-tight">
              UniZone
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {!isAuthed ? (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {[
                  { to: "/courses", label: "Courses" },
                  { to: "/events", label: "Events" },
                  { to: "/sports", label: "Sports" },
                  { to: "/services", label: "Services" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
                {(user?.role === "admin" || user?.role === "staff") && (
                  <Link
                    to="/admin/requests"
                    className="px-4 py-2 text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/5 rounded-xl transition-all duration-200 underline decoration-2 underline-offset-4 decoration-amber-400/30"
                  >
                    Requests
                  </Link>
                )}
                <div className="w-px h-6 bg-white/10 mx-3"></div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 leading-none mb-1">
                      Role
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full ${getRoleColor(user?.role)}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 !px-4 !py-2" onClick={onLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
            ></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t border-gray-200 mt-2">
            {!isAuthed ? (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="block w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="block w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/courses"
                  onClick={handleNavClick}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Courses
                </Link>
                <Link
                  to="/events"
                  onClick={handleNavClick}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Events
                </Link>
                <Link
                  to="/sports"
                  onClick={handleNavClick}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Sports
                </Link>
                <Link
                  to="/services"
                  onClick={handleNavClick}
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                >
                  Services
                </Link>
                {(user?.role === "admin" || user?.role === "staff") && (
                  <Link
                    to="/admin/requests"
                    onClick={handleNavClick}
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Requests
                  </Link>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-4 py-2 inline-block">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user?.role)}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    className="w-full mx-4"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
