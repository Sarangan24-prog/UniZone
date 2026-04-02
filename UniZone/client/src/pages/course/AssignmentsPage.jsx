import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
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
    course: "",
    title: "",
    description: "",
    dueDate: "",
    totalMarks: 100,
    status: "Active",
  });

  const load = async () => {
    try {
      setLoading(true);
      const [aRes, cRes] = await Promise.all([
        api.get("/assignments"),
        api.get("/courses"),
      ]);
      setItems(aRes.data || []);
      setCourses(cRes.data || []);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setItems([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () =>
    setForm({
      course: "",
      title: "",
      description: "",
      dueDate: "",
      totalMarks: 100,
      status: "Active",
    });

  const onCreate = () => {
    resetForm();
    setEditing(null);
    setErrors({});
    setOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      course: row.course?._id || "",
      title: row.title || "",
      description: row.description || "",
      dueDate: row.dueDate
        ? new Date(row.dueDate).toISOString().split("T")[0]
        : "",
      totalMarks: row.totalMarks || 100,
      status: row.status || "Active",
    });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    const newErrors = {};

    if (!form.course) {
      newErrors.course = "Please select a course.";
    }

    if (
      !form.title ||
      form.title.trim().length < 3 ||
      form.title.length > 100
    ) {
      newErrors.title = "Title must be 3-100 characters.";
    }

    if (!form.dueDate || isNaN(Date.parse(form.dueDate))) {
      newErrors.dueDate = "Valid due date is required.";
    }

    if (
      !form.totalMarks ||
      isNaN(form.totalMarks) ||
      form.totalMarks < 1 ||
      form.totalMarks > 1000
    ) {
      newErrors.totalMarks = "Total marks must be between 1 and 1000.";
    }

    if (!form.status) {
      newErrors.status = "Please select a status.";
    }

    if (form.description && form.description.trim().length < 10) {
      newErrors.description =
        "Description must be at least 10 characters long if provided.";
    }

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
      setOpen(false);
      load();
    } catch (e) {
      setErrors({ global: e.response?.data?.message || "Save failed" });
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      load();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filtered = useMemo(() => {
    let out = [...items];

    if (filterCourse !== "all") {
      out = out.filter((x) => (x.course?._id || "") === filterCourse);
    }

    if (filterStatus !== "all") {
      out = out.filter((x) => x.status === filterStatus);
    }

    out.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return out;
  }, [items, filterCourse, filterStatus]);

  const isOverdue = (date) => new Date(date) < new Date();

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Assignments
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Track and manage course assignments
          </p>
        </div>

        {isAdmin && (
          <Button onClick={onCreate} className="rounded-2xl">
            New Assignment
          </Button>
        )}
      </div>

      <div className="mb-5 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Filter by Course"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </Select>

          <Select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </Select>
        </div>
      </div>

      <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-white" />
              <p className="text-base font-medium text-slate-200">Loading...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                📝
              </div>
             <h3 className="text-xl font-bold text-white">
  No assignments found
</h3>
<p className="mt-2 text-sm text-slate-300">
  Try changing filters or create a new assignment.
</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a) => (
              <div
                key={a._id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className={`px-5 py-3 ${
                    a.status === "Closed"
                      ? "bg-white/5"
                      : isOverdue(a.dueDate)
                      ? "bg-red-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        a.status === "Closed"
                          ? "bg-white/10 text-slate-300"
                          : isOverdue(a.dueDate)
                          ? "bg-red-500/20 text-red-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {a.status === "Closed"
                        ? "Closed"
                        : isOverdue(a.dueDate)
                        ? "Overdue"
                        : "Active"}
                    </span>

                    <span className="text-xs font-semibold text-slate-300">
                      {a.totalMarks} marks
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-1 text-lg font-bold text-white">
                    {a.title}
                  </h3>

                  <p className="mb-3 text-xs font-medium text-slate-400">
                    {a.course ? `${a.course.code} - ${a.course.title}` : "—"}
                  </p>

                  {a.description && (
                    <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-300">
                      {a.description}
                    </p>
                  )}

                  <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
                    <span>📅</span>
                    <span className="font-medium">
                      Due: {formatDate(a.dueDate)}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 border-t border-white/10 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onEdit(a)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="flex-1"
                        onClick={() => del(a._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Assignment" : "New Assignment"}
        onClose={() => setOpen(false)}
        footer={
          <div className="space-y-3">
            {errors.global && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm font-medium text-red-400">
                  • {errors.global}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Course"
            value={form.course}
            error={errors.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </Select>

          <Input
            label="Title"
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            error={errors.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <Input
            label="Total Marks"
            type="number"
            value={form.totalMarks}
            error={errors.totalMarks}
            onChange={(e) =>
              setForm({ ...form, totalMarks: Number(e.target.value) })
            }
          />

          <Select
            label="Status"
            value={form.status}
            error={errors.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </Select>

          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              rows={3}
              value={form.description}
              error={errors.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}