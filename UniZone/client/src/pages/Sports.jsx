import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import TextArea from "../components/TextArea";
import { useAuth } from "../auth/AuthContext";

export default function Sports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";
  const showJoinLeave = isStudent; // only students/clients can Join/Leave, admin/staff do not

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState("created_desc");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState("");
  const [sportNameError, setSportNameError] = useState("");
  const [maxPlayersError, setMaxPlayersError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [playerModalSport, setPlayerModalSport] = useState(null);
  const [students, setStudents] = useState([]);
  const [playerForm, setPlayerForm] = useState({ studentId: "", role: "Player", jerseyNumber: "", notes: "" });
  const [playerErrors, setPlayerErrors] = useState({ studentId: "", role: "", jerseyNumber: "", notes: "", general: "" });
  const [playerSubmitting, setPlayerSubmitting] = useState(false);

  const [joiningStates, setJoiningStates] = useState({});
  const [joinErrors, setJoinErrors] = useState({});
  const [form, setForm] = useState({ name: "", maxPlayers: 30, teamSizeCategory: "", status: "Active", description: "" });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const normalizeSportName = (name) => (name || "").trim().replace(/\s+/g, " ");

  const normalizeSearchInput = (value) => {
    if (!value) return "";
    let normalized = String(value).trim().replace(/\s+/g, " ");
    if (normalized.length > 30) normalized = normalized.slice(0, 30);
    return normalized;
  };


  const validateSportName = (name, sports, editingSportId = null) => {
    const normalized = normalizeSportName(name);

    if (!normalized) return "Sport name is required";
    if (normalized.length < 3) return "Sport name must be at least 3 characters";
    if (normalized.length > 30) return "Sport name must be at most 30 characters";
    if (!/^[A-Za-z ]+$/.test(normalized)) return "Sport name can contain only letters and spaces";

    const match = (sports || []).find((item) => {
      if (!item?.name) return false;
      if (editingSportId && item._id === editingSportId) return false;
      return item.name.trim().toLowerCase() === normalized.toLowerCase();
    });
    if (match) return "Sport name already exists";

    return "";
  };

  const validateMaxPlayers = (value, currentPlayers = 0) => {
    const strValue = String(value || "").trim();

    if (!strValue) return "Max players is required";

    const num = Number(strValue);
    if (isNaN(num)) return "Max players must be a whole number";
    if (!Number.isInteger(num)) return "Max players must be a whole number";
    if (num < 1) return "Max players must be greater than 0";
    if (num > 100) return "Max players cannot exceed 100";
    if (editing && num < currentPlayers) return "Max players cannot be less than current players";

    return "";
  };

  const validatePlayerSelection = (value) => {
    if (!value) return "Student is required";
    return "";
  };

  const validatePlayerRole = (value) => {
    if (!value) return "Player role is required";
    return "";
  };

  const validateJerseyNumber = (value) => {
    if (!value) return "";
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) return "Jersey number must be a whole number";
    if (num < 1) return "Jersey number must be greater than 0";
    if (num > 999) return "Jersey number must be 999 or less";
    return "";
  };

  const canRegisterPlayer = (sport, studentId) => {
    if (!sport || !studentId) return false;
    const currentPlayers = sport.players?.length || 0;
    if (currentPlayers >= sport.maxPlayers) return false;
    const alreadyAdded = (sport.players || []).some((p) => String(p?._id || p) === String(studentId));
    return !alreadyAdded;
  };


  const canJoinSport = (sport) => {
    if (!user) return false;
    const currentPlayers = sport.players?.length || 0;
    const isFull = currentPlayers >= (sport.maxPlayers || 0);
    const alreadyJoined = (sport.players || []).some(p => p._id === user._id);
    return !isFull && !alreadyJoined;
  };

  const getJoinButtonState = (sport) => {
    const isJoining = joiningStates[sport._id] || false;
    const alreadyJoined = (sport.players || []).some(p => p._id === user._id);
    const currentPlayers = sport.players?.length || 0;
    const isFull = currentPlayers >= (sport.maxPlayers || 0);

    if (isJoining) return { disabled: true, text: "Joining..." };
    if (alreadyJoined) return { disabled: true, text: "Joined" };
    if (isFull) return { disabled: true, text: "Full" };
    if (!user) return { disabled: true, text: "Join" };
    return { disabled: false, text: "Join" };
  };

  const load = async () => {
    setLoading(true);
    setJoinErrors({});
    const res = await api.get("/sports");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!isStaff) return;
      try {
        const res = await api.get('/users');
        setStudents((res.data || []).filter((u) => u.role === 'student'));
      } catch (error) {
        console.error('Unable to load students', error);
      }
    };

    loadStudents();
  }, [isStaff]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(normalizeSearchInput(q));
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);


  const onCreate = () => {
    setForm({ name: "", maxPlayers: 30, teamSizeCategory: "", status: "Active", description: "" });
    setEditing(null);
    setErr("");
    setSportNameError("");
    setMaxPlayersError("");
    setCategoryError("");
    setStatusError("");
    setDescriptionError("");
    setOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      maxPlayers: row.maxPlayers || 30,
      teamSizeCategory: row.teamSizeCategory || "",
      status: row.status || "Active",
      description: row.description || ""
    });
    setErr("");
    setSportNameError("");
    setMaxPlayersError("");
    setCategoryError("");
    setStatusError("");
    setDescriptionError("");
    setOpen(true);
  };

  const onOpenPlayerModal = (sport) => {
    setPlayerModalSport(sport);
    setPlayerForm({ studentId: "", role: "Player", jerseyNumber: "", notes: "" });
    setPlayerErrors({ studentId: "", role: "", jerseyNumber: "", notes: "", general: "" });
    setPlayerModalOpen(true);
  };

  const onClosePlayerModal = () => {
    setPlayerModalOpen(false);
    setPlayerModalSport(null);
  };


  const onSportNameChange = (value) => {
    const updatedForm = { ...form, name: value };
    setForm(updatedForm);
    setSportNameError(validateSportName(value, items, editing?._id));
  };

  const onSportNameBlur = () => {
    const normalized = normalizeSportName(form.name);
    setForm({ ...form, name: normalized });
    setSportNameError(validateSportName(normalized, items, editing?._id));
  };

  const onMaxPlayersChange = (value) => {
    const currentPlayers = editing?.players?.length || 0;
    setForm({ ...form, maxPlayers: value === "" ? "" : +value });
    setMaxPlayersError(validateMaxPlayers(value, currentPlayers));
  };

  const onMaxPlayersBlur = () => {
    const currentPlayers = editing?.players?.length || 0;
    const strValue = String(form.maxPlayers || "").trim();
    const num = isNaN(Number(strValue)) ? "" : Math.trunc(Number(strValue));
    setForm({ ...form, maxPlayers: num });
    setMaxPlayersError(validateMaxPlayers(num, currentPlayers));
  };

  const save = async () => {
    const normalized = normalizeSportName(form.name);
    const validationErrorName = validateSportName(normalized, items, editing?._id);
    const currentPlayers = editing?.players?.length || 0;
    const validationErrorMaxPlayers = validateMaxPlayers(form.maxPlayers, currentPlayers);
    const validationErrorCategory = !form.teamSizeCategory ? "Team Size Category is required" : "";
    const validationErrorStatus = !form.status ? "Status is required" : "";
    const validationErrorDescription = form.description && normalizeSportName(form.description).length > 20 ? "Description must not exceed 20 characters" : "";

    if (validationErrorName) {
      setSportNameError(validationErrorName);
      return;
    }
    if (validationErrorMaxPlayers) {
      setMaxPlayersError(validationErrorMaxPlayers);
      return;
    }
    if (validationErrorCategory) {
      setCategoryError(validationErrorCategory);
      return;
    }
    if (validationErrorStatus) {
      setStatusError(validationErrorStatus);
      return;
    }
    if (validationErrorDescription) {
      setDescriptionError(validationErrorDescription);
      return;
    }

    try {
      setErr("");
      setSubmitting(true);
      const payload = {
        ...form,
        name: normalized,
        maxPlayers: Math.trunc(form.maxPlayers),
        description: form.description ? form.description.trim() : ""
      };
      if (editing) await api.put(`/sports/${editing._id}`, payload);
      else await api.post("/sports", payload);
      setOpen(false);
      setEditing(null);
      setForm({ name: "", maxPlayers: 30, teamSizeCategory: "", status: "Active", description: "" });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const registerPlayer = async () => {
    if (!playerModalSport) return;

    const studentIdError = validatePlayerSelection(playerForm.studentId);
    const roleError = validatePlayerRole(playerForm.role);
    const jerseyError = validateJerseyNumber(playerForm.jerseyNumber);

    if (studentIdError || roleError || jerseyError) {
      setPlayerErrors((prev) => ({ ...prev, studentId: studentIdError, role: roleError, jerseyNumber: jerseyError }));
      return;
    }

    if (!canRegisterPlayer(playerModalSport, playerForm.studentId)) {
      setPlayerErrors((prev) => ({ ...prev, general: "Cannot register player: already registered or sport is full." }));
      return;
    }

    if ((playerModalSport.players || []).length >= (playerModalSport.maxPlayers || 0)) {
      setPlayerErrors((prev) => ({ ...prev, general: "Cannot register player because the sport is full." }));
      return;
    }

    try {
      setPlayerSubmitting(true);
      setPlayerErrors((prev) => ({ ...prev, general: "" }));

      await api.post(`/sports/${playerModalSport._id}/register`, {
        studentId: playerForm.studentId,
        role: playerForm.role,
        jerseyNumber: playerForm.jerseyNumber ? Number(playerForm.jerseyNumber) : undefined,
        notes: playerForm.notes?.trim(),
      });

      onClosePlayerModal();
      load();
    } catch (e) {
      setPlayerErrors((prev) => ({ ...prev, general: e.response?.data?.message || "Player registration failed" }));
    } finally {
      setPlayerSubmitting(false);
    }
  };


  const del = async (id) => {
    if (!confirm("Delete this sport?")) return;
    await api.delete(`/sports/${id}`);
    load();
  };

  const join = async (id) => {
    const sport = items.find(s => s._id === id);
    if (!sport) return;

    if (!canJoinSport(sport)) {
      setJoinErrors({ ...joinErrors, [id]: "Cannot join this sport" });
      return;
    }

    try {
      setJoinErrors({ ...joinErrors, [id]: "" });
      setJoiningStates({ ...joiningStates, [id]: true });

      // Optimistic UI update
      const updatedItems = items.map(s =>
        s._id === id
          ? { ...s, players: [...(s.players || []), user] }
          : s
      );
      setItems(updatedItems);

      const res = await api.post(`/sports/${id}/join`);

      // Sync with backend response if available
      if (res.data) {
        const syncedItems = items.map(s =>
          s._id === id ? res.data : s
        );
        setItems(syncedItems);
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Join failed";
      setJoinErrors({ ...joinErrors, [id]: errorMsg });

      // Revert optimistic update on error
      load();
    } finally {
      setJoiningStates({ ...joiningStates, [id]: false });
    }
  };

  const leave = async (id) => {
    try {
      setJoinErrors({ ...joinErrors, [id]: "" });
      await api.post(`/sports/${id}/leave`);
      load();
    } catch (e) {
      setJoinErrors({ ...joinErrors, [id]: e.response?.data?.message || "Leave failed" });
    }
  };

  const filtered = useMemo(() => {
    let out = [...items];

    if (debouncedQ) {
      const qq = debouncedQ.toLowerCase();
      out = out.filter(x => {
        const sportName = (x?.name || "").trim().toLowerCase();
        return sportName.includes(qq);
      });
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

    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      out = out.filter(x => new Date(x.createdAt) >= s);
    }

    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      out = out.filter(x => new Date(x.createdAt) <= e);
    }

    out.sort((a, b) => {
      if (sort === "created_desc") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "created_asc") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sort === "name_desc") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

    return out;
  }, [items, debouncedQ, size, sort]);

  const isSportNameValid = !validateSportName(form.name, items, editing?._id);
  const sportNameBorderClass = sportNameError
    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
    : form.name
      ? "border-green-500 focus:border-green-500 focus:ring-green-100"
      : "";

  const isMaxPlayersValid = !validateMaxPlayers(form.maxPlayers, editing?.players?.length || 0);
  const maxPlayersBorderClass = maxPlayersError
    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
    : form.maxPlayers
      ? "border-green-500 focus:border-green-500 focus:ring-green-100"
      : "";

  const isCategoryValid = !!form.teamSizeCategory;
  const isStatusValid = !!form.status;
  const isDescriptionValid = !form.description || form.description.trim().length <= 20;

  const isFormValid = isSportNameValid && isMaxPlayersValid && isCategoryValid && isStatusValid && isDescriptionValid;

  return (
    <PageShell
      title="Sports Management"
      subtitle="Discover, join, and manage campus sports activities"
      right={(
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/sports/equipment')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 border-none !px-6 !py-3 rounded-2xl transform active:scale-95 transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">⚾</span> Equipment Booking
            </span>
          </Button>
          {isStaff && (
            <Button
              onClick={onCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 border-none !px-6 !py-3 rounded-2xl transform active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">+</span> New Sport
              </span>
            </Button>
          )}
        </div>
      )}
    >
      <Card glass className="mb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Input
              label="Search (name)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cricket, Football..."
              maxLength={30}
            />
            {q.length >= 28 && (
              <p className="mt-1 text-xs text-slate-500">{q.length}/30</p>
            )}
          </div>
          <Select label="Team Size" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="all">All</option>
            <option value="small">Small (≤ 15)</option>
            <option value="medium">Medium (16–30)</option>
            <option value="large">Large (30+)</option>
          </Select>
          <Select label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="created_desc">Newest</option>
            <option value="created_asc">Oldest</option>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
          </Select>
          <div className="lg:col-span-1">
            <Input
              label="First Date"
              type="date"
              value={startDate}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                if (endDate && val > endDate) setEndDate("");
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <Input
              label="Last Date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        {err && !open && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-sm font-medium text-red-700">{err}</p>
          </div>
        )}
      </Card>

      <div className="mt-6">
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState title="No sports found" subtitle="Try a different search or filter." />
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((sport) => {
              const buttonState = getJoinButtonState(sport);
              const joinError = joinErrors[sport._id];
              const currentPlayers = sport.players?.length || 0;
              const maxPlayers = sport.maxPlayers || 0;
              const capacityPercent = maxPlayers > 0 ? Math.round((currentPlayers / maxPlayers) * 100) : 0;
              const alreadyJoined = (sport.players || []).some(p => p._id === user?._id);

              return (
                <Card
                  key={sport._id}
                  className="group flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2 transform transition-all duration-500 sports-card-dark rounded-[32px] overflow-hidden"
                >
                  {/* Decorative Gradient Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="relative p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-2xl font-black text-white flex-1 truncate group-hover:text-blue-400 transition-colors tracking-tight">
                          {sport.name}
                        </h3>
                        <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg ${sport.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                          }`}>
                          {sport.status}
                        </span>
                      </div>
                      {sport.teamSizeCategory && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-white/5 w-fit px-3 py-1 rounded-xl border border-white/5 uppercase tracking-wider">
                          <span className="opacity-70">📋</span> {sport.teamSizeCategory}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {sport.description && (
                      <p className="text-sm text-slate-400 mb-8 line-clamp-2 leading-relaxed h-10 font-medium italic opacity-80">
                        "{sport.description}"
                      </p>
                    )}

                    {/* Capacity Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Occupancy</span>
                        <span className="text-sm font-black text-white">{currentPlayers} <span className="text-slate-500 font-medium">/ {maxPlayers}</span></span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner p-0.5 border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${capacityPercent >= 90
                            ? "bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/20"
                            : capacityPercent >= 70
                              ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/20"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20"
                            }`}
                          style={{ width: `${capacityPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-3 font-black text-[9px] uppercase tracking-widest">
                        <span className={capacityPercent >= 90 ? "text-red-400" : "text-slate-500"}>
                          {capacityPercent >= 90 ? "⚠️ Almost Full" : "Available"}
                        </span>
                        <span className="text-slate-400">{capacityPercent}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                      {showJoinLeave && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => join(sport._id)}
                            disabled={buttonState.disabled}
                            className={`flex-1 text-xs font-black rounded-xl py-3 shadow-lg transition-all ${!alreadyJoined ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20" : "bg-white/10 text-slate-400 border border-white/10"
                              }`}
                          >
                            {buttonState.text}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => leave(sport._id)}
                            disabled={!alreadyJoined}
                            className="flex-1 text-xs font-black rounded-xl py-3 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            Leave
                          </Button>
                        </div>
                      )}

                      {isStaff && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-blue-500/30 hover:from-cyan-500 hover:to-blue-600 shadow-xl shadow-blue-900/40 text-[10px] font-black uppercase tracking-widest rounded-xl py-2.5"
                            onClick={() => onOpenPlayerModal(sport)}
                          >
                            Players
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-500/30 hover:from-emerald-500 hover:to-teal-600 shadow-xl shadow-emerald-900/40 text-[10px] font-black uppercase tracking-widest rounded-xl py-2.5"
                            onClick={() => onEdit(sport)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => del(sport._id)}
                            className="text-[10px] font-black uppercase tracking-widest col-span-2 rounded-xl py-2.5 opacity-60 hover:opacity-100 transition-opacity"
                          >
                            Delete Sport
                          </Button>
                        </div>
                      )}
                      {joinError && (
                        <p className="text-[10px] font-black text-red-400 bg-red-500/5 border border-red-500/20 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                          {joinError}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "Edit Sport" : "Add New Sport"}
        onClose={() => setOpen(false)}
        footer={(
          <div className="space-y-3">
            {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{err}</p></div>}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={!isFormValid || submitting}>
                {submitting ? "Saving..." : editing ? "Update Sport" : "Create Sport"}
              </Button>
            </div>
          </div>
        )}
      >
        <form onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Sport Name"
                value={form.name}
                onChange={(e) => onSportNameChange(e.target.value)}
                onBlur={onSportNameBlur}
                className={sportNameBorderClass}
              />
              {sportNameError && <p className="mt-1 text-sm text-red-600">{sportNameError}</p>}
            </div>
            <div>
              <Input
                label="Max Players"
                type="number"
                value={form.maxPlayers}
                onChange={(e) => onMaxPlayersChange(e.target.value)}
                onBlur={onMaxPlayersBlur}
                className={maxPlayersBorderClass}
              />
              {maxPlayersError && <p className="mt-1 text-sm text-red-600">{maxPlayersError}</p>}
            </div>
            <div>
              <Select
                label="Team Size Category"
                value={form.teamSizeCategory}
                onChange={(e) => {
                  setForm({ ...form, teamSizeCategory: e.target.value });
                  setCategoryError(e.target.value ? "" : "Team Size Category is required");
                }}
                className={categoryError ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
              >
                <option value="">Select category</option>
                <option value="Individual">Individual</option>
                <option value="Duo">Duo</option>
                <option value="Small Team">Small Team</option>
                <option value="Medium Team">Medium Team</option>
                <option value="Large Team">Large Team</option>
              </Select>
              {categoryError && <p className="mt-1 text-sm text-red-600">{categoryError}</p>}
            </div>
            <div>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => {
                  setForm({ ...form, status: e.target.value });
                  setStatusError(e.target.value ? "" : "Status is required");
                }}
                className={statusError ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
              {statusError && <p className="mt-1 text-sm text-red-600">{statusError}</p>}
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="Description"
                rows={3}
                value={form.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, description: value });
                  setDescriptionError(value.trim().length > 20 ? "Description must not exceed 20 characters" : "");
                }}
              />
              {descriptionError && <p className="mt-1 text-sm text-red-600">{descriptionError}</p>}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={playerModalOpen}
        title="Register Player"
        onClose={onClosePlayerModal}
        footer={(
          <div className="space-y-3">
            {playerErrors.general && <div className="rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm font-medium text-red-700">{playerErrors.general}</p></div>}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClosePlayerModal}>Cancel</Button>
              <Button onClick={registerPlayer} disabled={playerSubmitting || !playerForm.studentId || !playerForm.role || playerErrors.studentId || playerErrors.role || playerErrors.jerseyNumber}>
                {playerSubmitting ? "Saving..." : "Register Player"}
              </Button>
            </div>
          </div>
        )}
      >
        <div className="space-y-5">
          <div className="text-sm text-slate-600">
            {playerModalSport ? `Managing: ${playerModalSport.name} (${(playerModalSport.players || []).length}/${playerModalSport.maxPlayers})` : "Select a sport to manage players"}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input label="Selected Sport" value={playerModalSport?.name || ""} disabled />
            </div>
            <div>
              <Input label="Current Players" value={`${(playerModalSport?.players?.length || 0)} / ${playerModalSport?.maxPlayers || 0}`} disabled />
            </div>
            <div className="sm:col-span-2">
              <Select
                label="Student / Player"
                value={playerForm.studentId}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlayerForm((prev) => ({ ...prev, studentId: value }));
                  setPlayerErrors((prev) => ({ ...prev, studentId: validatePlayerSelection(value) }));
                }}
                className={playerErrors.studentId ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </Select>
              {playerErrors.studentId && <p className="mt-1 text-sm text-red-600">{playerErrors.studentId}</p>}
            </div>
            <div>
              <Select
                label="Player Role"
                value={playerForm.role}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlayerForm((prev) => ({ ...prev, role: value }));
                  setPlayerErrors((prev) => ({ ...prev, role: validatePlayerRole(value) }));
                }}
                className={playerErrors.role ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
              >
                <option value="">Select role</option>
                <option value="Player">Player</option>
                <option value="Captain">Captain</option>
                <option value="Substitute">Substitute</option>
              </Select>
              {playerErrors.role && <p className="mt-1 text-sm text-red-600">{playerErrors.role}</p>}
            </div>
            <div>
              <Input
                label="Jersey Number (optional)"
                type="number"
                value={playerForm.jerseyNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlayerForm((prev) => ({ ...prev, jerseyNumber: value }));
                  setPlayerErrors((prev) => ({ ...prev, jerseyNumber: validateJerseyNumber(value) }));
                }}
                className={playerErrors.jerseyNumber ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
              />
              {playerErrors.jerseyNumber && <p className="mt-1 text-sm text-red-600">{playerErrors.jerseyNumber}</p>}
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="Notes (optional)"
                rows={3}
                value={playerForm.notes}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlayerForm((prev) => ({ ...prev, notes: value }));
                  setPlayerErrors((prev) => ({ ...prev, notes: value.trim().length > 500 ? "Notes should be 500 characters or fewer" : "" }));
                }}
              />
              {playerErrors.notes && <p className="mt-1 text-sm text-red-600">{playerErrors.notes}</p>}
            </div>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}
