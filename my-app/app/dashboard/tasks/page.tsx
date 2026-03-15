"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Plus, 
  Search, 
  User, 
  Filter,
  Loader2,
  X,
  CheckCircle,
  Clock3,
  BarChart3,
  CalendarDays,
  Edit2,
  Trash2,
  ShieldCheck
} from "lucide-react";
import { taskService } from "@/services/taskService";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("My Tasks");
  const [tasks, setTasks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [adminSearch, setAdminSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const DOMAINS = ["All", "Creatives", "Web Dev", "Cloud", "Corporate", "AIML", "APP DEV"];

  // Assign Task Form State
  const [taskData, setTaskData] = useState<any>({
    title: "",
    description: "",
    priority: "MEDIUM",
    deadline: "",
    assignedTo: []
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionTaskId, setSubmissionTaskId] = useState<string | null>(null);
  const [submissionDescription, setSubmissionDescription] = useState("");

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const isLeadOrAssociate = profile?.domain?.role === "LEAD" || profile?.domain?.role === "ASSOCIATE";

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (profile) {
      if (activeTab === "My Tasks") {
        fetchMyTasks();
      } else if (activeTab === "Team Management") {
        fetchTeamTasks();
      } else if (activeTab === "Org Tracking") {
        fetchAdminTasks();
      }
    }
  }, [activeTab, profile, selectedDomain, selectedStatus, selectedPriority, currentPage, adminSearch]);

  const isHighLevelAdmin = (role: string) => {
    const r = role?.toUpperCase();
    return r === "FOUNDER" || r === "PRESIDENT" || r === "VICE PRESIDENT" || r === "VICEPRESIDENT";
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        authService.getProfile(),
        taskService.getTaskStats()
      ]);
      setProfile(profileRes.data);
      setStats(statsRes.data);
      
      if (isHighLevelAdmin(profileRes.data.domain?.role)) {
        setActiveTab("Org Tracking");
      }
      
      if (profileRes.data.domain.role === "LEAD" || profileRes.data.domain.role === "ASSOCIATE") {
        const membersRes = await authService.getTeamMembers();
        // Filter out itself if needed, but usually leads can assign to themselves too if they want
        setTeamMembers(membersRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await taskService.getTaskStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getMyTasks(currentPage, selectedStatus, selectedPriority, adminSearch); 
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch my tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTeamTasks(selectedStatus, currentPage, selectedPriority, adminSearch);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch team tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getAllTasksForAdmin(selectedDomain, currentPage, selectedStatus, adminSearch, selectedPriority);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch admin tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (id: string) => {
    setTaskData((prev: { assignedTo: string[] }) => {
      const isSelected = prev.assignedTo.includes(id);
      return {
        ...prev,
        assignedTo: isSelected 
          ? prev.assignedTo.filter((mid: string) => mid !== id)
          : [...prev.assignedTo, id]
      };
    });
  };

  const selectAllMembers = () => {
    const allIds = teamMembers.map(m => m._id);
    setTaskData((prev: any) => ({
      ...prev,
      assignedTo: prev.assignedTo.length === allIds.length ? [] : allIds
    }));
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId && taskData.assignedTo.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    setActionLoading(true);
    try {
      if (editingTaskId) {
        await taskService.updateTask(editingTaskId, taskData);
        toast.success("Task updated successfully!");
      } else {
        await taskService.assignTask(taskData);
        toast.success("Task(s) assigned successfully!");
      }
      setShowAssignModal(false);
      setEditingTaskId(null);
      setTaskData({ title: "", description: "", priority: "MEDIUM", deadline: "", assignedTo: [] });
      if (activeTab === "Team Management") fetchTeamTasks();
      else if (activeTab === "Org Tracking") fetchAdminTasks();
      else fetchMyTasks();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || `Failed to ${editingTaskId ? 'update' : 'assign'} task`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Task",
      message: "Are you sure you want to delete this task? This action cannot be undone.",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await taskService.deleteTask(taskId);
          fetchTeamTasks();
          fetchStats();
          toast.success("Task deleted successfully");
        } catch (err: any) {
          toast.error(err.response?.data?.msg || "Failed to delete task");
        } finally {
          setActionLoading(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openEditModal = (task: any) => {
    setTaskData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline.split('T')[0],
      assignedTo: [task.assignedTo?._id]
    });
    setEditingTaskId(task._id);
    setShowAssignModal(true);
  };

  const handleMarkDone = async (taskId: string) => {
    setSubmissionTaskId(taskId);
    setSubmissionDescription("");
    setShowSubmissionModal(true);
  };

  const submitTask = async () => {
    if (!submissionTaskId) return;
    setActionLoading(true);
    try {
      await taskService.markTaskDone(submissionTaskId, { submissionDescription });
      toast.success("Task submitted for review!");
      setShowSubmissionModal(false);
      fetchMyTasks();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to submit task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      await taskService.approveTask(taskId);
      fetchTeamTasks();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to approve task");
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      await taskService.rejectTask(taskId);
      fetchTeamTasks();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to reject task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "MEDIUM": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "LOW": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-primary/60 bg-primary/5 border-primary/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO": return <Clock3 className="w-5 h-5 text-amber-500/60" />;
      case "UNDER_REVIEW": return <AlertCircle className="w-5 h-5 text-blue-500/60 animate-pulse" />;
      case "COMPLETED": return <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground/30" />;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-6">
      {/* Stats Cards */}
      {stats && (
        <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl no-scrollbar">
          <div className="grid grid-cols-3">
            {/* Total */}
            <div className="p-4 md:p-7 border-r border-white/5 flex items-center gap-3">
              <div className="hidden md:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-white leading-none">{stats.total}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Total</p>
              </div>
            </div>
            {/* Pending Approval */}
            <div className="p-4 md:p-7 border-r border-white/5 flex items-center gap-3">
              <div className="hidden md:flex w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-blue-400 leading-none">{stats.pending}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Pending</p>
              </div>
            </div>
            {/* Completed */}
            <div className="p-4 md:p-7 flex items-center gap-3">
              <div className="hidden md:flex w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-emerald-500 leading-none">{stats.completed}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Finished</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Filter Suite */}
      <div className="space-y-4 md:space-y-6 animate-in slide-in-from-top duration-700 bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] backdrop-blur-3xl">
        {/* Action Row: Tabs & Assign */}
        {(isLeadOrAssociate || isHighLevelAdmin(profile?.domain?.role)) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-2">
            <div className="flex items-center gap-4">
              {isLeadOrAssociate && (
                <div className="flex bg-white/5 p-1 rounded-2xl w-full md:w-auto">
                  <button
                    onClick={() => { setActiveTab("Team Management"); setCurrentPage(1); }}
                    className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === "Team Management" 
                        ? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)]" 
                        : "text-muted-foreground/40 hover:text-white"
                    }`}
                  >
                    Team
                  </button>
                </div>
              )}
            </div>

            {isLeadOrAssociate && (
              <button 
                onClick={() => setShowAssignModal(true)}
                className="group relative flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 hover:bg-primary px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all shadow-xl shadow-primary/5"
              >
                 <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary group-hover:text-white transition-colors" />
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">Assign</span>
              </button>
            )}
          </div>
        )}
         <div className={`grid grid-cols-1 md:grid-cols-2 ${activeTab === "Org Tracking" ? "xl:grid-cols-4" : "xl:grid-cols-3"} gap-4 md:gap-6`}>
            {/* Squad/Domain Filter - Only for Org Tracking */}
            {activeTab === "Org Tracking" && (
              <div className="space-y-2 md:space-y-3">
                 <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Domain Logistics</span>
                 <div className="relative">
                   <select
                     value={selectedDomain}
                     onChange={(e) => { setSelectedDomain(e.target.value); setCurrentPage(1); }}
                     className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-4 pr-10 text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-300 appearance-none cursor-pointer outline-none focus:border-primary/30 transition-all"
                   >
                     {DOMAINS.map(d => <option key={d} value={d} className="bg-[#111]">{d}</option>)}
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
                 </div>
              </div>
            )}

            {/* Status Filter */}
            <div className="space-y-2 md:space-y-3">
               <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Task Status</span>
               <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-4 pr-10 text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-300 appearance-none cursor-pointer outline-none focus:border-primary/30 transition-all"
                  >
                    {[
                      { label: "All Status", value: "All" },
                      { label: "Pending", value: "TODO" },
                      { label: "Review", value: "UNDER_REVIEW" },
                      { label: "Done", value: "COMPLETED" }
                    ].map(s => (
                      <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
               </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2 md:space-y-3">
               <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Urgency</span>
               <div className="relative">
                  <select
                    value={selectedPriority}
                    onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-4 pr-10 text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-300 appearance-none cursor-pointer outline-none focus:border-primary/30 transition-all"
                  >
                    {[
                      { label: "All Priority", value: "All" },
                      { label: "High", value: "HIGH" },
                      { label: "Medium", value: "MEDIUM" },
                      { label: "Low", value: "LOW" }
                    ].map(p => (
                      <option key={p.value} value={p.value} className="bg-[#111]">{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
               </div>
            </div>

            {/* Search Bar */}
            <div className={`space-y-2 md:space-y-3 ${activeTab === "Org Tracking" ? "" : "md:col-span-2 xl:col-span-1"}`}>
               <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] ml-1">Search</span>
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    value={adminSearch}
                    onChange={(e) => { setAdminSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search tasks..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl py-2 md:py-3 pl-11 md:pl-12 pr-4 text-xs md:text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-muted-foreground/20"
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-card/20 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-card/30 transition-all group relative overflow-hidden"
            >
               {/* Priority Left Trace */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(task.priority).split(" ")[1]}`}></div>

               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-8">
                  <div className="flex items-center gap-4 md:gap-6 flex-1">
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/20 transition-all">
                        {getStatusIcon(task.status)}
                     </div>
                     <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                           <div className="flex flex-col min-w-0">
                             <h3 className="text-sm md:text-lg font-bold text-white tracking-tight truncate">{task.title}</h3>
                             {activeTab === "Org Tracking" && (
                               <span className="text-[8px] md:text-[10px] text-primary/60 font-black uppercase tracking-widest truncate">{task.team} Team</span>
                             )}
                           </div>
                           <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                             {task.priority}
                           </span>
                        </div>
                        <p className="text-[11px] md:text-sm text-muted-foreground/40 line-clamp-1 group-hover:line-clamp-none transition-all duration-500">{task.description}</p>
                        
                        {task.submissionDescription && (
                          <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                            <p className="text-[8px] md:text-[10px] text-primary/60 font-black uppercase tracking-widest mb-1">Submission Note</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground/60 italic">"{task.submissionDescription}"</p>
                          </div>
                        )}
                     </div>
                  </div>

                   <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-10 lg:justify-end">
                    <div className="space-y-1 md:space-y-1.5 flex-shrink-0">
                        <p className="text-[8px] md:text-[10px] text-muted-foreground/20 uppercase font-black tracking-widest">Temporal Bound</p>
                        <div className="flex items-center gap-2 text-white/70 font-bold text-[10px] md:text-xs tracking-tighter uppercase">
                          <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary/40" />
                          {new Date(task.deadline).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-10">
                      {activeTab === "Org Tracking" ? (
                        <>
                          <div className="space-y-1 md:space-y-1.5 min-w-[100px] md:min-w-[140px]">
                              <p className="text-[8px] md:text-[10px] text-muted-foreground/20 uppercase font-black tracking-widest">Commander</p>
                              <div className="flex items-center gap-2 text-white/70 font-bold text-[10px] md:text-xs">
                                <div className="hidden md:flex w-6 h-6 rounded-lg bg-primary/10 items-center justify-center">
                                   <ShieldCheck className="w-3 h-3 text-primary/60" />
                                </div>
                                {task.assignedBy?.name || 'Directorate'}
                              </div>
                          </div>
                          <div className="space-y-1 md:space-y-1.5 min-w-[100px] md:min-w-[140px]">
                              <p className="text-[8px] md:text-[10px] text-muted-foreground/20 uppercase font-black tracking-widest">Agent</p>
                              <div className="flex items-center gap-2 text-white/70 font-bold text-[10px] md:text-xs">
                                <div className="hidden md:flex w-6 h-6 rounded-lg bg-blue-500/10 items-center justify-center">
                                   <User className="w-3 h-3 text-blue-400/60" />
                                </div>
                                {task.assignedTo?.name}
                              </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1 md:space-y-1.5 min-w-[100px] md:min-w-[140px]">
                            <p className="text-[8px] md:text-[10px] text-muted-foreground/20 uppercase font-black tracking-widest">
                              {activeTab === "My Tasks" ? "Commander" : "Agent"}
                            </p>
                            <div className="flex items-center gap-2 text-white/70 font-bold text-[10px] md:text-xs">
                              <div className="hidden md:flex w-6 h-6 rounded-lg bg-primary/10 items-center justify-center">
                                 <User className="w-3 h-3 text-primary/60" />
                              </div>
                              {activeTab === "My Tasks" ? task.assignedBy?.name : task.assignedTo?.name}
                            </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 md:gap-3 lg:ml-4">
                         {activeTab === "My Tasks" && task.status === "TODO" && (
                           <button 
                             onClick={() => handleMarkDone(task._id)}
                             className="px-4 md:px-6 py-2 md:py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg shadow-primary/10"
                           >
                             Review
                           </button>
                         )}

                          {activeTab === "Team Management" && (
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => openEditModal(task)}
                                 className="p-2 md:p-2.5 bg-white/5 border border-white/5 rounded-xl text-muted-foreground/40 hover:bg-white/10 hover:text-white transition-all"
                               >
                                 <Edit2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                               </button>
                               <button 
                                 onClick={() => handleDeleteTask(task._id)}
                                 className="p-2 md:p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                               >
                                 <Trash2 className="w-3.5 md:w-4 h-3.5 md:h-4" />
                               </button>
                               
                               {task.status === "UNDER_REVIEW" && (
                                 <div className="flex items-center gap-2 ml-1 md:ml-2">
                                    <button 
                                      onClick={() => handleApprove(task._id)}
                                      className="px-3 md:px-6 py-2 md:py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => handleReject(task._id)}
                                      className="px-3 md:px-6 py-2 md:py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                    >
                                      Reject
                                    </button>
                                 </div>
                               )}
                            </div>
                         )}

                         {task.status === "COMPLETED" && (
                           <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                              <CheckCircle className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-500" />
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400/60">Finalized</span>
                           </div>
                         )}

                         {task.status === "UNDER_REVIEW" && activeTab === "My Tasks" && (
                            <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                              <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-400" />
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/60">Review</span>
                            </div>
                         )}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-card/10 rounded-[3rem] border border-dashed border-white/5">
            <BarChart3 className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
            <p className="text-muted-foreground/40 font-medium">Clear objectives. No pending tasks for this sequence.</p>
          </div>
        )}
      </div>

      {/* Unified Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 md:gap-4 py-6 md:py-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-2.5 md:p-3 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl text-white/40 hover:text-white hover:border-primary/50 disabled:opacity-20 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 md:w-5 h-4 md:h-5" />
          </button>
          
          <div className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
            <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Page</span>
            <span className="text-sm md:text-lg font-black text-white">{pagination.currentPage}</span>
            <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">/ {pagination.totalPages}</span>
          </div>

          <button
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            className="p-2.5 md:p-3 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl text-white/40 hover:text-white hover:border-primary/50 disabled:opacity-20 transition-all active:scale-95"
          >
            <ChevronRight className="w-4 md:w-5 h-4 md:h-5" />
          </button>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card/95 backdrop-blur-2xl border-x md:border border-white/10 rounded-none md:rounded-[2rem] w-full max-w-sm md:max-w-md h-full md:h-auto flex flex-col relative shadow-2xl overflow-hidden">
               <button onClick={() => setShowSubmissionModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 z-[110] text-muted-foreground/40 hover:text-white transition-all">
                 <X className="w-5 h-5" />
               </button>

               <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <h2 className="text-lg md:text-xl font-bold text-white tracking-tight uppercase">Finish Task</h2>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground/60 mt-1 uppercase font-bold tracking-widest leading-relaxed">Provide details regarding your progress</p>
                  
                  <div className="mt-4 md:mt-6 space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">Submission Note</label>
                       <textarea 
                         required
                         value={submissionDescription}
                         onChange={(e) => setSubmissionDescription(e.target.value)}
                         placeholder="Describe what you completed..."
                         rows={4}
                         className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 md:py-3 px-4 text-white text-xs md:text-sm outline-none focus:border-primary/50 transition-all resize-none"
                       />
                    </div>

                    <button 
                      onClick={submitTask}
                      disabled={actionLoading}
                      className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit for Review
                    </button>
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card/95 backdrop-blur-2xl border-x md:border border-white/10 rounded-none md:rounded-[2rem] w-full max-w-xl h-full md:h-auto flex flex-col md:max-h-[90vh] relative shadow-2xl overflow-hidden">
               <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 z-[110] text-muted-foreground/40 hover:text-white transition-all border md:border-none border-white/5 rounded-lg bg-white/5 md:bg-transparent">
                 <X className="w-4 h-4 md:w-5 md:h-5" />
               </button>

               <div className="p-5 md:p-8 pb-3 md:pb-0 border-b md:border-none border-white/5">
                  <h2 className="text-base md:text-xl font-bold text-white tracking-tight uppercase">{editingTaskId ? 'Patch' : 'Assign'} Task</h2>
                  <p className="text-[8px] md:text-[10px] text-muted-foreground/60 mt-0.5 md:mt-1 uppercase font-bold tracking-widest">Squad: <span className="text-primary/80">{profile?.domain?.name}</span></p>
               </div>

               <div className="p-4 md:p-8 pt-4 md:pt-6 overflow-y-auto no-scrollbar flex-1">
                  <form onSubmit={handleAssignTask} className="space-y-6 md:space-y-5">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-1.5">
                       <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">Objective Title</label>
                       <input 
                         required
                         value={taskData.title}
                         onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                         placeholder="e.g. System Update"
                         className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 md:py-3 px-4 text-white text-xs md:text-sm outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                       />
                    </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                       <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Agents</label>
                       <button 
                         type="button"
                         onClick={selectAllMembers}
                         className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-primary hover:text-blue-400 transition-colors"
                       >
                         {taskData.assignedTo.length === teamMembers.length ? "Clear" : "All"}
                       </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[140px] md:max-h-[180px] overflow-y-auto no-scrollbar pr-1">
                       {teamMembers.map(m => (
                         <button
                           key={m._id}
                           type="button"
                           onClick={() => toggleMemberSelection(m._id)}
                           className={`px-3 md:px-4 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] font-bold border transition-all text-left ${
                             taskData.assignedTo.includes(m._id)
                               ? "bg-primary text-white border-primary"
                               : "bg-white/[0.03] text-muted-foreground/60 border-white/5 hover:border-white/10 hover:text-white"
                           }`}
                         >
                           <div className="flex items-center justify-between gap-4">
                             <span className="font-black tracking-tight truncate">{m.name}</span>
                             <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg ${taskData.assignedTo.includes(m._id) ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                               {m.domain?.role}
                             </span>
                           </div>
                         </button>
                       ))}
                    </div>
                  </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">Instructions</label>
                    <textarea 
                      required
                      value={taskData.description}
                      onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                      placeholder="Operational details..."
                      rows={2}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 md:py-3 px-4 text-white text-xs md:text-sm outline-none focus:border-primary/50 transition-all resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                     <div className="space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">Deadline</label>
                        <input 
                          required
                          value={taskData.deadline}
                          onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
                          placeholder="dd/mm/yyyy"
                          className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 md:py-3 px-4 text-white text-xs md:text-sm outline-none focus:border-primary/50 transition-all"
                        />
                     </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] md:text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest ml-1">Priority</label>
                       <div className="grid grid-cols-3 gap-2">
                          {["LOW", "MEDIUM", "HIGH"].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setTaskData({...taskData, priority: p})}
                              className={`py-2.5 md:py-3 rounded-xl text-[8px] md:text-[9px] font-black transition-all border ${
                                taskData.priority === p 
                                  ? (p === "HIGH" ? "bg-rose-500/20 text-rose-400 border-rose-400/30" : p === "MEDIUM" ? "bg-amber-500/20 text-amber-400 border-amber-400/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-400/30")
                                  : "bg-white/[0.02] text-muted-foreground/30 border-transparent hover:border-white/10"
                              }`}
                            >
                               {p}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={actionLoading}
                   className="w-full py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 md:mt-2"
                 >
                   {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                   {editingTaskId ? 'Patch Objective' : 'Commit Assignment'}
                 </button>
               </form>
               <div className="h-6 md:h-0"></div>
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
        confirmText="Delete Task"
      />
    </div>
  );
}
