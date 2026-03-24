"use client";

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  User,
  Calendar,
  Tag,
  FileText,
  Search,
  Flag,
  Phone,
  Package,
  DollarSign,
  Clock,
  Image as ImageIcon,
  ShoppingBag
} from 'lucide-react';
import { reportService } from '@/services';
import toast from 'react-hot-toast';

interface SellerInfo {
  userId?: string;
  name?: string;
  phone?: string;
}

interface TargetDetails {
  _id?: string;
  // Community / post fields
  title?: string;
  tag?: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  upvotes?: number;
  downvotes?: number;
  // Marketplace fields
  itemName?: string;
  price?: string;
  howOld?: string;
  status?: string;
  photos?: string[];
  seller?: SellerInfo;
  createdAt?: string;
}

interface Report {
  _id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
  targetDetails?: TargetDetails;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReports();
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err: any) {
      console.error('Failed to fetch reports', err);
      toast.error(err.response?.data?.msg || "Failed to load reports");
    } finally {
      setLoading(false);
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
      toast.error(err.response?.data?.msg || "Failed to delete report");
    }
  };

  const filteredReports = reports.filter(r =>
    r.reporterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.targetDetails?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.targetDetails?.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.targetDetails?.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl backdrop-blur-3xl shadow-lg">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search by reporter ID, reason, item, or seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap">{filteredReports.length} Found</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-xs font-black text-muted-foreground/20 uppercase tracking-[0.2em] animate-pulse">Loading Reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl py-28 flex flex-col items-center justify-center gap-4">
          <Flag className="w-10 h-10 text-muted-foreground/20" />
          <h3 className="text-base font-bold text-white/30 tracking-tight">No Reports Found</h3>
          <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">All clear — nothing to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredReports.map((report) => {
            const d = report.targetDetails;
            const isMarketplace = report.targetType === 'marketplace';

            return (
              <div
                key={report._id}
                className="group relative bg-[#121214]/60 border border-white/5 rounded-3xl overflow-hidden hover:border-rose-500/20 transition-all duration-500 shadow-xl"
              >
                {/* Top stripe */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/40 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase tracking-widest border border-rose-500/20">
                            {report.targetType}
                          </span>
                          <span className="text-[9px] text-muted-foreground/30 font-bold truncate">#{report._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <User className="w-3 h-3 text-primary/40 shrink-0" />
                          <span className="text-xs text-white/70 font-bold truncate">{report.reporterId}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="shrink-0 p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reason */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] font-black text-rose-500/50 uppercase tracking-widest mb-1">Reason</p>
                    <p className="text-sm text-stone-300 italic">"{report.reason}"</p>
                  </div>

                  {/* Target Details */}
                  {d && (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest">
                          {isMarketplace ? 'Marketplace Listing' : 'Post Details'}
                        </p>
                        {d.createdAt && (
                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/30 font-bold">
                            <Calendar className="w-3 h-3" />
                            {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {isMarketplace ? (
                        /* Marketplace Details */
                        <div className="space-y-3">
                          {/* Photo */}
                          {d.photos && d.photos.length > 0 && (
                            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/5 bg-white/5">
                              <img
                                src={d.photos[0]}
                                alt="Item photo"
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                              {d.photos.length > 1 && (
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-lg text-[9px] font-black text-white/60 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />
                                  +{d.photos.length - 1} more
                                </div>
                              )}
                            </div>
                          )}

                          {/* Item details grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                <ShoppingBag className="w-2.5 h-2.5" /> Item
                              </p>
                              <p className="text-xs font-bold text-white/80 truncate">{d.itemName || '—'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign className="w-2.5 h-2.5" /> Price
                              </p>
                              <p className="text-xs font-bold text-emerald-400 truncate">₹{d.price || '—'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> Age
                              </p>
                              <p className="text-xs font-bold text-white/60">{d.howOld ? `${d.howOld} yr(s)` : '—'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                <Package className="w-2.5 h-2.5" /> Status
                              </p>
                              <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-lg ${d.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {d.status || 'unknown'}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {d.description && (
                            <div className="pt-2 border-t border-primary/10">
                              <p className="text-[10px] text-stone-400/70 italic leading-relaxed line-clamp-2">{d.description}</p>
                            </div>
                          )}

                          {/* Seller Info */}
                          {d.seller && (
                            <div className="pt-2 border-t border-primary/10 space-y-1">
                              <p className="text-[8px] font-black text-primary/50 uppercase tracking-widest">Seller</p>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-primary/40" />
                                  <span className="text-xs font-bold text-white/70">{d.seller.name || '—'}</span>
                                </div>
                                {d.seller.phone && (
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-primary/40" />
                                    <span className="text-xs font-bold text-white/50">{d.seller.phone}</span>
                                  </div>
                                )}
                                {d.seller.userId && (
                                  <span className="text-[9px] text-muted-foreground/30 font-bold uppercase">{d.seller.userId}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Community Post Details */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                <FileText className="w-2.5 h-2.5" /> Title
                              </p>
                              <p className="text-xs font-bold text-white/80 truncate">{d.title || 'Untitled'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" /> Tag
                              </p>
                              <p className="text-xs font-bold text-white/60 truncate">{d.tag || '—'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Author</p>
                              <p className="text-xs font-bold text-primary/70 truncate">{d.userName || 'Anonymous'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Email</p>
                              <p className="text-[10px] font-bold text-muted-foreground/40 truncate">{d.userEmail || '—'}</p>
                            </div>
                          </div>
                          {d.description && (
                            <div className="pt-2 border-t border-primary/10">
                              <p className="text-[10px] text-stone-400/70 italic leading-relaxed line-clamp-2">{d.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/25 font-bold pt-1">
                    <span>Reported {new Date(report.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Target: {report.targetId.slice(-10).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
