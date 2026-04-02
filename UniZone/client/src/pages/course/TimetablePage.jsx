import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Table from "../../components/Table";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";

export default function TimetablePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    course: "", day: "Monday", startTime: "09:00", endTime: "10:00",
    room: "", instructor: "", type: "Lecture"
  });

  const load = async () => {
    setLoading(true);
    const [tRes, cRes] = await Promise.all([
      api.get("/timetable"),
      api.get("/courses")
    ]);
    setItems(tRes.data);
    setCourses(cRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({
    course: "", day: "Monday", startTime: "09:00", endTime: "10:00",
    room: "", instructor: "", type: "Lecture"
  });

  const onCreate = () => { resetForm(); setEditing(null); setErrors({}); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      course: row.course?._id || "", day: row.day || "Monday",
      startTime: row.startTime || "09:00", endTime: row.endTime || "10:00",
      room: row.room || "", instructor: row.instructor || "", type: row.type || "Lecture"
    });
    setErrors({}); setOpen(true);
  };

  const save = async () => {
    const newErrors = {};
    if (!form.course) newErrors.course = "Please select a course.";
    if (!form.day) newErrors.day = "Please select a day.";
    if (!form.startTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.startTime)) newErrors.startTime = "Valid start time is required.";
    if (!form.endTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.endTime)) newErrors.endTime = "Valid end time is required.";
    if (form.startTime && form.endTime && form.endTime <= form.startTime) newErrors.endTime = "End time must be after start time.";
    if (!form.room || form.room.trim().length < 2 || form.room.length > 50) newErrors.room = "Room must be 2-50 characters.";
    if (!form.instructor || form.instructor.trim().length < 3 || form.instructor.length > 100 || !/^[a-zA-Z\s.-]+$/.test(form.instructor)) newErrors.instructor = "Valid instructor name is required (letters only).";
    if (!form.type) newErrors.type = "Please select a class type.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      if (editing) {
        await api.put(`/timetable/${editing._id}`, form);
      } else {
        await api.post("/timetable", form);
      }
      setOpen(false); load();
    } catch (e) { setErrors({ global: e.response?.data?.message || "Save failed" }); }
  };

  const del = async (id) => { await api.delete(`/timetable/${id}`); load(); };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const filtered = useMemo(() => {
    let out = [...items];
    if (filterDay !== "all") out = out.filter(x => x.day === filterDay);
    if (filterCourse !== "all") out = out.filter(x => (x.course?._id || "") === filterCourse);
    const dayOrder = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5 };
    out.sort((a, b) => (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0) || a.startTime?.localeCompare(b.startTime));
    return out;
  }, [items, filterDay, filterCourse]);

  const columns = [
    { key: "day", header: "Day" },
    { key: "startTime", header: "Start" },
    { key: "endTime", header: "End" },
    { key: "course", header: "Course", render: (r) => r.course ? `${r.course.code} - ${r.course.title}` : "—" },
    { key: "room", header: "Room" },
    { key: "instructor", header: "Instructor" },
    { key: "type", header: "Type", render: (r) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
        r.type === "Lecture" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
        r.type === "Lab" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
        r.type === "Tutorial" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
        "bg-amber-500/20 text-amber-300 border border-amber-500/30"
      }`}>{r.type}</span>
    )},
    ...(isAdmin ? [{
      key: "actions", header: "Actions", render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onEdit(r)}>Edit</Button>
          <Button variant="danger" onClick={() => del(r._id)}>Delete</Button>
        </div>
      )
    }] : [])
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Timetable & Exam Schedule</h2>
          <p className="text-sm text-slate-400 mt-1">View and manage class schedules</p>
        </div>
        {isAdmin && <Button onClick={onCreate}>Add Schedule</Button>}
      </div>

      <Card glass>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Filter by Day" value={filterDay} onChange={e => setFilterDay(e.target.value)}>
            <option value="all">All Days</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="Filter by Course" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState glass title="No schedule entries" subtitle="Try changing filters or add a new entry." />
        ) : (
          <Table glass columns={columns} rows={filtered} />
        )}
      </div>

      <Modal open={open} title={editing ? "Edit Schedule" : "Add Schedule"} onClose={() => setOpen(false)}
        footer={<div className="space-y-3">
          {errors.global && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm font-medium text-red-400">• {errors.global}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Course" value={form.course} error={errors.course} onChange={e => setForm({ ...form, course: e.target.value })}>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </Select>
          <Select label="Day" value={form.day} error={errors.day} onChange={e => setForm({ ...form, day: e.target.value })}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Input label="Start Time" type="time" value={form.startTime} error={errors.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
          <Input label="End Time" type="time" value={form.endTime} error={errors.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
          <Input label="Room" value={form.room} error={errors.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 301" />
          <Input label="Instructor" value={form.instructor} error={errors.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. Dr. Smith" />
          <Select label="Type" value={form.type} error={errors.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="Lecture">Lecture</option>
            <option value="Lab">Lab</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Seminar">Seminar</option>
          </Select>
        </div>
      </Modal>
    </div>
  );
}
