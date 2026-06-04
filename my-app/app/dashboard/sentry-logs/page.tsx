"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Bug,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ExternalLink,
  UserPlus,
  X,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Code2,
  Layers,
  Tag,
  Activity,
  Zap,
  Shield,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { sentryService } from "@/services/sentryService";
import { memberService } from "@/services/memberService";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";

// ─── Types ───
interface SentryIssue {
  _id: string;
  sentryId: string;
  title: string;
  culprit: string;
  level: string;
  platform: string;
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  status: string;
  shortId: string;
  permalink: string;
  assignedTask: any;
  assignedTasks?: any[];
  metadata: any;
  projectSlug?: string;
  projectName?: string;
}

interface SentryProject {
  id: string;
  name: string;
  slug: string;
  platform: string;
}

interface Stats {
  total: number;
  unresolved: number;
  resolved: number;
  assigned: number;
  byLevel: {
    fatal: number;
    error: number;
    warning: number;
    info: number;
  };
}

// ─── Helpers ───
function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getLevelConfig(level: string) {
  switch (level) {
    case "fatal":
      return {
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        icon: AlertOctagon,
        label: "FATAL",
      };
    case "error":
      return {
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
        icon: AlertTriangle,
        label: "ERROR",
      };
    case "warning":
      return {
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        glow: "shadow-[0_0_15px_rgba(234,179,8,0.1)]",
        icon: AlertTriangle,
        label: "WARN",
      };
    default:
      return {
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        glow: "",
        icon: Bug,
        label: "INFO",
      };
  }
}

