import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import TextArea from "../../components/TextArea";
import FileDropZone from "../../components/FileDropZone";

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
    course: "",
    title: "",
    description: "",
    type: "Notes",
    url: "",
  });
  const [attachedFiles, setAttachedFiles] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const [mRes, cRes] = await Promise.all([
        api.get("/materials"),
        api.get("/courses"),
      ]);
      setItems(mRes.data || []);
      setCourses(cRes.data || []);
    } catch (error) {
      console.error("Failed to load materials:", error);
      setItems([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      course: "",
      title: "",
      description: "",
      type: "Notes",
      url: "",
    });
    setAttachedFiles([]);
  };

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
      type: row.type || "Notes",
      url: row.url || "",
    });
    setAttachedFiles([]);
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
      form.title.length > 150
    ) {
      newErrors.title = "Title must be 3-150 characters.";
    }

    if (!form.type) {
      newErrors.type = "Please select a material type.";
    }

    if (
      !form.url ||
      form.url.trim().length === 0 ||
      !/^https?:\/\/.+/.test(form.url)
    ) {
      newErrors.url =
        "Valid URL starting with http:// or https:// is required.";
    }

    if (form.description && form.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      const encodeFile = (file) =>
        new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () =>
            res({ name: file.name, size: file.size, type: file.type, data: reader.result });
          reader.onerror = rej;
          reader.readAsDataURL(file);
        });
      const encodedFiles = await Promise.all(attachedFiles.map(encodeFile));
      const payload = { ...form, attachments: encodedFiles };
      if (editing) {
        await api.put(`/materials/${editing._id}`, payload);
      } else {
        await api.post("/materials", payload);
      }
      setOpen(false);
      load();
    } catch (e) {
      setErrors({ global: e.response?.data?.message || "Save failed" });
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/materials/${id}`);
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

    if (filterType !== "all") {
      out = out.filter((x) => x.type === filterType);
    }

    out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return out;
  }, [items, filterCourse, filterType]);

  const typeStyles = {
    Notes: {
      bg: "bg-blue-500/10",
      pill: "bg-blue-500/20 text-blue-300",
      icon: "📝",
    },
    Slides: {
      bg: "bg-purple-500/10",
      pill: "bg-purple-500/20 text-purple-300",
      icon: "📊",
    },
    Video: {
      bg: "bg-red-500/10",
      pill: "bg-red-500/20 text-red-300",
      icon: "🎥",
    },
    Link: {
      bg: "bg-green-500/10",
      pill: "bg-green-500/20 text-green-300",
      icon: "🔗",
    },
    PDF: {
      bg: "bg-amber-500/10",
      pill: "bg-amber-500/20 text-amber-300",
      icon: "📄",
    },
  };

  return (
    <div className="text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Study Materials
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Access course notes, slides, videos, and links
          </p>
        </div>

        {isAdmin && (
          <Button onClick={onCreate} className="rounded-2xl">
            Add Material
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
            label="Filter by Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Notes">Notes</option>
            <option value="Slides">Slides</option>
            <option value="Video">Video</option>
            <option value="Link">Link</option>
            <option value="PDF">PDF</option>
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
                📚
              </div>
              <h3 className="text-xl font-bold text-white">
  No study materials
</h3>
<p className="mt-2 text-sm text-slate-300">
  Try changing filters or add new material.
</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => {
              const style = typeStyles[m.type] || typeStyles.Notes;

              return (
                <div
                  key={m._id}
                  className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className={`px-5 py-4 ${style.bg}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${style.pill}`}
                      >
                        <span>{style.icon}</span>
                        {m.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="mb-1 text-lg font-bold text-white">
                      {m.title}
                    </h3>

                    <p className="mb-2 text-xs font-medium text-slate-400">
                      {m.course ? `${m.course.code} - ${m.course.title}` : "—"}
                    </p>

                    {m.description && (
                      <p className="mb-3 line-clamp-3 text-sm leading-6 text-slate-300">
                        {m.description}
                      </p>
                    )}

                    {m.uploadedBy && (
                      <p className="mb-3 text-xs text-slate-500">
                        Uploaded by: {m.uploadedBy.name}
                      </p>
                    )}

                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                      >
                        🔗 Open Resource
                      </a>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2 border-t border-white/10 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => onEdit(m)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="flex-1"
                          onClick={() => del(m._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Material" : "Add Material"}
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

          <Select
            label="Type"
            value={form.type}
            error={errors.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="Notes">Notes</option>
            <option value="Slides">Slides</option>
            <option value="Video">Video</option>
            <option value="Link">Link</option>
            <option value="PDF">PDF</option>
          </Select>

          <Input
            label="URL / Link"
            value={form.url}
            error={errors.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
          />

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

          <div className="sm:col-span-2">
            <FileDropZone
              label="Upload Files (optional)"
              files={attachedFiles}
              onChange={setAttachedFiles}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt,video/*,image/*"
              multiple
              maxSizeMB={25}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}