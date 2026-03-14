"use client";

import React, { useEffect, useState } from 'react';
import { Search, Bell, Menu, User, ShieldCheck } from 'lucide-react';
import { authService } from '@/services';
import { usePathname } from 'next/navigation';

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchHeaderProfile = async () => {
      try {
        const res = await authService.getProfile();
        setProfile(res.data);
      } catch (err) {
        console.error('Header profile fetch failed', err);
      }
    };
    fetchHeaderProfile();
  }, []);

  const getPageInfo = () => {
    if (pathname === '/dashboard/members') {
      return { title: 'Members', desc: 'Manage team and access' };
    }
    if (pathname === '/dashboard/profile') {
      return { title: 'Profile Settings', desc: 'Manage identity and security' };
    }
    if (pathname === '/dashboard/interviews') {
      return { title: 'Interview Management', desc: 'Manage interviews' };
    }
    if (pathname === '/dashboard/mom-control') {
      return { title: 'MOM Control', desc: 'Create and manage meeting minutes' };
    }
    if (pathname === '/dashboard/tasks') {
      const role = profile?.domain?.role?.toUpperCase();
      const isExec = role === "FOUNDER" || role === "PRESIDENT" || role === "VICE PRESIDENT" || role === "VICEPRESIDENT";
      const target = isExec 
        ? profile.domain.role.charAt(0).toUpperCase() + profile.domain.role.slice(1).toLowerCase() 
        : profile?.domain?.name || 'Squad';
      
      return { 
        title: 'Team Workflow', 
        desc: `Monitor tasks for ${target}` 
      };
    }
    return { title: 'Overview', desc: 'Monitoring SIC PORTAL status and activity' };
  };

  const { title, desc } = getPageInfo();

  return (
    <header className="h-20 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center flex-1 gap-4 md:gap-8">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 lg:hidden text-muted-foreground hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
           <h2 className="text-xs md:text-sm font-black tracking-widest text-white uppercase">{title}</h2>
           <p className="text-[9px] md:text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter mt-0.5">{desc}</p>
        </div>
      </div>


      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white group-hover:text-primary transition-colors">{profile?.name || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">{profile?.domain?.role || 'Root Access'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/40 to-blue-600/10 p-[1px] group-hover:from-primary transition-all">
            <div className="w-full h-full rounded-[10px] bg-[#121214] flex items-center justify-center overflow-hidden">
               {profile?.profilePhoto ? (
                 <img src={profile.profilePhoto} alt="Admin" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-6 h-6 text-primary" />
               )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
