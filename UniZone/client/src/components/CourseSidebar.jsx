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
    <aside className="course-sidebar">
      <nav className="course-sidebar-card">
        <header className="course-sidebar-header">
          <h2>Course Management</h2>
        </header>
        <ul className="course-sidebar-list">
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
