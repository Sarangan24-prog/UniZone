import { useEffect, useState, useMemo } from "react";
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

export default function Equipment() {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === "admin" || user?.role === "staff";
  const isStudent = user?.role === "student";

  const [loading, setLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Search & Filters
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  // Modals Data
  const [openEquipModal, setOpenEquipModal] = useState(false);
  const [editingEquip, setEditingEquip] = useState(null);
  const [equipForm, setEquipForm] = useState({ name: "", sportCategory: "", totalQuantity: 1, description: "" });
  const [equipError, setEquipError] = useState("");
  const [submittingEquip, setSubmittingEquip] = useState(false);

  // Booking Modal
  const [openBookingModal, setOpenBookingModal] = useState(false);
  const [bookingEquip, setBookingEquip] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    quantity: 1,
    bookingDate: new Date().toISOString().split("T")[0],
    pickupTime: "10:00",
    returnDate: new Date().toISOString().split("T")[0],
    returnTime: "12:00",
    notes: ""
  });
  const [bookingError, setBookingError] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [eqRes, bkRes] = await Promise.all([
        api.get("/equipment"),
        user ? api.get(isAdminOrStaff ? "/equipment/bookings" : "/equipment/bookings/my") : Promise.resolve({ data: [] })
      ]);
      console.log("📦 Equipment loaded:", eqRes.data);
      console.log("User role:", user?.role);
      setEquipmentList(eqRes.data || []);
      setBookings(bkRes.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
      alert(`Error loading equipment: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [user, isAdminOrStaff]);
  
  useEffect(() => {
    // Reload equipment when page becomes visible
    const handleVisibility = () => {
      if (!document.hidden) {
        console.log("Page visible - reloading equipment...");
        loadData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  // Filtering Equipment
  const filteredEquipment = useMemo(() => {
    console.log("Filtering equipment, total:", equipmentList.length, "search:", debouncedQ);
    if (!debouncedQ) return equipmentList;
    return equipmentList.filter(e => 
      (e.name && e.name.toLowerCase().includes(debouncedQ.toLowerCase())) || 
      (e.sportCategory && e.sportCategory.toLowerCase().includes(debouncedQ.toLowerCase()))
    );
  }, [equipmentList, debouncedQ]);

  // ---- Admin Equipment Management ----
  const onAddEquipment = () => {
    setEquipForm({ name: "", sportCategory: "", totalQuantity: 1, description: "" });
    setEditingEquip(null);
    setEquipError("");
    setOpenEquipModal(true);
  };
  const onEditEquipment = (eq) => {
    setEditingEquip(eq);
    setEquipForm({
      name: eq.name,
      sportCategory: eq.sportCategory,
      totalQuantity: eq.totalQuantity,
      description: eq.description || ""
    });
    setEquipError("");
    setOpenEquipModal(true);
  };
  const saveEquipment = async () => {
    setEquipError("");
    if (!equipForm.name || !equipForm.sportCategory || equipForm.totalQuantity < 1) {
      return setEquipError("Please fill all required fields correctly.");
    }
    try {
      setSubmittingEquip(true);
      if (editingEquip) {
        await api.put(`/equipment/${editingEquip._id}`, equipForm);
        alert(`✅ Equipment "${equipForm.name}" updated successfully!`);
      } else {
        await api.post("/equipment", equipForm);
        alert(`✅ Equipment "${equipForm.name}" added successfully! Now visible to students.`);
      }
      setOpenEquipModal(false);
      loadData();
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to save equipment";
      setEquipError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
      console.error("Save equipment error:", e);
    } finally {
      setSubmittingEquip(false);
    }
  };
  const deleteEquipment = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    try {
      await api.delete(`/equipment/${id}`);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  // ---- Student Booking Management ----
  const onBookEquipment = (eq) => {
    if (eq.availableQuantity < 1) return alert("Out of stock!");
    setBookingEquip(eq);
    setBookingForm({
      quantity: 1,
      bookingDate: new Date().toISOString().split("T")[0],
      pickupTime: "10:00",
      returnDate: new Date().toISOString().split("T")[0],
      returnTime: "12:00",
      notes: ""
    });
    setBookingError("");
    setOpenBookingModal(true);
  };
  const saveBooking = async () => {
    setBookingError("");
    if (bookingForm.quantity < 1 || bookingForm.quantity > bookingEquip.availableQuantity) {
      return setBookingError(`Invalid quantity. Available: ${bookingEquip.availableQuantity}`);
    }
    if (new Date(bookingForm.returnDate) < new Date(bookingForm.bookingDate)) {
      return setBookingError("Return date cannot be before booking date");
    }
    try {
      setSubmittingBooking(true);
      await api.post("/equipment/book", {
        equipmentId: bookingEquip._id,
        ...bookingForm
      });
      setOpenBookingModal(false);
      loadData();
      alert("Booking request submitted!");
    } catch (e) {
      setBookingError(e.response?.data?.message || "Booking failed");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // ---- Admin Status Management ----
  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/equipment/bookings/${bookingId}/status`, { status });
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Status update failed");
    }
  };

  return (
    <PageShell
      title="Equipment Booking"
      subtitle="Reserve sports equipment for your games and practice."
      right={isAdminOrStaff && (
        <Button onClick={onAddEquipment} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl">
          + Add Equipment
        </Button>
      )}
    >
      <Card glass className="mb-8">
        <Input label="Search Equipment" placeholder="Bat, Ball, Nets..." value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      {/* Equipment List */}
      <div className="mb-10">
        <h2 className="text-2xl font-black text-white mb-6">Available Inventory</h2>
        {loading ? <Loading /> : filteredEquipment.length === 0 ? <EmptyState title={equipmentList.length === 0 ? "No equipment added yet" : "No equipment found"} /> : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEquipment.map(eq => {
              const totalQty = eq.totalQuantity || 0;
              const availQty = eq.availableQuantity || 0;
              const capPercent = totalQty > 0 ? (availQty / totalQty) * 100 : 0;
              return (
                <Card key={eq._id} className="group sports-card-dark rounded-[32px] overflow-hidden p-6 flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white tracking-tight break-words">{eq.name || "Unnamed"}</h3>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">{eq.sportCategory || "N/A"}</p>
                    {eq.description && <p className="text-sm text-slate-400 mb-4 line-clamp-2">{eq.description}</p>}
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[10px] font-black uppercase text-slate-500">Stock</span>
                         <span className="text-sm font-black text-white">{availQty} <span className="text-slate-500">/ {totalQty}</span></span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div className={`h-full rounded-full ${capPercent <= 20 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${capPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                    {isStudent && (
                      <Button className="w-full bg-blue-600 font-black rounded-xl" onClick={() => onBookEquipment(eq)} disabled={availQty < 1}>
                        {availQty < 1 ? "Out of Stock" : "Book Now"}
                      </Button>
                    )}
                    {isAdminOrStaff && (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 border-emerald-500/30 text-emerald-400 text-xs" onClick={() => onEditEquipment(eq)}>Edit</Button>
                        <Button variant="danger" className="flex-1 text-xs" onClick={() => deleteEquipment(eq._id)}>Delete</Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      {(bookings.length > 0 || !loading) && (
        <div>
          <h2 className="text-2xl font-black text-white mb-6">{isAdminOrStaff ? "All Booking Requests" : "My Bookings"}</h2>
          {loading ? <Loading /> : bookings.length === 0 ? <EmptyState title="No bookings found" /> : (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white border-collapse">
                  <thead className="bg-white/5 border-b border-white/10 text-xs uppercase font-black tracking-widest text-slate-400">
                    <tr>
                      {isAdminOrStaff && <th className="p-4">User</th>}
                      <th className="p-4">Item (Qty)</th>
                      <th className="p-4">Pickup Date/Time</th>
                      <th className="p-4">Return Date/Time</th>
                      <th className="p-4">Status</th>
                      {isAdminOrStaff && <th className="p-4">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {bookings.map(b => (
                      <tr key={b._id} className="hover:bg-white/5 transition-colors">
                        {isAdminOrStaff && <td className="p-4"><span className="block">{b.user?.name}</span><span className="text-[10px] text-slate-500">{b.user?.studentId}</span></td>}
                        <td className="p-4"><span className="font-bold text-blue-400">{b.equipment?.name}</span> x {b.quantity}</td>
                        <td className="p-4">{new Date(b.bookingDate).toLocaleDateString()} at {b.pickupTime}</td>
                        <td className="p-4">{new Date(b.returnDate).toLocaleDateString()} at {b.returnTime}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border 
                            ${b.status === 'Pending' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
                              b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                              b.status === 'Rejected' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 
                              'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                            {b.status}
                          </span>
                        </td>
                        {isAdminOrStaff && (
                          <td className="p-4 space-x-2">
                            {b.status === 'Pending' && (
                              <>
                                <button className="text-xs bg-emerald-600/30 hover:bg-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors font-black uppercase" onClick={() => updateBookingStatus(b._id, 'Approved')}>Approve</button>
                                <button className="text-xs bg-red-600/30 hover:bg-red-500/50 text-red-400 px-3 py-1.5 rounded-lg transition-colors font-black uppercase" onClick={() => updateBookingStatus(b._id, 'Rejected')}>Reject</button>
                              </>
                            )}
                            {b.status === 'Approved' && (
                              <button className="text-xs bg-blue-600/30 hover:bg-blue-500/50 text-blue-400 px-3 py-1.5 rounded-lg transition-colors font-black uppercase" onClick={() => updateBookingStatus(b._id, 'Returned')}>Mark Returned</button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Equipment Modal (Admin) */}
      <Modal open={openEquipModal} onClose={() => setOpenEquipModal(false)} title={editingEquip ? "Edit Equipment" : "Add Equipment"}
        footer={(
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setOpenEquipModal(false)}>Cancel</Button>
            <Button onClick={saveEquipment} disabled={submittingEquip}>{submittingEquip ? "Saving..." : "Save Equipment"}</Button>
          </div>
        )}>
         {equipError && <div className="mb-4 text-red-500 text-sm">{equipError}</div>}
         <div className="grid grid-cols-2 gap-4">
           <Input label="Name" className="col-span-2" value={equipForm.name} onChange={e => setEquipForm({...equipForm, name: e.target.value})} />
           <Input label="Category (e.g., Cricket)" value={equipForm.sportCategory} onChange={e => setEquipForm({...equipForm, sportCategory: e.target.value})} />
           <Input label="Total Quantity" type="number" min="1" value={equipForm.totalQuantity} onChange={e => setEquipForm({...equipForm, totalQuantity: Number(e.target.value)})} />
           <TextArea label="Description" className="col-span-2" value={equipForm.description} onChange={e => setEquipForm({...equipForm, description: e.target.value})} />
         </div>
      </Modal>

      {/* Booking Modal (Student) */}
      <Modal open={openBookingModal} onClose={() => setOpenBookingModal(false)} title={`Book ${bookingEquip?.name}`}
        footer={(
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setOpenBookingModal(false)}>Cancel</Button>
            <Button onClick={saveBooking} disabled={submittingBooking}>{submittingBooking ? "Booking..." : "Submit Booking Request"}</Button>
          </div>
        )}>
         {bookingError && <div className="mb-4 text-red-500 text-sm">{bookingError}</div>}
         <div className="grid grid-cols-2 gap-4">
           <Input label="Quantity" type="number" min="1" max={bookingEquip?.availableQuantity} value={bookingForm.quantity} onChange={e => setBookingForm({...bookingForm, quantity: Number(e.target.value)})} />
           <div />
           <Input label="Pickup Date" type="date" min={new Date().toISOString().split("T")[0]} value={bookingForm.bookingDate} onChange={e => setBookingForm({...bookingForm, bookingDate: e.target.value})} />
           <Input label="Pickup Time" type="time" value={bookingForm.pickupTime} onChange={e => setBookingForm({...bookingForm, pickupTime: e.target.value})} />
           <Input label="Return Date" type="date" min={bookingForm.bookingDate} value={bookingForm.returnDate} onChange={e => setBookingForm({...bookingForm, returnDate: e.target.value})} />
           <Input label="Return Time" type="time" value={bookingForm.returnTime} onChange={e => setBookingForm({...bookingForm, returnTime: e.target.value})} />
           <TextArea label="Special Requests / Notes" className="col-span-2" value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} />
         </div>
      </Modal>
    </PageShell>
  );
}
