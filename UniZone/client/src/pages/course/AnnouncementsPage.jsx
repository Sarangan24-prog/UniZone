import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Select from "../../components/Select";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import TextArea from "../../components/TextArea";

export default function AnnouncementsPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "Medium",
    targetAudience: "All",
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/announcements");
      setItems(res.data || []);
    } catch (error) {
      console.error("Failed to load announcements:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () =>
    setForm({
      title: "",
      content: "",
      priority: "Medium",
      targetAudience: "All",
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
      title: row.title || "",
      content: row.content || "",
      priority: row.priority || "Medium",
      targetAudience: row.targetAudience || "All",
    });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    const newErrors = {};

    if (!form.title || form.title.trim().length < 5 || form.title.length > 200) {
      newErrors.title = "Title must be 5-200 characters.";
    }

    if (!form.priority) {
      newErrors.priority = "Priority is required.";
    }

    if (!form.targetAudience) {
      newErrors.targetAudience = "Target Audience is required.";
    }

    if (
      !form.content ||
      form.content.trim().length < 10 ||
      form.content.length > 2000
    ) {
      newErrors.content = "Content must be 10-2000 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      if (editing) {
        await api.put(`/announcements/${editing._id}`, form);
      } else {
        await api.post("/announcements", form);
      }
      setOpen(false);
      load();
    } catch (e) {
      setErrors({ global: e.response?.data?.message || "Save failed" });
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      load();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filtered = useMemo(() => {
    let out = [...items];
    if (filterPriority !== "all") {
      out = out.filter((x) => x.priority === filterPriority);
    }
    return out;
  }, [items, filterPriority]);

  const priorityStyles = {
    Low: {
      header: "bg-white/5",
      border: "border-white/10",
      text: "text-slate-300",
      dot: "bg-slate-400",
      badge: "bg-white/10 text-slate-300",
    },
    Medium: {
      header: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-300",
      dot: "bg-blue-400",
      badge: "bg-blue-500/20 text-blue-300",
    },
    High: {
      header: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-300",
      dot: "bg-orange-400",
      badge: "bg-orange-500/20 text-orange-300",
    },
    Urgent: {
      header: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-300",
      dot: "bg-red-400",
      badge: "bg-red-500/20 text-red-300",
    },
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="text-white">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Announcements & Notices
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Stay updated with latest announcements
          </p>
        </div>

        {isAdmin && (
          <Button onClick={onCreate} className="rounded-2xl">
            New Announcement
          </Button>
        )}
      </div>

      <div className="mb-5 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-md">
        <Select
          label="Filter by Priority"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </Select>
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
                📢
              </div>
              <h3 className="text-xl font-bold text-white">No announcements</h3>
<p className="mt-2 text-sm text-slate-300">No announcements to show.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => {
              const pStyle = priorityStyles[a.priority] || priorityStyles.Medium;

              return (
                <div
                  key={a._id}
                  className={`overflow-hidden rounded-[24px] border bg-white/5 shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl ${pStyle.border}`}
                >
                  <div
                    className={`flex items-center justify-between gap-4 px-6 py-4 ${pStyle.header}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${pStyle.dot}`} />
                      <span
                        className={`text-xs font-bold uppercase tracking-[0.18em] ${pStyle.text}`}
                      >
                        {a.priority} Priority
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-white">
                      {a.title}
                    </h3>

                    <p className="mb-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {a.content}
                    </p>

                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${pStyle.badge}`}
                        >
                          👥 {a.targetAudience}
                        </span>

                        {a.postedBy && (
                          <span className="text-xs text-slate-500">
                            Posted by: {a.postedBy.name}
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => onEdit(a)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => del(a._id)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Announcement" : "New Announcement"}
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
          <Input
            label="Title"
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Select
            label="Priority"
            value={form.priority}
            error={errors.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </Select>

          <Select
            label="Target Audience"
            value={form.targetAudience}
            error={errors.targetAudience}
            onChange={(e) =>
              setForm({ ...form, targetAudience: e.target.value })
            }
          >
            <option value="All">All</option>
            <option value="Students">Students</option>
            <option value="Staff">Staff</option>
          </Select>

          <div className="sm:col-span-2">
            <TextArea
              label="Content"
              rows={4}
              value={form.content}
              error={errors.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}