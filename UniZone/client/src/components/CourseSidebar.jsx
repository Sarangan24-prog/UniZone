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
      <nav className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Course Management</h2>
        </div>
        <ul className="p-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`course-sidebar-item ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="course-sidebar-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
