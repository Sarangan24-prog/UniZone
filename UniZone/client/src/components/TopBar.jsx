import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Button from "./Button";

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
    nav("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "staff": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      default: return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full animate-in fade-in duration-700">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 border-white/20">
                <span className="text-white text-xl font-black drop-shadow-lg">U</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
                UniZone
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {[
                { name: "Courses", path: "/courses" },
                { name: "Events", path: "/events" },
                { name: "Sports", path: "/sports" },
                { name: "Services", path: "/services" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${isActive(item.path)
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/40"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            {user && (
              <div className="flex items-center">
                <div className="flex items-center gap-5">
                  <Link to="/profile" className="flex items-center gap-4 group/avatar">
                    <div className="flex flex-col items-end hidden sm:flex">
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 leading-none mb-1 group-hover/avatar:text-blue-400 transition-colors">
                        {user?.name}
                      </span>
                      <span className={`inline-block px-3 py-0.5 text-[9px] font-black rounded-full uppercase tracking-tighter ${getRoleColor(user?.role)}`}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl group-hover/avatar:scale-110 transition-transform duration-300 border-2 border-white/10">
                      <span className="text-white font-black text-base drop-shadow-md">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  </Link>
                  <Button
                    variant="outline"
                    className="hidden sm:flex border-white/10 text-slate-300 hover:text-white hover:bg-white/5 !px-5 !py-2.5 font-black text-xs rounded-2xl"
                    onClick={onLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