// ═══════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════
export default function SentryLogsPage() {
  const [issues, setIssues] = useState<SentryIssue[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<SentryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("unresolved");
  const [projectFilter, setProjectFilter] = useState("");

  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  // Detail Panel
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignIssueId, setAssignIssueId] = useState<string>("");
  const [members, setMembers] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({
    assignedTo: "",
    priority: "HIGH",
    deadline: "",
    description: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [domainFilter, setDomainFilter] = useState("All");

  // ─── Fetch Profile ───
  const fetchProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      setProfile(res.data || null);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  }, []);

  // ─── Fetch Projects ───
  const fetchProjects = useCallback(async () => {
    try {
      const res = await sentryService.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch Sentry projects", err);
    }
  }, []);

  // ─── Fetch Issues ───
  const fetchIssues = useCallback(
    async (cursor?: string) => {
      try {
        setLoading(true);
        const params: any = {};
        if (cursor) params.cursor = cursor;
        if (searchQuery) params.search = searchQuery;
        if (levelFilter) params.level = levelFilter;
        if (statusFilter) params.status = statusFilter;
        if (projectFilter) params.project = projectFilter;

        const res = await sentryService.getIssues(params);
        setIssues(res.data.issues || []);
        setNextCursor(res.data.nextCursor);
        setPrevCursor(res.data.prevCursor);
      } catch (err: any) {
        console.error("Failed to fetch Sentry issues", err);
        toast.error(err.response?.data?.msg || "Failed to load Sentry issues");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, levelFilter, statusFilter, projectFilter]
  );

  // ─── Fetch Stats ───
  const fetchStats = useCallback(async () => {
    try {
      const res = await sentryService.getStats(projectFilter ? { project: projectFilter } : undefined);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch Sentry stats", err);
    }
  }, [projectFilter]);

  useEffect(() => {
    fetchProfile();
    fetchProjects();
  }, [fetchProfile, fetchProjects]);

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, [fetchIssues, fetchStats]);

  // ─── Refresh ───
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchProjects(), fetchIssues(), fetchStats()]);
    setRefreshing(false);
    toast.success("Refreshed");
  };

  // ─── Pagination ───
  const goNext = () => {
    if (nextCursor) {
      setCursorStack((prev) => [...prev, nextCursor]);
      fetchIssues(nextCursor);
    }
  };

  const goPrev = () => {
    if (cursorStack.length > 0) {
      const newStack = [...cursorStack];
      newStack.pop();
      setCursorStack(newStack);
      fetchIssues(newStack[newStack.length - 1] || undefined);
    }
  };

  // ─── Open Detail Panel ───
  const openDetail = async (issue: SentryIssue) => {
    setSelectedIssue(issue);
    setDetailLoading(true);
    try {
      const res = await sentryService.getIssueDetail(issue.sentryId);
      setDetailData(res.data);
    } catch (err) {
      toast.error("Failed to load issue details");
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Open Assign Modal ───
  const openAssignModal = async (sentryId: string) => {
    setAssignIssueId(sentryId);
    setAssignModalOpen(true);
    setAssignForm({ assignedTo: "", priority: "HIGH", deadline: "", description: "" });
    setDomainFilter("All");

    try {
      const res = await memberService.getAllMembers();
      const allMembers = res.data || [];
      
      const userRole = profile?.domain?.role?.toUpperCase();
      const userDomain = profile?.domain?.name;

      let allowedMembers = allMembers;

      if (["LEAD", "ASSOCIATE"].includes(userRole)) {
        // Leads/Associates: only members in their own team (domain name matches)
        allowedMembers = allMembers.filter((m: any) => m.domain?.name === userDomain);
      } else if (["FOUNDER", "PRESIDENT", "VICE PRESIDENT", "TECHNICAL DIRECTOR"].includes(userRole)) {
        // Founders/Presidents/VPs/TDs: can assign to any LEAD and ASSOCIATE
        allowedMembers = allMembers.filter((m: any) => ["LEAD", "ASSOCIATE"].includes(m.domain?.role?.toUpperCase()));
      } else {
        allowedMembers = [];
      }

      setMembers(allowedMembers);
    } catch (err) {
      toast.error("Failed to load members");
    }
  };

  // ─── Submit Assignment ───
  const handleAssign = async () => {
    if (!assignForm.assignedTo) {
      toast.error("Select a member to assign");
      return;
    }
    if (!assignForm.deadline) {
      toast.error("Set a deadline");
      return;
    }

    setAssigning(true);
    try {
      await sentryService.assignIssue(assignIssueId, assignForm);
      toast.success("Issue assigned as task!");
      setAssignModalOpen(false);
      fetchIssues();
      fetchStats();

      // Refresh detail data if currently viewing
      if (selectedIssue && selectedIssue.sentryId === assignIssueId) {
        const detailRes = await sentryService.getIssueDetail(assignIssueId);
        setDetailData(detailRes.data);
        setSelectedIssue(detailRes.data.issue);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  // ─── Undo Assignment ───
  const handleUndoAssignment = async (sentryId: string) => {
    if (!confirm("Are you sure you want to undo assignment for this error? This will delete all associated tasks.")) return;
    try {
      await sentryService.unassignIssue(sentryId);
      toast.success("Assignment undone and tasks deleted.");
      fetchIssues();
      fetchStats();
      if (selectedIssue && selectedIssue.sentryId === sentryId) {
        const detailRes = await sentryService.getIssueDetail(sentryId);
        setDetailData(detailRes.data);
        setSelectedIssue(detailRes.data.issue);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to undo assignment");
    }
  };

  // ─── Remove Specific Member ───
  const handleRemoveMember = async (sentryId: string, userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this assignment?`)) return;
    try {
      await sentryService.removeMember(sentryId, userId);
      toast.success(`${userName} removed from assignment.`);
      fetchIssues();
      fetchStats();
      if (selectedIssue && selectedIssue.sentryId === sentryId) {
        const detailRes = await sentryService.getIssueDetail(sentryId);
        setDetailData(detailRes.data);
        setSelectedIssue(detailRes.data.issue);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to remove member");
    }
  };

  // ─── Resolve Issue ───
  const handleResolve = async (sentryId: string) => {
    try {
      await sentryService.resolveIssue(sentryId);
      toast.success("Issue resolved");
      fetchIssues();
      fetchStats();
      if (selectedIssue?.sentryId === sentryId) {
        setSelectedIssue(null);
        setDetailData(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to resolve");
    }
  };

  // ─── Copy Error Details ───
  const handleCopyError = () => {
    if (!selectedIssue) return;
    
    let errorText = `Error: ${selectedIssue.title}\n` +
      `Location: ${selectedIssue.culprit || "Unknown"}\n` +
      `Project: ${selectedIssue.projectName || selectedIssue.projectSlug || "Unknown"}\n` +
      `Level: ${selectedIssue.level?.toUpperCase()}\n` +
      `Sentry Link: ${selectedIssue.permalink || "N/A"}`;

    const exception = detailData?.latestEvent?.entries?.find((e: any) => e.type === "exception");
    if (exception?.data?.values?.[0]) {
      const exc = exception.data.values[0];
      errorText += `\n\nException Details:\n${exc.type}: ${exc.value}`;
      if (exc.stacktrace?.frames) {
        const frames = exc.stacktrace.frames.slice(-5); // Get last 5 frames
        errorText += `\n\nStacktrace (Last 5 frames):\n` +
          frames.map((f: any) => `  at ${f.function || "anonymous"} (${f.filename || f.absPath}:${f.lineNo || "?"})`).join("\n");
      }
    }

    navigator.clipboard.writeText(errorText);
    toast.success("Error details copied to clipboard!");
  };

  // ─── Get unique domains from members ───
  const domains = Array.from(
    new Set(members.map((m: any) => m.domain?.name).filter(Boolean))
  );

  const filteredMembers =
    domainFilter === "All"
      ? members
      : members.filter((m: any) => m.domain?.name === domainFilter);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  if (loading && issues.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
            Loading Sentry Telemetry...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <Bug className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tighter">
              Sentry Error Intelligence
            </h2>
          </div>
          <p className="text-[7px] md:text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] md:tracking-[0.3em] ml-[42px]">
            SRM Academia — Live Error Monitoring
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground hover:text-white hover:border-white/10 transition-all text-xs font-bold"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Sync
        </button>
      </div>

      {/* ── Stats Bar ── */}
      {stats && (
        <div className="flex bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-[1.5rem] overflow-hidden backdrop-blur-xl">
          {[
            {
              name: "Total Issues",
              value: stats.total,
              icon: Layers,
              color: "text-blue-400",
            },
            {
              name: "Unresolved",
              value: stats.unresolved,
              icon: AlertTriangle,
              color: "text-orange-400",
            },
            {
              name: "Resolved",
              value: stats.resolved,
              icon: CheckCircle2,
              color: "text-emerald-400",
            },
            {
              name: "Assigned",
              value: stats.assigned,
              icon: UserPlus,
              color: "text-primary",
            },
          ].map((stat, idx) => (
            <div
              key={stat.name}
              className={`flex-1 px-3 py-2 md:px-5 md:py-3 flex flex-col gap-1 transition-all hover:bg-white/[0.02] ${
                idx !== 3 ? "border-r border-white/5" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground/40 text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none">
                  {stat.name.split(" ")[0]}
                </h3>
                <stat.icon
                  className={`w-3 h-3 ${stat.color} opacity-30`}
                />
              </div>
              <p className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
          <input
            type="text"
            placeholder="Search errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchIssues()}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/30 transition-colors font-medium"
          />
        </div>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary/30 transition-colors font-medium appearance-none cursor-pointer min-w-[100px]"
        >
          <option value="" className="bg-[#121214]">All Levels</option>
          <option value="fatal" className="bg-[#121214]">Fatal</option>
          <option value="error" className="bg-[#121214]">Error</option>
          <option value="warning" className="bg-[#121214]">Warning</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary/30 transition-colors font-medium appearance-none cursor-pointer min-w-[120px]"
        >
          <option value="unresolved" className="bg-[#121214]">Unresolved</option>
          <option value="resolved" className="bg-[#121214]">Resolved</option>
          <option value="ignored" className="bg-[#121214]">Ignored</option>
          <option value="" className="bg-[#121214]">All Status</option>
        </select>

        {/* Project Filter */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary/30 transition-colors font-medium appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="" className="bg-[#121214]">All Projects</option>
          {projects.map((proj) => (
            <option key={proj.slug} value={proj.slug} className="bg-[#121214]">
              {proj.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => fetchIssues()}
          className="px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* ── Issues List ── */}
      <div className="space-y-2">
        {issues.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-white mb-1">All Clear</h3>
            <p className="text-xs text-muted-foreground/40 font-medium">
              No issues match your current filters
            </p>
          </div>
        ) : (
          issues.map((issue) => {
            const levelCfg = getLevelConfig(issue.level);
            const LevelIcon = levelCfg.icon;
            const isSelected = selectedIssue?.sentryId === issue.sentryId;

            return (
              <div
                key={issue._id}
                onClick={() => openDetail(issue)}
                className={`group relative bg-white/[0.02] border rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:bg-white/[0.04] ${
                  isSelected
                    ? `border-${levelCfg.color.replace("text-", "")}/30 ${levelCfg.glow}`
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Level Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${levelCfg.bg} border ${levelCfg.border}`}
                  >
                    <LevelIcon className={`w-4 h-4 ${levelCfg.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white truncate flex-1">
                        {issue.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${levelCfg.bg} ${levelCfg.color} border ${levelCfg.border}`}
                      >
                        {levelCfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground/40 font-medium truncate mb-2">
                      {issue.culprit || "Unknown location"}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/25 uppercase tracking-wider flex-wrap">
                      {issue.projectSlug && (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10 text-[9px] font-black uppercase tracking-widest leading-none">
                          {issue.projectSlug}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {issue.count} events
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(issue.lastSeen)}
                      </span>
                      {issue.shortId && (
                        <span className="text-primary/30">{issue.shortId}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAssignModal(issue.sentryId);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        issue.assignedTask || (issue.assignedTasks && issue.assignedTasks.length > 0)
                          ? "bg-primary/20 border border-primary/30 text-primary hover:bg-primary/35"
                          : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                      }`}
                      title={
                        issue.assignedTask || (issue.assignedTasks && issue.assignedTasks.length > 0)
                          ? "Add another member as assignee"
                          : "Assign as task"
                      }
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                    {issue.status !== "resolved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(issue.sentryId);
                        }}
                        className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Resolve"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {issue.permalink && (
                      <a
                        href={issue.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-muted-foreground/40 hover:text-white transition-colors"
                        title="Open in Sentry"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Assignment Info */}
                {((issue.assignedTasks && issue.assignedTasks.length > 0) || issue.assignedTask) && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                    {issue.assignedTasks && issue.assignedTasks.length > 0 ? (
                      issue.assignedTasks.map((task: any) => (
                        <div key={task._id} className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-primary/40 shrink-0" />
                          <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider truncate">
                            Assigned to{" "}
                            <span className="text-primary/60">
                              {task.assignedTo?.name || "—"}
                            </span>
                            {" · "}
                            <span
                              className={
                                task.status === "COMPLETED"
                                  ? "text-emerald-400/60"
                                  : task.status === "UNDER_REVIEW"
                                  ? "text-amber-400/60"
                                  : "text-muted-foreground/40"
                              }
                            >
                              {task.status}
                            </span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-primary/40 shrink-0" />
                        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider truncate">
                          Assigned to{" "}
                          <span className="text-primary/60">
                            {issue.assignedTask.assignedTo?.name || "—"}
                          </span>
                          {" · "}
                          <span
                            className={
                              issue.assignedTask.status === "COMPLETED"
                                ? "text-emerald-400/60"
                                : issue.assignedTask.status === "UNDER_REVIEW"
                                ? "text-amber-400/60"
                                : "text-muted-foreground/40"
                            }
                          >
                            {issue.assignedTask.status}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {(nextCursor || cursorStack.length > 0) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={goPrev}
            disabled={cursorStack.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-bold text-muted-foreground disabled:opacity-20 hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={!nextCursor}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-bold text-muted-foreground disabled:opacity-20 hover:bg-white/[0.06] transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           Detail Slide-Over Panel
         ═══════════════════════════════════════════ */}
      {selectedIssue && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => {
              setSelectedIssue(null);
              setDetailData(null);
            }}
          />
          <div className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-[#0a0a0c] border-l border-white/5 z-[61] overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-white/5 p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const cfg = getLevelConfig(selectedIssue.level);
                      return (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      );
                    })()}
                    {selectedIssue.shortId && (
                      <span className="text-[10px] font-bold text-muted-foreground/20">
                        {selectedIssue.shortId}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base md:text-lg font-black text-white leading-snug">
                    {selectedIssue.title}
                  </h2>
                  <p className="text-xs text-muted-foreground/40 font-medium mt-1">
                    {selectedIssue.culprit}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedIssue(null);
                    setDetailData(null);
                  }}
                  className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground/40 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => openAssignModal(selectedIssue.sentryId)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {selectedIssue.assignedTask || (selectedIssue.assignedTasks && selectedIssue.assignedTasks.length > 0)
                    ? "Add Member"
                    : "Assign to Member"}
                </button>
                {(selectedIssue.assignedTask || (selectedIssue.assignedTasks && selectedIssue.assignedTasks.length > 0)) && (
                  <button
                    onClick={() => handleUndoAssignment(selectedIssue.sentryId)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Undo Assignment
                  </button>
                )}
                {selectedIssue.status !== "resolved" && (
                  <button
                    onClick={() => handleResolve(selectedIssue.sentryId)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}
                <button
                  onClick={handleCopyError}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground/60 text-xs font-bold hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Error
                </button>
                {selectedIssue.permalink && (
                  <a
                    href={selectedIssue.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground/60 text-xs font-bold hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Sentry
                  </a>
                )}
              </div>
            </div>

            {/* Panel Body */}
            <div className="p-4 md:p-6 space-y-6">
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : detailData ? (
                <>
                  {/* Issue Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Project", value: selectedIssue.projectName || selectedIssue.projectSlug || "—", icon: Bug },
                      { label: "Platform", value: selectedIssue.platform || "—", icon: Code2 },
                      { label: "Events", value: selectedIssue.count, icon: Activity },
                      { label: "Users", value: selectedIssue.userCount, icon: Eye },
                      { label: "First Seen", value: timeAgo(selectedIssue.firstSeen), icon: Clock },
                      { label: "Last Seen", value: timeAgo(selectedIssue.lastSeen), icon: Zap },
                    ].map((meta) => (
                      <div
                        key={meta.label}
                        className="bg-white/[0.02] border border-white/5 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <meta.icon className="w-3 h-3 text-muted-foreground/20" />
                          <span className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-wider">
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm font-black text-white">{meta.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Assignment Status */}
                  {((detailData.issue?.assignedTasks && detailData.issue.assignedTasks.length > 0) || detailData.issue?.assignedTask) && (
                    <div className="bg-primary/5 border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Shield className="w-4 h-4 text-primary/60" />
                        <span className="text-xs font-black text-primary/80 uppercase tracking-wider">
                          Active Assignments ({detailData.issue?.assignedTasks?.length || 1})
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {detailData.issue?.assignedTasks && detailData.issue.assignedTasks.length > 0 ? (
                          detailData.issue.assignedTasks.map((task: any) => (
                            <div key={task._id} className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:bg-white/[0.04] transition-all">
                              <div className="space-y-1 text-xs min-w-0 flex-1">
                                <p className="text-muted-foreground/60 truncate">
                                  <span className="text-white font-bold">
                                    {task.assignedTo?.name || "Unknown member"}
                                  </span>{" "}
                                  ·{" "}
                                  <span className={
                                    task.status === "COMPLETED"
                                      ? "text-emerald-400/60 font-semibold"
                                      : task.status === "UNDER_REVIEW"
                                      ? "text-amber-400/60 font-semibold"
                                      : "text-muted-foreground/40"
                                  }>
                                    {task.status}
                                  </span>
                                </p>
                                <p className="text-[10px] text-muted-foreground/30">
                                  Priority: {task.priority} · Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => handleRemoveMember(selectedIssue.sentryId, task.assignedTo?._id, task.assignedTo?.name || "")}
                                className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors shrink-0"
                                title="Remove Assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                            <div className="space-y-1 text-xs min-w-0 flex-1">
                              <p className="text-muted-foreground/60 truncate">
                                <span className="text-white font-bold">
                                  {detailData.issue.assignedTask.assignedTo?.name || "Unknown member"}
                                </span>{" "}
                                ·{" "}
                                <span className={
                                  detailData.issue.assignedTask.status === "COMPLETED"
                                    ? "text-emerald-400/60 font-semibold"
                                    : detailData.issue.assignedTask.status === "UNDER_REVIEW"
                                    ? "text-amber-400/60 font-semibold"
                                    : "text-muted-foreground/40"
                                }>
                                  {detailData.issue.assignedTask.status}
                                </span>
                              </p>
                              <p className="text-[10px] text-muted-foreground/30">
                                Priority: {detailData.issue.assignedTask.priority} · Deadline: {detailData.issue.assignedTask.deadline ? new Date(detailData.issue.assignedTask.deadline).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveMember(selectedIssue.sentryId, detailData.issue.assignedTask.assignedTo?._id, detailData.issue.assignedTask.assignedTo?.name || "")}
                              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors shrink-0"
                              title="Remove Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {detailData.issue?.tags?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground/20" />
                        <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider">
                          Tags
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const latestEventTags = detailData.latestEvent?.tags || [];
                          const tagValueMap = new Map(latestEventTags.map((t: any) => [t.key, t.value]));
                          return detailData.issue.tags
                            .slice(0, 20)
                            .map((tag: any, idx: number) => {
                              const displayVal = tagValueMap.get(tag.key) || tag.topValues?.[0]?.value || tag.value || "—";
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-medium text-muted-foreground/50"
                                >
                                  <span className="text-muted-foreground/25 font-semibold">
                                    {tag.name || tag.key}:
                                  </span>
                                  <span className="text-white/70 font-semibold">
                                    {displayVal}
                                  </span>
                                </span>
                              );
                            });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Stacktrace */}
                  {detailData.latestEvent?.entries?.map(
                    (entry: any, idx: number) => {
                      if (entry.type === "exception") {
                        return (
                          <div key={idx}>
                            <div className="flex items-center gap-1.5 mb-3">
                              <Code2 className="w-3.5 h-3.5 text-red-400/40" />
                              <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider">
                                Stack Trace
                              </h3>
                            </div>
                            <div className="space-y-2">
                              {entry.data?.values?.map(
                                (exc: any, eIdx: number) => (
                                  <div
                                    key={eIdx}
                                    className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
                                  >
                                    <div className="px-4 py-2.5 border-b border-white/5 bg-red-500/5">
                                      <p className="text-xs font-bold text-red-400">
                                        {exc.type}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground/50 mt-0.5 break-all">
                                        {exc.value}
                                      </p>
                                    </div>
                                    {exc.stacktrace?.frames && (
                                      <div className="divide-y divide-white/[0.03]">
                                        {[...exc.stacktrace.frames]
                                          .reverse()
                                          .slice(0, 10)
                                          .map(
                                            (frame: any, fIdx: number) => (
                                              <div
                                                key={fIdx}
                                                className={`px-4 py-2 text-[11px] font-mono ${
                                                  frame.inApp
                                                    ? "bg-orange-500/5"
                                                    : ""
                                                }`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  {frame.inApp && (
                                                    <span className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                                                  )}
                                                  <span className="text-muted-foreground/60 truncate">
                                                    {frame.filename || frame.module}
                                                  </span>
                                                  {frame.lineNo && (
                                                    <span className="text-muted-foreground/25 flex-shrink-0">
                                                      :{frame.lineNo}
                                                    </span>
                                                  )}
                                                </div>
                                                {frame.function && (
                                                  <p className="text-primary/50 mt-0.5 ml-3">
                                                    {frame.function}()
                                                  </p>
                                                )}
                                                {frame.context &&
                                                  frame.context.length > 0 && (
                                                    <pre className="mt-1 ml-3 text-[10px] text-muted-foreground/30 overflow-x-auto max-h-16 no-scrollbar">
                                                      {frame.context
                                                        .map(
                                                          (c: any) =>
                                                            `${c[0]}: ${c[1]}`
                                                        )
                                                        .join("\n")}
                                                    </pre>
                                                  )}
                                              </div>
                                            )
                                          )}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      }

                      if (entry.type === "breadcrumbs") {
                        return (
                          <div key={idx}>
                            <div className="flex items-center gap-1.5 mb-3">
                              <Layers className="w-3.5 h-3.5 text-muted-foreground/20" />
                              <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider">
                                Breadcrumbs
                              </h3>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-xl divide-y divide-white/[0.03] max-h-[300px] overflow-y-auto">
                              {(entry.data?.values || [])
                                .slice(-15)
                                .reverse()
                                .map((bc: any, bIdx: number) => (
                                  <div
                                    key={bIdx}
                                    className="px-4 py-2 text-[11px]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                          bc.level === "error"
                                            ? "bg-red-400"
                                            : bc.level === "warning"
                                            ? "bg-yellow-400"
                                            : "bg-muted-foreground/20"
                                        }`}
                                      />
                                      <span className="text-muted-foreground/40 font-medium">
                                        {bc.category || bc.type || "—"}
                                      </span>
                                      <span className="text-muted-foreground/15 ml-auto flex-shrink-0">
                                        {bc.timestamp
                                          ? new Date(
                                              bc.timestamp * 1000
                                            ).toLocaleTimeString()
                                          : ""}
                                      </span>
                                    </div>
                                    {bc.message && (
                                      <p className="text-muted-foreground/30 mt-0.5 ml-3.5 truncate">
                                        {bc.message}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        );
                      }

                      return null;
                    }
                  )}

                  {/* Context Info */}
                  {detailData.latestEvent?.contexts && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground/20" />
                        <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider">
                          Context
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(detailData.latestEvent.contexts)
                          .filter(
                            ([key]) =>
                              !["trace", "replay"].includes(key)
                          )
                          .slice(0, 6)
                          .map(([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="bg-white/[0.02] border border-white/5 rounded-xl p-3"
                            >
                              <p className="text-[9px] font-black text-muted-foreground/25 uppercase tracking-wider mb-1.5">
                                {key}
                              </p>
                              <div className="space-y-0.5">
                                {Object.entries(value || {})
                                  .slice(0, 5)
                                  .map(([k, v]: [string, any]) => (
                                    <div
                                      key={k}
                                      className="flex items-center gap-2 text-[11px]"
                                    >
                                      <span className="text-muted-foreground/30 min-w-[80px]">
                                        {k}:
                                      </span>
                                      <span className="text-muted-foreground/60 truncate">
                                        {typeof v === "object"
                                          ? JSON.stringify(v)
                                          : String(v)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground/30 text-xs">
                  Failed to load details
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════
           Assign Modal
         ═══════════════════════════════════════════ */}
      {assignModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
            onClick={() => setAssignModalOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-[520px] bg-[#0e0e10] border border-white/5 rounded-2xl z-[71] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Assign Error as Task
                    </h3>
                    <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-wider">
                      Create a bug-fix task from this issue
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Domain Filter */}
              <div>
                <label className="block text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider mb-2">
                  Filter by Domain
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setDomainFilter("All")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      domainFilter === "All"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-white/[0.03] text-muted-foreground/40 border border-white/5 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  {domains.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDomainFilter(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        domainFilter === d
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-white/[0.03] text-muted-foreground/40 border border-white/5 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Member Selection */}
              <div>
                <label className="block text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider mb-2">
                  Select Member
                </label>
                <div className="space-y-1 max-h-[180px] overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-2">
                  {filteredMembers.length === 0 ? (
                    <p className="text-xs text-muted-foreground/20 text-center py-4">
                      No members found
                    </p>
                  ) : (
                    filteredMembers.map((m: any) => (
                      <button
                        key={m._id}
                        onClick={() =>
                          setAssignForm({ ...assignForm, assignedTo: m._id })
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          assignForm.assignedTo === m._id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-white/[0.03] border border-transparent"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {m.profilePhoto ? (
                            <img
                              src={m.profilePhoto}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-black text-muted-foreground/30">
                              {m.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {m.name}
                          </p>
                          <p className="text-[9px] text-muted-foreground/25 font-medium">
                            {m.domain?.name} · {m.domain?.role}
                          </p>
                        </div>
                        {assignForm.assignedTo === m._id && (
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {["LOW", "MEDIUM", "HIGH"].map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        setAssignForm({ ...assignForm, priority: p })
                      }
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${
                        assignForm.priority === p
                          ? p === "HIGH"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : p === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-white/[0.03] text-muted-foreground/30 border-white/5 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={assignForm.deadline}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-primary/30 transition-colors font-medium"
                />
              </div>

              {/* Description Override */}
              <div>
                <label className="block text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider mb-2">
                  Additional Notes{" "}
                  <span className="text-muted-foreground/15">(optional)</span>
                </label>
                <textarea
                  value={assignForm.description}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add context or reproduction steps..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm text-white placeholder:text-muted-foreground/15 focus:outline-none focus:border-primary/30 transition-colors font-medium resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-bold text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning || !assignForm.assignedTo}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {assigning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign Task
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
