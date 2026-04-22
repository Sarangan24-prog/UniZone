import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Select from "../components/Select";
import TextArea from "../components/TextArea";
import Input from "../components/Input";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import { useAuth } from "../auth/AuthContext";

const TABS = [
  { id: 0, label: 'Hostel', icon: '🏢' },
  { id: 1, label: 'ID Card', icon: '🪪' },
  { id: 2, label: 'Certificates', icon: '📜' },
  { id: 3, label: 'Complaints', icon: '📢' },
  { id: 4, label: 'Lost & Found', icon: '🔍' },
  { id: 5, label: 'General Services', icon: '⚙️' }
];

const ENDPOINTS = ['hostel', 'idcard', 'certificate', 'complaint', 'lostfound', ''];

export default function Services() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitErr, setSubmitErr] = useState("");
  const [errors, setErrors] = useState({});

  const [hostelForm, setHostelForm] = useState({ roomType: "Single", duration: 1 });
  const [idCardForm, setIdCardForm] = useState({ 
    reason: "New", 
    fullName: "",
    studentId: "",
    department: "",
    batch: "",
    phone: "",
    nicNumber: "",
    lossDate: "",
    lossLocation: "",
    file: null
  });
  const [certForm, setCertForm] = useState({ type: "Transcript", description: "" });
  const [complaintForm, setComplaintForm] = useState({ subject: "", description: "" });
  const [lostFoundForm, setLostFoundForm] = useState({ type: "Lost", itemName: "", description: "", location: "", date: "", contactInfo: "" });
  const [genericForm, setGenericForm] = useState({ category: "", description: "" });
  const [newCatForm, setNewCatForm] = useState({ name: "", description: "" });

  // Clear errors when tab switches
  useEffect(() => {
    setErrors({});
    setSubmitErr("");
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !genericForm.category) {
        setGenericForm(prev => ({ ...prev, category: res.data[0].name }));
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const load = async (tabIdx = activeTab) => {
    setLoading(true);
    setSubmitErr("");
    const endpoint = ENDPOINTS[tabIdx];
    try {
      let url = `/services/${endpoint}`;
      if (isStudent && endpoint !== 'lostfound') {
        url += (endpoint === '' ? 'mine' : '/mine');
      }
      url = url.replace('//', '/');
      const res = await api.get(url);
      setItems(res.data);
    } catch (e) {
      setSubmitErr(e.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(activeTab); 
    if (activeTab === 5) loadCategories();
  }, [activeTab]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const err = (field, msg) => {
      newErrors[field] = msg;
      isValid = false;
    };

    switch (activeTab) {
      case 0:
        if (!hostelForm.roomType) err("roomType", "Please select a room type.");
        if (hostelForm.duration < 1 || hostelForm.duration > 8 || isNaN(hostelForm.duration)) {
            err("duration", "Duration must be between 1 and 8 semesters.");
        }
        break;
      case 1:
        if (!idCardForm.reason) err("reason", "Please select a reason.");
        if (!idCardForm.fullName) err("fullName", "Full Name is required.");
        
        if (idCardForm.reason === "New") {
          if (!idCardForm.department || idCardForm.department.trim().length < 2) err("department", "Specify your department.");
          if (!/^\d{4}(\/\d{2,4})?$/.test(idCardForm.batch)) err("batch", "Enter a valid batch/year (e.g. 2022 or 2022/23).");
          
          const phone = (idCardForm.phone || "").trim();
          if (!/^\d{10}$/.test(phone)) err("phone", "Enter a valid 10-digit phone number (e.g. 0712345678).");
          
          const nic = (idCardForm.nicNumber || "").trim();
          if (!/^(\d{9}[vVxX]|\d{12})$/.test(nic)) err("nicNumber", "Enter a valid NIC (9 digits + V/X or 12 digits).");
          
          if (!idCardForm.file) {
            err("file", "A profile picture is required for new ID cards.");
          } else if (idCardForm.file.size > 10 * 1024 * 1024) {
            err("file", "Photo must be smaller than 10MB.");
          } else if (!['image/jpeg', 'image/jpg', 'image/png'].includes(idCardForm.file.type)) {
            err("file", "Only JPG, JPEG, and PNG images are allowed for profile photos.");
          }
        } else if (idCardForm.reason === "Lost") {
          const studentId = (idCardForm.studentId || "").trim();
          if (!/^[a-zA-Z0-9-]{5,15}$/.test(studentId)) err("studentId", "Enter a valid Student ID (5-15 alphanumeric chars).");

          if (!idCardForm.lossDate) {
              err("lossDate", "Date of loss is required.");
          } else if (new Date(idCardForm.lossDate) > new Date()) {
              err("lossDate", "Date of loss cannot be in the future.");
          }
          if (!idCardForm.lossLocation || idCardForm.lossLocation.trim().length < 3) err("lossLocation", "Specify where you lost your ID (min 3 chars).");
          
          if (!idCardForm.file) {
            err("file", "Police report or affidavit scan is required.");
          } else if (idCardForm.file.size > 10 * 1024 * 1024) {
            err("file", "Document must be smaller than 10MB.");
          }
        }
        break;
      case 2:
        if (!certForm.type) err("type", "Please select a certificate type.");
        if (certForm.type === "Other" && (!certForm.description || certForm.description.trim().length < 5)) {
          err("certDesc", "A description of at least 5 characters is required for 'Other' type.");
        }
        break;
      case 3:
        if (!complaintForm.subject || complaintForm.subject.trim().length < 5) {
            err("subject", "Subject must be at least 5 characters long.");
        }
        if (!complaintForm.description || complaintForm.description.trim().length < 20) {
            err("complaintDesc", "Please provide a detailed description (minimum 20 characters).");
        }
        break;
      case 4:
        if (!lostFoundForm.type) err("lfType", "Please specify if lost or found.");
        if (!lostFoundForm.itemName || lostFoundForm.itemName.trim().length < 3) {
            err("itemName", "Item name must be at least 3 characters.");
        }
        if (!lostFoundForm.location || lostFoundForm.location.trim().length < 3) {
            err("location", "Location is required (min 3 characters).");
        }
        
        if (!lostFoundForm.date) {
            err("date", "Date is required.");
        } else {
           const selectedDate = new Date(lostFoundForm.date);
           const today = new Date();
           today.setHours(0,0,0,0);
           if (selectedDate > today) err("date", "Date cannot be in the future.");
        }

        if (!lostFoundForm.contactInfo || lostFoundForm.contactInfo.trim().length < 5) {
          err("contact", "Please provide valid contact info (email or phone).");
        }
        break;
      case 5:
        if (!genericForm.category) err("category", "Please select a valid category.");
        if (!genericForm.description || genericForm.description.trim().length < 10) {
            err("genDesc", "Please describe your request in detail (min 10 characters).");
        }
        break;
      default: break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const clearErr = (field) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitErr("Please fix the highlighted errors in the form before submitting.");
      return;
    }

    setSubmitErr("");
    const endpoint = ENDPOINTS[activeTab];
    let payload = {};
    if (activeTab === 0) payload = hostelForm;
    if (activeTab === 1) {
      payload = new FormData();
      // Only send fields applicable to the selected reason to avoid backend casting errors
      const commonFields = ['reason', 'fullName', 'studentId'];
      const newFields = ['department', 'batch', 'phone', 'nicNumber'];
      const lostFields = ['lossDate', 'lossLocation'];
      
      const relevantKeys = [...commonFields, ...(idCardForm.reason === 'New' ? newFields : lostFields)];
      
      relevantKeys.forEach(key => {
        if (idCardForm[key]) payload.append(key, idCardForm[key]);
      });

      if (idCardForm.file) {
        payload.append('attachment', idCardForm.file);
      }
    }
    if (activeTab === 2) payload = certForm;
    if (activeTab === 3) payload = complaintForm;
    if (activeTab === 4) payload = lostFoundForm;
    if (activeTab === 5) payload = genericForm;

    try {
      const config = activeTab === 1 ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      await api.post(`/services/${endpoint}`.replace('//', '/'), payload, config);
      if (activeTab === 0) setHostelForm({ roomType: "Single", duration: 1 });
      if (activeTab === 1) setIdCardForm({ 
        reason: "New", fullName: "", studentId: "", department: "", batch: "", phone: "", nicNumber: "", lossDate: "", lossLocation: "", file: null
      });
      if (activeTab === 2) setCertForm({ type: "Transcript", description: "" });
      if (activeTab === 3) setComplaintForm({ subject: "", description: "" });
      if (activeTab === 4) setLostFoundForm({ type: "Lost", itemName: "", description: "", location: "", date: "", contactInfo: "" });
      if (activeTab === 5) setGenericForm({ category: categories[0]?.name || "", description: "" });
      load(activeTab);
    } catch (e) {
      setSubmitErr(e.response?.data?.message || "Submit failed. Please try again.");
    }
  };

  const handleAddCategory = async () => {
    if (newCatForm.name.trim().length < 3) {
      setErrors({ adminCatName: "Category name must be at least 3 characters." });
      return;
    }
    setSubmitErr("");
    try {
      await api.post('/categories', newCatForm);
      setNewCatForm({ name: "", description: "" });
      loadCategories();
    } catch(e) {
      setSubmitErr(e.response?.data?.message || "Failed to create category");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const endpoint = ENDPOINTS[activeTab];
    try {
      await api.put(`/services/${endpoint}/${id}`.replace('//', '/'), { status: newStatus });
      load(activeTab);
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const renderForm = () => {
    if (!isStudent && activeTab !== 4 && activeTab !== 5) return null;

    let content = null;
    let buttonAction = handleSubmit;
    let buttonLabel = `Submit ${TABS.find(t=>t.id===activeTab).label} Request`;

    // Admin view
    if (!isStudent && activeTab === 5) {
      content = (
        <div className="grid gap-4">
          <Input 
             label="New Category Name" 
             value={newCatForm.name} 
             error={errors.adminCatName}
             onChange={e => { setNewCatForm({...newCatForm, name: e.target.value}); clearErr('adminCatName'); }} 
             placeholder="e.g. Gym Maintenance" 
          />
          <TextArea 
             label="Category Description (Optional)" 
             rows={2} 
             value={newCatForm.description} 
             onChange={e => setNewCatForm({...newCatForm, description: e.target.value})} 
          />
        </div>
      );
      buttonAction = handleAddCategory;
      buttonLabel = "Create Service Category";
    } else {
      switch (activeTab) {
        case 0:
          content = (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Room Type" value={hostelForm.roomType} error={errors.roomType} onChange={e => { setHostelForm({...hostelForm, roomType: e.target.value}); clearErr('roomType'); }}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Shared">Shared</option>
              </Select>
              <Input type="number" label="Duration (Semesters, 1-8)" min="1" max="8" value={hostelForm.duration} error={errors.duration} onChange={e => { setHostelForm({...hostelForm, duration: parseInt(e.target.value) || ""}); clearErr('duration'); }} />
            </div>
          );
          break;
        case 1:
          content = (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Application Reason" value={idCardForm.reason} error={errors.reason} onChange={e => { setIdCardForm({...idCardForm, reason: e.target.value}); clearErr('reason'); }}>
                <option value="New">New ID Card</option>
                <option value="Lost">Lost ID Card Replacement</option>
              </Select>
              <Input label="Full Name" value={idCardForm.fullName} error={errors.fullName} onChange={e => { setIdCardForm({...idCardForm, fullName: e.target.value}); clearErr('fullName'); }} placeholder="Enter your full name" />
              
              {idCardForm.reason === "New" ? (
                <>
                  <Input label="Department" value={idCardForm.department} error={errors.department} onChange={e => { setIdCardForm({...idCardForm, department: e.target.value}); clearErr('department'); }} />
                  <Input label="Batch/Year" value={idCardForm.batch} error={errors.batch} onChange={e => { setIdCardForm({...idCardForm, batch: e.target.value}); clearErr('batch'); }} />
                  <Input label="Phone Number" value={idCardForm.phone} error={errors.phone} onChange={e => { setIdCardForm({...idCardForm, phone: e.target.value}); clearErr('phone'); }} />
                  <Input label="National ID (NIC)" value={idCardForm.nicNumber} error={errors.nicNumber} onChange={e => { setIdCardForm({...idCardForm, nicNumber: e.target.value}); clearErr('nicNumber'); }} />
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Profile Photo (Passport size)</label>
                    <label className={`group relative flex flex-col items-center justify-center w-full min-h-[120px] rounded-[24px] border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                      idCardForm.file 
                        ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_30px_rgba(37,99,235,0.1)]' 
                        : errors.file 
                          ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={e => { setIdCardForm({...idCardForm, file: e.target.files[0]}); clearErr('file'); }}
                      />
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 ${idCardForm.file ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                          {idCardForm.file ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          )}
                        </div>
                        <p className={`text-sm font-bold tracking-tight mb-1 ${idCardForm.file ? 'text-blue-400' : 'text-white'}`}>
                          {idCardForm.file ? idCardForm.file.name : 'Click to upload your photo'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                          {idCardForm.file ? `${(idCardForm.file.size / 1024 / 1024).toFixed(2)} MB` : 'PNG or JPG (Max. 10MB)'}
                        </p>
                      </div>
                    </label>
                    {errors.file && <p className="mt-2 text-[10px] text-red-500 font-bold px-2">{errors.file}</p>}
                  </div>
                </>
              ) : (
                <>
                  <Input label="Student ID" value={idCardForm.studentId} error={errors.studentId} onChange={e => { setIdCardForm({...idCardForm, studentId: e.target.value}); clearErr('studentId'); }} placeholder="e.g. STU12345" />
                  <Input type="date" label="Date of Loss" value={idCardForm.lossDate} error={errors.lossDate} onChange={e => { setIdCardForm({...idCardForm, lossDate: e.target.value}); clearErr('lossDate'); }} />
                  <Input label="Location Where Lost" value={idCardForm.lossLocation} error={errors.lossLocation} onChange={e => { setIdCardForm({...idCardForm, lossLocation: e.target.value}); clearErr('lossLocation'); }} />
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Police Report / Affidavit (Scan/PDF)</label>
                    <label className={`group relative flex flex-col items-center justify-center w-full min-h-[120px] rounded-[24px] border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                      idCardForm.file 
                        ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                        : errors.file 
                          ? 'border-red-500/50 bg-red-500/5 hover:bg-red-500/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={e => { setIdCardForm({...idCardForm, file: e.target.files[0]}); clearErr('file'); }}
                      />
                      <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 ${idCardForm.file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                          {idCardForm.file ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          )}
                        </div>
                        <p className={`text-sm font-bold tracking-tight mb-1 ${idCardForm.file ? 'text-emerald-400' : 'text-white'}`}>
                          {idCardForm.file ? idCardForm.file.name : 'Click to upload your documents'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                          {idCardForm.file ? `${(idCardForm.file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF or Image (Max. 10MB)'}
                        </p>
                      </div>
                    </label>
                    {errors.file && <p className="mt-2 text-[10px] text-red-500 font-bold px-2">{errors.file}</p>}
                  </div>
                </>
              )}
            </div>
          );
          break;
        case 2:
          content = (
            <div className="grid gap-4">
              <div className="w-full sm:w-1/2">
                <Select label="Certificate Type" value={certForm.type} error={errors.type} onChange={e => { setCertForm({...certForm, type: e.target.value}); clearErr('type'); }}>
                  {['Transcript', 'Bonafide', 'Conduct', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                </Select>
              </div>
              <TextArea label="Description (Required if 'Other')" rows={3} value={certForm.description} error={errors.certDesc} onChange={e => { setCertForm({...certForm, description: e.target.value}); clearErr('certDesc'); }}/>
            </div>
          );
          break;
        case 3:
          content = (
            <div className="grid gap-4">
              <Input label="Subject" value={complaintForm.subject} error={errors.subject} onChange={e => { setComplaintForm({...complaintForm, subject: e.target.value}); clearErr('subject'); }} />
              <TextArea label="Description (min 20 chars)" rows={4} value={complaintForm.description} error={errors.complaintDesc} onChange={e => { setComplaintForm({...complaintForm, description: e.target.value}); clearErr('complaintDesc'); }}/>
            </div>
          );
          break;
        case 4:
          content = (
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Report Type" value={lostFoundForm.type} error={errors.lfType} onChange={e => { setLostFoundForm({...lostFoundForm, type: e.target.value}); clearErr('lfType'); }}>
                <option value="Lost">I Lost Something</option>
                <option value="Found">I Found Something</option>
              </Select>
              <Input label="Item Name" value={lostFoundForm.itemName} error={errors.itemName} onChange={e => { setLostFoundForm({...lostFoundForm, itemName: e.target.value}); clearErr('itemName'); }} />
              <Input label="Location" value={lostFoundForm.location} error={errors.location} onChange={e => { setLostFoundForm({...lostFoundForm, location: e.target.value}); clearErr('location'); }} />
              <Input type="date" label="Date" value={lostFoundForm.date} error={errors.date} onChange={e => { setLostFoundForm({...lostFoundForm, date: e.target.value}); clearErr('date'); }} />
              <Input label="Contact Email or Phone" value={lostFoundForm.contactInfo} error={errors.contact} onChange={e => { setLostFoundForm({...lostFoundForm, contactInfo: e.target.value}); clearErr('contact'); }} />
              <TextArea className="sm:col-span-2" label="Description" rows={3} value={lostFoundForm.description} onChange={e => setLostFoundForm({...lostFoundForm, description: e.target.value})}/>
            </div>
          );
          break;
        case 5:
          content = (
            <div className="grid gap-4">
              {categories.length === 0 ? (
                <p className="text-yellow-400 text-sm">No service categories available yet. Admins must create them first.</p>
              ) : (
                <>
                  <Select label="Service Category" value={genericForm.category} error={errors.category} onChange={e => { setGenericForm({...genericForm, category: e.target.value}); clearErr('category'); }}>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </Select>
                  <TextArea label="Detailed Description (min 10 chars)" rows={4} value={genericForm.description} error={errors.genDesc} onChange={e => { setGenericForm({...genericForm, description: e.target.value}); clearErr('genDesc'); }} />
                </>
              )}
            </div>
          );
          break;
        default: return null;
      }
    }

    if (activeTab === 5 && categories.length === 0 && isStudent) return null;

    return (
      <Card glass className="mb-8 border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.15)] ring-1 ring-white/10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">
             {activeTab === 5 && !isStudent ? 'Admin Configuration' : `File a New ${TABS.find(t=>t.id===activeTab).label}`}
          </h2>
          <p className="text-slate-400 text-sm">
             {activeTab === 5 && !isStudent ? 'Create custom service categories for students to request.' : 'Fill out the form below. Errors will highlight in red if any invalid fields are detected.'}
          </p>
        </div>
        {content}
        {submitErr && (
            <div className="mt-5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 animate-in zoom-in-95 font-semibold">
                <p className="text-sm text-red-500 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {submitErr}
                </p>
            </div>
        )}
        <Button className="mt-6 font-bold tracking-wide" onClick={buttonAction}>{buttonLabel}</Button>
      </Card>
    );
  };

  const renderItems = () => {
    if (loading) return <div className="py-20 flex justify-center"><Loading /></div>;
    
    let adminCategoriesView = null;
    if (activeTab === 5 && !isStudent && categories.length > 0) {
      adminCategoriesView = (
        <div className="mb-10">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {categories.map(cat => (
              <Card key={cat._id} glass className="flex flex-col h-full hover:border-white/20 transition-all shadow-lg hover:shadow-blue-500/10">
                <h3 className="text-white font-bold text-lg mb-1">{cat.name}</h3>
                <p className="text-slate-400 text-sm">{cat.description || 'No description provided'}</p>
              </Card>
            ))}
          </div>
        </div>
      );
    }
    
    if (items.length === 0) {
      return (
        <>
          {adminCategoriesView}
          <EmptyState title="No items found" subtitle="There are currently no relevant requests to display."/>
        </>
      );
    }

    return (
      <>
       {adminCategoriesView}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(item => (
          <Card key={item._id} glass className="flex flex-col h-full hover:border-white/30 transition-all hover:-translate-y-1 shadow-md hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="flex justify-between items-start mb-4 gap-2 border-b border-white/5 pb-3">
              <h3 className="text-white font-bold text-base truncate flex-1 leading-tight">
                {activeTab === 0 && `Hostel: ${item.roomType} Room`}
                {activeTab === 1 && `ID Card: ${item.reason}`}
                {activeTab === 2 && `Certificate: ${item.type}`}
                {activeTab === 3 && item.subject}
                {activeTab === 4 && item.itemName}
                {activeTab === 5 && `Service: ${item.category}`}
              </h3>
              <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded text-center tracking-widest flex-shrink-0 border ${
                ['open', 'active'].includes(item.status) ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                ['approved', 'completed', 'resolved'].includes(item.status) ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }`}>
                {item.status}
              </span>
            </div>
            
            <div className="text-slate-300 text-sm mb-5 flex-1">
              {activeTab === 0 && <p className="font-medium text-blue-100 bg-blue-500/10 p-2 rounded-lg inline-block">⏳ Duration: {item.duration} semester(s)</p>}
              {activeTab === 1 && (
                <div className="space-y-2 mt-2 bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="text-white font-medium">{item.fullName}</span></p>
                  <p className="flex justify-between"><span className="text-slate-500">ID:</span> <span className="text-white font-medium">{item.studentId}</span></p>
                  {item.reason === "New" ? (
                    <>
                      <p className="flex justify-between"><span className="text-slate-500">Dept:</span> <span className="text-white font-medium">{item.department}</span></p>
                      <p className="flex justify-between"><span className="text-slate-500">Batch:</span> <span className="text-white font-medium">{item.batch}</span></p>
                      <p className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="text-white font-medium">{item.phone}</span></p>
                      <p className="flex justify-between"><span className="text-slate-500">NIC:</span> <span className="text-white font-medium">{item.nicNumber}</span></p>
                    </>
                  ) : (
                    <>
                      <p className="flex justify-between"><span className="text-slate-500">Lost Date:</span> <span className="text-white font-medium">{item.lossDate?.split('T')[0]}</span></p>
                      <p className="flex justify-between"><span className="text-slate-500">Location:</span> <span className="text-white font-medium">{item.lossLocation}</span></p>
                    </>
                  )}
                  {item.attachment && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <a 
                        href={`http://localhost:3000${item.attachment}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <span>📎 View Attachment</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 2 && <p className="leading-relaxed mt-1 text-slate-400">{item.description || 'No additional details.'}</p>}
              {activeTab === 3 && <p className="line-clamp-4 leading-relaxed text-slate-400">{item.description}</p>}
              {activeTab === 4 && (
                 <div className="text-slate-400 space-y-2.5 mt-1 bg-white/5 p-3 rounded-xl border border-white/5">
                   <p className="flex justify-between"><span className="text-slate-500">Type</span> <span className="text-white font-medium">{item.type}</span></p>
                   <p className="flex justify-between"><span className="text-slate-500">Location</span> <span className="text-white text-right max-w-[60%] truncate">{item.location}</span></p>
                   <p className="flex justify-between"><span className="text-slate-500">Date</span> <span className="text-white">{item.date?.split('T')[0]}</span></p>
                   <p className="flex justify-between"><span className="text-slate-500">Contact</span> <span className="text-white">{item.contactInfo}</span></p>
                   {item.description && <p className="mt-3 text-sm italic text-slate-400">"{item.description}"</p>}
                 </div>
              )}
              {activeTab === 5 && <p className="leading-relaxed mt-1 text-slate-400">{item.description}</p>}
            </div>
            
            {!isStudent && activeTab !== 4 && (
              <div className="mt-auto pt-4 border-t border-white/10 bg-black/10 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
                <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-widest mt-2">Update Status</p>
                <Select className="py-2.5 px-3 focus:ring-1 text-xs font-semibold" value={item.status} onChange={(e) => handleStatusUpdate(item._id, e.target.value)}>
                   {activeTab === 0 && <><option value="open">Open</option><option value="approved">Approved</option><option value="rejected">Rejected</option></>}
                   {activeTab === 1 && <><option value="open">Open</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option></>}
                   {activeTab === 2 && <><option value="open">Open</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option></>}
                   {activeTab === 3 && <><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="closed">Closed</option></>}
                   {activeTab === 5 && <><option value="open">Open</option><option value="in_progress">In Progress</option><option value="closed">Closed</option></>}
                </Select>
              </div>
            )}
            
            {!isStudent && activeTab === 4 && item.status === 'active' && (
              <div className="mt-auto pt-4 border-t border-white/10">
                 <Button onClick={() => handleStatusUpdate(item._id, 'resolved')} className="w-full text-xs py-2 bg-slate-700 hover:bg-green-600">Mark as Resolved</Button>
              </div>
            )}
            {isStudent && activeTab === 4 && item.userId?._id === user?._id && item.status === 'active' && (
              <div className="mt-auto pt-4 border-t border-white/10">
                 <Button onClick={() => handleStatusUpdate(item._id, 'resolved')} className="w-full text-xs py-2 bg-slate-700 hover:bg-green-600">Mark as Resolved</Button>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-medium tracking-wide flex justify-between items-center">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                {item.userId?.name && <span className="truncate max-w-[100px] text-right">{item.userId.name}</span>}
            </div>
          </Card>
        ))}
      </div>
     </>
    );
  };

  return (
    <PageShell 
      title="Services Management" 
      subtitle={isStudent ? "Request university services instantly" : "Manage internal student service structures"}
      right={<span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]">Active System</span>}
    >
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-900/40 rounded-[20px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md sticky top-6">
             {/* Header */}
             <div className="bg-[#1c2331] text-white py-5 px-6 font-black tracking-widest text-[11px] uppercase border-b border-white/5 shadow-inner">
                Service Navigator
             </div>
             {/* Menu Items */}
             <div className="p-3 space-y-1.5 bg-black/20">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${
                         isActive 
                           ? 'bg-[#1c2331] text-white shadow-lg ring-1 ring-white/10 scale-[1.02]' 
                           : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-[20px] filter drop-shadow-md">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="animate-in slide-in-from-right-8 duration-500 zoom-in-[0.98]">
            {renderForm()}
          </div>
          
          <div className="mt-6 mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                {isStudent && activeTab !== 4 ? "My " : (activeTab === 5 && !isStudent ? "Available " : "All ")}
                <span className="text-blue-400">{TABS.find(t => t.id === activeTab).label}</span> 
                {activeTab === 4 ? "Items" : (activeTab === 5 && !isStudent ? "Categories" : "Requests")}
            </h2>
            <div className="h-px bg-gradient-to-r from-blue-500/50 to-transparent flex-1 ml-6"></div>
          </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {renderItems()}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
