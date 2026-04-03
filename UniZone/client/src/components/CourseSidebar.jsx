export default function CourseSidebar({ activeTab, onTabChange }) {
  const tabs = [
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "timetable", label: "Timetable", icon: "📅" },
    { id: "assignments", label: "Assignments", icon: "📝" },
    { id: "materials", label: "Study Materials", icon: "📖" },
    { id: "announcements", label: "Announcements", icon: "📢" },
    { id: "attendance", label: "Attendance", icon: "✅" },
  ];

  return (
    <div className="h-full">
      <div className="bg-slate-900/40 rounded-[20px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md sticky top-6">
        <div className="bg-[#1c2331] text-white py-5 px-6 font-black tracking-widest text-[11px] uppercase border-b border-white/5 shadow-inner">
          Course Management
        </div>
        <div className="p-3 space-y-1.5 bg-black/20">
          {tabs.map(({ id, label, icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                  isActive
                    ? 'bg-[#1c2331] text-white shadow-lg ring-1 ring-white/10 scale-[1.02]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-[20px] filter drop-shadow-md">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
