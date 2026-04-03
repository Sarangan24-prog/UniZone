import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Modal from "../components/Modal";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import TextArea from "../components/TextArea";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS_STUDENT = [
  { key: "all", label: "All Events", icon: "📅" },
  { key: "my", label: "My Registrations", icon: "✅" },
  { key: "stats", label: "Event Statistics", icon: "📊" },
];

const NAV_ITEMS_STAFF = [
  { key: "all", label: "All Events", icon: "📅" },
  { key: "stats", label: "Event Statistics", icon: "📊" },
];

export default function Events() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("all");

  const [q, setQ] = useState("");
  const [month, setMonth] = useState("all");
  const [sort, setSort] = useState("date_asc");
  const [tab, setTab] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({ title: "", location: "", dateTime: "", capacity: 100, description: "" });

  // Ticket states — saved in localStorage so data persists between logins
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("eventTickets");
    return saved ? JSON.parse(saved) : [];
  });
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketEvent, setTicketEvent] = useState(null);
  const [ticketForm, setTicketForm] = useState({ name: "", email: "", phone: "" });
  const [ticketErrors, setTicketErrors] = useState({});
  const [adminTicketOpen, setAdminTicketOpen] = useState(false);
  const [showRegSuccess, setShowRegSuccess] = useState(false);

  // Countdown timer tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (dateTime) => {
    const diff = new Date(dateTime) - new Date();
    if (diff <= 0) return { label: "🔴 Ended", color: "text-red-400" };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return { label: `⏰ ${days}d ${hrs}h ${mins}m left`, color: "text-yellow-400" };
    return { label: `⏰ ${hrs}h ${mins}m ${secs}s left`, color: "text-green-400" };
  };

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
      setFieldErrors({});
      const payload = { ...form, dateTime: new Date(form.dateTime) };
      if (editing) await api.put(`/events/${editing._id}`, payload);
      else await api.post("/events", payload);
      alert("Event saved successfully");
      setOpen(false);
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    await api.delete(`/events/${id}`);
    load();
  };

  const reg = async (event) => {
    const registeredCount = event.registeredUsers?.length || 0;
    if (registeredCount >= event.capacity) { alert("Event is full"); return; }
    const alreadyRegistered = event.registeredUsers?.some(u => u._id === user?._id);
    if (alreadyRegistered) { alert("You are already registered"); return; }
    if (new Date(event.dateTime) < new Date()) { alert("Event already finished"); return; }
    await api.post(`/events/${event._id}/register`);
    load();
    setShowRegSuccess(true);
    setTimeout(() => setShowRegSuccess(false), 5000);
  };

  const unreg = async (event) => {
    const alreadyRegistered = event.registeredUsers?.some(u => u._id === user?._id);
    if (!alreadyRegistered) { alert("You are not registered for this event"); return; }
    if (!window.confirm("Are you sure you want to unregister?")) return;
    await api.post(`/events/${event._id}/unregister`);
    load();
  };

  // Ticket functions
  const openTicket = (event) => {
    setTicketEvent(event);
    setTicketForm({ name: "", email: "", phone: "" });
    setTicketErrors({});
    setTicketOpen(true);
  };

  const submitTicket = () => {
    const errors = {};
    if (!ticketForm.name.trim()) errors.name = "Name is required";
    if (!ticketForm.email.trim()) errors.email = "Email is required";
    if (!ticketForm.phone.trim()) errors.phone = "Phone is required";
    if (Object.keys(errors).length > 0) { setTicketErrors(errors); return; }

    const newTicket = {
      id: Date.now(),
      eventTitle: ticketEvent?.title,
      name: ticketForm.name,
      email: ticketForm.email,
      phone: ticketForm.phone,
      status: "pending",
      raisedAt: new Date().toLocaleString()
    };

    setTickets(prev => {
      const updated = [...prev, newTicket];
      localStorage.setItem("eventTickets", JSON.stringify(updated));
      return updated;
    });

    setTicketOpen(false);
    alert("🎟️ Ticket raised successfully! Admin will confirm soon.");
  };

  const confirmTicket = (id) => {
    setTickets(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status: "confirmed" } : t);
      localStorage.setItem("eventTickets", JSON.stringify(updated));
      return updated;
    });
    alert("✅ Ticket confirmed! Email will be sent to student.");
  };

  const now = new Date();

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
    { key: "countdown", header: "Countdown", render: (r) => {
      const cd = getCountdown(r.dateTime);
      return <span className={`font-mono text-sm font-medium ${cd.color}`}>{cd.label}</span>;
    }},
    { key: "capacity", header: "Capacity", render: (r) => `${r.registeredUsers?.length || 0}/${r.capacity || 0}` },
    {
      key: "actions", header: "Actions", render: (r) => (
        <div className="flex flex-wrap gap-2">
          {isStudent && (
            <>
              <Button onClick={() => reg(r)}>Register</Button>
              <Button variant="outline" onClick={() => unreg(r)}>Unregister</Button>
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
      <Card glass>
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

      {/* Create/Edit Event Modal */}
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

      {/* Raise Ticket Modal - Student */}
      <Modal
        open={ticketOpen}
        title="🎟️ Raise Event Ticket"
        onClose={() => setTicketOpen(false)}
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTicketOpen(false)}>Cancel</Button>
            <Button onClick={submitTicket}>Submit Ticket</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">Event: <strong>{ticketEvent?.title}</strong></p>
          <div>
            <Input label="Full Name" value={ticketForm.name} onChange={(e) => { setTicketForm({ ...ticketForm, name: e.target.value }); setTicketErrors(p => ({ ...p, name: "" })); }} />
            {ticketErrors.name && <p className="text-red-500 text-sm mt-1">{ticketErrors.name}</p>}
          </div>
          <div>
            <Input label="Email" type="email" value={ticketForm.email} onChange={(e) => { setTicketForm({ ...ticketForm, email: e.target.value }); setTicketErrors(p => ({ ...p, email: "" })); }} />
            {ticketErrors.email && <p className="text-red-500 text-sm mt-1">{ticketErrors.email}</p>}
          </div>
          <div>
            <Input label="Phone Number" type="tel" value={ticketForm.phone} onChange={(e) => { setTicketForm({ ...ticketForm, phone: e.target.value }); setTicketErrors(p => ({ ...p, phone: "" })); }} />
            {ticketErrors.phone && <p className="text-red-500 text-sm mt-1">{ticketErrors.phone}</p>}
          </div>
        </div>
      </Modal>

      {/* Admin Ticket Requests Modal */}
      <Modal
        open={adminTicketOpen}
        title="🎟️ Ticket Requests"
        onClose={() => setAdminTicketOpen(false)}
        footer={(
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAdminTicketOpen(false)}>Close</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No ticket requests yet.</p>
          ) : (
            tickets.map(t => (
              <div key={t.id} className="rounded-xl border border-gray-200 p-4 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.email} • {t.phone}</p>
                    <p className="text-xs text-gray-400">Event: {t.eventTitle}</p>
                    <p className="text-xs text-gray-400">Raised: {t.raisedAt}</p>
                  </div>
                  <div>
                    {t.status === "pending" ? (
                      <button
                        onClick={() => confirmTicket(t.id)}
                        className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-all"
                      >
                        ✅ Confirm
                      </button>
                    ) : (
                      <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        ✅ Confirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

    </PageShell>
  );
}