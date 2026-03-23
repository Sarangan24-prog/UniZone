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

export default function Courses() {
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
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title: "", code: "", department: "CSE", schedule: "", capacity: 50, description: "" });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/courses");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title: "", code: "", department: "CSE", schedule: "", capacity: 50, description: "" });

  const onCreate = () => {
    resetForm();
    setEditing(null);
    setErr("");
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
      description: row.description || ""
    });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      if (editing) {
        await api.put(`/courses/${editing._id}`, form);
      } else {
        await api.post("/courses", form);
      }
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    // if (!confirm("Delete this course?")) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  const enroll = async (id) => { await api.post(`/courses/${id}/enroll`); load(); };
  const drop = async (id) => { await api.post(`/courses/${id}/drop`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    // filter by department
    if (department !== "all") out = out.filter(x => (x.department || "") === department);

    // search by title/code
    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.title || "").toLowerCase().includes(qq) ||
        (x.code || "").toLowerCase().includes(qq)
      );
    }

    // sort
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

  return (
    <PageShell
      title="Courses"
      subtitle="Search, filter, sort, and manage courses"
      right={isStaff && (
        <Button onClick={onCreate}>New Course</Button>
      )}
    >
      <Card>
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
          <EmptyState title="No courses found" subtitle="Try another search or change filters." />
        ) : (
          <Table columns={columns} rows={filtered} />
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Course" : "Create Course"}
        onClose={() => setOpen(false)}
        footer={(
          <div className="space-y-3">
            {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{err}</p></div>}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </Select>
          <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} />
          <Input label="Schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon 10-12" />
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
