"use client";

import React, { useState, useEffect } from "react";
import { studyMaterialService } from "@/services/studyMaterialService";
import { CheckCircle, XCircle, Trash2, Plus, RefreshCw, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function StudyMaterialsPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [loading, setLoading] = useState(false);
    
    // State for data
    const [materials, setMaterials] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [coupons, setCoupons] = useState([]);

    // Coupon form state
    const [newCoupon, setNewCoupon] = useState({ code: "", discountPercent: 100, targetEmail: "", maxUses: 1, expiresAt: "" });

    useEffect(() => {
        if (activeTab === "pending") fetchMaterials();
        else if (activeTab === "withdrawals") fetchWithdrawals();
        else if (activeTab === "coupons") fetchCoupons();
    }, [activeTab]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await studyMaterialService.getPendingMaterials();
            if (res.success) setMaterials(res.materials);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await studyMaterialService.getWithdrawalRequests();
            if (res.success) setWithdrawals(res.requests);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load withdrawals");
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await studyMaterialService.getCoupons();
            if (res.success) setCoupons(res.coupons);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleApproveMaterial = async (id: string) => {
        try {
            await studyMaterialService.approveMaterial(id);
            toast.success("Material approved");
            fetchMaterials();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to approve");
        }
    };

    const handleRejectMaterial = async (id: string) => {
        const comment = prompt("Reason for rejection:");
        if (!comment) return;
        try {
            await studyMaterialService.rejectMaterial(id, comment);
            toast.success("Material rejected");
            fetchMaterials();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to reject");
        }
    };

    const handleUpdateWithdrawal = async (id: string, status: string) => {
        let comment = "";
        if (status === "rejected") {
            comment = prompt("Reason for rejection:") || "";
            if (!comment) return;
        }
        try {
            await studyMaterialService.updateWithdrawalStatus(id, status, comment);
            toast.success(`Withdrawal ${status}`);
            fetchWithdrawals();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update");
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await studyMaterialService.createCoupon(newCoupon);
            toast.success("Coupon created");
            setNewCoupon({ code: "", discountPercent: 100, targetEmail: "", maxUses: 1, expiresAt: "" });
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create coupon");
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await studyMaterialService.deleteCoupon(id);
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete coupon");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Study Materials Admin</h1>
                    <p className="text-muted-foreground mt-1">Manage pending uploads, withdrawals, and discount coupons.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-white/10 pb-4 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "pending" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    Pending Approvals
                </button>
                <button 
                    onClick={() => setActiveTab("withdrawals")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "withdrawals" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    Withdrawal Requests
                </button>
                <button 
                    onClick={() => setActiveTab("coupons")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "coupons" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    Coupons
                </button>
            </div>

            {loading && <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>}

            {/* Tab: Pending */}
            {!loading && activeTab === "pending" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.length === 0 ? (
                        <p className="text-muted-foreground col-span-full">No pending materials.</p>
                    ) : (
                        materials.map((m: any) => (
                            <div key={m._id} className="bg-[#121214] border border-white/5 rounded-xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg leading-tight">{m.subjectName || "Unknown Subject"}</h3>
                                    <span className="px-2 py-1 text-xs rounded-md bg-yellow-500/20 text-yellow-500 font-bold uppercase">{m.type}</span>
                                </div>
                                <div className="space-y-2 text-sm text-muted-foreground border-t border-white/5 pt-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <p><span className="text-white/60">Code:</span> <span className="text-white">{m.subjectCode}</span></p>
                                        <p><span className="text-white/60">Semester:</span> <span className="text-white">{m.semester}</span></p>
                                        <p className="col-span-2"><span className="text-white/60">Uploader:</span> <span className="text-white">{m.uploaderName}</span> <span className="text-xs text-white/40">({m.uploadedBy})</span></p>
                                        <p><span className="text-white/60">Pricing:</span> <span className={m.isPaid ? "text-emerald-400 font-bold" : "text-white"}>{m.isPaid ? `${m.pricePoints} pts` : "Free"}</span></p>
                                        <p><span className="text-white/60">Size:</span> <span className="text-white">{(m.fileSize / 1024 / 1024).toFixed(2)} MB</span></p>
                                        <p className="col-span-2 text-xs text-white/40">Uploaded on {new Date(m.uploadedAt || m.createdAt).toLocaleString()}</p>
                                    </div>
                                    {m.description && <p className="line-clamp-2 mt-2 pt-2 border-t border-white/5"><span className="text-white/60">Desc:</span> {m.description}</p>}
                                </div>
                                <div className="flex space-x-2 pt-2 border-t border-white/5 mt-2">
                                    <button onClick={() => {
                                        let token = "";
                                        if (typeof window !== "undefined") {
                                            const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
                                            token = match ? match[1] : localStorage.getItem("token") || "";
                                        }
                                        window.open(`${process.env.NEXT_PUBLIC_MAIN_BACKEND_URL}/admin/view/${m._id}?token=${token}`, '_blank');
                                    }} className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                                        <FileText className="w-4 h-4" /> View PDF
                                    </button>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleApproveMaterial(m._id)} className="flex-1 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm">
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button onClick={() => handleRejectMaterial(m._id)} className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-sm">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Withdrawals */}
            {!loading && activeTab === "withdrawals" && (
                <div className="space-y-4">
                    {withdrawals.length === 0 ? (
                        <p className="text-muted-foreground">No withdrawal requests.</p>
                    ) : (
                        <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#121214]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-white/60 font-medium">
                                    <tr>
                                        <th className="p-4">User</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">UPI ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawals.map((w: any) => (
                                        <tr key={w._id} className="border-t border-white/5">
                                            <td className="p-4">{w.userEmail}</td>
                                            <td className="p-4 font-bold text-emerald-400">₹{w.amount}</td>
                                            <td className="p-4 font-mono">{w.upiId}</td>
                                            <td className="p-4 text-xs text-white/60">{new Date(w.createdAt).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded-md font-bold uppercase ${w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : w.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {w.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleUpdateWithdrawal(w._id, 'completed')} className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors inline-flex">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleUpdateWithdrawal(w._id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors inline-flex">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Coupons */}
            {!loading && activeTab === "coupons" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create Form */}
                    <div className="lg:col-span-1 bg-[#121214] border border-white/5 rounded-xl p-5 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Create Coupon</h3>
                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Coupon Code</label>
                                <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary uppercase" placeholder="e.g. FREE100" />
                            </div>
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Discount %</label>
                                <input required type="number" min="1" max="100" value={newCoupon.discountPercent} onChange={e => setNewCoupon({...newCoupon, discountPercent: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Target Email (optional)</label>
                                <input type="email" value={newCoupon.targetEmail} onChange={e => setNewCoupon({...newCoupon, targetEmail: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" placeholder="all" />
                            </div>
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Max Uses</label>
                                <input required type="number" min="1" value={newCoupon.maxUses} onChange={e => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" />
                            </div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-colors">
                                Create Coupon
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2 space-y-4">
                        {coupons.length === 0 ? (
                            <p className="text-muted-foreground">No coupons found.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {coupons.map((c: any) => (
                                    <div key={c._id} className="bg-[#121214] border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 bg-primary/20 text-primary px-3 py-1 rounded-bl-xl font-bold text-sm">
                                            {c.discountPercent}% OFF
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black font-mono tracking-wider">{c.code}</h4>
                                            <p className="text-sm text-white/60">Target: <span className="text-white">{c.targetEmail}</span></p>
                                            <p className="text-sm text-white/60">Uses: <span className="text-white">{c.usedCount || 0} / {c.maxUses}</span></p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-xs text-white/40">Created by {c.createdBy}</span>
                                            <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
