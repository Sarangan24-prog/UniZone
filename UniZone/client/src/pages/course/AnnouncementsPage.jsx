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
    title: "", content: "", priority: "Medium", targetAudience: "All"
  });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/announcements");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title: "", content: "", priority: "Medium", targetAudience: "All" });

  const onCreate = () => { resetForm(); setEditing(null); setErrors({}); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || "", content: row.content || "",
      priority: row.priority || "Medium", targetAudience: row.targetAudience || "All"
    });
    setErrors({}); setOpen(true);
  };

  const save = async () => {
    const newErrors = {};
    if (!form.title || form.title.trim().length < 5 || form.title.length > 200) newErrors.title = "Title must be 5-200 characters.";
    if (!form.priority) newErrors.priority = "Priority is required.";
    if (!form.targetAudience) newErrors.targetAudience = "Target Audience is required.";
    if (!form.content || form.content.trim().length < 10 || form.content.length > 2000) newErrors.content = "Content must be 10-2000 characters.";

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
      setOpen(false); load();
    } catch (e) { setErrors({ global: e.response?.data?.message || "Save failed" }); }
  };

  const del = async (id) => { await api.delete(`/announcements/${id}`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];
    if (filterPriority !== "all") out = out.filter(x => x.priority === filterPriority);
    return out;
  }, [items, filterPriority]);

  const priorityStyles = {
    Low: { bg: "bg-white/5", border: "border-white/20", text: "text-slate-300", dot: "bg-gray-400" },
    Medium: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-300", dot: "bg-blue-500" },
    High: { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-300", dot: "bg-orange-500" },
    Urgent: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-300", dot: "bg-red-500" },
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Announcements & Notices</h2>
          <p className="text-sm text-slate-400 mt-1">Stay updated with latest announcements</p>
        </div>
        {isAdmin && <Button onClick={onCreate}>New Announcement</Button>}
      </div>

      <Card glass>
        <Select label="Filter by Priority" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </Select>
      </Card>

      <div className="mt-4">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState glass title="No announcements" subtitle="No announcements to show." />
        ) : (
          <div className="space-y-4">
            {filtered.map((a) => {
              const pStyle = priorityStyles[a.priority] || priorityStyles.Medium;
              return (
                <div key={a._id} className={`rounded-2xl border ${pStyle.border} glass shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
                  <div className={`px-6 py-3 ${pStyle.bg} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${pStyle.dot}`}></span>
                      <span className={`text-xs font-bold uppercase tracking-wide ${pStyle.text}`}>{a.priority} Priority</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{formatDate(a.createdAt)}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{a.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-3">{a.content}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-white/10 text-xs font-semibold text-slate-300">
                          👥 {a.targetAudience}
                        </span>
                        {a.postedBy && (
                          <span className="text-xs text-slate-500">Posted by: {a.postedBy.name}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => onEdit(a)}>Edit</Button>
                          <Button variant="danger" onClick={() => del(a._id)}>Delete</Button>
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

      <Modal open={open} title={editing ? "Edit Announcement" : "New Announcement"} onClose={() => setOpen(false)}
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
          <Input label="Title" value={form.title} error={errors.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Select label="Priority" value={form.priority} error={errors.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </Select>
          <Select label="Target Audience" value={form.targetAudience} error={errors.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}>
            <option value="All">All</option>
            <option value="Students">Students</option>
            <option value="Staff">Staff</option>
          </Select>
          <div className="sm:col-span-2">
            <TextArea label="Content" rows={4} value={form.content} error={errors.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
