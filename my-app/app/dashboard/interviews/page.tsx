"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Plus, 
  ChevronRight, 
  Star, 
  Mail, 
  ExternalLink,
  Users,
  Search,
  CheckCircle,
  X,
  Filter,
  Trash2,
  Upload,
  ShieldCheck,
  FileSpreadsheet,
  Edit2,
  CalendarDays,
  LayoutGrid,
  Settings2,
  Timer,
  ChevronDown,
  Globe
} from "lucide-react";
import { interviewService } from "@/services/interviewService";
import { adminService } from "@/services/adminService";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

export default function InterviewsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Schedule Form State
  const [scheduleData, setScheduleData] = useState({
    startDate: "",
    endDate: "",
    dailyStartTime: "10:00",
    dailyEndTime: "18:00",
    duration: 30,
    panels: 1,
    domain: "web dev"
  });

  // Evaluation Form State
  const [evaluationData, setEvaluationData] = useState({
    result: "SELECTED",
    rating: 5
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");

  const [activeTab, setActiveTab] = useState("Interviews");
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [whitelistSearchTerm, setWhitelistSearchTerm] = useState("");
  const [whitelistDomainFilter, setWhitelistDomainFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const domains = ["web dev", "app dev", "creatives", "corporate", "aiml", "cloud"];
  const [selectedWhitelistDomain, setSelectedWhitelistDomain] = useState("web dev");
  const [selectedAllowedStudents, setSelectedAllowedStudents] = useState<string[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: async () => {},
  });

  useEffect(() => {
    if (activeTab === "Interviews") {
      fetchBookings();
    } else if (activeTab === "Schedules") {
      fetchSchedules();
    } else {
      fetchWhitelist();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await interviewService.getAllBookings();
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await interviewService.createSchedule(scheduleData);
      setShowScheduleModal(false);
      fetchBookings();
      toast.success("Schedule created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to create schedule");
    } finally {
      setActionLoading(false)
    }
  };

  const handleOpenEvaluateModal = (booking: any) => {
    setSelectedBooking(booking);
    if (booking.status === "COMPLETED" && booking.evaluation) {
      setEvaluationData({
        result: booking.evaluation.result,
        rating: booking.evaluation.rating || 5
      });
    } else {
      setEvaluationData({
        result: "SELECTED",
        rating: 5
      });
    }
    setShowEvaluateModal(true);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await interviewService.evaluateBooking(selectedBooking._id, evaluationData);
      setShowEvaluateModal(false);
      fetchBookings();
      toast.success("Evaluation saved!");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to save evaluation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = (bookingId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Booking",
      message: "Are you sure you want to PERMANENTLY delete this booking? This will also free up the interview slot.",
      confirmText: "Delete",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await interviewService.adminDeleteBooking(bookingId);
          fetchBookings();
          toast.success("Booking deleted successfully");
        } catch (err: any) {
          toast.error(err.response?.data?.msg || "Failed to delete booking");
        } finally {
          setActionLoading(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const fetchWhitelist = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllAllowedEmails();
      setWhitelist(res.data);
    } catch (err) {
      console.error("Failed to fetch whitelist", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("domain", selectedWhitelistDomain);

    setUploading(true);
    try {
      await adminService.uploadAllowedEmails(formData);
      fetchWhitelist();
      toast.success("Whitelist updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveEmail = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Remove Email",
      message: "Remove this email from whitelist?",
      confirmText: "Remove",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminService.removeAllowedEmail(id);
          fetchWhitelist();
        } catch (err: any) {
          toast.error(err.response?.data?.msg || "Failed to remove email");
        } finally {
          setActionLoading(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRemoveAllEmails = () => {
    setConfirmState({
      isOpen: true,
      title: "Delete All Whitelist",
      message: "WARNING: Are you sure you want to delete ALL whitelisted emails? This action cannot be undone.",
      confirmText: "Delete All",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await adminService.removeAllAllowedEmails();
          fetchWhitelist();
          toast.success("All whitelisted emails have been removed.");
        } catch (err: any) {
          toast.error(err.response?.data?.msg || "Failed to remove all emails");
        } finally {
          setActionLoading(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const filteredWhitelist = useMemo(() => {
    return whitelist.filter(item => {
      const matchesSearch = item.email?.toLowerCase().includes(whitelistSearchTerm.toLowerCase());
      const matchesDomain = whitelistDomainFilter === "All" || item.domain === whitelistDomainFilter;
      return matchesSearch && matchesDomain;
    });
  }, [whitelist, whitelistSearchTerm, whitelistDomainFilter]);

  const handleToggleSelectStudent = (id: string) => {
    setSelectedAllowedStudents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedAllowedStudents.length === filteredWhitelist.length && filteredWhitelist.length > 0) {
      setSelectedAllowedStudents([]);
    } else {
      setSelectedAllowedStudents(filteredWhitelist.map(s => s._id));
    }
  };

  const handleExportSelected = async () => {
    if (selectedAllowedStudents.length === 0) {
      toast.error("Please select students to export");
      return;
    }
    setActionLoading(true);
    try {
      const response = await adminService.exportAllowedStudents(selectedAllowedStudents);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `whitelisted_students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (err: any) {
      toast.error("Failed to export students");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSelectBooking = (id: string) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllBookings = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b._id));
    }
  };

  const handleExportBookings = async () => {
    if (selectedBookings.length === 0) {
      toast.error("Please select interviews to export");
      return;
    }
    setActionLoading(true);
    try {
      const response = await interviewService.exportBookings(selectedBookings);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interview_bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!");
    } catch (err: any) {
      toast.error("Failed to export interviews");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await interviewService.getAllSchedules();
      setSchedules(res.data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Schedule",
      message: "WARNING: This will PERMANENTLY delete this schedule, all its slots, AND ALL student bookings associated with it (including Google Calendar events). This action cannot be undone. Proceed?",
      confirmText: "Delete",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await interviewService.deleteSchedule(id);
          fetchSchedules();
          toast.success("Schedule deleted successfully");
        } catch (err: any) {
          toast.error(err.response?.data?.msg || "Failed to delete schedule");
        } finally {
          setActionLoading(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleOpenEditModal = (schedule: any) => {
    setScheduleData({
      startDate: schedule.startDate.split('T')[0],
      endDate: schedule.endDate.split('T')[0],
      dailyStartTime: schedule.dailyStartTime,
      dailyEndTime: schedule.dailyEndTime,
      duration: schedule.duration,
      panels: schedule.panels,
      domain: schedule.domain
    });
    setEditId(schedule._id);
    setIsEditing(true);
    setShowScheduleModal(true);
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setActionLoading(true);
    try {
      await interviewService.updateSchedule(editId, scheduleData);
      setShowScheduleModal(false);
      setIsEditing(false);
      setEditId(null);
      fetchSchedules();
      toast.success("Schedule updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Update failed");
    } finally {
      setActionLoading(false);
    }
  };




  const availableDates = useMemo(() => {
    const dates = bookings
      .map(b => b.slot?.date?.split('T')[0])
      .filter(Boolean);
    return ["All", ...Array.from(new Set(dates))].sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings.filter(b => {
      const matchesSearch = 
        b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "All" || 
        b.status === statusFilter || 
        (statusFilter === "SELECTED" && b.evaluation?.result === "SELECTED") ||
        (statusFilter === "REJECTED" && b.evaluation?.result === "REJECTED");
      
      const bDate = b.slot?.date?.split('T')[0];
      const matchesDate = dateFilter === "All" || bDate === dateFilter;
      
      const bDomain = b.slot?.scheduleId?.domain;
      const matchesDomain = domainFilter === "All" || bDomain === domainFilter;
      
      return matchesSearch && matchesStatus && matchesDate && matchesDomain;
    });

    return result.sort((a, b) => {
      const timeA = a.slot?.startTime || "00:00";
      const timeB = b.slot?.startTime || "00:00";
      return timeA.localeCompare(timeB);
    });
  }, [bookings, searchTerm, statusFilter, dateFilter, domainFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "COMPLETED": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "CANCELLED": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-4">
      {/* Tab Switcher & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex bg-white/5 p-1 rounded-2xl w-full md:w-auto">
          {["Interviews", "Schedules", "Whitelist"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-2 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)]" 
                  : "text-muted-foreground/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Interviews" || activeTab === "Schedules" ? (
          <button
            onClick={() => {
              setIsEditing(false);
              setScheduleData({
                startDate: "",
                endDate: "",
                dailyStartTime: "10:00",
                dailyEndTime: "18:00",
                duration: 30,
                panels: 1,
                domain: "web dev"
              });
              setShowScheduleModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-black py-3 px-8 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Create Schedule
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <select
              value={selectedWhitelistDomain}
              onChange={(e) => setSelectedWhitelistDomain(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
            >
              {domains.map(d => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
            <div className="relative group">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploading}
              />
              <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-8 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 text-[10px] uppercase tracking-widest">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Whitelist (CSV)
              </button>
            </div>
          </div>
        )}
      </div>

      {activeTab === "Interviews" ? (
        <>
          {/* Stats Cards */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3">
              <div className="p-4 md:p-7 border-r border-white/5 flex items-center gap-4">
                <div className="hidden md:flex w-12 h-12 rounded-xl bg-blue-500/10 items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white leading-none">{bookings.length}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Interviews</p>
                </div>
              </div>
              <div className="p-4 md:p-7 border-r border-white/5 flex items-center gap-4">
                <div className="hidden md:flex w-12 h-12 rounded-xl bg-amber-500/10 items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-amber-500 leading-none">{bookings.filter(b => b.status === "BOOKED").length}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Scheduled</p>
                </div>
              </div>
              <div className="p-4 md:p-7 flex items-center gap-4">
                <div className="hidden md:flex w-12 h-12 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-emerald-500 leading-none">{bookings.filter(b => b.status === "COMPLETED").length}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Finished</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row items-stretch xl:items-center gap-4 md:gap-6">
            
            {/* Left/Main Section: Search & Status */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
              <div className="md:col-span-8 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm text-white focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/20 hover:bg-white/[0.08]"
                />
              </div>

              <div className="md:col-span-4 relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/40" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3.5 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                >
                  <option value="All" className="bg-slate-900 text-xs">All Status</option>
                  <option value="BOOKED" className="bg-slate-900 text-xs">Booked</option>
                  <option value="COMPLETED" className="bg-slate-900 text-xs">Completed</option>
                  <option value="CANCELLED" className="bg-slate-900 text-xs">Cancelled</option>
                  <option value="SELECTED" className="bg-slate-900 text-xs">Selected</option>
                  <option value="REJECTED" className="bg-slate-900 text-xs">Rejected</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
              </div>
            </div>

            {/* Right Section: Refiners & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div className="relative group">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-36 bg-white/5 border border-white/10 rounded-2xl pl-4 pr-10 py-3.5 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                  >
                    <option value="All" className="bg-slate-900 text-xs">Dates</option>
                    {Array.isArray(availableDates) && availableDates.map(d => d !== "All" && (
                      <option key={d} value={d} className="bg-slate-900 text-xs">{new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</option>
                    ))}
                  </select>
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
                </div>

                <div className="relative group">
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full sm:w-36 bg-white/5 border border-white/10 rounded-2xl pl-4 pr-10 py-3.5 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                  >
                    <option value="All" className="bg-slate-900 text-xs">Domain</option>
                    {domains.map(d => (
                      <option key={d} value={d} className="bg-slate-900 uppercase text-xs">{d}</option>
                    ))}
                  </select>
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleExportBookings}
                disabled={selectedBookings.length === 0 || actionLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 px-8 py-3.5 md:py-4 rounded-2xl transition-all text-xs font-black uppercase tracking-widest disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-primary/20 whitespace-nowrap active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export {selectedBookings.length > 0 ? `(${selectedBookings.length})` : ""}
              </button>
            </div>
          </div>

          {filteredBookings.length > 0 && (
            <div className="flex items-center gap-3 mb-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <input 
                type="checkbox"
                checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                onChange={handleSelectAllBookings}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 cursor-pointer"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Select All</span>
            </div>
          )}

          {/* Bookings List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className={`backdrop-blur-md border rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all group relative overflow-hidden ${
                    selectedBookings.includes(booking._id) ? 'border-primary/40 bg-primary/5' : 'bg-card/20 border-white/5 hover:bg-card/30'
                  }`}
                >
                  <div className="grid grid-cols-1 xl:grid-cols-12 items-start gap-4 xl:gap-0">
                    
                    {/* Zone 1: Identity (Col 5) */}
                    <div className="xl:col-span-5 flex items-start gap-3 md:gap-4 xl:pr-6 pb-4 xl:pb-0">
                      <div className="relative shrink-0 mt-2">
                        <input 
                          type="checkbox"
                          checked={selectedBookings.includes(booking._id)}
                          onChange={() => handleToggleSelectBooking(booking._id)}
                          className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm border-white/10 bg-white/5 text-primary focus:ring-primary/40 cursor-pointer transition-all shrink-0"
                        />
                      </div>
                      <div className="flex items-start gap-1 min-w-0">
                        <div className="min-w-0 pt-0.5">
                          <div className="mb-1">
                            <h4 className="text-sm md:text-base font-bold text-white tracking-tight break-words leading-tight">
                              {booking.user?.name}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[9px] md:text-[10px]">
                            {booking.slot?.scheduleId?.domain && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase tracking-widest whitespace-nowrap">
                                {booking.slot.scheduleId.domain}
                              </span>
                            )}
                             <div className="flex items-center gap-1.5 min-w-0">
                               <Mail className="w-2.5 h-2.5 text-muted-foreground/30 shrink-0" />
                               <span className="text-muted-foreground/40 font-bold break-all truncate">{booking.user?.email}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Zone 2: Logistics (Col 3) */}
                    <div className="xl:col-span-3 flex items-center border-t xl:border-t-0 xl:border-l border-white/5 pt-4 xl:pt-0 xl:px-6">
                      <div className="space-y-1.5 w-full">
                        <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Interview Logistics</p>
                        <div className="flex items-center gap-3 text-white/80 font-bold whitespace-nowrap overflow-hidden">
                           <div className="flex items-center gap-1.5">
                             <Calendar className="w-3 h-3 text-primary/40 shrink-0" />
                             <span className="text-[9px] md:text-[10px]">{booking.slot?.date ? new Date(booking.slot.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "---"}</span>
                           </div>
                           <span className="text-white/10 font-thin">|</span>
                           <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-primary/40 shrink-0" />
                              <span className="text-[9px] md:text-[10px]">{booking.slot?.startTime} - {booking.slot?.endTime}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Zone 3: Result & Admin (Col 2) */}
                    <div className="xl:col-span-2 flex items-center border-t xl:border-t-0 xl:border-l border-white/5 pt-4 xl:pt-0 xl:px-6">
                       {booking.status === "COMPLETED" && booking.evaluation ? (
                         <div className="flex flex-col gap-1">
                           <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Decision</p>
                           <div className="inline-flex flex-col items-start gap-0.5">
                             <span className={`px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black tracking-widest border uppercase ${
                               booking.evaluation.result === "SELECTED" 
                                 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                 : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                             }`}>
                               {booking.evaluation.result}
                             </span>
                             {booking.evaluation.evaluatedBy?.name && (
                               <span className="text-[6px] md:text-[7px] font-black text-muted-foreground/20 uppercase tracking-[0.1em] ml-0.5">
                                 By {booking.evaluation.evaluatedBy.name}
                               </span>
                             )}
                           </div>
                         </div>
                       ) : (
                         <div className="space-y-1">
                           <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Status</p>
                           <span className={`px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black tracking-widest border uppercase bg-white/5 border-white/10 ${getStatusColor(booking.status)}`}>
                             {booking.status}
                           </span>
                         </div>
                       )}
                    </div>

                    {/* Zone 4: Actions (Col 2) */}
                    <div className="xl:col-span-2 flex items-center justify-end border-t xl:border-t-0 xl:border-l border-white/5 pt-4 xl:pt-0 xl:pl-6 gap-2">
                      {booking.meetingLink && (
                        <a 
                          href={booking.meetingLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-primary hover:text-white hover:bg-primary transition-all shadow-lg active:scale-95 group/link"
                          title="Join Meeting"
                        >
                          <ExternalLink className="w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                        </a>
                      )}
                      
                      {(booking.status === "BOOKED" || booking.status === "COMPLETED") && (
                        <button 
                          onClick={() => handleOpenEvaluateModal(booking)}
                          className="flex-1 xl:flex-none px-4 py-2 bg-primary text-white border border-primary/20 rounded-[12px] text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                        >
                          {booking.status === "COMPLETED" ? "Re-eval" : "Evaluate"}
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteBooking(booking._id)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-rose-400/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all active:scale-95 group/del"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover/del:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center bg-card/10 rounded-3xl border border-dashed border-white/5">
                <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground/40 font-medium">No interviews found matching your criteria</p>
              </div>
            )}
          </div>
        </>
      ) : activeTab === "Schedules" ? (
        <div className="space-y-6">
          <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Interview Cycles</h3>
                <p className="text-sm text-muted-foreground/40">Manage your automated scheduling configurations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {schedules.length > 0 ? (
                schedules.map((s) => (
                  <div key={s._id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                        <CalendarDays className="w-5 h-5 md:w-7 md:h-7 text-amber-500/60" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 md:gap-3 mb-1">
                           <span className="text-white font-bold text-sm md:text-base">{new Date(s.startDate).toLocaleDateString()}</span>
                           <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground/20" />
                           <span className="text-white font-bold text-sm md:text-base">{new Date(s.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-4 text-[9px] md:text-xs text-muted-foreground/40 uppercase font-black tracking-widest">
                           {s.domain && (
                             <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                               {s.domain}
                             </span>
                           )}
                           <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {s.dailyStartTime} - {s.dailyEndTime}</span>
                           <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full my-auto"></span>
                           <span className="flex items-center gap-1.5"><LayoutGrid className="w-3 h-3" /> {s.panels} Panels</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                         onClick={() => handleOpenEditModal(s)}
                         className="p-3 bg-white/5 border border-white/10 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
                         title="Edit Cycle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => handleDeleteSchedule(s._id)}
                         className="p-3 bg-white/5 border border-white/10 rounded-xl text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                         title="Delete Cycle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                   <Calendar className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                   <p className="text-muted-foreground/30 text-sm font-medium">No cycles configured yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex items-start gap-4">
             <div className="p-3 bg-amber-500/10 rounded-xl">
                <Settings2 className="w-6 h-6 text-amber-500" />
             </div>
             <div>
                <h4 className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest mb-1.5">Cycle Constraints</h4>
                <p className="text-[9px] md:text-xs text-muted-foreground/60 leading-relaxed font-bold uppercase tracking-tighter">
                   Updating regenerates <span className="text-amber-400">unbooked</span> slots. Please resolve active bookings before changes.
                </p>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Whitelist Content */}
          <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tighter">Access Whitelist</h3>
                <p className="text-[10px] md:text-sm text-muted-foreground/40 uppercase font-black tracking-widest mt-1.5">Authorized Student Directory</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 lg:max-w-4xl lg:justify-end">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search by email..."
                    value={whitelistSearchTerm}
                    onChange={(e) => setWhitelistSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-primary/50 transition-all outline-none placeholder:text-muted-foreground/20 hover:bg-white/[0.08]"
                  />
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                  <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                    <select
                      value={whitelistDomainFilter}
                      onChange={(e) => setWhitelistDomainFilter(e.target.value)}
                      className="w-full sm:w-44 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-3.5 text-[10px] md:text-xs font-black uppercase tracking-widest text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/[0.08]"
                    >
                      <option value="All" className="bg-slate-900">All Domains</option>
                      {domains.map(d => (
                        <option key={d} value={d} className="bg-slate-900 uppercase">{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportSelected}
                      disabled={selectedAllowedStudents.length === 0 || actionLoading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl transition-all text-[10px] md:text-xs font-black uppercase tracking-widest disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-primary/20 active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span> {selectedAllowedStudents.length > 0 ? `(${selectedAllowedStudents.length})` : ""}
                    </button>
                    <button
                      onClick={handleRemoveAllEmails}
                      className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-95"
                      title="Delete All"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
                <input 
                  type="checkbox"
                  checked={selectedAllowedStudents.length === filteredWhitelist.length && filteredWhitelist.length > 0}
                  onChange={handleSelectAllStudents}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-lg md:rounded-xl border-white/10 bg-white/5 text-primary focus:ring-primary/40 cursor-pointer transition-all"
                />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                   {selectedAllowedStudents.length > 0 ? `${selectedAllowedStudents.length} Selected` : "Select All Visible"}
                </span>
              </div>
              
              <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                <span className="text-sm font-black text-white">{filteredWhitelist.length}</span>
                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Matched</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWhitelist.length > 0 ? (
                filteredWhitelist.map((item) => (
                  <div 
                    key={item._id} 
                    className={`bg-white/[0.02] border rounded-2xl p-4 flex items-center justify-between group transition-all ${
                      selectedAllowedStudents.includes(item._id) ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <input 
                        type="checkbox"
                        checked={selectedAllowedStudents.includes(item._id)}
                        onChange={() => handleToggleSelectStudent(item._id)}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/70 truncate">{item.email}</p>
                        <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest truncate">{item.domain}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveEmail(item._id)}
                      className="p-2 text-muted-foreground/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-card/10 rounded-3xl border border-dashed border-white/10">
                  <FileSpreadsheet className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                  <p className="text-muted-foreground/30 text-sm font-medium">No students found matching filters</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Upload className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest mb-1.5">Upload CSV</h4>
              <p className="text-[9px] md:text-xs text-muted-foreground/60 leading-relaxed font-bold uppercase tracking-tighter">
                Upload CSV with an <span className="text-emerald-400">"email"</span> column. Unique IDs will be whitelisted automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl relative shadow-2xl">
            <button onClick={() => setShowScheduleModal(false)} className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-white"><X className="w-6 h-6" /></button>
            <div className="mb-8">
               <h3 className="text-2xl font-bold text-white">{isEditing ? "Update Interview Cycle" : "Configure Interview Cycle"}</h3>
               <p className="text-sm text-muted-foreground/60 mt-1">
                 {isEditing ? "Modify existing cycle and regenerate slots" : "Generate automated interview slots for participants"}
               </p>
            </div>

            <form onSubmit={isEditing ? handleUpdateSchedule : handleCreateSchedule} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Cycle Start Date</label>
                  <input 
                    type="date"
                    required
                    value={scheduleData.startDate}
                    onChange={(e) => setScheduleData({ ...scheduleData, startDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Cycle End Date</label>
                  <input 
                    type="date"
                    required
                    value={scheduleData.endDate}
                    onChange={(e) => setScheduleData({ ...scheduleData, endDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Daily Start Time</label>
                  <input 
                    type="time"
                    required
                    value={scheduleData.dailyStartTime}
                    onChange={(e) => setScheduleData({...scheduleData, dailyStartTime: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Daily End Time</label>
                  <input 
                    type="time"
                    required
                    value={scheduleData.dailyEndTime}
                    onChange={(e) => setScheduleData({...scheduleData, dailyEndTime: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Slot Duration (Min)</label>
                  <input 
                    type="number"
                    required
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({...scheduleData, duration: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Parallel Panels</label>
                  <input 
                    type="number"
                    required
                    value={scheduleData.panels}
                    onChange={(e) => setScheduleData({...scheduleData, panels: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Interview Domain</label>
                <select
                  required
                  value={scheduleData.domain}
                  onChange={(e) => setScheduleData({ ...scheduleData, domain: e.target.value })}
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {domains.map(d => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={actionLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                {isEditing ? "Update Cycle & Regenerate" : "Generate Interview Slots"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Evaluate Modal */}
      {showEvaluateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowEvaluateModal(false)} className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-white"><X className="w-6 h-6" /></button>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white">Record Evaluation</h3>
              <p className="text-sm text-muted-foreground/60 mt-1">Final decision for {selectedBooking?.user?.name}</p>
            </div>

            <form onSubmit={handleEvaluate} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Final Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  {["SELECTED", "REJECTED"].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEvaluationData({...evaluationData, result: r})}
                      className={`py-4 rounded-2xl font-bold text-xs transition-all border ${
                        evaluationData.result === r 
                          ? (r === "SELECTED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30")
                          : "bg-white/5 text-muted-foreground/40 border-transparent hover:border-white/10"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Rating Out of 5</label>
                <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/5 rounded-2xl py-5">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEvaluationData({...evaluationData, rating: num})}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        evaluationData.rating >= num ? "text-amber-400" : "text-white/10"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${evaluationData.rating >= num ? "fill-amber-400" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={actionLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Submit Evaluation
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        isLoading={actionLoading}
        confirmText={confirmState.confirmText}
      />
    </div>
  );
}

