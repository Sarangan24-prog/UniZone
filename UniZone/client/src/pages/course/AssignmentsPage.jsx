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
  const [err, setErr] = useState("");
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

  const onCreate = () => { resetForm(); setEditing(null); setErr(""); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      course: row.course?._id || "", title: row.title || "",
      description: row.description || "",
      dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "",
      totalMarks: row.totalMarks || 100, status: row.status || "Active"
    });
    setErr(""); setOpen(true);
  };

  const save = async () => {
    const errors = [];
    if (!form.course) errors.push("Please select a course.");
    if (!form.title || form.title.trim().length < 3 || form.title.length > 100) errors.push("Title must be 3-100 characters.");
    if (!form.dueDate || isNaN(Date.parse(form.dueDate))) errors.push("Valid due date is required.");
    if (!form.totalMarks || isNaN(form.totalMarks) || form.totalMarks < 1 || form.totalMarks > 1000) errors.push("Total marks must be between 1 and 1000.");
    if (form.description && form.description.trim().length < 10) errors.push("Description must be at least 10 characters long if provided.");

    if (errors.length > 0) {
      setErr(errors.join("\n"));
      return;
    }

    try {
      setErr("");
      if (editing) {
        await api.put(`/assignments/${editing._id}`, form);
      } else {
        await api.post("/assignments", form);
      }
      setOpen(false); load();
    } catch (e) { setErr(e.response?.data?.message || "Save failed"); }
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
          <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage course assignments</p>
        </div>
        {isAdmin && <Button onClick={onCreate}>New Assignment</Button>}
      </div>

      <Card>
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
          <EmptyState title="No assignments found" subtitle="Try changing filters or create a new assignment." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <div key={a._id} className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className={`px-5 py-3 ${a.status === "Closed" ? "bg-gray-100" : isOverdue(a.dueDate) ? "bg-gradient-to-r from-red-50 to-red-100/50" : "bg-gradient-to-r from-blue-50 to-blue-100/50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wide ${a.status === "Closed" ? "text-gray-500" : isOverdue(a.dueDate) ? "text-red-600" : "text-blue-600"}`}>
                      {a.status === "Closed" ? "Closed" : isOverdue(a.dueDate) ? "Overdue" : "Active"}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{a.totalMarks} marks</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{a.title}</h3>
                  <p className="text-xs font-medium text-gray-500 mb-3">
                    {a.course ? `${a.course.code} - ${a.course.title}` : "—"}
                  </p>
                  {a.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{a.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>📅</span>
                    <span className="font-medium">Due: {formatDate(a.dueDate)}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
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
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="text-sm font-medium text-red-700 space-y-1">
                {err.split("\n").map((e, i) => <p key={i}>• {e}</p>)}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Course" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </Select>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <Input label="Total Marks" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: +e.target.value })} />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </Select>
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
