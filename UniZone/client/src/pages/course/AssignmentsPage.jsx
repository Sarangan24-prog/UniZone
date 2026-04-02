import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import TextArea from "../../components/TextArea";

export default function AssignmentsPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    course: "", title: "", description: "", dueDate: "", totalMarks: 100, status: "Active"
  });

  const load = async () => {
    setLoading(true);
    const [aRes, cRes] = await Promise.all([
      api.get("/assignments"),
      api.get("/courses")
    ]);
    setItems(aRes.data);
    setCourses(cRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({
    course: "", title: "", description: "", dueDate: "", totalMarks: 100, status: "Active"
  });

  const onCreate = () => { resetForm(); setEditing(null); setErrors({}); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      course: row.course?._id || "", title: row.title || "",
      description: row.description || "",
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "",
      totalMarks: row.totalMarks || 100, status: row.status || "Active"
    });
    setErrors({}); setOpen(true);
  };

  const save = async () => {
    const newErrors = {};
    if (!form.course) newErrors.course = "Please select a course.";
    if (!form.title || form.title.trim().length < 3 || form.title.length > 100) newErrors.title = "Title must be 3-100 characters.";
    if (!form.dueDate || isNaN(Date.parse(form.dueDate))) newErrors.dueDate = "Valid due date is required.";
    if (!form.totalMarks || isNaN(form.totalMarks) || form.totalMarks < 1 || form.totalMarks > 1000) newErrors.totalMarks = "Total marks must be between 1 and 1000.";
    if (!form.status) newErrors.status = "Please select a status.";
    if (form.description && form.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters long if provided.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      if (editing) {
        await api.put(`/assignments/${editing._id}`, form);
      } else {
        await api.post("/assignments", form);
      }
      setOpen(false); load();
    } catch (e) { setErrors({ global: e.response?.data?.message || "Save failed" }); }
  };

  const del = async (id) => { await api.delete(`/assignments/${id}`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];
    if (filterCourse !== "all") out = out.filter(x => (x.course?._id || "") === filterCourse);
    if (filterStatus !== "all") out = out.filter(x => x.status === filterStatus);
    out.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return out;
  }, [items, filterCourse, filterStatus]);

  const isOverdue = (date) => new Date(date) < new Date() ;
  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Assignments</h2>
          <p className="text-sm text-slate-400 mt-1">Track and manage course assignments</p>
        </div>
        {isAdmin && <Button onClick={onCreate}>New Assignment</Button>}
      </div>

      <Card glass>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Filter by Course" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </Select>
          <Select label="Filter by Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState glass title="No assignments found" subtitle="Try changing filters or create a new assignment." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <div key={a._id} className="rounded-2xl border border-white/10 glass shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className={`px-5 py-3 ${a.status === "Closed" ? "bg-white/10" : isOverdue(a.dueDate) ? "bg-gradient-to-r from-red-50 to-red-100/50" : "bg-gradient-to-r from-blue-50 to-blue-100/50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wide ${a.status === "Closed" ? "text-slate-400" : isOverdue(a.dueDate) ? "text-red-400" : "text-blue-400"}`}>
                      {a.status === "Closed" ? "Closed" : isOverdue(a.dueDate) ? "Overdue" : "Active"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{a.totalMarks} marks</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                  <p className="text-xs font-medium text-slate-400 mb-3">
                    {a.course ? `${a.course.code} - ${a.course.title}` : "—"}
                  </p>
                  {a.description && (
                    <p className="text-sm text-slate-300 mb-3 line-clamp-2">{a.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <span>📅</span>
                    <span className="font-medium">Due: {formatDate(a.dueDate)}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <Button variant="outline" className="flex-1" onClick={() => onEdit(a)}>Edit</Button>
                      <Button variant="danger" className="flex-1" onClick={() => del(a._id)}>Delete</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} title={editing ? "Edit Assignment" : "New Assignment"} onClose={() => setOpen(false)}
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
          <Input label="Title" value={form.title} error={errors.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="Due Date" type="date" value={form.dueDate} error={errors.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Total Marks" type="number" value={form.totalMarks} error={errors.totalMarks} onChange={e => setForm({ ...form, totalMarks: +e.target.value })} />
          <Select label="Status" value={form.status} error={errors.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </Select>
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} error={errors.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
