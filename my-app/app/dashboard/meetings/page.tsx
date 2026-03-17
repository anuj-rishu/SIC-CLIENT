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
  Filter,
  Video,
  CheckCircle2,
  Link as LinkIcon,
  History
} from "lucide-react";
import { momService, authService, memberService, meetingService } from "@/services";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { useData } from "@/app/context/DataContext";



export default function MeetingsPage() {
  const { profile } = useData();
  const [moms, setMoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingMoM, setEditingMoM] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeView, setActiveView] = useState<"minutes" | "meetings">("minutes");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [meetingStep, setMeetingStep] = useState(1);
  const meetingSteps = [
    { id: 1, title: "Logistics", icon: Calendar },
    { id: 2, title: "Participants", icon: Users },
    { id: 3, title: "Briefing", icon: FileText },
  ];

  const [meetingFormData, setMeetingFormData] = useState({
    title: "",
    agenda: "",
    date: "",
    time: "",
    domains: [] as string[],
    participantIds: [] as string[]
  });

  const steps = [
    { id: 1, title: "Logistics", icon: Calendar },
    { id: 2, title: "Personnel", icon: Users },
    { id: 3, title: "Deliberations", icon: MessageSquare },
    { id: 4, title: "Roadmap", icon: Target },
  ];

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
    if (activeView === "minutes") {
      fetchMoMs();
    } else {
      fetchMeetings();
    }
    fetchAllMembers();
  }, [domainFilter, searchTerm, activeView]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetingService.getMeetings();
      setMeetings(res.data);
    } catch (err) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
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
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleOpenMeetingModal = (meeting: any = null) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setMeetingFormData({
        title: meeting.title,
        agenda: meeting.agenda,
        date: meeting.date?.split('T')[0] || "",
        time: meeting.time || "",
        domains: meeting.domains || [],
        participantIds: meeting.participants?.map((p: any) => p._id) || []
      });
    } else {
      setEditingMeeting(null);
      setMeetingFormData({
        title: "",
        agenda: "",
        date: "",
        time: "",
        domains: [],
        participantIds: []
      });
    }
    setMeetingStep(1);
    setShowMeetingModal(true);
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
    // Filter out completely empty action items
    const filteredActionItems = formData.actionItems.filter(
      (item: any) => item.task.trim() || item.responsiblePerson.trim() || item.deadline.trim()
    );

    const submissionData = {
      ...formData,
      actionItems: filteredActionItems
    };

    setActionLoading(true);
    try {
      if (editingMoM) {
        await momService.updateMoM(editingMoM._id, submissionData);
        toast.success("Minutes updated successfully");
      } else {
        await momService.createMoM(submissionData);
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
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(meetingFormData.date);
    if (selectedDate < today) {
      toast.error("Cannot schedule meetings in the past");
      return;
    }

    setActionLoading(true);
    try {
      if (editingMeeting) {
        await meetingService.updateMeeting(editingMeeting._id, meetingFormData);
        toast.success("Meeting updated successfully");
      } else {
        await meetingService.scheduleMeeting(meetingFormData);
        toast.success("Meeting scheduled successfully");
      }
      setShowMeetingModal(false);
      setMeetingFormData({
        title: "",
        agenda: "",
        date: "",
        time: "",
        domains: [],
        participantIds: [] as string[]
      });
      setEditingMeeting(null);
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to save meeting");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMeeting = async (id: string) => {
    try {
      await meetingService.completeMeeting(id);
      toast.success("Meeting marked as completed");
      fetchMeetings();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  // Group members by domain
  const membersByDomain = allMembers.reduce((acc: any, member: any) => {
    const domain = member.domain?.name || "Unassigned";
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(member);
    return acc;
  }, {});

  const handleToggleMeetingParticipant = (id: string) => {
    setMeetingFormData(prev => {
      const current = prev.participantIds;
      if (current.includes(id)) {
        return { ...prev, participantIds: current.filter(p => p !== id) };
      } else {
        return { ...prev, participantIds: [...current, id] };
      }
    });
  };

  const handleSelectAllMeetingDomain = (domain: string, members: any[]) => {
    const memberIds = members.map(m => m._id);
    setMeetingFormData(prev => {
      const current = prev.participantIds;
      const allSelected = memberIds.every(id => current.includes(id));
      
      if (allSelected) {
        return { ...prev, participantIds: current.filter(id => !memberIds.includes(id)) };
      } else {
        const newParticipants = [...new Set([...current, ...memberIds])];
        return { ...prev, participantIds: newParticipants };
      }
    });
  };

  const downloadPDF = async (mom: any) => {
    try {
      toast.loading("Generating Secure PDF...", { id: 'pdf-download' });
      const response = await momService.downloadMoMPDF(mom._id);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MOM_${mom.domain}_${mom.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("MOM Downloaded Successfully", { id: 'pdf-download' });
    } catch (err) {
      console.error("PDF Download failed", err);
      toast.error("Failed to generate PDF", { id: 'pdf-download' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => setActiveView("minutes")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeView === "minutes" 
            ? "bg-primary text-white shadow-lg shadow-primary/20" 
            : "bg-white/5 text-muted-foreground/40 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" /> Minutes Catalog
        </button>
        <button 
          onClick={() => setActiveView("meetings")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeView === "meetings" 
            ? "bg-primary text-white shadow-lg shadow-primary/20" 
            : "bg-white/5 text-muted-foreground/40 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" /> Active Schedules
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={activeView === "minutes" ? "Search titles..." : "Search meetings..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white focus:border-primary/50 transition-all outline-none"
          />
        </div>

        {activeView === "minutes" && (
          <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
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
        )}

        <button
          onClick={() => activeView === "minutes" ? handleOpenModal() : handleOpenMeetingModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-black py-3 px-6 rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 text-[10px] uppercase tracking-widest whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> {activeView === "minutes" ? "Log New Minutes" : "Schedule Meeting"}
        </button>
      </div>

      {/* MoM List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
        </div>
      ) : activeView === "minutes" ? (
        moms.length > 0 ? (
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
                                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                       <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {mom.time}</div>
                       <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {mom.location}</div>
                    </div>
                    {mom.preparedBy && (
                       <div className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-widest flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                          <Target className="w-3 h-3" /> {mom.preparedBy.name}
                       </div>
                    )}
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
      )) : (
        /* Meetings List */
        meetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-card/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 group hover:border-primary/20 transition-all relative overflow-hidden"
              >
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                       {meeting.domains.map((d: string) => (
                           <span key={d} className="px-2 py-0.5 rounded-full text-[8px] font-black text-primary bg-primary/10 border border-primary/20 uppercase tracking-widest">{d}</span>
                       ))}
                      <span className={`text-[10px] font-bold uppercase tracking-widest ml-auto ${
                        meeting.status === 'COMPLETED' ? 'text-emerald-400' : 'text-primary'
                      }`}>{meeting.status}</span>
                   </div>

                   <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{meeting.title}</h3>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                         <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(meeting.date).toLocaleDateString()}</div>
                         <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {meeting.time}</div>
                      </div>
                   </div>

                   <p className="text-[10px] text-muted-foreground/60 line-clamp-2">{meeting.agenda}</p>

                   <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         {meeting.googleMeetLink && meeting.status !== 'COMPLETED' ? (
                           <a
                             href={meeting.googleMeetLink}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                           >
                              <Video className="w-3.5 h-3.5" /> Join Meet
                           </a>
                         ) : meeting.status === 'COMPLETED' ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                               <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                            </div>
                         ) : (
                            <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest">No Link Generated</div>
                         )}
                      </div>

                      <div className="flex items-center gap-2">
                         {meeting.status !== 'COMPLETED' && (profile?.domain?.role === "FOUNDER" || profile?.domain?.role === "PRESIDENT" || meeting.createdBy?._id === profile?._id) && (
                           <button
                             onClick={() => handleCompleteMeeting(meeting._id)}
                             className="p-2.5 rounded-xl bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all"
                             title="Mark as Completed"
                           >
                             <CheckCircle2 className="w-4 h-4" />
                           </button>
                         )}
                         {(profile?.domain?.role === "FOUNDER" || profile?.domain?.role === "PRESIDENT" || meeting.createdBy?._id === profile?._id) && (
                           <>
                             <button
                               onClick={() => handleOpenMeetingModal(meeting)}
                               className="p-2.5 rounded-xl bg-white/5 text-muted-foreground hover:bg-primary hover:text-white border border-white/10 transition-all"
                               title="Edit Meeting"
                             >
                               <Edit2 className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => {
                                 setConfirmState({
                                   isOpen: true,
                                   title: "Cancel Meeting",
                                   message: "Are you sure you want to cancel and delete this meeting?",
                                   onConfirm: async () => {
                                     setActionLoading(true);
                                     try {
                                       await meetingService.deleteMeeting(meeting._id);
                                       fetchMeetings();
                                       toast.success("Meeting cancelled");
                                     } catch (err) {
                                       toast.error("Action failed");
                                     } finally {
                                       setActionLoading(false);
                                       setConfirmState(prev => ({ ...prev, isOpen: false }));
                                     }
                                   }
                                 });
                               }}
                               className="p-2.5 rounded-xl bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
                               title="Cancel Meeting"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-card/10 rounded-[3rem] border border-dashed border-white/5">
            <Video className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
            <p className="text-muted-foreground/40 font-medium">No active schedules found.</p>
          </div>
        )
      )}

      {/* Schedule Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border-x md:border border-white/10 rounded-none md:rounded-[2.5rem] w-full max-w-5xl h-full md:h-[90vh] flex flex-col relative shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10 md:pb-6 border-b border-white/5 bg-card/50 backdrop-blur-md relative z-30">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                     <div className="hidden md:flex w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                         <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">{editingMeeting ? "Modify Session" : "Schedule New Session"}</h3>
                         <p className="text-[8px] md:text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] mt-0.5">Step {meetingStep} of 3 • {meetingSteps[meetingStep-1].title}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-6">
                      {/* Progress Indicator */}
                      <div className="hidden md:flex items-center gap-2">
                         {meetingSteps.map((step) => (
                            <React.Fragment key={step.id}>
                               <div className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
                                  meetingStep >= step.id 
                                  ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                  : 'bg-white/5 border-white/10 text-muted-foreground/20'
                               }`}>
                                  <step.icon className="w-4 h-4" />
                               </div>
                               {step.id < 3 && (
                                  <div className={`w-4 md:w-8 h-0.5 rounded-full transition-all ${
                                     meetingStep > step.id ? 'bg-primary/40' : 'bg-white/5'
                                  }`} />
                               )}
                            </React.Fragment>
                         ))}
                      </div>

                      <button onClick={() => setShowMeetingModal(false)} className="self-end md:self-center p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-muted-foreground hover:text-white transition-all border border-white/5">
                         <X className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                   </div>
               </div>
            </div>

            <form onSubmit={handleScheduleMeeting} className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-10 md:pt-8 space-y-8 md:space-y-10 pb-32">
               {/* Step 1: Logistics */}
               {meetingStep === 1 && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Meeting Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-1 space-y-2">
                        <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Title</label>
                        <input required value={meetingFormData.title} onChange={(e) => setMeetingFormData({...meetingFormData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all shadow-inner" placeholder="Strategic Planning..." />
                     </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Date</label>
                          <div className="relative group">
                             <div className="absolute left-0 inset-y-0 pl-4 flex items-center pointer-events-none z-10">
                                <Calendar className="w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors duration-300" />
                             </div>
                             <input 
                                required 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                value={meetingFormData.date} 
                                onChange={(e) => setMeetingFormData({...meetingFormData, date: e.target.value})} 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner appearance-none calendar-picker-indicator-white" 
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Time</label>
                          <div className="relative group">
                             <div className="absolute left-0 inset-y-0 pl-4 flex items-center pointer-events-none z-10">
                                <Clock className="w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors duration-300" />
                             </div>
                             <input 
                                required 
                                type="time" 
                                value={meetingFormData.time} 
                                onChange={(e) => setMeetingFormData({...meetingFormData, time: e.target.value})} 
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner appearance-none" 
                             />
                          </div>
                       </div>
                  </div>
               </section>
               )}

               {/* Step 2: Participants */}
               {meetingStep === 2 && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Individual Invitees</h4>
                     </div>
                     <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="text-[8px] md:text-[9px] font-bold text-primary/60 uppercase tracking-widest">{meetingFormData.participantIds.length} Selected</div>
                        <div className="w-full sm:w-48 relative group">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                              <input 
                                 type="text" 
                                 placeholder="Search..." 
                                 value={memberSearch}
                                 onChange={(e) => setMemberSearch(e.target.value)}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-[10px] text-white outline-none focus:border-primary/50 transition-all"
                              />
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 max-h-[50vh] overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
                     {Object.entries(membersByDomain).map(([domain, members]: [string, any]) => {
                        const filteredMembers = members.filter((m: any) => m.name.toLowerCase().includes(memberSearch.toLowerCase()));
                        if (filteredMembers.length === 0) return null;
                        
                        const memberIds = filteredMembers.map((m: any) => m._id);
                        const isAllSelected = memberIds.every((id: string) => meetingFormData.participantIds.includes(id));
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
                                       onClick={() => handleSelectAllMeetingDomain(domain, filteredMembers)}
                                       className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border transition-all ${
                                             isAllSelected 
                                             ? 'bg-primary/10 border-primary/20 text-primary' 
                                             : 'bg-white/5 border-white/10 text-muted-foreground/40 hover:text-white hover:border-white/20'
                                       }`}
                                    >
                                       {isAllSelected ? 'Deselect Team' : 'Select Entire Team'}
                                    </button>
                                 </div>
                                 
                                 {isExpanded && (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                       {filteredMembers.map((member: any) => {
                                             const isSelected = meetingFormData.participantIds.includes(member._id);
                                             return (
                                                <button
                                                   key={member._id}
                                                   type="button"
                                                   onClick={() => handleToggleMeetingParticipant(member._id)}
                                                   className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all text-left ${
                                                      isSelected 
                                                      ? 'bg-primary/10 border-primary/30 shadow-[0_5px_15px_-5px_rgba(59,130,246,0.3)]' 
                                                      : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                                                   }`}
                                                >
                                                   <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-[10px] font-black transition-colors shrink-0 ${
                                                      isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground/40'
                                                   }`}>
                                                      {isSelected ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : member.name.charAt(0).toUpperCase()}
                                                   </div>
                                                   <div className="flex-1 min-w-0">
                                                      <p className={`text-[10px] md:text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-muted-foreground/60'}`}>{member.name}</p>
                                                      <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/20 uppercase tracking-tighter truncate">{member.domain?.role || 'Member'}</p>
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
               )}

               {/* Step 3: Agenda */}
               {meetingStep === 3 && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Meeting Agenda</h4>
                     </div>
                     <textarea rows={4} value={meetingFormData.agenda} onChange={(e) => setMeetingFormData({...meetingFormData, agenda: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Primary objectives..." />
                  </section>
               )}
             <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-card/90 backdrop-blur-3xl border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
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
                <div className="flex flex-row items-center gap-2 w-full md:w-auto">
                   <button type="button" onClick={() => { setShowMeetingModal(false); setEditingMeeting(null); setMeetingFormData({ title: "", agenda: "", date: "", time: "", domains: [], participantIds: [] }); }} className="flex-1 md:flex-none py-3 md:py-4 px-4 md:px-10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-all whitespace-nowrap active:scale-95">Discard</button>
                   
                   {meetingStep > 1 && (
                      <button type="button" onClick={() => setMeetingStep(prev => prev - 1)} className="flex-1 md:flex-none py-3 md:py-4 px-4 md:px-10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white border border-white/5 hover:border-white/10 transition-all whitespace-nowrap active:scale-95">Back</button>
                   )}

                   {meetingStep < 3 ? (
                      <button type="button" onClick={() => setMeetingStep(prev => prev + 1)} className="flex-[2] md:flex-none py-3 md:py-4 px-6 md:px-12 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3">
                         Next <ChevronRight className="w-4 h-4" />
                      </button>
                   ) : (
                      <button type="submit" disabled={actionLoading} className="flex-[2] md:flex-none py-3 md:py-4 px-6 md:px-12 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3">
                         {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMeeting ? <CheckSquare className="w-4 h-4 shadow-sm" /> : <Plus className="w-4 h-4 shadow-sm" />}
                         {editingMeeting ? "Update Session" : "Schedule Session"}
                      </button>
                   )}
                </div>
             </div>
            </form>
          </div>
        </div>
      )}

      {/* MoM Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border-x md:border border-white/10 rounded-none md:rounded-[2.5rem] w-full max-w-5xl h-full md:h-[90vh] flex flex-col relative shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10 md:pb-6 border-b border-white/5 bg-card/50 backdrop-blur-md relative z-30">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                     <div className="hidden md:flex w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">{editingMoM ? "Modify Minutes" : "Capture Meeting Details"}</h3>
                        <p className="text-[8px] md:text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] mt-0.5">Step {currentStep} of 4 • {steps[currentStep-1].title}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-6">
                     {/* Progress Indicator */}
                     <div className="hidden md:flex items-center gap-2">
                        {steps.map((step) => (
                           <React.Fragment key={step.id}>
                              <div className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-all ${
                                 currentStep >= step.id 
                                 ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                 : 'bg-white/5 border-white/10 text-muted-foreground/20'
                              }`}>
                                 <step.icon className="w-4 h-4" />
                              </div>
                              {step.id < 4 && (
                                 <div className={`w-4 md:w-8 h-0.5 rounded-full transition-all ${
                                    currentStep > step.id ? 'bg-primary/40' : 'bg-white/5'
                                 }`} />
                              )}
                           </React.Fragment>
                        ))}
                     </div>

                     <button onClick={() => setShowModal(false)} className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-muted-foreground hover:text-white transition-all border border-white/5">
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-10 md:pt-8 space-y-6 md:space-y-12 pb-32">
               {/* Step 1: Basic Info */}
               {currentStep === 1 && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Metadata & Logistics</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Title</label>
                           <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-primary transition-all shadow-inner" placeholder="Strategic Planning..." />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Date</label>
                            <div className="relative group">
                               <div className="absolute left-0 inset-y-0 pl-4 flex items-center pointer-events-none z-10">
                                  <Calendar className="w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors duration-300" />
                               </div>
                               <input 
                                  required 
                                  type="date" 
                                  value={formData.date} 
                                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner appearance-none calendar-picker-indicator-white" 
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Meeting Time</label>
                            <div className="relative group">
                               <div className="absolute left-0 inset-y-0 pl-4 flex items-center pointer-events-none z-10">
                                  <Clock className="w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors duration-300" />
                               </div>
                               <input 
                                  required 
                                  type="time" 
                                  value={formData.time} 
                                  onChange={(e) => setFormData({...formData, time: e.target.value})} 
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner appearance-none" 
                               />
                            </div>
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
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Next Meeting Date (Optional)</label>
                            <div className="relative group">
                               <div className="absolute left-0 inset-y-0 pl-4 flex items-center pointer-events-none z-10">
                                  <Calendar className="w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors duration-300" />
                               </div>
                               <input 
                                  type="date" 
                                  value={formData.nextMeetingDate} 
                                  onChange={(e) => setFormData({...formData, nextMeetingDate: e.target.value})} 
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-inner appearance-none calendar-picker-indicator-white" 
                               />
                            </div>
                         </div>
                     </div>
                  </section>
               )}

               {/* Step 2: Attendees */}
               {currentStep === 2 && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Personnel Selection</h4>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="text-[8px] md:text-[9px] font-bold text-primary/60 uppercase tracking-widest">{formData.attendees.length} Selected</div>
                        <div className="w-full sm:w-48 relative group">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                              <input 
                                 type="text" 
                                 placeholder="Search..." 
                                 value={memberSearch}
                                 onChange={(e) => setMemberSearch(e.target.value)}
                                 className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-[10px] text-white outline-none focus:border-primary/50 transition-all"
                              />
                        </div>
                        </div>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-8 max-h-[50vh] overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
                        {Object.entries(membersByDomain).map(([domain, members]: [string, any]) => {
                           const filteredMembers = members.filter((m: any) => m.name.toLowerCase().includes(memberSearch.toLowerCase()));
                           if (filteredMembers.length === 0) return null;
                           
                           const domainMemberNames = filteredMembers.map((m: any) => m.name);
                           const isAllSelected = domainMemberNames.every((name: string) => formData.attendees.includes(name));
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
                                       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                          {filteredMembers.map((member: any) => {
                                                const isSelected = formData.attendees.includes(member.name);
                                                return (
                                                   <button
                                                      key={member._id}
                                                      type="button"
                                                      onClick={() => handleToggleAttendee(member.name)}
                                                      className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all text-left ${
                                                         isSelected 
                                                         ? 'bg-primary/10 border-primary/30 shadow-[0_5px_15px_-5px_rgba(59,130,246,0.3)]' 
                                                         : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                                                      }`}
                                                   >
                                                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-[10px] font-black transition-colors shrink-0 ${
                                                         isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground/40'
                                                      }`}>
                                                         {isSelected ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : member.name.charAt(0).toUpperCase()}
                                                      </div>
                                                      <div className="flex-1 min-w-0">
                                                         <p className={`text-[10px] md:text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-muted-foreground/60'}`}>{member.name}</p>
                                                         <p className="text-[7px] md:text-[8px] font-black text-muted-foreground/20 uppercase tracking-tighter truncate">{member.domain?.role || 'Member'}</p>
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
               )}

               {/* Step 3: Deliberations */}
               {currentStep === 3 && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Deliberations & Context</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-2 group">
                           <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Meeting Agenda</label>
                           <textarea rows={4} value={formData.agenda} onChange={(e) => setFormData({...formData, agenda: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 px-4 md:px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Primary objectives..." />
                        </div>
                        <div className="space-y-2 group">
                           <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Discussion Timeline</label>
                           <textarea rows={4} value={formData.discussionPoints} onChange={(e) => setFormData({...formData, discussionPoints: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 px-4 md:px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Detailed chronological log..." />
                        </div>
                        <div className="space-y-2 group">
                           <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Key Decisions</label>
                           <textarea rows={4} value={formData.decisionsTaken} onChange={(e) => setFormData({...formData, decisionsTaken: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 px-4 md:px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Finalized resolutions..." />
                        </div>
                     </div>
                  </section>
               )}

               {/* Step 4: Roadmap */}
               {currentStep === 4 && (
                  <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Roadmap</h4>
                           </div>
                           <button type="button" onClick={() => handleAddField('actionItems')} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                              <PlusCircle className="w-3.5 h-3.5" /> Initialize Action
                           </button>
                        </div>
                        <div className="space-y-4 md:space-y-6 pr-2">
                           {formData.actionItems.map((item: any, i: number) => (
                              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white/[0.02] p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-white/5 relative group transition-all hover:bg-white/[0.04] hover:border-white/10">
                                 <div className="md:col-span-12 lg:col-span-5 space-y-1">
                                    <label className="text-[8px] font-black text-muted-foreground/20 uppercase ml-1">Deliverable Task</label>
                                    <input value={item.task} onChange={(e) => {
                                       const updated = [...formData.actionItems];
                                       updated[i].task = e.target.value;
                                       setFormData({...formData, actionItems: updated});
                                    }} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-primary transition-all" placeholder="Quantifiable action..." />
                                 </div>
                                 <div className="md:col-span-5 lg:col-span-3 space-y-1">
                                    <label className="text-[8px] font-black text-muted-foreground/20 uppercase ml-1">Responsible Entity</label>
                                    <input value={item.responsiblePerson} onChange={(e) => {
                                       const updated = [...formData.actionItems];
                                       updated[i].responsiblePerson = e.target.value;
                                       setFormData({...formData, actionItems: updated});
                                    }} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white outline-none focus:border-primary transition-all" placeholder="Agent Name" />
                                 </div>
                                 <div className="md:col-span-12 lg:col-span-3 space-y-1">
                                    <label className="text-[8px] font-black text-muted-foreground/20 uppercase ml-1">Timeline Deadline</label>
                                    <div className="relative group/field">
                                     <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none z-10">
                                        <Calendar className="w-3.5 h-3.5 text-primary/40 group-focus-within/field:text-primary transition-colors" />
                                     </div>
                                     <input 
                                        type="date" 
                                        value={item.deadline} 
                                        onChange={(e) => {
                                           const updated = [...formData.actionItems];
                                           updated[i].deadline = e.target.value;
                                           setFormData({...formData, actionItems: updated});
                                        }} 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 md:py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-primary transition-all appearance-none [color-scheme:dark]" 
                                     />
                                  </div>
                                 </div>
                                 <div className="md:col-span-2 lg:col-span-1 flex justify-center pb-1">
                                    {formData.actionItems.length > 1 && (
                                       <button type="button" onClick={() => handleRemoveField('actionItems', i)} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5">
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Post-Meeting Strategy</h4>
                        </div>
                        <div className="space-y-2 group">
                           <label className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Supplementary Notes</label>
                           <textarea rows={4} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 px-4 md:px-6 text-white text-sm outline-none focus:border-primary transition-all resize-none shadow-inner" placeholder="Side context or constraints..." />
                        </div>
                     </div>
                  </section>
               )}

             <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-card/90 backdrop-blur-3xl border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
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
                <div className="flex flex-row items-center gap-2 w-full md:w-auto">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 md:flex-none py-3 md:py-4 px-4 md:px-10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-all whitespace-nowrap active:scale-95">Discard</button>
                   
                   {currentStep > 1 && (
                      <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 md:flex-none py-3 md:py-4 px-4 md:px-10 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-white border border-white/5 hover:border-white/10 transition-all whitespace-nowrap active:scale-95">Back</button>
                   )}

                   {currentStep < 4 ? (
                      <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} className="flex-[2] md:flex-none py-3 md:py-4 px-6 md:px-12 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3">
                         Next <ChevronRight className="w-4 h-4" />
                      </button>
                   ) : (
                      <button type="submit" disabled={actionLoading} className="flex-[2] md:flex-none py-3 md:py-4 px-6 md:px-12 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3">
                         {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingMoM ? <ClipboardList className="w-4 h-4 shadow-sm" /> : <CheckSquare className="w-4 h-4 shadow-sm" />}
                         {editingMoM ? "Patch" : "Log"}
                      </button>
                   )}
                </div>
            </div>
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
        confirmText="Confirm Delete"
      />
    </div>
  );
}
