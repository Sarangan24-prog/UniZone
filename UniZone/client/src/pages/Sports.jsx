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

export default function Sports() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState("created_desc");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name:"", maxPlayers:30, description:"" });

  const load = async () => {
    setLoading(true);
    const res = await api.get("/sports");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onCreate = () => { setForm({ name:"", maxPlayers:30, description:"" }); setEditing(null); setErr(""); setOpen(true); };

  const onEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || "", maxPlayers: row.maxPlayers || 30, description: row.description || "" });
    setErr("");
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      if (editing) await api.put(`/sports/${editing._id}`, form);
      else await api.post("/sports", form);
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this sport?")) return;
    await api.delete(`/sports/${id}`);
    load();
  };

  const join = async (id) => { await api.post(`/sports/${id}/join`); load(); };
  const leave = async (id) => { await api.post(`/sports/${id}/leave`); load(); };

  const filtered = useMemo(() => {
    let out = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x => (x.name || "").toLowerCase().includes(qq));
    }

    if (size !== "all") {
      out = out.filter(x => {
        const mp = x.maxPlayers || 0;
        if (size === "small") return mp <= 15;
        if (size === "medium") return mp > 15 && mp <= 30;
        if (size === "large") return mp > 30;
        return true;
      });
    }

    out.sort((a,b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "name_asc") return (a.name||"").localeCompare(b.name||"");
      if (sort === "name_desc") return (b.name||"").localeCompare(a.name||"");
      return 0;
    });

    return out;
  }, [items, q, size, sort]);

  const columns = [
    { key: "name", header: "Sport" },
    { key: "maxPlayers", header: "Max Players" },
    { key: "players", header: "Current", render: (r) => `${r.players?.length || 0}/${r.maxPlayers || 0}` },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-2">
        {isStudent && (
          <>
            <Button onClick={()=>join(r._id)}>Join</Button>
            <Button variant="outline" onClick={()=>leave(r._id)}>Leave</Button>
          </>
        )}
        {isStaff && (
          <>
            <Button variant="outline" onClick={()=>onEdit(r)}>Edit</Button>
            <Button variant="danger" onClick={()=>del(r._id)}>Delete</Button>
          </>
        )}
      </div>
    ) }
  ];

  return (
    <PageShell
      title="Sports"
      subtitle="Search, filter by team size, and manage sports"
      right={isStaff && <Button onClick={onCreate}>New Sport</Button>}
    >
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search (name)" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cricket, Football..." />
          <Select label="Team Size" value={size} onChange={(e)=>setSize(e.target.value)}>
            <option value="all">All</option>
            <option value="small">Small (≤ 15)</option>
            <option value="medium">Medium (16–30)</option>
            <option value="large">Large (30+)</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : filtered.length === 0 ? (
          <EmptyState title="No sports found" subtitle="Try a different search or filter."/>
        ) : (
          <Table columns={columns} rows={filtered}/>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Sport" : "Create Sport"}
        onClose={()=>setOpen(false)}
        footer={(
          <div className="space-y-3">
            {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{err}</p></div>}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Sport Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <Input label="Max Players" type="number" value={form.maxPlayers} onChange={(e)=>setForm({...form,maxPlayers:+e.target.value})}/>
          <div className="sm:col-span-2">
            <TextArea label="Description" rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
