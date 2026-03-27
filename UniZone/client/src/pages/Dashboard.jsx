import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <PageShell
      title="University Home"
      subtitle={`Welcome back to your vibrant campus environment, ${user?.name || 'Explorer'}`}
    >
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {/* User-Provided Vibrant Educational Hero Section */}
        <div className="relative h-[530px] w-full rounded-[64px] overflow-hidden shadow-[0_40px_100px_rgba(30,58,138,0.4)] group border-[8px] border-white/5">
          <img
            src="https://img.freepik.com/premium-photo/colorful-education-back-school-background-with-supplies-books-sports-equipment-vibrant-blue-surface_43969-42191.jpg"
            alt="Vibrant Education"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
          />
          {/* Enhanced Dark Overlay for Text Visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 left-0 p-12 md:p-16 w-full flex flex-col md:flex-row items-end justify-between gap-10">
            <div className="flex items-center gap-10">
              {/* Profile Avatar inside Hero */}
              <div className="relative">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-[44px] bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl transform group-hover:-rotate-6 transition-transform duration-500 border-4 border-white/20">
                  <span className="text-white font-black text-6xl drop-shadow-2xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-400 rounded-3xl flex items-center justify-center border-[6px] border-slate-950 shadow-2xl">
                  <div className="w-3.5 h-3.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md text-blue-200 text-[11px] font-black uppercase tracking-widest border border-blue-400/20">
                    {user?.role} Role
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-400/20 backdrop-blur-md text-emerald-300 text-[11px] font-black uppercase tracking-widest border border-emerald-400/20">
                    System Active
                  </span>
                </div>
                <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                  {user?.name}
                </h2>
                <p className="text-xl font-bold text-slate-300 flex items-center gap-3">
                  <span className="text-yellow-400 drop-shadow-lg">★</span> Your personalized campus workspace is ready
                </p>
              </div>
            </div>

            <Button
              onClick={() => window.location.href = '/profile'}
              className="bg-white text-slate-950 hover:bg-yellow-400 hover:text-slate-900 font-black px-12 py-6 rounded-[32px] shadow-[0_20px_60px_rgba(255,255,255,0.25)] transform active:scale-95 transition-all text-xl"
            >
              Access Profile
            </Button>
          </div>
        </div>

        {/* Unified Modules Layout Grid */}
        <div className="space-y-16">
          {/* Fast Navigation Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-6">
              <h3 className="text-4xl font-black text-white flex items-center gap-6 tracking-tighter">
                <div className="w-14 h-14 rounded-3xl bg-yellow-400 text-slate-900 flex items-center justify-center shadow-2xl shadow-yellow-400/30 transform rotate-6 border-4 border-white/20">🚀</div>
                Fast Navigation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Courses", path: "/courses", icon: "📚", color: "blue", bg: "bg-blue-600/10", border: "border-blue-500/20", accent: "text-blue-400" },
                { name: "Events", path: "/events", icon: "🎭", color: "purple", bg: "bg-purple-600/10", border: "border-purple-500/20", accent: "text-purple-400" },
                { name: "Sports", path: "/sports", icon: "⚽", color: "red", bg: "bg-red-600/10", border: "border-red-500/20", accent: "text-red-400" },
                { name: "Services", path: "/services", icon: "🛠️", color: "emerald", bg: "bg-emerald-600/10", border: "border-emerald-500/20", accent: "text-emerald-400" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group/item relative p-10 rounded-[48px] ${item.bg} border-2 ${item.border} backdrop-blur-3xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-4 overflow-hidden text-center`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover/item:bg-${item.color}-500/10 transition-all duration-700`}></div>
                  <span className="text-6xl mb-6 block transform group-hover/item:scale-125 group-hover/item:rotate-12 transition-transform duration-500">{item.icon}</span>
                  <div className="space-y-2">
                    <p className="font-black text-white text-2xl tracking-tight">{item.name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${item.accent}`}>Ready to explore</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* App Modules Section (Now with Unified UI) */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-6">
              <h3 className="text-4xl font-black text-white flex items-center gap-6 tracking-tighter">
                <div className="w-14 h-14 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30 transform -rotate-6 border-4 border-white/20">🧩</div>
                App Modules
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Smart Scheduling", status: "ONLINE", icon: "📅", color: "emerald", bg: "bg-emerald-500/10", border: "border-emerald-500/20", accent: "text-emerald-400" },
                { name: "Campus Maps", status: "BETA", icon: "📍", color: "blue", bg: "bg-blue-500/10", border: "border-blue-500/20", accent: "text-blue-400" },
                { name: "Resource Hub", status: "ACTIVE", icon: "🔑", color: "orange", bg: "bg-orange-500/10", border: "border-orange-500/20", accent: "text-orange-400" },
                { name: "Global Sync", status: "LIVE", icon: "🌐", color: "purple", bg: "bg-purple-500/10", border: "border-purple-500/20", accent: "text-purple-400" }
              ].map((module) => (
                <div key={module.name} className={`group/mod relative p-10 rounded-[48px] ${module.bg} border-2 ${module.border} backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden text-center cursor-pointer`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${module.color}-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover/mod:bg-${module.color}-500/10 transition-all duration-700`}></div>
                  <div className={`w-16 h-16 mx-auto rounded-3xl bg-${module.color}-500 text-white flex items-center justify-center text-3xl shadow-2xl shadow-${module.color}-500/20 transform group-hover/mod:scale-110 group-hover/mod:rotate-6 transition-all duration-500 mb-6`}>
                    {module.icon}
                  </div>
                  <div className="space-y-3">
                    <p className="font-black text-white text-xl tracking-tight leading-none">{module.name}</p>
                    <span className={`inline-block text-[9px] font-black px-4 py-1.5 rounded-full bg-${module.color}-500 text-white shadow-lg shadow-black/20`}>
                      {module.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
