import {
  BookOpen,
  Calendar,
  FileText,
  Book,
  Megaphone,
  CheckSquare,
} from "lucide-react";

const tabs = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "materials", label: "Study Materials", icon: Book },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
];

export default function CourseSidebar({ activeTab, onTabChange }) {
  return (
    <div className="h-full rounded-[2rem] bg-gradient-to-b from-slate-100 to-stone-200 p-5">
      
      {/* Title */}
      <h2 className="mb-6 text-xl font-bold text-slate-800">
        Course Management
      </h2>

      {/* Tabs */}
      <div className="flex flex-col gap-3">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600 shadow-sm border border-blue-200"
                    : "text-slate-600 hover:bg-white hover:shadow-sm"
                }`}
            >
              <Icon
                size={22}
                className={isActive ? "text-blue-500" : "text-slate-400"}
              />
              <span className="text-base font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}