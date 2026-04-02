import { useState } from "react";
import PageShell from "../../components/PageShell";
import CourseSidebar from "../../components/CourseSidebar";
import Courses from "./Courses";
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
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <CourseSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="animate-in slide-in-from-right-8 duration-500 zoom-in-[0.98]">
            <div className="course-management-content">
              <ActiveComponent isEmbedded />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
