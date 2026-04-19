"use client";

import React, { useState } from 'react';
import { Trophy, Medal, Crown, Users, User, ArrowUpRight, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  data: {
    members: any[];
    domains: any[];
  };
}

export default function Leaderboard({ data }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'domains'>('members');

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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        {activeTab === 'members' ? (
          data.members.slice(0, 10).map((member, index) => (
            <div 
              key={member.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all hover:scale-[1.01] duration-300 ${getRankColor(index)} group`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index)}
              </div>
              
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden flex-shrink-0">
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary bg-primary/10">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">{member.name}</h4>
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground/60 border border-white/5">
                    {member.domain}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500">{member.score} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-500">{member.completedTasks} tasks</span>
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                 <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (member.score / (data.members[0].score || 1)) * 100)}%` }}
                    />
                 </div>
              </div>
            </div>
          ))
        ) : (
          data.domains.map((domain, index) => (
            <div 
              key={domain.name}
              className={`flex flex-col gap-3 p-3.5 rounded-xl border transition-all hover:scale-[1.01] duration-300 ${getRankColor(index)}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-grow flex items-center justify-between">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{domain.name}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-primary tracking-tighter leading-none">{domain.score}</span>
                    <span className="text-[6px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Avg Score</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Team Size</span>
                    <span className="text-[11px] font-black text-white">{domain.memberCount} Members</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Total Output</span>
                    <span className="text-[11px] font-black text-white">{domain.totalScore} pts</span>
                  </div>
                </div>

                {domain.topMember && (
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">Domain MVP</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-white/10 ring-1 ring-primary/20">
                        {domain.topMember.photo ? (
                          <img src={domain.topMember.photo} alt={domain.topMember.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[6px] font-black text-primary uppercase">{domain.topMember.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-white/90">{domain.topMember.name.split(' ')[0]}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (domain.score / (data.domains[0].score || 1)) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
