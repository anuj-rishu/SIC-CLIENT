"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, 
  UserCircle, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
  ListTodo,
  Globe,
  FileText
} from 'lucide-react';
import { authService } from '@/services';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Profile', icon: UserCircle, path: '/dashboard/profile' },
  { name: 'Members', icon: Users, path: '/dashboard/members' },
  { name: 'Interviews', icon: CalendarDays, path: '/dashboard/interviews' },
  { name: 'Tasks', icon: ListTodo, path: '/dashboard/tasks' },
  { name: 'MOM control', icon: FileText, path: '/dashboard/mom-control' },
  { name: 'Website Control', icon: Globe, path: '/dashboard/website-control' },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Server logout failed', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div className={`w-72 h-[100dvh] bg-[#09090b] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header - Fixed */}
        <div className="p-6 lg:p-8 flex-shrink-0">
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-black text-white tracking-tighter uppercase leading-none mb-1">SIC CONSOLE</h1>
                <div className="flex items-center gap-1.5">
                   <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-primary rounded-full animate-pulse"></span>
                   <p className="text-[9px] lg:text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">Admin v2.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-4 custom-scrollbar">
          <div className="space-y-1 mb-10">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] px-4 mb-4">Core Navigation</p>
            <nav className="space-y-1.5 lg:space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl lg:rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.2)]' 
                        : 'text-muted-foreground/70 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 lg:gap-3.5">
                      <Icon className={`w-4.5 h-4.5 lg:w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                      <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </div>
                    {isActive ? (
                       <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="mt-auto p-4 lg:p-6 space-y-4 border-t border-white/5 bg-[#09090b]/80 backdrop-blur-md">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 lg:gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-muted-foreground/60 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm tracking-tight">Terminate Session</span>
          </button>
        </div>
      </div>
    </>
  );
}

