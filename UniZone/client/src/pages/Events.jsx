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

export default function Events() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [month, setMonth] = useState("all");
  const [sort, setSort] = useState("date_asc");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ title: "", location: "", dateTime: "", capacity: 100, description: "" });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/events");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ title: "", location: "", dateTime: "", capacity: 100, description: "" });

  const onCreate = () => { resetForm(); setEditing(null); setErr(""); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || "",
      location: row.location || "",
      dateTime: row.dateTime ? new Date(row.dateTime).toISOString().slice(0, 16) : "",
      capacity: row.capacity || 100,
      description: row.description || ""
    });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      const payload = { ...form, dateTime: new Date(form.dateTime) };
      if (editing) await api.put(`/events/${editing._id}`, payload);
      else await api.post("/events", payload);
       alert("Event saved successfully")
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    // if (!confirm("Delete this event?")) return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    await api.delete(`/events/${id}`);
    load();
  };

  const reg = async (id) => { await api.post(`/events/${id}/register`); load(); };
  const unreg = async (id) => { await api.post(`/events/${id}/unregister`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.title || "").toLowerCase().includes(qq) ||
        (x.location || "").toLowerCase().includes(qq)
      );
    }

    if (month !== "all") {
      out = out.filter(x => {
        const m = new Date(x.dateTime).getMonth() + 1;
        return String(m) === month;
      });
    }

    out.sort((a, b) => {
      if (sort === "date_asc") return new Date(a.dateTime) - new Date(b.dateTime);
      if (sort === "date_desc") return new Date(b.dateTime) - new Date(a.dateTime);
      if (sort === "title_asc") return (a.title || "").localeCompare(b.title || "");
      if (sort === "title_desc") return (b.title || "").localeCompare(a.title || "");
      return 0;
    });

    return out;
  }, [items, q, month, sort]);

  const columns = [
    { key: "title", header: "Title" },
    { key: "location", header: "Location" },
    { key: "dateTime", header: "Date", render: (r) => new Date(r.dateTime).toLocaleString() },
    { key: "capacity", header: "Capacity", render: (r) => `${r.registeredUsers?.length || 0}/${r.capacity || 0}` },
    {
      key: "actions", header: "Actions", render: (r) => (
        <div className="flex flex-wrap gap-2">
          {isStudent && (
            <>
              <Button onClick={() => reg(r._id)}>Register</Button>
              <Button variant="outline" onClick={() => unreg(r._id)}>Unregister</Button>
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
      title="Events"
      subtitle="Search, filter by month, and manage events"
      right={isStaff && <Button onClick={onCreate}>New Event</Button>}
    >
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search (title/location)" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sports day..." />
          <Select label="Month" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="all">All</option>
            <option value="1">Jan</option><option value="2">Feb</option><option value="3">Mar</option>
            <option value="4">Apr</option><option value="5">May</option><option value="6">Jun</option>
            <option value="7">Jul</option><option value="8">Aug</option><option value="9">Sep</option>
            <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date_asc">Upcoming first</option>
            <option value="date_desc">Latest first</option>
            <option value="title_asc">Title A→Z</option>
            <option value="title_desc">Title Z→A</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState title="No events found" subtitle="Try a different search or month filter." />
        ) : (
          <Table columns={columns} rows={filtered} />
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Event" : "Create Event"}
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
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Date & Time" type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} />
          <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} />
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
