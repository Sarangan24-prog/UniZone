import React, { useState, useRef } from "react";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import { useAuth } from "../auth/AuthContext";
import api from "../api/client";

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const fileInputRef = useRef(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'security', 'preferences', 'privacy'
    const [formErrors, setFormErrors] = useState({});
    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        major: "Interactive Design",
        year: "Year 3"
    });

    const [prefs, setPrefs] = useState({
        notifications: true,
        securityAlerts: true,
        weeklyReports: false
    });

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-red-400 text-white shadow-lg shadow-red-500/20';
            case 'staff': return 'bg-blue-400 text-white shadow-lg shadow-blue-500/20';
            default: return 'bg-emerald-400 text-white shadow-lg shadow-emerald-500/20';
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!profileForm.name.trim()) {
            errors.name = "Full Name is required";
        } else if (profileForm.name.trim().length < 3) {
            errors.name = "Name must be at least 3 characters";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!profileForm.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(profileForm.email)) {
            errors.email = "Invalid email format";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = () => {
        if (!validateForm()) return;

        // Here we would typically call an API
        console.log("Saving profile:", profileForm);
        setIsEditModalOpen(false);
        setFormErrors({});
    };

    const handleDownloadData = () => {
        const data = {
            user: {
                name: user?.name,
                email: user?.email,
                role: user?.role,
                ...profileForm
            },
            preferences: prefs,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unizone-profile-${user?.name?.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setIsUploading(true);
            const res = await api.post('users/profile-pic', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser({ profilePic: res.data.profilePic });
        } catch (error) {
            console.error("Avatar upload failed:", error);
            alert(error.response?.data?.message || "Failed to upload profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    const getAvatarUrl = () => {
        if (!user?.profilePic) return null;
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${user.profilePic}`;
    };

    return (
        <PageShell title="User Profile" subtitle="Refine your professional persona and account settings">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Premium Hero Section */}
                <div className="relative group overflow-hidden rounded-[40px] border border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-[0_32px_128px_rgba(0,0,0,0.5)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none"></div>
                    <div className="relative flex flex-col md:flex-row items-center gap-10 p-10">
                        <div className="relative">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                            <div 
                                onClick={handleAvatarClick}
                                className={`w-40 h-40 md:w-52 md:h-52 rounded-[60px] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-2xl border-2 border-white/20 group-hover:scale-[1.02] transition-all duration-700 overflow-hidden cursor-pointer relative group/avatar ${isUploading ? 'opacity-70' : ''}`}
                            >
                                {user?.profilePic ? (
                                    <img 
                                        src={getAvatarUrl()} 
                                        alt={user?.name} 
                                        className="w-full h-full object-cover animate-in fade-in duration-700" 
                                    />
                                ) : (
                                    <span className="text-white font-black text-7xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">{user?.name?.charAt(0)?.toUpperCase()}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white font-black text-xs uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20">
                                        {isUploading ? 'Uploading...' : 'Change Photo'}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-emerald-500 w-12 h-12 rounded-3xl flex items-center justify-center border-4 border-slate-900 shadow-2xl animate-bounce-slow z-10">
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h2 className="text-5xl font-black text-white tracking-tight">{user?.name}</h2>
                                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${getRoleColor(user?.role)}`}>
                                        {user?.role}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-slate-400/80">{user?.email}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 opacity-80">
                                <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-blue-400">ID</span> #2024-UIZ
                                </div>
                                <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/5 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="text-emerald-400">STATUS</span> ACTIVE
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <Button
                                onClick={() => setIsEditModalOpen(true)}
                                className="!px-10 py-4 bg-white text-slate-950 hover:bg-slate-100 font-black rounded-3xl transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3 group/btn"
                            >
                                <span className="text-lg group-hover/btn:rotate-12 transition-transform">✍️</span>
                                Edit Identity
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid gap-8 md:grid-cols-12">
                    {/* Left: Account Details */}
                    <div className="md:col-span-7 space-y-8">
                        <Card glass className="border border-white/10 shadow-2xl rounded-[32px] p-8 h-full">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black text-white flex items-center gap-4">
                                    <span className="w-12 h-12 rounded-2xl bg-white/5 text-blue-400 flex items-center justify-center text-xl shadow-inner border border-white/5">👤</span>
                                    Core Profile
                                </h3>
                                <div className="h-[2px] flex-1 mx-6 bg-gradient-to-r from-blue-500/20 to-transparent"></div>
                            </div>

                            <div className="grid gap-10 sm:grid-cols-2">
                                {[
                                    { label: 'Official Name', value: user?.name, desc: 'Your display identity' },
                                    { label: 'Authorized Email', value: user?.email, desc: 'Primary contact' },
                                    { label: 'Academic Major', value: profileForm.major, desc: 'Department specialization' },
                                    { label: 'Academic Year', value: profileForm.year, desc: 'Enrollment progress' }
                                ].map(item => (
                                    <div key={item.label} className="group/item flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/item:text-blue-400 transition-colors">{item.label}</p>
                                        <div className="py-2 transition-all">
                                            <p className="text-lg font-bold text-white tracking-tight">{item.value}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Security & Actions */}
                    <div className="md:col-span-5 space-y-8">
                        <Card glass className="border border-white/10 shadow-2xl rounded-[32px] p-8">
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                                <span className="w-12 h-12 rounded-2xl bg-white/5 text-blue-400 flex items-center justify-center text-xl shadow-inner border border-white/5">⚡</span>
                                Ecosystem
                            </h3>
                            <div className="grid gap-4">
                                {[
                                    { name: 'Update Security', icon: '🔑', color: 'bg-blue-500/10 text-blue-400', action: () => setActiveModal('security') },
                                    { name: 'Preferences', icon: '⚙️', color: 'bg-slate-500/10 text-slate-400', action: () => setActiveModal('preferences') },
                                    { name: 'Download Data', icon: '📄', color: 'bg-emerald-500/10 text-emerald-400', action: handleDownloadData },
                                    { name: 'Privacy Center', icon: '🛡️', color: 'bg-purple-500/10 text-purple-400', action: () => setActiveModal('privacy') }
                                ].map(action => (
                                    <button 
                                        key={action.name} 
                                        onClick={action.action}
                                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/action shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${action.color} group-hover/action:scale-110 transition-transform shadow-sm`}>{action.icon}</span>
                                            <span className="text-sm font-black text-slate-400 group-hover/action:text-white uppercase tracking-widest">{action.name}</span>
                                        </div>
                                        <span className="text-slate-500 group-hover/action:text-white group-hover/action:translate-x-1 transition-all">→</span>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Sign Out Card */}
                        <div
                            onClick={logout}
                            className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all flex items-center justify-between cursor-pointer group/logout active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center text-xl shadow-lg shadow-red-500/20 group-hover/logout:rotate-12 transition-transform">👋</div>
                                <div>
                                    <h3 className="text-base font-black text-white uppercase tracking-widest">Sign Out</h3>
                                    <p className="text-[10px] font-bold text-red-400/60 uppercase">Terminate current session</p>
                                </div>
                            </div>
                            <span className="text-red-500/40 text-2xl group-hover/logout:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Edit Modal */}
            <Modal
                open={isEditModalOpen}
                title="Update User Profile"
                onClose={() => {
                    setIsEditModalOpen(false);
                    setFormErrors({});
                }}
                footer={(
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setFormErrors({});
                            }}
                            className="!px-6 rounded-2xl border-white/10 text-slate-400 hover:text-white uppercase tracking-widest text-[10px]"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            className="!px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20"
                        >
                            Commit Changes
                        </Button>
                    </div>
                )}
            >
                <div className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2 pt-2">
                        <div>
                            <Input
                                label="Full Name"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your full name"
                                className={formErrors.name ? "border-red-500/50" : ""}
                            />
                            {formErrors.name && (
                                <p className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-widest px-1">{formErrors.name}</p>
                            )}
                        </div>
                        <div>
                            <Input
                                label="Email Address"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                placeholder="you@example.com"
                                className={formErrors.email ? "border-red-500/50" : ""}
                            />
                            {formErrors.email && (
                                <p className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-widest px-1">{formErrors.email}</p>
                            )}
                        </div>
                        <Input
                            label="Academic Major"
                            value={profileForm.major}
                            onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                            placeholder="e.g. Computer Science"
                        />
                        <Select
                            label="Year of Study"
                            value={profileForm.year}
                            onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                        >
                            <option value="Year 1" className="bg-slate-900">Year 1</option>
                            <option value="Year 2" className="bg-slate-900">Year 2</option>
                            <option value="Year 3" className="bg-slate-900">Year 3</option>
                            <option value="Year 4" className="bg-slate-900">Year 4</option>
                        </Select>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest leading-relaxed">
                        Note: Official academic record changes may require verification from the student affairs portal.
                    </div>
                </div>
            </Modal>

            {/* Security Modal */}
            <Modal
                open={activeModal === 'security'}
                title="Account Security"
                onClose={() => setActiveModal(null)}
                footer={(
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setActiveModal(null)} className="!px-8 rounded-2xl bg-blue-600 font-black uppercase tracking-widest text-[10px]">Update Credentials</Button>
                    </div>
                )}
            >
                <div className="space-y-6">
                    <Input type="password" label="Current Pin/Password" placeholder="••••••••" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Input type="password" label="New Password" placeholder="••••••••" />
                        <Input type="password" label="Confirm New Password" placeholder="••••••••" />
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        ⚠️ Changing security credentials will end all other active sessions for this account.
                    </div>
                </div>
            </Modal>

            {/* Preferences Modal */}
            <Modal
                open={activeModal === 'preferences'}
                title="User Preferences"
                onClose={() => setActiveModal(null)}
                footer={(
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setActiveModal(null)} className="!px-8 rounded-2xl bg-emerald-600 font-black uppercase tracking-widest text-[10px]">Save Preferences</Button>
                    </div>
                )}
            >
                <div className="space-y-4">
                    {[
                        { id: 'notifications', title: 'Social Notifications', desc: 'Receive alerts for sport team updates and news.' },
                        { id: 'securityAlerts', title: 'Security Alerts', desc: 'Notify me when unusual login attempts are detected.' },
                        { id: 'weeklyReports', title: 'Weekly Reports', desc: 'Send a summary of my academic and sport progress.' }
                    ].map(pref => (
                        <div key={pref.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">{pref.title}</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{pref.desc}</p>
                            </div>
                            <button 
                                onClick={() => setPrefs(p => ({...p, [pref.id]: !p[pref.id]}))}
                                className={`w-12 h-6 rounded-full transition-all duration-500 relative ${prefs[pref.id] ? 'bg-blue-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${prefs[pref.id] ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Privacy Center Modal */}
            <Modal
                open={activeModal === 'privacy'}
                title="Privacy & Data Control"
                onClose={() => setActiveModal(null)}
            >
                <div className="space-y-6">
                    <div className="aspect-video rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                        <span className="text-6xl">🛡️</span>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Your data is yours.</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-[0.05em]">
                            UniZone employs industry-standard encryption for all student records. We never share your personal data with third-party organizations without your explicit consent.
                        </p>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">End-to-End Encryption Enabled</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">GDPR & CCPA Compliant storage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
}
