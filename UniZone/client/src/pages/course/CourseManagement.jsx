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
      <div className="course-management-page">
        <div className="course-management-inner">
          <aside className="course-management-sidebar">
            <CourseSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </aside>
          <main className="course-management-main">
            
           
            <div className="course-management-content">
              <ActiveComponent isEmbedded />
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}
