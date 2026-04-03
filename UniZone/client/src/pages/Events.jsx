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
  const [form, setForm] = useState({
    title: "",
    location: "",
    dateTime: "",
    capacity: 100,
    description: "",
  });

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

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (dateTime) => {
    const diff = new Date(dateTime) - new Date();
    if (diff <= 0) return { label: "🔴 Ended", color: "text-red-400" };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return { label: `⏰ ${days}d ${hrs}h ${mins}m left`, color: "text-yellow-400" };
    }

    return { label: `⏰ ${hrs}h ${mins}m ${secs}s left`, color: "text-green-400" };
  };

  const load = async () => {
    setLoading(true);
    const res = await api.get("/events");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () =>
    setForm({
      title: "",
      location: "",
      dateTime: "",
      capacity: 100,
      description: "",
    });

  const onCreate = () => {
    resetForm();
    setEditing(null);
    setErr("");
    setFieldErrors({});
    setOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || "",
      location: row.location || "",
      dateTime: row.dateTime ? new Date(row.dateTime).toISOString().slice(0, 16) : "",
      capacity: row.capacity || 100,
      description: row.description || "",
    });
    setErr("");
    setFieldErrors({});
    setOpen(true);
  };

  const save = async () => {
    try {
      setErr("");
      setFieldErrors({});
      const payload = { ...form, dateTime: new Date(form.dateTime) };

      if (editing) {
        await api.put(`/events/${editing._id}`, payload);
      } else {
        await api.post("/events", payload);
      }

      alert("Event saved successfully");
      setOpen(false);
      load();
    } catch (e) {
      const message = e.response?.data?.message || "Save failed";
      const extractedErrors = {};

      if (message.includes("title:")) extractedErrors.title = "Event title is required";
      if (message.includes("location:")) extractedErrors.location = "Location is required";
      if (message.includes("dateTime:")) extractedErrors.dateTime = "Date and time is required";
      if (message.includes("capacity:")) extractedErrors.capacity = "Capacity is invalid";

      if (Object.keys(extractedErrors).length > 0) {
        setFieldErrors(extractedErrors);
        setErr("");
      } else {
        setErr(message);
        setFieldErrors({});
      }
    }
  };

  const del = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    await api.delete(`/events/${id}`);
    load();
  };

  const reg = async (event) => {
    const registeredCount = event.registeredUsers?.length || 0;

    if (registeredCount >= event.capacity) {
      alert("Event is full");
      return;
    }

    const alreadyRegistered = event.registeredUsers?.some((u) => u._id === user?._id);
    if (alreadyRegistered) {
      alert("You are already registered");
      return;
    }

    if (new Date(event.dateTime) < new Date()) {
      alert("Event already finished");
      return;
    }

    await api.post(`/events/${event._id}/register`);
    load();
    setShowRegSuccess(true);
    setTimeout(() => setShowRegSuccess(false), 5000);
  };

  const unreg = async (event) => {
    const alreadyRegistered = event.registeredUsers?.some((u) => u._id === user?._id);

    if (!alreadyRegistered) {
      alert("You are not registered for this event");
      return;
    }

    if (!window.confirm("Are you sure you want to unregister?")) return;

    await api.post(`/events/${event._id}/unregister`);
    load();
  };

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

    if (Object.keys(errors).length > 0) {
      setTicketErrors(errors);
      return;
    }

    const newTicket = {
      id: Date.now(),
      eventTitle: ticketEvent?.title,
      name: ticketForm.name,
      email: ticketForm.email,
      phone: ticketForm.phone,
      status: "pending",
      raisedAt: new Date().toLocaleString(),
    };

    setTickets((prev) => {
      const updated = [...prev, newTicket];
      localStorage.setItem("eventTickets", JSON.stringify(updated));
      return updated;
    });

    setTicketOpen(false);
    alert("🎟️ Ticket raised successfully! Admin will confirm soon.");
  };

  const confirmTicket = (id) => {
    setTickets((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, status: "confirmed" } : t
      );
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
      out = out.filter(
        (x) =>
          (x.title || "").toLowerCase().includes(qq) ||
          (x.location || "").toLowerCase().includes(qq)
      );
    }

    if (month !== "all") {
      out = out.filter((x) => {
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

  const myEvents = items.filter((x) =>
    x.registeredUsers?.some((u) => u._id === user?._id)
  );

  const upcomingCount = items.filter((x) => new Date(x.dateTime) > now).length;
  const endedCount = items.filter((x) => new Date(x.dateTime) <= now).length;
  const pendingTickets = tickets.filter((t) => t.status === "pending").length;

  const navItems = isStudent ? NAV_ITEMS_STUDENT : NAV_ITEMS_STAFF;

  const columns = [
    { key: "title", header: "Title" },
    { key: "location", header: "Location" },
    {
      key: "dateTime",
      header: "Date",
      render: (r) => new Date(r.dateTime).toLocaleString(),
    },
    {
      key: "countdown",
      header: "Countdown",
      render: (r) => {
        const cd = getCountdown(r.dateTime);
        return (
          <span className={`font-mono text-sm font-medium ${cd.color}`}>
            {cd.label}
          </span>
        );
      },
    },
    {
      key: "capacity",
      header: "Capacity",
      render: (r) => `${r.registeredUsers?.length || 0}/${r.capacity || 0}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {isStudent && activeNav === "my" && (
            <div className="flex gap-2 items-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-400 font-medium text-sm animate-pulse">
                ✅ Registered
              </span>
              <button
                onClick={() => openTicket(r)}
                className="px-3 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all"
              >
                🎟️ Raise Ticket
              </button>
            </div>
          )}

          {isStudent && activeNav !== "my" && (
            <>
              <Button onClick={() => reg(r)}>Register</Button>
              <Button variant="outline" onClick={() => unreg(r)}>
                Unregister
              </Button>
            </>
          )}

          {isStaff && (
            <>
              <Button variant="outline" onClick={() => onEdit(r)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => del(r._id)}>
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0d1b4b] to-[#1a0a3c] text-white">
      {showRegSuccess && (
        <div className="mx-8 mt-4 rounded-2xl bg-green-500 bg-opacity-20 border border-green-400 border-opacity-40 p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-green-300 font-semibold">
              You are registered successfully!
            </p>
            <p className="text-green-400 text-sm">
              You can now raise a ticket 🎟️ from My Registrations tab.
            </p>
          </div>
        </div>
      )}

      <div className="px-8 pt-10 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Event Management
          </h1>
          <p className="text-blue-300 mt-2 text-lg">
            Manage and explore university events
          </p>
        </div>

        <div className="flex gap-3 mt-2">
          {isStaff && (
            <>
              <button
                onClick={() => setAdminTicketOpen(true)}
                className="relative px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold tracking-wide text-sm uppercase transition-all duration-200 shadow-xl"
              >
                🎟️ TICKET REQUESTS
                {pendingTickets > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingTickets}
                  </span>
                )}
              </button>

              <button
                onClick={onCreate}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-semibold tracking-wide text-sm uppercase transition-all duration-200 shadow-xl"
              >
                + NEW EVENT
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-8 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 p-5 text-center backdrop-blur">
          <p className="text-3xl font-bold text-white">{items.length}</p>
          <p className="text-blue-300 text-sm mt-1">Total Events</p>
        </div>

        {isStudent && (
          <div className="rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 p-5 text-center backdrop-blur">
            <p className="text-3xl font-bold text-green-400">{myEvents.length}</p>
            <p className="text-blue-300 text-sm mt-1">My Registrations</p>
          </div>
        )}

        <div className="rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 p-5 text-center backdrop-blur">
          <p className="text-3xl font-bold text-yellow-400">{upcomingCount}</p>
          <p className="text-blue-300 text-sm mt-1">Upcoming</p>
        </div>

        <div className="rounded-2xl border border-white border-opacity-10 bg-white bg-opacity-5 p-5 text-center backdrop-blur">
          <p className="text-3xl font-bold text-red-400">{endedCount}</p>
          <p className="text-blue-300 text-sm mt-1">Ended</p>
        </div>
      </div>

      <div className="px-8 pb-10 flex gap-6">
        <div className="w-56 flex-shrink-0">
          <div className="rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 p-4 backdrop-blur">
            <p className="text-xs font-bold text-blue-300 tracking-widest mb-4 uppercase">
              Event Navigator
            </p>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveNav(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeNav === item.key
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-blue-200 hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {activeNav === "all" && (
            <div className="rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 p-6 backdrop-blur">
              <h2 className="text-xl font-bold text-white mb-4">All Events</h2>

              <div className="grid gap-3 sm:grid-cols-3 mb-6">
                <Input
                  label="Search (title/location)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Sports day..."
                />

                <Select
                  label="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="1">Jan</option>
                  <option value="2">Feb</option>
                  <option value="3">Mar</option>
                  <option value="4">Apr</option>
                  <option value="5">May</option>
                  <option value="6">Jun</option>
                  <option value="7">Jul</option>
                  <option value="8">Aug</option>
                  <option value="9">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>
                </Select>

                <Select
                  label="Sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="date_asc">Upcoming first</option>
                  <option value="date_desc">Latest first</option>
                  <option value="title_asc">Title A→Z</option>
                  <option value="title_desc">Title Z→A</option>
                </Select>
              </div>

              {loading ? (
                <Loading />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No events found"
                  subtitle="Try a different search or month filter."
                />
              ) : (
                <Table columns={columns} rows={filtered} />
              )}
            </div>
          )}

          {activeNav === "my" && isStudent && (
            <div className="rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 p-6 backdrop-blur">
              <h2 className="text-xl font-bold text-white mb-4">My Registrations</h2>
              {loading ? (
                <Loading />
              ) : myEvents.length === 0 ? (
                <EmptyState
                  title="No registrations"
                  subtitle="You have not registered for any events."
                />
              ) : (
                <Table columns={columns} rows={myEvents} />
              )}
            </div>
          )}

          {activeNav === "stats" && (
            <div className="rounded-2xl bg-white bg-opacity-5 border border-white border-opacity-10 p-6 backdrop-blur">
              <h2 className="text-xl font-bold text-white mb-6">Event Statistics</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30 p-5">
                  <p className="text-blue-300 text-sm">Total Events</p>
                  <p className="text-4xl font-bold text-white mt-1">{items.length}</p>
                </div>

                <div className="rounded-xl bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30 p-5">
                  <p className="text-green-300 text-sm">Upcoming Events</p>
                  <p className="text-4xl font-bold text-white mt-1">{upcomingCount}</p>
                </div>

                <div className="rounded-xl bg-red-600 bg-opacity-20 border border-red-500 border-opacity-30 p-5">
                  <p className="text-red-300 text-sm">Ended Events</p>
                  <p className="text-4xl font-bold text-white mt-1">{endedCount}</p>
                </div>

                {isStudent && (
                  <div className="rounded-xl bg-purple-600 bg-opacity-20 border border-purple-500 border-opacity-30 p-5">
                    <p className="text-purple-300 text-sm">My Registrations</p>
                    <p className="text-4xl font-bold text-white mt-1">{myEvents.length}</p>
                  </div>
                )}
              </div>

              <h3 className="text-white font-semibold mb-3">All Events Status</h3>

              <div className="space-y-2">
                {items.map((ev) => {
                  const cd = getCountdown(ev.dateTime);

                  return (
                    <div
                      key={ev._id}
                      className="flex items-center justify-between rounded-xl bg-white bg-opacity-5 px-4 py-3"
                    >
                      <div>
                        <p className="text-white font-medium">{ev.title}</p>
                        <p className="text-blue-300 text-xs">
                          {ev.location} — {new Date(ev.dateTime).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-blue-300 text-sm">
                          {ev.registeredUsers?.length || 0}/{ev.capacity}
                        </span>
                        <span className={`font-mono text-xs font-medium ${cd.color}`}>
                          {cd.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Event" : "Create Event"}
        onClose={() => setOpen(false)}
        footer={
          <div className="space-y-3">
            {err && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-sm font-medium text-red-700">{err}</p>
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
          <div>
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
            />
            {fieldErrors.title && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => {
                setForm({ ...form, location: e.target.value });
                setFieldErrors((prev) => ({ ...prev, location: "" }));
              }}
            />
            {fieldErrors.location && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.location}</p>
            )}
          </div>

          <div>
            <Input
              label="Date & Time"
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => {
                setForm({ ...form, dateTime: e.target.value });
                setFieldErrors((prev) => ({ ...prev, dateTime: "" }));
              }}
            />
            {fieldErrors.dateTime && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.dateTime}</p>
            )}
          </div>

          <div>
            <Input
              label="Capacity"
              type="number"
              value={form.capacity}
              onChange={(e) => {
                setForm({ ...form, capacity: +e.target.value });
                setFieldErrors((prev) => ({ ...prev, capacity: "" }));
              }}
            />
            {fieldErrors.capacity && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.capacity}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={ticketOpen}
        title="🎟️ Raise Event Ticket"
        onClose={() => setTicketOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTicketOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTicket}>Submit Ticket</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">
            Event: <strong>{ticketEvent?.title}</strong>
          </p>

          <div>
            <Input
              label="Full Name"
              value={ticketForm.name}
              onChange={(e) => {
                setTicketForm({ ...ticketForm, name: e.target.value });
                setTicketErrors((p) => ({ ...p, name: "" }));
              }}
            />
            {ticketErrors.name && (
              <p className="text-red-500 text-sm mt-1">{ticketErrors.name}</p>
            )}
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              value={ticketForm.email}
              onChange={(e) => {
                setTicketForm({ ...ticketForm, email: e.target.value });
                setTicketErrors((p) => ({ ...p, email: "" }));
              }}
            />
            {ticketErrors.email && (
              <p className="text-red-500 text-sm mt-1">{ticketErrors.email}</p>
            )}
          </div>

          <div>
            <Input
              label="Phone Number"
              type="tel"
              value={ticketForm.phone}
              onChange={(e) => {
                setTicketForm({ ...ticketForm, phone: e.target.value });
                setTicketErrors((p) => ({ ...p, phone: "" }));
              }}
            />
            {ticketErrors.phone && (
              <p className="text-red-500 text-sm mt-1">{ticketErrors.phone}</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={adminTicketOpen}
        title="🎟️ Ticket Requests"
        onClose={() => setAdminTicketOpen(false)}
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAdminTicketOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No ticket requests yet.</p>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-gray-200 p-4 space-y-1"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-sm text-gray-500">
                      {t.email} • {t.phone}
                    </p>
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

    </div>
  );
}