"use client";

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Trash2, 
  User, 
  Mail, 
  Calendar, 
  Tag, 
  FileText,
  Loader2,
  Search,
  Users,
  Globe,
  Plus
} from 'lucide-react';
import { clubService } from '@/services';
import toast from 'react-hot-toast';

interface Club {
  _id: string;
  name: string;
  description: string;
  category: string;
  creator: {
    userId: string;
    name: string;
  };
  email?: string;
  logo?: string;
  createdAt: string;
}

export default function ClubApprovalPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPendingClubs = async () => {
    try {
      setLoading(true);
      const res = await clubService.getPendingClubs();
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err: any) {
      console.error('Failed to fetch pending clubs', err);
      toast.error(err.response?.data?.msg || "Failed to load pending clubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingClubs();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this club?")) return;
    
    try {
      const res = await clubService.approveClub(id);
      if (res.data.success) {
        toast.success("Club approved successfully!");
        setClubs(prev => prev.filter(c => c._id !== id));
      }
    } catch (err: any) {
      console.error('Failed to approve club', err);
      toast.error(err.response?.data?.msg || "Failed to approve club");
    }
  };

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-3xl shadow-xl">
           <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-300" />
              <input 
                type="text" 
                placeholder="Search clubs by name, creator, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-12 pr-6 text-white text-sm outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all duration-300"
              />
           </div>
           <div className="hidden md:flex items-center gap-2 px-4 border-l border-white/5 ml-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{filteredClubs.length} Pending Clubs</p>
           </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
              <div className="w-12 h-12 border-4 border-primary/5 rounded-full absolute inset-0"></div>
           </div>
           <p className="text-xs font-black text-muted-foreground/20 uppercase tracking-[0.2em] animate-pulse">Gathering Club Data...</p>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] py-32 flex flex-col items-center justify-center group hover:border-primary/20 transition-all duration-700">
           <div className="w-20 h-20 rounded-[2.5rem] bg-white/[0.03] flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-all duration-700">
              <Trophy className="w-10 h-10 text-muted-foreground/20 group-hover:text-primary/40 transition-all duration-700" />
           </div>
           <h3 className="text-lg font-bold text-white/40 tracking-tight mb-1">No Pending Approvals</h3>
           <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">Everything is up to date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredClubs.map((club) => (
            <div 
              key={club._id}
              className="group relative bg-[#121214]/40 border border-white/5 rounded-[2.5rem] p-6 lg:p-8 hover:bg-[#121214]/60 transition-all duration-500 hover:border-primary/20 shadow-2xl overflow-hidden"
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700 opacity-0 group-hover:opacity-100"></div>

              <div className="flex flex-col gap-6 relative z-10">
                {/* Header: Club Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {club.logo ? (
                      <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shrink-0">
                        <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                        <Users className="w-8 h-8" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
                          {club.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight truncate mt-1">{club.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground/40 font-bold text-xs tracking-tight">
                        <User className="w-3.5 h-3.5 text-primary/40" />
                        Creator: {club.creator?.name || 'Unknown'} ({club.creator?.userId || 'N/A'})
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApprove(club._id)}
                    className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-90 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Approve</span>
                  </button>
                </div>

                {/* Description Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                   <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-2">
                      About the Club
                   </p>
                   <p className="text-sm text-stone-300 font-medium leading-relaxed italic">
                      "{club.description}"
                   </p>
                </div>

                {/* Meta Footer */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30 font-bold uppercase italic">
                        <Calendar className="w-3.5 h-3.5" />
                        Requested on {new Date(club.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                     </div>
                  </div>
                  {club.email && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/30 font-bold truncate max-w-[150px]">
                      <Mail className="w-3.5 h-3.5" />
                      {club.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
