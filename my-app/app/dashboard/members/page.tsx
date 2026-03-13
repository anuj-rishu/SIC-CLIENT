"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity,
  UserX,
} from "lucide-react";
import { memberService, authService } from "@/services";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "MEMBER",
    domainName: "Web Dev",
  });

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const roles = ["LEAD", "MEMBER", "ASSOCIATE", "PRESIDENT", "VICE PRESIDENT", "TECHNICAL DIRECTOR", "FOUNDER"];
  const domains = ["Creatives", "Web Dev", "Cloud", "Corporate", "AIML", "APP DEV"];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await memberService.getAllMembers();
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setActionLoading(id);
    try {
      await authService.toggleMemberStatus(id);
      await fetchMembers();
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMember = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Remove Member",
      message: "Are you sure you want to remove this member?",
      onConfirm: async () => {
        setActionLoading(id);
        try {
          await authService.deleteMember(id);
          await fetchMembers();
          toast.success("Member removed");
        } catch (err) {
          console.error("Failed to delete member", err);
          toast.error("Failed to remove member");
        } finally {
          setActionLoading(null);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setActionLoading(id);
    try {
      await authService.changeMemberRole(id, newRole);
      await fetchMembers();
    } catch (err: any) {
      console.error("Failed to change role", err);
      toast.error(err.response?.data?.msg || "Role change failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("adding");
    try {
      await authService.addMember(formData);
      setShowAddModal(false);
      setFormData({ name: "", email: "", role: "MEMBER", domainName: "Web Dev" });
      await fetchMembers();
      toast.success("Member added successfully!");
    } catch (err: any) {
      console.error("Failed to add member", err);
      toast.error(err.response?.data?.msg || "Failed to add member");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesStatus =
      filter === "All"
        ? true
        : filter === "Active"
          ? m.isActive === true
          : m.isActive === false;
    const matchesRole =
      roleFilter === "All" ? true : m.domain?.role?.toUpperCase() === roleFilter.toUpperCase();
    const matchesDomain =
      domainFilter === "All" ? true : m.domain?.name?.toLowerCase() === domainFilter.toLowerCase();
    const safeName = m.name?.toLowerCase() || "";
    const safeEmail = m.email?.toLowerCase() || "";
    const safeId = m.adminId?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    const matchesSearch = safeName.includes(search) || safeEmail.includes(search) || safeId.includes(search);
    return matchesStatus && matchesRole && matchesDomain && matchesSearch;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      FOUNDER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      PRESIDENT: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      "VICE PRESIDENT": "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
      "TECHNICAL DIRECTOR": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      LEAD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      MEMBER: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
      ASSOCIATE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return styles[role?.toUpperCase()] || styles.MEMBER;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-4">


      {/* Stats */}
      <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl no-scrollbar">
        <div className="grid grid-cols-3">
          {/* Total */}
          <div className="p-4 md:p-7 border-r border-white/5 flex items-center gap-3">
            <div className="hidden md:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white leading-none">{members.length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Total</p>
            </div>
          </div>
          {/* Active */}
          <div className="p-4 md:p-7 border-r border-white/5 flex items-center gap-3">
            <div className="hidden md:flex w-10 h-10 rounded-xl bg-green-500/10 items-center justify-center">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-green-500 leading-none">{members.filter(m => m.isActive).length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Active</p>
            </div>
          </div>
          {/* Inactive */}
          <div className="p-4 md:p-7 flex items-center gap-3">
            <div className="hidden md:flex w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-red-500 leading-none">{members.filter(m => !m.isActive).length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground/50 uppercase tracking-wider mt-1.5 font-black">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card/30 border border-white/5 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Status Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl">
          {["All", "Active", "Inactive"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-primary text-white shadow-md"
                  : "text-muted-foreground/60 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="hidden lg:block w-px h-8 bg-white/10"></div>

        <div className="grid grid-cols-2 lg:flex items-center gap-3">
          {/* Role Dropdown */}
          <div className="relative w-full lg:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-3 pr-8 text-[10px] md:text-xs font-semibold text-stone-300 appearance-none cursor-pointer outline-none focus:border-primary/30 transition-all"
            >
              <option value="All">All Roles</option>
              {roles.map(r => <option key={r} value={r} className="bg-[#111]">{r}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 pointer-events-none" />
          </div>

          {/* Domain Dropdown */}
          <div className="relative w-full lg:w-auto">
            <select
              value={domainFilter}
              onChange={(e) => { setDomainFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-3 pr-8 text-[10px] md:text-xs font-semibold text-stone-300 appearance-none cursor-pointer outline-none focus:border-primary/30 transition-all"
            >
              <option value="All">All Domains</option>
              {domains.map(d => <option key={d} value={d} className="bg-[#111]">{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1"></div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search members..."
            className="bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-white w-full lg:w-48 outline-none focus:border-primary/30 transition-all placeholder:text-muted-foreground/20"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 text-xs whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add Member
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-card/30 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Member</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Role & Domain</th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-4 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Access</th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group"
                  >
                    {/* Member Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/10 flex items-center justify-center overflow-hidden border border-white/10">
                            {member.profilePhoto ? (
                              <img src={member.profilePhoto} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-primary">{member.name?.[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111] ${member.isActive ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{member.name}</p>
                          <p className="text-xs text-muted-foreground/40 mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role & Domain */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(member.domain?.role)}`}>
                          {member.domain?.role || "MEMBER"}
                        </span>
                        <p className="text-[11px] text-muted-foreground/40">{member.domain?.name || "—"}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {member.isActive ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-medium text-green-500/70">Active</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                            <span className="text-xs font-medium text-muted-foreground/40">Inactive</span>
                          </div>
                          {member.inactiveDuration && (
                            <p className="text-[10px] text-muted-foreground/20 ml-3">{member.inactiveDuration.formatted}</p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Toggle */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleStatus(member._id)}
                          disabled={actionLoading === member._id}
                          className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
                            member.isActive ? "bg-green-500" : "bg-zinc-700"
                          } disabled:opacity-50`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${
                            member.isActive ? "left-[22px]" : "left-0.5"
                          }`}>
                            {actionLoading === member._id && (
                              <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                            )}
                          </div>
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <select
                            value=""
                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                            disabled={actionLoading === member._id}
                            className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-3 pr-7 text-[10px] font-semibold text-muted-foreground/60 hover:text-white hover:border-primary/30 uppercase tracking-wider outline-none cursor-pointer appearance-none disabled:opacity-30 transition-all"
                          >
                            <option value="" disabled hidden>CHANGE ROLE</option>
                            {roles.map(r => <option key={r} value={r} className="bg-[#111]">{r}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/20 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => handleDeleteMember(member._id)}
                          className="p-2 rounded-lg text-muted-foreground/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <ShieldAlert className="w-12 h-12 text-muted-foreground/10 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground/30">No members found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground/40">
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground/40 disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              ).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "text-muted-foreground/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground/40 disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-4 h-4 text-muted-foreground/50" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add New Member</h3>
            <p className="text-xs text-muted-foreground/50 mb-8">Login credentials will be sent via email.</p>

            <form onSubmit={handleAddMember} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Full Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/20"
                  placeholder="Vikram Singh"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/20"
                  placeholder="vikram@sic.ai"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Domain</label>
                <div className="relative">
                  <select
                    value={formData.domainName}
                    onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-medium appearance-none cursor-pointer outline-none focus:border-primary/50 transition-all"
                  >
                    {domains.map(d => <option key={d} value={d} className="bg-[#09090b]">{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading === "adding"}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all mt-2"
              >
                {actionLoading === "adding" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {actionLoading === "adding" ? "Adding..." : "Add Member"}
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
        isLoading={actionLoading !== null}
        confirmText="Remove Member"
      />
    </div>
  );
}
