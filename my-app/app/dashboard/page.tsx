"use client";

import React, { useEffect, useState } from 'react';
import { 
  Target,
  Crown,
  ShieldCheck,
  TrendingUp,
  Clock,
  ClipboardList,
  CheckCircle2,
  Medal,
  Trophy
} from 'lucide-react';
import { authService, taskService } from '@/services';
import Leaderboard from '@/components/Leaderboard';

export default function DashboardPage() {
  const [taskStats, setTaskStats] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, leaderboardRes] = await Promise.all([
          taskService.getTaskStats(),
          taskService.getLeaderboard()
        ]);
        setTaskStats(statsRes.data);
        setLeaderboardData(leaderboardRes.data);
      } catch (err) {
        console.error('Dashboard data fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const getDashboardStats = () => {
    if (!taskStats) return [];
    
    // Efficiency calculation (Completed / Total)
    const efficiency = taskStats.total > 0 
      ? Math.round((taskStats.completed / taskStats.total) * 100) 
      : 0;

    return [
      { 
        name: 'Strategic Objectives', 
        value: taskStats.total, 
        trend: 'Operational', 
        icon: ClipboardList, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10' 
      },
      { 
        name: 'In Review / Pending', 
        value: taskStats.pending, 
        trend: 'High Priority', 
        icon: Clock, 
        color: 'text-amber-500', 
        bg: 'bg-amber-500/10' 
      },
      { 
        name: 'Finalized Actions', 
        value: taskStats.completed, 
        trend: 'Finalized', 
        icon: CheckCircle2, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-500/10' 
      },
      { 
        name: 'Completion Flux', 
        value: `${efficiency}%`, 
        trend: efficiency > 50 ? '+ Critical' : '- Lagging', 
        icon: Target, 
        color: 'text-primary', 
        bg: 'bg-primary/10' 
      },
    ];
  };

  if (loading) {
    return (
       <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
             <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Initializing Tactical Feed...</p>
          </div>
       </div>
    );
  }

  const roleStats = getDashboardStats();

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-700">
      <div>
        <h2 className="text-lg md:text-xl font-black text-white tracking-tighter mb-0.5 md:mb-1">Task Strategic Monitoring</h2>
        <p className="text-[7px] md:text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] md:tracking-[0.3em]">Operational Real-time Data Feed</p>
      </div>
      <div className="flex bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-[1.5rem] overflow-hidden backdrop-blur-xl">
        {roleStats.map((stat, idx) => (
          <div 
            key={stat.name} 
            className={`flex-1 px-3 py-2 md:px-5 md:py-3 flex flex-col gap-1 transition-all hover:bg-white/[0.02] ${
              idx !== roleStats.length - 1 ? 'border-r border-white/5' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground/40 text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none">{stat.name.split(' ')[0]}</h3>
              <div className={`w-1 h-1 rounded-full ${stat.color} opacity-30`} />
            </div>
            
            <div className="flex flex-col">
              <p className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {leaderboardData && (
        <div className="space-y-6">
          {/* Strategic Leads Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Crown className="w-4 h-4 text-yellow-500" />
              <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em]">Command Hierarchy: Leads</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaderboardData.members.filter(m => m.role === "LEAD").map((lead, idx) => (
                <div key={lead.id} className="bg-gradient-to-br from-yellow-500/5 via-card/40 to-card/40 border border-white/5 rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                      idx === 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 
                      idx === 1 ? 'bg-slate-300/10 border-slate-300/20' : 
                      idx === 2 ? 'bg-orange-500/10 border-orange-500/20' : 
                      'bg-white/5 border-white/10'
                    }`}>
                      {idx === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> :
                       idx === 1 ? <Medal className="w-5 h-5 text-slate-300" /> :
                       idx === 2 ? <Medal className="w-5 h-5 text-orange-500" /> :
                       <span className="text-muted-foreground/30 font-black text-xs">#{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{lead.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">{lead.domain}</p>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">{lead.totalTasks} Team Tasks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-yellow-500 leading-none">{lead.score}</p>
                      <p className="text-[6px] font-black text-muted-foreground/20 uppercase tracking-tighter mt-1">Index</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Associates Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em]">Operational Support: Associates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaderboardData.members.filter(m => m.role === "ASSOCIATE").map((assoc, idx) => (
                <div key={assoc.id} className="bg-gradient-to-br from-primary/5 via-card/40 to-card/40 border border-white/5 rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                      idx === 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 
                      idx === 1 ? 'bg-slate-300/10 border-slate-300/20' : 
                      idx === 2 ? 'bg-orange-500/10 border-orange-500/20' : 
                      'bg-white/5 border-white/10'
                    }`}>
                      {idx === 0 ? <Crown className="w-5 h-5 text-yellow-500" /> :
                       idx === 1 ? <Medal className="w-5 h-5 text-slate-300" /> :
                       idx === 2 ? <Medal className="w-5 h-5 text-orange-500" /> :
                       <span className="text-muted-foreground/30 font-black text-xs">#{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{assoc.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">{assoc.domain}</p>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <p className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">{assoc.totalTasks} Team Tasks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary leading-none">{assoc.score}</p>
                      <p className="text-[6px] font-black text-muted-foreground/20 uppercase tracking-tighter mt-1">Index</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Leaderboard */}
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Leaderboard data={leaderboardData} />
          </div>
        </div>
      )}
    </div>
  );
}
