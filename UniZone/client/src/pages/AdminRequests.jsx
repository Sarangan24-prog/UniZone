import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";

export default function AdminRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created_desc");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/services");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id, newStatus) => {
    await api.put(`/services/${id}`, { status: newStatus });
    load();
  };

  const filtered = useMemo(() => {
    let out = [...items];

    if (q.trim()) {
      const qq = q.toLowerCase();
      out = out.filter(x =>
        (x.category || "").toLowerCase().includes(qq) ||
        (x.description || "").toLowerCase().includes(qq) ||
        (x.status || "").toLowerCase().includes(qq)
      );
    }

    if (status !== "all") out = out.filter(x => x.status === status);

    out.sort((a,b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

    return out;
  }, [items, q, status, sort]);

  const columns = [
    { key: "category", header: "Category" },
    { key: "status", header: "Status" },
    { key: "description", header: "Description" },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => update(r._id, "in_progress")}>In Progress</Button>
        <Button onClick={() => update(r._id, "closed")}>Close</Button>
      </div>
    )}
  ];

  return (
    <PageShell title="All Service Requests" subtitle="Staff/Admin: search, filter, and update status">
      <Card glass>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="IT, finance, description..." />
          <Select label="Status" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
          </Select>
        </div>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : filtered.length === 0 ? (
          <EmptyState title="No requests found" subtitle="Try different filters/search."/>
        ) : (
          <Table columns={columns} rows={filtered}/>
        )}
      </div>
    </PageShell>
  );
}
