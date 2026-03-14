"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Plus,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Users,
  Target,
  MessageSquare,
  CheckSquare,
  ClipboardList,
  Edit2,
  Trash2,
  Download,
  Loader2,
  X,
  PlusCircle,
  MinusCircle,
  FileDown,
  Check,
  ChevronRight,
  Filter
} from "lucide-react";
import { momService, authService, memberService } from "@/services";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import CustomDatePicker from "@/components/dashboard/CustomDatePicker";

// We'll load html2pdf.js dynamically
const loadHtml2Pdf = () => {
    return new Promise((resolve, reject) => {
        if ((window as any).html2pdf) {
            resolve((window as any).html2pdf);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => resolve((window as any).html2pdf);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

export default function MoMControlPage() {
  const [moms, setMoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingMoM, setEditingMoM] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const [formData, setFormData] = useState<any>({
    title: "",
    date: "",
    time: "",
    location: "",
    domain: "All",
    attendees: [],
    agenda: "",
    discussionPoints: "",
    decisionsTaken: "",
    actionItems: [{ task: "", responsiblePerson: "", deadline: "" }],
    nextMeetingDate: "",
    notes: "",
  });

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const domains = ["Creatives", "Web Dev", "Cloud", "Corporate", "AIML", "APP DEV", "All"];

  useEffect(() => {
    fetchProfile();
    fetchMoMs();
    fetchAllMembers();
  }, [domainFilter, searchTerm]);

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchMoMs = async () => {
    try {
      setLoading(true);
      const res = await momService.getMoMs({ domain: domainFilter, search: searchTerm });
      setMoms(res.data.mms);
    } catch (err) {
      console.error("Failed to fetch MoMs", err);
      toast.error("Failed to load Meeting Minutes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const res = await memberService.getAllMembers();
      setAllMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  const handleOpenModal = (mom: any = null) => {
    if (mom) {
      setEditingMoM(mom);
      setFormData({
        ...mom,
        date: mom.date?.split('T')[0] || "",
        nextMeetingDate: mom.nextMeetingDate?.split('T')[0] || "",
        actionItems: mom.actionItems.map((item: any) => ({
          ...item,
          deadline: item.deadline?.split('T')[0] || ""
        }))
      });
    } else {
      setEditingMoM(null);
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        domain: profile?.domain?.name || "All",
        attendees: [],
        agenda: "",
        discussionPoints: "",
        decisionsTaken: "",
        actionItems: [{ task: "", responsiblePerson: "", deadline: "" }],
        nextMeetingDate: "",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleToggleAttendee = (name: string) => {
    const current = [...formData.attendees];
    if (current.includes(name)) {
      setFormData({ ...formData, attendees: current.filter(n => n !== name) });
    } else {
      setFormData({ ...formData, attendees: [...current, name] });
    }
  };

  const handleSelectDomainMembers = (domain: string, members: any[]) => {
    const current = [...formData.attendees];
    const domainMemberNames = members.map(m => m.name);
    
    // If all are already selected, deselect them. Otherwise, select all.
    const allSelected = domainMemberNames.every(name => current.includes(name));
    
    if (allSelected) {
      setFormData({ ...formData, attendees: current.filter(n => !domainMemberNames.includes(n)) });
    } else {
      const newAttendees = Array.from(new Set([...current, ...domainMemberNames]));
      setFormData({ ...formData, attendees: newAttendees });
    }
  };

  const handleAddField = (field: "actionItems") => {
    setFormData({
      ...formData,
      actionItems: [...formData.actionItems, { task: "", responsiblePerson: "", deadline: "" }]
    });
  };

  const handleRemoveField = (field: "actionItems", index: number) => {
    const updated = formData.actionItems.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, actionItems: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.attendees.length === 0) {
        toast.error("Please select at least one attendee");
        return;
    }
    setActionLoading(true);
    try {
      if (editingMoM) {
        await momService.updateMoM(editingMoM._id, formData);
        toast.success("Minutes updated successfully");
      } else {
        await momService.createMoM(formData);
        toast.success("Minutes created successfully");
      }
      setShowModal(false);
      fetchMoMs();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMoM = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Minutes",
      message: "Are you sure you want to delete these meeting minutes? This action cannot be undone.",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await momService.deleteMoM(id);
          fetchMoMs();
          toast.success("Minutes deleted");
        } catch (err) {
          toast.error("Deletion failed");
        } finally {
          setActionLoading(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Group members by domain
  const membersByDomain = allMembers.reduce((acc: any, member: any) => {
    const domain = member.domain?.name || "Unassigned";
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(member);
    return acc;
  }, {});

  const downloadPDF = async (mom: any) => {
    const html2pdf = await loadHtml2Pdf() as any;
    
    const element = document.createElement("div");
    element.className = "p-10 text-slate-900 bg-white font-sans max-w-[800px] mx-auto";
    element.innerHTML = `
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
        <h1 style="font-size: 28px; font-weight: 900; color: #1e1e1e; margin: 0; text-transform: uppercase; letter-spacing: -0.5px;">Minutes of Meeting</h1>
        <p style="color: #3b82f6; font-size: 14px; font-weight: 700; margin-top: 5px; text-transform: uppercase;">SIC Admin Portal</p>
      </div>

      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div>
          <h2 style="font-size: 20px; color: #1e1e1e; margin-bottom: 10px; border-left: 4px solid #3b82f6; padding-left: 10px;">General Information</h2>
          <table style="width: 100%; font-size: 13px;">
            <tr><td style="font-weight: 700; width: 120px; padding: 4px 0;">Meeting Title:</td><td>${mom.title}</td></tr>
            <tr><td style="font-weight: 700; padding: 4px 0;">Date:</td><td>${new Date(mom.date).toLocaleDateString()}</td></tr>
            <tr><td style="font-weight: 700; padding: 4px 0;">Time:</td><td>${mom.time}</td></tr>
            <tr><td style="font-weight: 700; padding: 4px 0;">Location:</td><td>${mom.location}</td></tr>
            <tr><td style="font-weight: 700; padding: 4px 0;">Domain:</td><td>${mom.domain}</td></tr>
          </table>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #1e1e1e; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px;">Attendees</h3>
        <p style="font-size: 13px; color: #444;">${mom.attendees.join(", ")}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #1e1e1e; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px;">Agenda</h3>
        <p style="font-size: 13px; color: #444; white-space: pre-wrap;">${mom.agenda}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #1e1e1e; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px;">Discussion Points</h3>
        <p style="font-size: 13px; color: #444; white-space: pre-wrap;">${mom.discussionPoints}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #1e1e1e; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px;">Decisions Taken</h3>
        <p style="font-size: 13px; color: #444; white-space: pre-wrap;">${mom.decisionsTaken}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; color: #1e1e1e; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px;">Action Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #3b82f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Task</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Responsible</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e2e8f0;">Deadline</th>
            </tr>
          </thead>
          <tbody>
            ${mom.actionItems.map((item: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.task}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.responsiblePerson}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.deadline ? new Date(item.deadline).toLocaleDateString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-top: 50px; font-size: 13px;">
        <div>
          <p style="margin-bottom: 20px;"><strong>Next Meeting:</strong> ${mom.nextMeetingDate ? new Date(mom.nextMeetingDate).toLocaleDateString() : 'To be confirmed'}</p>
          <p><strong>Notes:</strong> ${mom.notes || "None"}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin-bottom: 5px;"><strong>Prepared By:</strong></p>
          <p style="font-size: 15px; font-weight: 800; color: #3b82f6; margin: 0;">${mom.preparedBy?.name || profile?.name}</p>
          <p style="color: #64748b; font-size: 11px;">Electronic Documentation</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `MoM_${mom.title.replace(/\s+/g, '_')}_${new Date(mom.date).toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">MOM Dashboard</h2>
          <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Documenting strategic decisions & action items</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-black py-3 px-8 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Log New Meeting
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="w-full lg:w-64 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white focus:border-primary/50 transition-all outline-none"
          />
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto no-scrollbar w-full lg:w-auto">
          {["All", "Creatives", "Web Dev", "Cloud", "Corporate", "AIML", "APP DEV"].map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                domainFilter === d ? "bg-primary text-white shadow-lg" : "text-muted-foreground/40 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* MoM List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
        </div>
      ) : moms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {moms.map((mom) => (
            <div
              key={mom._id}
              className="bg-card/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 group hover:border-primary/20 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <FileText className="w-12 h-12 text-primary" />
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black text-primary bg-primary/10 border border-primary/20 uppercase tracking-widest">{mom.domain}</span>
                    <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{new Date(mom.date).toLocaleDateString()}</span>
                 </div>

                 <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{mom.title}</h3>
                 
                 <div className="flex items-center gap-4 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {mom.time}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {mom.location}</div>
                 </div>

                 <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {mom.attendees.slice(0, 3).map((a: string, i: number) => (
                         <div key={i} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-primary" title={a}>
                            {a.charAt(0).toUpperCase()}
                         </div>
                       ))}
                       {mom.attendees.length > 3 && (
                         <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                            +{mom.attendees.length - 3}
                         </div>
                       )}
                    </div>

                    <div className="flex items-center gap-2">
                       <button
                         onClick={() => downloadPDF(mom)}
                         className="p-2.5 rounded-xl bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all"
                         title="Download PDF"
                       >
                         <FileDown className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => handleOpenModal(mom)}
                         className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-primary hover:text-white border border-white/10 transition-all"
                         title="Edit Minutes"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       {(profile?.domain?.role === "FOUNDER" || profile?.domain?.role === "PRESIDENT" || mom.preparedBy?._id === profile?._id) && (
                         <button
                           onClick={() => handleDeleteMoM(mom._id)}
                           className="p-2.5 rounded-xl bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
                           title="Delete"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-card/10 rounded-[3rem] border border-dashed border-white/5">
          <FileText className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
          <p className="text-muted-foreground/40 font-medium">No meeting logs found in this sequence.</p>
        </div>
      )}

      {/* MoM Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2l border border-white/10 rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col relative shadow-2xl overflow-hidden">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-white z-10 transition-colors">
               <X className="w-6 h-6" />
            </button>

            <div className="p-10 pb-6 border-b border-white/5">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                     <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">{editingMoM ? "Modify Minutes" : "Capture Meeting Details"}</h3>
                    <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] mt-0.5">Operational Record Submission • SIC Admin</p>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-10 pt-8 space-y-12 pb-32">
               {/* Grid 1: Basic Info */}
               <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Metadata & Logistics</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Title</label>
                        <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all shadow-inner" placeholder="Strategic Planning..." />
                    </div>
                    <CustomDatePicker label="Meeting Date" value={formData.date} onChange={(val) => setFormData({...formData, date: val})} />
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Time</label>
                        <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Location</label>
                        <input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all" placeholder="Conference Room / Virtual" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Responsible Domain</label>
                        <select value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all appearance-none">
                            {domains.map(d => <option key={d} value={d} className="bg-[#111]">{d}</option>)}
                        </select>
                    </div>
                    <CustomDatePicker label="Next Meeting Date (Optional)" value={formData.nextMeetingDate} onChange={(val) => setFormData({...formData, nextMeetingDate: val})} />
                </div>
               </section>

               {/* Attendees Selection */}
               <section className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Personnel Selection</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">{formData.attendees.length} Verified Participants Selected</div>
                        <div className="w-48 relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search member..." 
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-[10px] text-white outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                      </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 max-h-[400px] overflow-y-auto no-scrollbar space-y-8">
                    {Object.entries(membersByDomain).map(([domain, members]: [string, any]) => {
                        const filteredMembers = members.filter((m: any) => m.name.toLowerCase().includes(memberSearch.toLowerCase()));
                        if (filteredMembers.length === 0) return null;
                        
                        const domainMemberNames = filteredMembers.map(m => m.name);
                        const isAllSelected = domainMemberNames.every(name => formData.attendees.includes(name));
                        const isExpanded = expandedDomains.includes(domain);

                        return (
                            <div key={domain} className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setExpandedDomains(prev => isExpanded ? prev.filter(d => d !== domain) : [...prev, domain])}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className={`p-1 rounded-lg bg-white/5 group-hover:bg-primary/20 transition-all ${isExpanded ? 'rotate-90 text-primary' : 'text-muted-foreground/40'}`}>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{domain}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[8px] font-bold text-muted-foreground/40">{filteredMembers.length} Members</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleSelectDomainMembers(domain, filteredMembers)}
                                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-all ${
                                            isAllSelected 
                                            ? 'bg-primary/10 border-primary/20 text-primary' 
                                            : 'bg-white/5 border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {isAllSelected ? 'Deselect Domain' : 'Select All Domain'}
                                    </button>
                                </div>
                                
                                {isExpanded && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {filteredMembers.map((member: any) => {
                                            const isSelected = formData.attendees.includes(member.name);
                                            return (
                                                <button
                                                    key={member._id}
                                                    type="button"
                                                    onClick={() => handleToggleAttendee(member.name)}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                                                        isSelected 
                                                        ? 'bg-primary/10 border-primary/30 shadow-[0_5px_15px_-5px_rgba(59,130,246,0.3)]' 
                                                        : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-colors ${
                                                        isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground/40'
                                                    }`}>
                                                        {isSelected ? <Check className="w-4 h-4" /> : member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-muted-foreground/60'}`}>{member.name}</p>
                                                        <p className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-tighter truncate">{member.domain?.role || 'Member'}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                  </div>
               </section>

               {/* Rich Content Fields */}
               <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Deliberations & Context</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Meeting Agenda</label>
                        <textarea rows={4} value={formData.agenda} onChange={(e) => setFormData({...formData, agenda: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Primary objectives..." />
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Discussion Timeline</label>
                        <textarea rows={4} value={formData.discussionPoints} onChange={(e) => setFormData({...formData, discussionPoints: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Detailed chronological log..." />
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Key Decisions</label>
                        <textarea rows={4} value={formData.decisionsTaken} onChange={(e) => setFormData({...formData, decisionsTaken: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Finalized resolutions..." />
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Supplementary Notes</label>
                        <textarea rows={4} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Side context or constraints..." />
                    </div>
                </div>
               </section>

               {/* Action Items */}
               <section className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Roadmap</h4>
                     </div>
                     <button type="button" onClick={() => handleAddField('actionItems')} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                        <PlusCircle className="w-3.5 h-3.5" /> Initialize Action
                     </button>
                  </div>
                  <div className="space-y-4">
                     {formData.actionItems.map((item: any, i: number) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white/[0.02] p-5 rounded-[2rem] border border-white/5 relative group transition-all hover:bg-white/[0.04] hover:border-white/10">
                           <div className="md:col-span-5 space-y-1">
                              <label className="text-[8px] font-black text-muted-foreground/20 uppercase ml-1">Deliverable Task</label>
                              <input value={item.task} onChange={(e) => {
                                 const updated = [...formData.actionItems];
                                 updated[i].task = e.target.value;
                                 setFormData({...formData, actionItems: updated});
                              }} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-primary transition-all" placeholder="Quantifiable action..." />
                           </div>
                           <div className="md:col-span-3 space-y-1">
                              <label className="text-[8px] font-black text-muted-foreground/20 uppercase ml-1">Responsible Entity</label>
                              <input value={item.responsiblePerson} onChange={(e) => {
                                 const updated = [...formData.actionItems];
                                 updated[i].responsiblePerson = e.target.value;
                                 setFormData({...formData, actionItems: updated});
                              }} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-primary transition-all" placeholder="Agent Name" />
                           </div>
                           <div className="md:col-span-3 space-y-1">
                              <label className="text-[8px] font-black text-muted-foreground/20 uppercase ml-1">Timeline Deadline</label>
                              <input type="date" value={item.deadline} onChange={(e) => {
                                 const updated = [...formData.actionItems];
                                 updated[i].deadline = e.target.value;
                                 setFormData({...formData, actionItems: updated});
                              }} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-primary transition-all" />
                           </div>
                           <div className="md:col-span-1 flex justify-center pb-1">
                              {formData.actionItems.length > 1 && (
                                <button type="button" onClick={() => handleRemoveField('actionItems', i)} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            </form>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-card/90 backdrop-blur-3xl border-t border-white/10 flex items-center justify-between z-20">
               <div className="hidden md:flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Authenticated Preparation</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-xs font-bold text-muted-foreground">{profile?.name || "Indexing System..."}</p>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-4 w-full md:w-auto">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 md:flex-none py-4 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-all whitespace-nowrap active:scale-95">Discard Sequence</button>
                  <button onClick={handleSubmit} disabled={actionLoading} className="flex-1 md:flex-none py-4 px-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
                     {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMoM ? <ClipboardList className="w-4 h-4 shadow-sm" /> : <CheckSquare className="w-4 h-4 shadow-sm" />}
                     {editingMoM ? "Verify and Patch" : "Log Sequence"}
                  </button>
               </div>
            </div>
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
        confirmText="Confirm Delete"
      />
    </div>
  );
}
