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
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverIp, setServerIp] = useState("localhost");

  // QR states
  const [sessionCourse, setSessionCourse] = useState("");
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [qrValue, setQrValue] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [dateError, setDateError] = useState("");
  const [generatedSessionData, setGeneratedSessionData] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      // Use separate try-catches or handle results individually if needed
      // For now, let's just log what's happening
      const [attendanceRes, coursesRes, sessionsRes, ipRes] = await Promise.allSettled([
        api.get("/attendance"),
        api.get("/courses"),
        api.get("/attendance/sessions/active"),
        api.get("/attendance/config/ip")
      ]);

      if (attendanceRes.status === 'fulfilled') {
        setItems(attendanceRes.value.data);
      } else {
        console.error("Attendance load error:", attendanceRes.reason);
      }

      if (coursesRes.status === 'fulfilled') {
        console.log("Fetched courses:", coursesRes.value.data);
        setCourses(coursesRes.value.data);
      } else {
        console.error("Courses load error:", coursesRes.reason);
      }

      if (sessionsRes.status === 'fulfilled') {
        setActiveSessions(sessionsRes.value.data);
      } else {
        console.error("Sessions load error:", sessionsRes.reason);
      }

      if (ipRes.status === 'fulfilled') {
        setServerIp(ipRes.value.data.ip);
      }
    } catch (e) {
      console.error("Unexpected load error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Add polling for active sessions
  useEffect(() => {
    let interval;
    if (isAdmin && activeSessions.length > 0) {
      interval = setInterval(async () => {
        try {
          const res = await api.get("/attendance/sessions/active");
          setActiveSessions(res.data);
        } catch (e) {
          console.error("Failed to poll sessions:", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAdmin, activeSessions.length]);

  const generateQR = async () => {
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
    const sessionId = `session_${Date.now()}`;

    const sessionData = {
      sessionId,
      courseId: sessionCourse,
      courseCode: selected?.code || "",
      courseTitle: selected?.title || "",
      date: sessionDate,
    };

    const browserHost = window.location.hostname;
    const localIp = (browserHost !== "localhost" && browserHost !== "127.0.0.1") ? browserHost : serverIp;

    try {
      await api.post("/attendance/sessions", sessionData);
      const url = `http://${localIp}:5174/attendance/scan?sessionData=${encodeURIComponent(JSON.stringify(sessionData))}`;
      setQrValue(url);
      setGeneratedSessionData(sessionData);
      setSessionMessage("Attendance session started and QR generated successfully.");
      load(); // Refresh active sessions
    } catch (err) {
      setSessionError(err.response?.data?.message || "Failed to start session.");
    }
  };

  // Set of sessionIds the student has already marked attendance for
  const markedSessionIds = new Set(items.map((i) => i.sessionId).filter(Boolean));

  const endSession = async (id) => {
    try {
      await api.patch(`/attendance/sessions/${id}/end`);
      load();
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  };

  const clearQR = () => {
    setQrValue("");
    setGeneratedSessionData(null);
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
      key: "student",
      header: "Student",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{r.studentName || r.student?.name || "—"}</span>
          <span className="text-xs text-slate-500">{r.regNo || "No Reg No"}</span>
        </div>
      )
    },
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

  if (loading) return <Loading />;

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


      </div>



      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Active Attendance Sessions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session) => (
              <Card key={session._id} glass className="border-green-500/20 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-500/10 text-green-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded border border-green-500/20">
                    Live Now
                  </div>
                  {isAdmin && (
                    <div className="bg-blue-500/20 text-blue-300 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1.5 shadow-lg shadow-blue-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                      {session.attendeeCount || 0} Checked In
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center mb-4">
                  <span className="text-[10px] text-slate-500 font-mono absolute top-4 left-1/2 -translate-x-1/2 opacity-50">{session.sessionId}</span>
                  <h4 className="text-white font-bold text-center mt-2">{session.course?.code}</h4>
                  <p className="text-xs text-slate-300 text-center mb-3">{session.course?.title}</p>
                  
                  {!isAdmin && (
                    <div className="p-2 bg-white rounded-lg shadow-inner mb-2">
                      <QRCode 
                        value={`http://${window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" ? window.location.hostname : serverIp}:5174/attendance/scan?sessionData=${encodeURIComponent(JSON.stringify({
                          sessionId: session.sessionId,
                          courseId: session.course?._id,
                          courseCode: session.course?.code,
                          courseTitle: session.course?.title,
                          date: session.date
                        }))}`} 
                        size={120} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-400">By: {session.createdBy?.name}</span>
                  {isAdmin ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="!py-1.5 !px-3 !text-xs border-red-500/50 hover:bg-red-500/10 text-red-400"
                      onClick={() => endSession(session._id)}
                    >
                      End Session
                    </Button>
                  ) : markedSessionIds.has(session.sessionId) ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Marked Present
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <Card glass className="mb-8">
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
              <Button onClick={generateQR}>Start Session & Generate QR</Button>
              <Button variant="outline" onClick={clearQR}>
                Clear
              </Button>
            </div>

            {qrValue && (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-white/20 glass p-6 bg-white/5">
                <div className="p-4 bg-white rounded-xl shadow-2xl">
                  <QRCode value={qrValue} size={220} />
                </div>
                <p className="mt-6 text-sm text-slate-400 text-center">
                  Students can scan this QR code to mark attendance.
                </p>

                {sessionCourse && (
                  <p className="mt-2 text-base font-bold text-white text-center">
                    {
                      courses.find((c) => c._id === sessionCourse)?.code
                    }{" "}
                    - {courses.find((c) => c._id === sessionCourse)?.title}
                  </p>
                )}

                {generatedSessionData && (
                  <p className="mt-1 text-sm text-slate-300 font-mono">
                    Session ID: {generatedSessionData.sessionId}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* History Table */}
      {items.length > 0 && (
         <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Attendance History</h3>
            <Table columns={columns} rows={items} />
         </div>
      )}

      {items.length === 0 && !isAdmin && (
        <EmptyState 
          title="No attendance records found" 
          message="Scan a QR code from your lecturer to mark attendance."
        />
      )}
    </div>
  );
}