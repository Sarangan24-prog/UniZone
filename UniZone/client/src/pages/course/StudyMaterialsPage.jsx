import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Card from "../../components/Card";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import TextArea from "../../components/TextArea";

export default function StudyMaterialsPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    course: "", title: "", description: "", type: "Notes", url: ""
  });

  const load = async () => {
    setLoading(true);
    const [mRes, cRes] = await Promise.all([
      api.get("/materials"),
      api.get("/courses")
    ]);
    setItems(mRes.data);
    setCourses(cRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ course: "", title: "", description: "", type: "Notes", url: "" });

  const onCreate = () => { resetForm(); setEditing(null); setErrors({}); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      course: row.course?._id || "", title: row.title || "",
      description: row.description || "", type: row.type || "Notes", url: row.url || ""
    });
    setErrors({}); setOpen(true);
  };

  const save = async () => {
    const newErrors = {};
    if (!form.course) newErrors.course = "Please select a course.";
    if (!form.title || form.title.trim().length < 3 || form.title.length > 150) newErrors.title = "Title must be 3-150 characters.";
    if (!form.type) newErrors.type = "Please select a material type.";
    if (!form.url || form.url.trim().length === 0 || !/^https?:\/\/.+/.test(form.url)) newErrors.url = "Valid URL starting with http:// or https:// is required.";
    if (form.description && form.description.length > 500) newErrors.description = "Description cannot exceed 500 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      if (editing) {
        await api.put(`/materials/${editing._id}`, form);
      } else {
        await api.post("/materials", form);
      }
      setOpen(false); load();
    } catch (e) { setErrors({ global: e.response?.data?.message || "Save failed" }); }
  };

  const del = async (id) => { await api.delete(`/materials/${id}`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];
    if (filterCourse !== "all") out = out.filter(x => (x.course?._id || "") === filterCourse);
    if (filterType !== "all") out = out.filter(x => x.type === filterType);
    out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return out;
  }, [items, filterCourse, filterType]);

  const typeStyles = {
    Notes: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", icon: "📝" },
    Slides: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", icon: "📊" },
    Video: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30", icon: "🎥" },
    Link: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", icon: "🔗" },
    PDF: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", icon: "📄" },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Study Materials</h2>
          <p className="text-sm text-slate-400 mt-1">Access course notes, slides, videos, and links</p>
        </div>
        {isAdmin && <Button onClick={onCreate}>Add Material</Button>}
      </div>

      <Card glass>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Filter by Course" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.title}</option>)}
          </Select>
          <Select label="Filter by Type" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="Notes">Notes</option>
            <option value="Slides">Slides</option>
            <option value="Video">Video</option>
            <option value="Link">Link</option>
            <option value="PDF">PDF</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState glass title="No study materials" subtitle="Try changing filters or add new material." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => {
              const style = typeStyles[m.type] || typeStyles.Notes;
              return (
                <div key={m._id} className="rounded-2xl border border-white/10 glass shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className={`px-5 py-3 ${style.bg} border-b ${style.border}`}>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${style.text}`}>
                        <span>{style.icon}</span> {m.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white mb-1">{m.title}</h3>
                    <p className="text-xs font-medium text-slate-400 mb-2">
                      {m.course ? `${m.course.code} - ${m.course.title}` : "—"}
                    </p>
                    {m.description && (
                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">{m.description}</p>
                    )}
                    {m.uploadedBy && (
                      <p className="text-xs text-slate-500 mb-3">Uploaded by: {m.uploadedBy.name}</p>
                    )}
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 mb-3">
                        🔗 Open Resource
                      </a>
                    )}
                    {isAdmin && (
                      <div className="flex gap-2 pt-3 border-t border-white/10">
                        <Button variant="outline" className="flex-1" onClick={() => onEdit(m)}>Edit</Button>
                        <Button variant="danger" className="flex-1" onClick={() => del(m._id)}>Delete</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={open} title={editing ? "Edit Material" : "Add Material"} onClose={() => setOpen(false)}
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
          <Select label="Type" value={form.type} error={errors.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="Notes">Notes</option>
            <option value="Slides">Slides</option>
            <option value="Video">Video</option>
            <option value="Link">Link</option>
            <option value="PDF">PDF</option>
          </Select>
          <Input label="URL / Link" value={form.url} error={errors.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} error={errors.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
