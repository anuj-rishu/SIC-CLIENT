"use client";

import React, { useEffect, useState } from 'react';
import { 
  Clock,
  ClipboardList,
  CheckCircle2,
  Target
} from 'lucide-react';
import { authService, taskService } from '@/services';

export default function DashboardPage() {
  const [taskStats, setTaskStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes] = await Promise.all([
          taskService.getTaskStats()
        ]);
        setTaskStats(statsRes.data);
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter mb-1 md:mb-2">Task Strategic Monitoring</h2>
        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] md:tracking-[0.3em]">Operational Real-time Data Feed</p>
      </div>
      <div className="grid grid-cols-4 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden">
        {roleStats.map((stat, idx) => (
          <div 
            key={stat.name} 
            className={`p-3 md:p-7 relative group transition-all hover:bg-white/[0.02] border-white/5 ${
              idx !== roleStats.length - 1 ? 'border-r' : ''
            }`}
          >
            <div className="flex flex-col gap-1 md:gap-3">
              <div className="flex justify-between items-center">
                <div className={`hidden md:flex p-2 md:p-4 rounded-lg md:rounded-[1.2rem] ${stat.bg} ${stat.color} border border-white/5 shadow-inner`}>
                  <stat.icon className="w-3.5 h-3.5 md:w-6 md:h-6" />
                </div>
                <span className={`text-[6px] md:text-[10px] font-black px-1.5 py-0.5 md:px-3 md:py-1 rounded-full ${stat.trend.includes('+') || stat.trend === 'Operational' || stat.trend === 'Finalized' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {stat.trend.includes('High') ? 'High' : stat.trend.includes('Critical') ? 'Crit' : stat.trend.includes('Lagging') ? 'Lag' : stat.trend}
                </span>
              </div>
              
              <div>
                <h3 className="text-muted-foreground/40 text-[6px] md:text-[10px] font-black uppercase tracking-tighter md:tracking-wider mb-0.5 line-clamp-1">{stat.name.split(' ')[0]}</h3>
                <p className="text-lg md:text-4xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
