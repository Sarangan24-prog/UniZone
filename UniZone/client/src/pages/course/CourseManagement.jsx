import { useState } from "react";
import PageShell from "../../components/PageShell";
import CourseSidebar from "../../components/CourseSidebar";
import Courses from "../Courses";
import TimetablePage from "./TimetablePage";
import AssignmentsPage from "./AssignmentsPage";
import StudyMaterialsPage from "./StudyMaterialsPage";
import AnnouncementsPage from "./AnnouncementsPage";
import AttendancePage from "./AttendancePage";

const tabComponents = {
  courses: Courses,
  timetable: TimetablePage,
  assignments: AssignmentsPage,
  materials: StudyMaterialsPage,
  announcements: AnnouncementsPage,
  attendance: AttendancePage,
};

export default function CourseManagement() {
  const [activeTab, setActiveTab] = useState("courses");
  const ActiveComponent = tabComponents[activeTab];

  return (
    <PageShell
      title="Course Management"
      subtitle="Manage your courses, assignments, attendance, and schedules"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <CourseSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 min-w-0">
          <ActiveComponent isEmbedded />
        </main>
      </div>
    </PageShell>
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <CourseSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="flex-1 min-w-0">
            <ActiveComponent isEmbedded />
          </main>
        </div>
      </div>
    </div>
  );
}
