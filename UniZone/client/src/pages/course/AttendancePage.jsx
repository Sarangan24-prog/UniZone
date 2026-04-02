import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import api from "../../api/client";
import Card from "../../components/Card";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";

export default function AttendancePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);



  // QR states
  const [sessionCourse, setSessionCourse] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [qrValue, setQrValue] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [dateError, setDateError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([api.get("/attendance"), api.get("/courses")]);
      setItems(results[0].data);
      setCourses(results[1].data);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const generateQR = () => {
    let hasError = false;
    if (!sessionCourse) {
      setSessionError("Please select a course.");
      hasError = true;
    } else {
      setSessionError("");
    }

    if (!sessionDate) {
      setDateError("Please select a date.");
      hasError = true;
    } else {
      setDateError("");
    }

    if (hasError) return;

    const selected = courses.find((c) => c._id === sessionCourse);

    const fakeSession = {
      sessionId: `session_${Date.now()}`,
      courseId: sessionCourse,
      courseCode: selected?.code || "",
      courseTitle: selected?.title || "",
      date: sessionDate,
    };

    setQrValue(JSON.stringify(fakeSession));
    setSessionMessage("QR generated successfully.");
  };

  const clearQR = () => {
    setQrValue("");
    setSessionMessage("");
    setSessionCourse("");
    setSessionDate(new Date().toISOString().split("T")[0]);
  };



  const stats = useMemo(() => {
    if (isAdmin) return null;

    const total = items.length;
    const present = items.filter((r) => r.status === "Present").length;
    const late = items.filter((r) => r.status === "Late").length;
    const absent = items.filter((r) => r.status === "Absent").length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, late, absent, percentage };
  }, [items, isAdmin]);

  const statusStyles = {
    Present: "bg-green-500/20 text-green-300 border border-green-500/30",
    Absent: "bg-red-500/20 text-red-300 border border-red-500/30",
    Late: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const columns = [
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
    {
      key: "course",
      header: "Course",
      render: (r) => (r.course ? `${r.course.code} - ${r.course.title}` : "—"),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
            statusStyles[r.status] || ""
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance Tracking</h2>
          <p className="text-sm text-slate-400 mt-1">
            {isAdmin
              ? "Generate QR attendance for students"
              : "View your attendance records"}
          </p>
        </div>

        {!isAdmin && (
          <Button onClick={() => navigate("/attendance/scan")}>Scan QR</Button>
        )}
      </div>

      {!isAdmin && stats && (
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="rounded-2xl border border-white/10 glass shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-white">{stats.percentage}%</p>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Overall</p>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-500/20/50 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-green-300">{stats.present}</p>
            <p className="text-xs font-semibold text-green-400 mt-1 uppercase">Present</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-500/20/50 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-amber-300">{stats.late}</p>
            <p className="text-xs font-semibold text-amber-400 mt-1 uppercase">Late</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-500/20/50 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-red-300">{stats.absent}</p>
            <p className="text-xs font-semibold text-red-400 mt-1 uppercase">Absent</p>
          </div>
        </div>
      )}

      {isAdmin && (
        <Card glass>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Generate Attendance QR</h3>
              <p className="text-sm text-slate-400">
                Select a course and date, then generate a QR code for students to scan.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Course"
                value={sessionCourse}
                error={sessionError}
                onChange={(e) => {
                  setSessionCourse(e.target.value);
                  setSessionError("");
                }}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </Select>

              <Input
                label="Date"
                type="date"
                value={sessionDate}
                error={dateError}
                onChange={(e) => {
                  setSessionDate(e.target.value);
                  setDateError("");
                }}
              />
            </div>

            {sessionMessage && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/20 px-4 py-3 text-sm text-blue-300">
                {sessionMessage}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={generateQR}>Generate QR</Button>
              <Button variant="outline" onClick={clearQR}>
                Clear
              </Button>
            </div>

            {qrValue && (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-white/20 glass p-6">
                <QRCode value={qrValue} size={220} />
                <p className="mt-4 text-sm text-slate-400 text-center">
                  Students can scan this QR code to mark attendance.
                </p>

                {sessionCourse && (
                  <p className="mt-2 text-sm text-slate-300 text-center">
                    {
                      courses.find((c) => c._id === sessionCourse)?.code
                    }{" "}
                    - {courses.find((c) => c._id === sessionCourse)?.title}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-400">
                  Date: {sessionDate}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}




    </div>
  );
}