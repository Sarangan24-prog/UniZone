import { useState } from "react";
import Courses from "./Courses";
import TimetablePage from "./TimetablePage";
import AssignmentsPage from "./AssignmentsPage";
import StudyMaterialsPage from "./StudyMaterialsPage";
import AnnouncementsPage from "./AnnouncementsPage";
import AttendancePage from "./AttendancePage";

const NAV_ITEMS = [
  { id: "courses",        label: "Courses",        icon: "🎓", subtitle: "Search, filter, sort, and manage courses" },
  { id: "timetable",     label: "Timetable",       icon: "📅", subtitle: "View class schedules and exam timetables" },
  { id: "assignments",   label: "Assignments",     icon: "📝", subtitle: "Track and manage course assignments" },
  { id: "materials",     label: "Study Materials", icon: "📖", subtitle: "Access course notes, slides, videos, and links" },
  { id: "announcements", label: "Announcements",   icon: "📢", subtitle: "Stay updated with latest announcements" },
  { id: "attendance",    label: "Attendance",      icon: "✅", subtitle: "Track and manage student attendance" },
];

const tabComponents = {
  courses:       Courses,
  timetable:     TimetablePage,
  assignments:   AssignmentsPage,
  materials:     StudyMaterialsPage,
  announcements: AnnouncementsPage,
  attendance:    AttendancePage,
};

export default function CourseManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  const ActiveComponent = tabComponents[activeTab];
  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0d1b4b] to-[#1a0a3c] text-white">
      {/* Header */}
      <div className="px-8 pt-10 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            {activeNav?.label}
          </h1>
          <p className="text-blue-300 mt-2 text-lg">
            {activeNav?.subtitle}
          </p>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="px-8 pb-10 flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 p-4 backdrop-blur">
            <p className="text-xs font-bold text-blue-300 tracking-widest mb-4 uppercase">
              Course Management
            </p>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-blue-200 hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 p-6 backdrop-blur">
            <ActiveComponent isEmbedded />
          </div>
        </div>
      </div>
    </div>
  );
}
