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
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="glass rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-5 border-b border-white/10 bg-slate-900/50">
          <h2 className="text-sm font-bold text-slate-300 tracking-wide uppercase">Course Management</h2>
        </div>
        <ul className="p-3 space-y-1">
      <nav className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Course Management</h2>
        </div>
        <ul className="p-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-blue-600/20 text-blue-400 shadow-lg border border-blue-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
