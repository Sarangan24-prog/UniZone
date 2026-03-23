import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Select from "../components/Select";
import TextArea from "../components/TextArea";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import { useAuth } from "../auth/AuthContext";

export default function Services() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ category: "IT", description: "" });
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    if (isStudent) {
      const res = await api.get("/services/mine");
      setMine(res.data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    setErr("");
    try {
      await api.post("/services", form);
      setForm({ category: "IT", description: "" });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Submit failed");
    }
  };

  if (!isStudent) {
    return (
      <PageShell title="Services" subtitle="Students submit requests. Staff/Admin view All Requests.">
        <Card>
          <p className="text-sm text-gray-700">Go to <b>All Requests</b> to manage requests.</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="My Service Requests" subtitle="Submit and track your requests">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>
            <option value="IT">IT</option>
            <option value="Library">Library</option>
            <option value="Housing">Housing</option>
            <option value="Finance">Finance</option>
          </Select>
        </div>

        <div className="mt-3">
          <TextArea label="Description" rows={4} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/>
        </div>

        {err && <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{err}</p></div>}

        <Button className="mt-3" onClick={create}>Submit Request</Button>
      </Card>

      <div className="mt-4">
        {loading ? <Loading/> : mine.length === 0 ? (
          <EmptyState title="No requests" subtitle="Create your first request above."/>
        ) : (
          <div className="grid gap-3">
            {mine.map(r => (
              <Card key={r._id}>
                <p className="text-sm text-gray-600">{r.category}</p>
                <p className="text-sm font-semibold text-gray-900">{r.status}</p>
                <p className="mt-2 text-sm text-gray-700">{r.description}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
