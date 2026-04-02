import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import TextArea from "../components/TextArea";
import { useAuth } from "../auth/AuthContext";

export default function Courses({ isEmbedded = false }) {
  const { user } = useAuth();

  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // search/filter/sort
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("all");
  const [sort, setSort] = useState("created_desc");

  // create/edit modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ title: "", code: "", department: "CSE", schedule: "", capacity: 50, description: "", features: [] });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/courses");
      setItems(res.data || []);
    } catch (e) {
      console.error("Failed to load courses:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title: "", code: "", department: "CSE", schedule: "", capacity: 50, description: "", features: [] });

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
      code: row.code || "",
      department: row.department || "CSE",
      schedule: row.schedule || "",
      capacity: row.capacity || 50,
      description: row.description || "",
      features: row.features || []
    });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    const cleanedFeatures = (form.features || []).map(f => f.trim()).filter(f => f.length > 0);
    const submitData = { ...form, features: cleanedFeatures };

    const newErrors = {};
    if (!submitData.title || submitData.title.trim().length < 3 || submitData.title.length > 100) newErrors.title = "Title must be 3-100 characters.";
    if (!submitData.code || submitData.code.trim().length < 2 || submitData.code.length > 20 || !/^[a-zA-Z0-9-]+$/.test(submitData.code)) newErrors.code = "Code must be 2-20 alphanumeric characters.";
    if (!submitData.department) newErrors.department = "Department is required.";
    if (!submitData.capacity || isNaN(submitData.capacity) || submitData.capacity < 1 || submitData.capacity > 1000) newErrors.capacity = "Capacity must be between 1 and 1000.";
    if (!submitData.schedule || submitData.schedule.trim().length === 0) newErrors.schedule = "Schedule is required.";
    if (submitData.description && submitData.description.length > 500) newErrors.description = "Description cannot exceed 500 characters.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      if (editing) {
        await api.put(`/courses/${editing._id}`, submitData);
      } else {
        await api.post("/courses", submitData);
      }
      setOpen(false);
      load();
    } catch (e) {
      setErrors({ global: e.response?.data?.message || "Save failed" });
    }
  };

  const del = async (id) => {
    await api.delete(`/courses/${id}`);
    load();
  };

  const enroll = async (id) => { await api.post(`/courses/${id}/enroll`); load(); };
  const drop = async (id) => { await api.post(`/courses/${id}/drop`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    if (department !== "all") out = out.filter(x => (x.department || "") === department);

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.title || "").toLowerCase().includes(qq) ||
        (x.code || "").toLowerCase().includes(qq)
      );
    }

    out.sort((a, b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "title_asc") return (a.title || "").localeCompare(b.title || "");
      if (sort === "title_desc") return (b.title || "").localeCompare(a.title || "");
      return 0;
    });

    return out;
  }, [items, q, department, sort]);

  const columns = [
    { key: "code", header: "Code" },
    { key: "title", header: "Title" },
    { key: "department", header: "Dept" },
    { key: "capacity", header: "Capacity", render: (r) => `${r.enrolledStudents?.length || 0}/${r.capacity || 0}` },
    {
      key: "actions", header: "Actions", render: (r) => (
        <div className="flex flex-wrap gap-2">
          {isStudent && (
            <>
              <Button onClick={() => enroll(r._id)}>Enroll</Button>
              <Button variant="outline" onClick={() => drop(r._id)}>Drop</Button>
            </>
          )}
          {isStaff && (
            <>
              <Button variant="outline" onClick={() => onEdit(r)}>Edit</Button>
              <Button variant="danger" onClick={() => del(r._id)}>Delete</Button>
            </>
          )}
        </div>
      )
    }
  ];

  const content = (
    <>
      {isEmbedded && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Course Registration</h2>
            <p className="text-sm text-slate-400 mt-1">Search, filter, sort, and manage courses</p>
          </div>
          {isStaff && <Button onClick={onCreate}>New Course</Button>}
        </div>
      )}

      <Card glass>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search (title/code)" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. DBMS, CSE101" />
          <Select label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="all">All</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="title_asc">Title A→Z</option>
            <option value="title_desc">Title Z→A</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState glass title="No courses found" subtitle="Try another search or change filters." />
        ) : (
          <Table glass columns={columns} rows={filtered} />
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Course" : "Create Course"}
        onClose={() => setOpen(false)}
        footer={(
          <div className="space-y-3">
            {errors.global && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm font-medium text-red-400">• {errors.global}</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Title" value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Code" value={form.code} error={errors.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Select label="Department" value={form.department} error={errors.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </Select>
          <Input label="Capacity" type="number" value={form.capacity} error={errors.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} />
          <Input label="Schedule" value={form.schedule} error={errors.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon 10-12" />
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2 space-y-3 mt-2">
            <label className="block text-sm font-medium text-slate-300">Course Features</label>
            {form.features?.map((feat, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input 
                    value={feat} 
                    onChange={(e) => {
                      const newF = [...(form.features || [])];
                      newF[i] = e.target.value;
                      setForm({ ...form, features: newF });
                    }} 
                    placeholder="e.g. Weekly Live Q&A" 
                  />
                </div>
                <Button variant="danger" onClick={() => {
                  const newF = (form.features || []).filter((_, idx) => idx !== i);
                  setForm({ ...form, features: newF });
                }}>
                  Remove
                </Button>
              </div>
            ))}
           
          </div>
          <div className="sm:col-span-2 space-y-3 mt-2">
            <label className="block text-sm font-medium text-gray-700">Course Features</label>
            {form.features?.map((feat, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input 
                    value={feat} 
                    onChange={(e) => {
                      const newF = [...(form.features || [])];
                      newF[i] = e.target.value;
                      setForm({ ...form, features: newF });
                    }} 
                    placeholder="e.g. Weekly Live Q&A" 
                  />
                </div>
                <Button variant="danger" onClick={() => {
                  const newF = (form.features || []).filter((_, idx) => idx !== i);
                  setForm({ ...form, features: newF });
                }}>
                  Remove
                </Button>
              </div>
            ))}
            <div>
              <Button variant="outline" onClick={() => setForm({ ...form, features: [...(form.features || []), ""] })}>
                + Add Feature
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );

  if (isEmbedded) return <div>{content}</div>;

  return (
    <PageShell
      title="Courses"
      subtitle="Search, filter, sort, and manage courses"
      right={isStaff && (
        <Button onClick={onCreate}>New Course</Button>
      )}
    >
      {content}
    </PageShell>
  );
}

