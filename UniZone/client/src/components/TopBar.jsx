import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Button from "./Button";

export default function TopBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

  const fetchNotifications = async () => {
    if (!isAdminOrStaff) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Pool every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        <div className="flex h-24 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-16 h-16 relative flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <img src="/logo.png" alt="UniZone Logo" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
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
              <div className="flex items-center gap-6">
                {isAdminOrStaff && (
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotiOpen(!isNotiOpen)}
                      className="relative p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-slate-900 animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotiOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                          <h3 className="text-sm font-black text-white tracking-widest uppercase italic">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-tighter">Mark all as read</button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                              <p className="text-xs text-slate-500 font-bold uppercase italic">All caught up!</p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div 
                                key={n._id} 
                                className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-600/5' : ''}`}
                                onClick={() => markAsRead(n._id)}
                              >
                                <div className="flex gap-4">
                                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
                                  <div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                      <span className="font-black text-white">{n.sender?.name}</span> {n.message.replace(n.sender?.name || '', '')}
                                    </p>
                                    <span className="text-[10px] text-slate-600 font-bold mt-2 block italic">{new Date(n.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl group-hover/avatar:scale-110 transition-transform duration-300 border-2 border-white/10 overflow-hidden">
                      {user?.profilePic ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${user.profilePic}`} 
                          alt={user?.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-white font-black text-base drop-shadow-md">{user?.name?.charAt(0)?.toUpperCase()}</span>
                      )}
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
