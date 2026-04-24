"use client";

import React, { useState } from 'react';
import { Trophy, Medal, Crown, Users, User, ArrowUpRight, TrendingUp, BarChart3, Search, ClipboardList } from 'lucide-react';
import LeaderboardCharts from './LeaderboardCharts';

interface LeaderboardProps {
  data: {
    members: any[];
    domains: any[];
  };
}

export default function Leaderboard({ data }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'domains' | 'analytics'>('members');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = data.members.filter(m => 
    m.role === "MEMBER" && (
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.domain.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
      case 1: return <Medal className="w-5 h-5 text-slate-300 fill-slate-300/20" />;
      case 2: return <Trophy className="w-5 h-5 text-amber-600 fill-amber-600/20" />;
      default: return <span className="text-[10px] font-black text-muted-foreground/40">{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'border-yellow-400/50 bg-yellow-400/5';
      case 1: return 'border-slate-300/50 bg-slate-300/5';
      case 2: return 'border-amber-600/50 bg-amber-600/5';
      default: return 'border-white/5 bg-white/[0.02]';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-lg md:text-xl font-black text-white tracking-tighter mb-0.5 md:mb-1">Elite Performance</h3>
          <p className="text-[7px] md:text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] md:tracking-[0.3em]">Ranked by Strategic Action Output</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-sm self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'members' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground/60 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Members
          </button>
          <button 
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'domains' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground/60 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Domains
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'analytics' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground/60 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'members' && (
        <div className="relative group/search mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 group-focus-within/search:text-primary transition-colors" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search squad personnel..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-[10px] md:text-xs text-white outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/10"
          />
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 ${activeTab === 'members' ? 'max-h-[600px] overflow-y-auto no-scrollbar pr-1' : ''}`}>
        {activeTab === 'members' ? (
          filteredMembers.map((member, index) => (
            <div 
              key={member.id}
              className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 hover:translate-x-1 ${getRankColor(index)} group overflow-hidden`}
            >
              {/* Animated Background Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-center w-8 shrink-0 z-10">
                {getRankIcon(index)}
              </div>
              
              <div className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 z-10 group-hover:border-primary/40 transition-colors">
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary bg-primary/10">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
    
              <div className="flex-grow min-w-0 z-10">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <h4 className="text-xs md:text-sm font-black text-white truncate">{member.name}</h4>
                  <div className="flex gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[6px] font-black uppercase tracking-widest text-muted-foreground/30 whitespace-nowrap">
                      {member.domain}
                    </div>
                    {member.role !== "MEMBER" && (
                      <div className="px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[6px] font-black uppercase tracking-widest text-primary whitespace-nowrap">
                        {member.role}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-primary">{member.score} <span className="opacity-40 text-[8px]">PTS</span></span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1">
                      <ClipboardList className="w-3 h-3 text-muted-foreground/30" />
                      <span className="text-[10px] font-black text-muted-foreground/60">{member.completedTasks}/{member.totalTasks} <span className="opacity-40 text-[8px]">TASKS</span></span>
                    </div>
                  </div>
                </div>
              </div>
    
              <div className="hidden sm:flex flex-col items-end shrink-0 z-10">
                 <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-blue-400 to-primary/80 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (member.score / (data.members[0].score || 1)) * 100)}%` }}
                    />
                 </div>
              </div>
            </div>
          ))
        ) : activeTab === 'domains' ? (
          data.domains.map((domain, index) => (
            <div 
              key={domain.name}
              className={`flex flex-col gap-3 p-4 md:p-5 rounded-2xl border transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 ${getRankColor(index)} relative overflow-hidden group`}
            >
              {/* Domain Header - Compact but Readable */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-all shadow-inner shrink-0">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tighter leading-tight">{domain.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest">Lead:</span>
                        <span className="text-[8px] font-bold text-white/60">{domain.lead || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest">Assoc:</span>
                        <span className="text-[8px] font-bold text-white/60">{domain.associate || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl md:text-2xl font-black text-primary tracking-tighter leading-none">{domain.score}</div>
                  <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mt-1">Efficiency</div>
                </div>
              </div>

              {/* Consolidated Stats Row - Refined */}
              <div className="flex items-center justify-between gap-3 relative z-10 bg-white/5 rounded-xl p-3 border border-white/5 group-hover:bg-white/[0.07] transition-all duration-300">
                <div className="flex flex-col">
                   <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Squad Output</p>
                   <p className="text-sm font-black text-white">{domain.totalScore} <span className="text-[10px] text-muted-foreground/40 font-bold uppercase">pts</span></p>
                </div>
                <div className="h-6 w-px bg-white/10 shrink-0" />
                <div className="flex flex-col items-end text-right">
                   <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Quality Avg</p>
                   <p className="text-sm font-black text-emerald-500">{domain.avgRating} <span className="text-[10px] opacity-40 font-bold">★</span></p>
                </div>
              </div>

              {/* Roster Section - Compact but Clear */}
              {domain.topMembers && domain.topMembers.length > 0 && (
                <div className="flex flex-col gap-2.5 relative z-10 bg-black/20 rounded-xl p-3.5 border border-white/5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Domain Elite</span>
                    <div className="flex gap-1">
                       {[...Array(5)].map((_, i) => (
                         <div key={i} className={`w-1 h-1 rounded-full ${i < domain.topMembers.length ? 'bg-primary/40' : 'bg-white/5'}`} />
                       ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {domain.topMembers.map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group/member py-0.5 transition-all">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] font-black text-white/20 w-3">{i + 1}</span>
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 ring-1 ring-primary/20 shrink-0 group-hover/member:ring-primary/50 transition-all">
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary bg-primary/5">{m.name.charAt(0)}</div>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-white/80 group-hover/member:text-white transition-colors truncate max-w-[110px]">{m.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-primary/60 group-hover/member:text-primary transition-colors">{m.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar - Readable Ranking */}
              <div className="space-y-1.5 relative z-10">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
                  <span>Power Ranking</span>
                  <span className="text-primary/60">{Math.round((domain.score / (data.domains[0].score || 1)) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-blue-400 to-primary/60 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                    style={{ width: `${Math.min(100, (domain.score / (data.domains[0].score || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
            </div>
          ))
        ) : (
          <div className="lg:col-span-2">
            <LeaderboardCharts data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
