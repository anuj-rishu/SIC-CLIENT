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
  Globe
} from 'lucide-react';
import { authService } from '@/services';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Profile', icon: UserCircle, path: '/dashboard/profile' },
  { name: 'Members', icon: Users, path: '/dashboard/members' },
  { name: 'Interviews', icon: CalendarDays, path: '/dashboard/interviews' },
  { name: 'Tasks', icon: ListTodo, path: '/dashboard/tasks' },
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

      <div className={`w-72 h-screen bg-[#09090b] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tighter">SIC CONSOLE</h1>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                   <p className="text-[10px] text-muted-foreground/60 uppercase font-black tracking-widest">Admin v2.0</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 mb-10">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] px-4 mb-4">Core Navigation</p>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.2)]' 
                        : 'text-muted-foreground/70 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
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

        <div className="mt-auto p-6 space-y-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm">Terminate Session</span>
          </button>
        </div>
      </div>
    </>
  );
}

