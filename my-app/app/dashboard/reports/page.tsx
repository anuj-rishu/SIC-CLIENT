"use client";

import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Trash2, 
  User, 
  Mail, 
  Calendar, 
  Tag, 
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Flag
} from 'lucide-react';
import { reportService } from '@/services';
import toast from 'react-hot-toast';

interface Report {
  _id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
  targetDetails?: {
    _id: string;
    title?: string;
    tag?: string;
    description?: string;
    userEmail?: string;
    userName?: string;
    upvotes?: number;
    downvotes?: number;
    createdAt?: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const res = await reportService.getReports();
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err: any) {
      console.error('Failed to fetch reports', err);
      toast.error(err.response?.data?.msg || "Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    try {
      const res = await reportService.deleteReport(id);
      if (res.data.success) {
        toast.success("Report deleted successfully");
        setReports(prev => prev.filter(r => r._id !== id));
      }
    } catch (err: any) {
      console.error('Failed to delete report', err);
      toast.error(err.response?.data?.msg || "Failed to delete report");
    }
  };

  const filteredReports = reports.filter(report => 
    report.reporterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.targetDetails?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.targetDetails?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header Controls */}
      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-3xl shadow-xl">
           <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-300" />
              <input 
                type="text" 
                placeholder="Search reports by ID, reason, or user details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all duration-300"
              />
           </div>
           <div className="hidden md:flex items-center gap-2 px-4 border-l border-white/5 ml-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{filteredReports.length} Reports Found</p>
           </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <div className="w-12 h-12 border-4 border-primary/5 rounded-full absolute inset-0"></div>
           </div>
           <p className="text-xs font-black text-muted-foreground/20 uppercase tracking-[0.2em] animate-pulse">Synchronizing Intelligence...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] py-32 flex flex-col items-center justify-center group hover:border-primary/20 transition-all duration-700">
           <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-all duration-700">
              <ShieldCheck className="w-10 h-10 text-muted-foreground/20 group-hover:text-primary/40 transition-all duration-700" />
           </div>
           <h3 className="text-lg font-bold text-white/40 tracking-tight mb-1">Clear Horizon Detected</h3>
           <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">No reports match your current parameters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <div 
              key={report._id}
              className="group relative bg-[#121214]/40 border border-white/5 rounded-[2.5rem] p-6 lg:p-8 hover:bg-[#121214]/60 transition-all duration-500 hover:border-rose-500/20 shadow-2xl overflow-hidden"
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-all duration-700 opacity-0 group-hover:opacity-100"></div>

              <div className="flex flex-col gap-6 relative z-10">
                {/* Header: Report Type & Meta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform duration-500">
                      <Flag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest border border-rose-500/20">
                          {report.targetType}
                        </span>
                        <span className="text-[10px] text-muted-foreground/30 font-black tracking-widest uppercase truncate max-w-[120px]">
                          ID: {report.targetId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-white/90 font-bold text-sm tracking-tight">
                        <User className="w-3.5 h-3.5 text-primary/40" />
                        Reporter: {report.reporterId}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(report._id)}
                    className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                     <p className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest flex items-center gap-2">
                        Reason for Report
                     </p>
                     <p className="text-sm text-stone-300 font-medium leading-relaxed italic">
                        "{report.reason}"
                     </p>
                  </div>

                  {report.targetDetails && (
                    <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest">Involved Asset Details</p>
                          <div className="flex items-center gap-2">
                             <Calendar className="w-3 h-3 text-primary/40" />
                             <span className="text-[9px] text-primary/40 font-bold uppercase tracking-tighter">
                                {new Date(report.targetDetails.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <h4 className="text-xs font-black text-white/80 uppercase tracking-tight truncate flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-primary/60" />
                                {report.targetDetails.title || 'Untitled Post'}
                             </h4>
                             <p className="text-[10px] text-muted-foreground/40 font-bold uppercase flex items-center gap-2">
                                <Tag className="w-3 h-3" />
                                {report.targetDetails.tag || 'Uncategorized'}
                             </p>
                          </div>
                          
                          <div className="space-y-1 md:text-right">
                             <p className="text-xs font-black text-primary/70 uppercase tracking-tight truncate">
                                {report.targetDetails.userName || 'Anonymous'}
                             </p>
                             <p className="text-[10px] text-muted-foreground/30 font-bold truncate flex items-center md:justify-end gap-2">
                                <Mail className="w-3 h-3" />
                                {report.targetDetails.userEmail || 'No Email'}
                             </p>
                          </div>
                       </div>

                       {report.targetDetails.description && (
                         <div className="pt-3 border-t border-primary/10 transition-all group-hover:pt-4">
                            <p className="text-[10px] text-stone-400/80 leading-relaxed line-clamp-2 italic">
                               {report.targetDetails.description}
                            </p>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                {/* Date Footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30 font-bold uppercase italic">
                        Logged on {new Date(report.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                     </div>
                  </div>
                  <div className="text-[9px] font-black text-muted-foreground/20 italic tracking-[0.2em] group-hover:text-primary/30 transition-colors">
                     #{report._id.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
