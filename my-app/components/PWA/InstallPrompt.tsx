"use client";

import React, { useState, useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { X, Download, Share, PlusSquare, ArrowBigDownDash, Smartphone, Info } from "lucide-react";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { platform, isStandalone, installApp, deferredPrompt } = usePWA();

  useEffect(() => {
    if (isStandalone) return;
    
    const hasSeenPrompt = localStorage.getItem("pwa_prompt_seen");
    if (hasSeenPrompt) return;

    // Show after delay for guidance
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const closePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_seen", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] animate-in slide-in-from-top-full duration-700">
      <div className="max-w-md mx-auto bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/30 transition-all duration-1000"></div>
        
        <button 
          onClick={closePrompt}
          className="absolute top-3 right-3 p-1.5 text-muted-foreground/40 hover:text-white transition-all bg-white/5 rounded-full z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 ring-2 ring-primary/10">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 pt-0.5">
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              SIC CONSOLE
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </h3>
            <p className="text-[9px] text-muted-foreground/60 font-medium mt-0.5 leading-tight">
              {platform === "other" 
                ? "Switch to the standalone app for a faster experience." 
                : "Instantly access the console from your home screen."}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl">
          {platform === "ios" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Share className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-[9px] font-bold text-white uppercase tracking-widest">
                  1. Tap the <span className="text-primary italic">Share</span> button
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <PlusSquare className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-[9px] font-bold text-white uppercase tracking-widest">
                  2. Select <span className="text-primary italic">Add to Home Screen</span>
                </p>
              </div>
            </div>
          ) : platform === "android" || (platform === "other" && deferredPrompt) ? (
            <div className="flex items-center justify-between gap-3">
               <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                  <ArrowBigDownDash className="w-3 h-3" /> Direct
               </div>
               <button 
                onClick={handleInstallClick}
                className="flex-1 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
               >
                 <Download className="w-3.5 h-3.5" /> Install Now
               </button>
            </div>
          ) : (
             <div className="space-y-2">
               <div className="flex items-center gap-2 text-white/70 text-[9px] font-bold uppercase tracking-widest">
                 <Info className="w-3.5 h-3.5 text-primary" /> 
                 <span>Manual Installation</span>
               </div>
               <p className="text-[8px] text-muted-foreground/40 leading-relaxed">
                 Use the browser's menu and select <span className="text-white">"Install SIC CONSOLE"</span>.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
