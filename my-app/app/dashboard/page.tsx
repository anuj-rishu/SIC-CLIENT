"use client";

import React, { useEffect, useState } from 'react';
import { 
  Clock,
  ClipboardList,
  CheckCircle2,
  Target
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
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <Leaderboard data={leaderboardData} />
        </div>
      )}
    </div>
  );
}
