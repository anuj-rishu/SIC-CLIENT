"use client";

import React, { useState, useEffect } from "react";
import { studyMaterialService } from "@/services/studyMaterialService";
import { CheckCircle, XCircle, Trash2, Plus, RefreshCw, FileText, AlertTriangle } from "lucide-react";

import toast from "react-hot-toast";

export default function StudyMaterialsPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [loading, setLoading] = useState(false);
    
    // State for data
    const [materials, setMaterials] = useState([]);
    const [withdrawals, setWithdrawals] = useState([])
    const [coupons, setCoupons] = useState([]);
    const [requests, setRequests] = useState([]);
    const [earningsData, setEarningsData] = useState([]);
    const [reports, setReports] = useState([]);


    // Coupon form state
    const [newCoupon, setNewCoupon] = useState({ code: "", discountPercent: 100, targetEmail: "", maxUses: 1, expiresAt: "" });

    // Admin Upload state
    const [uploadData, setUploadData] = useState({
        subjectCode: "",
        subjectName: "",
        semester: "1",
        type: "notes",
        isPaid: false,
        pricePoints: 5
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (activeTab === "pending") fetchMaterials();
        else if (activeTab === "withdrawals") fetchWithdrawals();
        else if (activeTab === "coupons") fetchCoupons();
        else if (activeTab === "requests") fetchRequests();
        else if (activeTab === "earnings") fetchEarningsData();
        else if (activeTab === "reports") fetchReports();
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

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await studyMaterialService.getMaterialRequests();
            if (res.success) setRequests(res.requests);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const fetchEarningsData = async () => {
        setLoading(true);
        try {
            const res = await studyMaterialService.getEarningsSummary();
            if (res.success) setEarningsData(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load earnings data");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await studyMaterialService.getReports();
            if (res.success) setReports(res.reports);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to load reports");
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

    const handleDeleteMaterial = async (id: string) => {
        if (!confirm("CRITICAL: This will permanently delete the material record AND the file from storage. Continue?")) return;
        try {
            await studyMaterialService.deleteMaterial(id);
            toast.success("Material deleted permanently");
            if (activeTab === "reports") fetchReports();
            else fetchMaterials();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete material");
        }
    };

    const handleUpdateReportStatus = async (id: string, status: string) => {
        try {
            await studyMaterialService.updateReportStatus(id, status);
            toast.success(`Report ${status}`);
            fetchReports();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update report status");
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

    const handleAdminUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return toast.error("Please select a file");

        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("subjectCode", uploadData.subjectCode);
        formData.append("subjectName", uploadData.subjectName);
        formData.append("semester", uploadData.semester);
        formData.append("type", uploadData.type);
        formData.append("isPaid", String(uploadData.isPaid));
        formData.append("pricePoints", String(uploadData.pricePoints));

        try {
            const res = await studyMaterialService.adminUploadMaterial(formData);
            if (res.success) {
                toast.success("Material uploaded and approved successfully");
                setUploadData({ subjectCode: "", subjectName: "", semester: "1", type: "notes", isPaid: false, pricePoints: 5 });
                setSelectedFile(null);
                const fileInput = document.getElementById("admin-file-upload") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to upload material");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
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
                <button 
                    onClick={() => setActiveTab("requests")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "requests" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    Paper Requests
                </button>
                <button 
                    onClick={() => setActiveTab("upload")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "upload" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    Direct Upload
                </button>
                <button 
                    onClick={() => setActiveTab("earnings")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "earnings" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    Earnings Summary
                </button>
                <button 
                    onClick={() => setActiveTab("reports")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === "reports" ? "bg-primary text-white" : "hover:bg-white/5"}`}
                >
                    User Reports
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

            {/* Tab: Requests */}
            {!loading && activeTab === "requests" && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <p className="text-muted-foreground">No pending paper requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {requests.map((r: any) => (
                                <div key={r._id} className="bg-[#121214] border border-white/5 rounded-xl p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg leading-tight">{r.subjectName}</h3>
                                        <span className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary font-bold uppercase">{r.type}</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-muted-foreground border-t border-white/5 pt-3">
                                        <p><span className="text-white/60">Subject Code:</span> <span className="text-white font-mono">{r.subjectCode}</span></p>
                                        <p><span className="text-white/60">Semester:</span> <span className="text-white">{r.semester}</span></p>
                                        <p><span className="text-white/60">Requester:</span> <span className="text-white">{r.requesterName}</span></p>
                                        <p className="text-xs text-white/40 mt-2">Requested on {new Date(r.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex space-x-2 pt-2 border-t border-white/5">
                                        <a 
                                            href={`https://www.google.com/search?q=SRM+${r.subjectCode}+${r.subjectName}+${r.type}+question+paper`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                        >
                                            Search on Google
                                        </a>
                                        <button 
                                            onClick={async () => {
                                                if (!confirm("Mark this request as done and remove it?")) return;
                                                try {
                                                    await studyMaterialService.deleteMaterialRequest(r._id);
                                                    toast.success("Request removed");
                                                    fetchRequests();
                                                } catch (error: any) {
                                                    toast.error("Failed to remove request");
                                                }
                                            }}
                                            className="px-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                            title="Mark as Done"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Earnings Summary */}
            {!loading && activeTab === "earnings" && (
                <div className="space-y-4">
                    {earningsData.length === 0 ? (
                        <p className="text-muted-foreground">No earnings data available.</p>
                    ) : (
                        <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#121214]">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/5 text-white/60 font-medium">
                                    <tr>
                                        <th className="p-4">Student Email</th>
                                        <th className="p-4">Earned Points</th>
                                        <th className="p-4">Current Points</th>
                                        <th className="p-4">Withdrawable (₹)</th>
                                        <th className="p-4">Total Withdrawn (₹)</th>
                                        <th className="p-4">Approved Reqs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {earningsData.map((data: any, idx: number) => (
                                        <tr key={idx} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-mono">{data.userEmail}</td>
                                            <td className="p-4">{data.earnedPoints}</td>
                                            <td className="p-4 font-bold text-primary">{data.currentPoints}</td>
                                            <td className="p-4 font-bold text-emerald-400">₹{data.withdrawableBalance.toFixed(2)}</td>
                                            <td className="p-4 text-white/60">₹{data.totalWithdrawn.toFixed(2)}</td>
                                            <td className="p-4">{data.approvedRequestCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Reports */}
            {!loading && activeTab === "reports" && (
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <p className="text-muted-foreground">No reports found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reports.map((r: any) => (
                                <div key={r._id} className="bg-[#121214] border border-red-500/10 rounded-xl p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                {r.materialId?.subjectName || "Deleted Material"}
                                            </h3>
                                            <p className="text-xs text-white/40">Reported by {r.reportedBy}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] rounded-md font-bold uppercase ${r.status === 'pending' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                            {r.status}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10 space-y-1">
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{r.reason.replace('_', ' ')}</p>
                                        <p className="text-sm text-white/80">{r.comment || "No comment provided."}</p>
                                    </div>

                                    {r.materialId && (
                                        <div className="space-y-2 text-sm text-muted-foreground border-t border-white/5 pt-3">
                                            <p><span className="text-white/60">Code:</span> <span className="text-white">{r.materialId.subjectCode}</span></p>
                                            <p><span className="text-white/60">Type:</span> <span className="text-white uppercase">{r.materialId.type}</span></p>
                                            
                                            <div className="flex space-x-2 pt-2">
                                                <button onClick={() => {
                                                    let token = "";
                                                    if (typeof window !== "undefined") {
                                                        const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
                                                        token = match ? match[1] : localStorage.getItem("token") || "";
                                                    }
                                                    window.open(`${process.env.NEXT_PUBLIC_MAIN_BACKEND_URL}/admin/view/${r.materialId._id}?token=${token}`, '_blank');
                                                }} className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs">
                                                    <FileText className="w-4 h-4" /> View PDF
                                                </button>
                                                {r.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleDeleteMaterial(r.materialId._id)}
                                                        className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold text-xs"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete Material
                                                    </button>
                                                )}
                                            </div>


                                            {r.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleUpdateReportStatus(r._id, 'dismissed')}
                                                    className="w-full mt-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-xs border border-emerald-500/10"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Dismiss Report
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    
                                    {!r.materialId && (
                                        <p className="text-xs text-white/30 italic">The associated material has already been deleted.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* Tab: Direct Upload */}
            {!loading && activeTab === "upload" && (
                <div className="max-w-2xl mx-auto bg-[#121214] border border-white/5 rounded-xl p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Direct Material Upload</h3>
                        <p className="text-sm text-muted-foreground mt-1">This will automatically mark the material as approved and notify requesters.</p>
                    </div>

                    <form onSubmit={handleAdminUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Subject Code</label>
                                <input required type="text" value={uploadData.subjectCode} onChange={e => setUploadData({...uploadData, subjectCode: e.target.value.toUpperCase()})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary uppercase" placeholder="e.g. 18CSC304J" />
                            </div>
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Subject Name</label>
                                <input required type="text" value={uploadData.subjectName} onChange={e => setUploadData({...uploadData, subjectName: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" placeholder="e.g. Artificial Intelligence" />
                            </div>
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Semester</label>
                                <select value={uploadData.semester} onChange={e => setUploadData({...uploadData, semester: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-white/60 block mb-1">Type</label>
                                <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary">
                                    <option value="notes">Handwritten Notes</option>
                                    <option value="sem">End Sem Paper</option>
                                    <option value="ct">Cycle Test Paper</option>
                                    <option value="ppt">PPT / PDF</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 p-4 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Paid Material</label>
                                <button type="button" onClick={() => setUploadData({...uploadData, isPaid: !uploadData.isPaid})} className={`w-12 h-6 rounded-full transition-colors relative ${uploadData.isPaid ? 'bg-primary' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${uploadData.isPaid ? 'right-1' : 'left-1'}`}></div>
                                </button>
                            </div>
                            {uploadData.isPaid && (
                                <div>
                                    <label className="text-sm text-white/60 block mb-1">Price (Points)</label>
                                    <input type="number" min="1" value={uploadData.pricePoints} onChange={e => setUploadData({...uploadData, pricePoints: Number(e.target.value)})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-white/60 block mb-1">Document (PDF)</label>
                            <input id="admin-file-upload" required type="file" accept=".pdf" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                        </div>

                        <button disabled={uploading} type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            {uploading ? "Uploading..." : "Upload & Approve Material"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
