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
      <div className="max-w-md mx-auto bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-all duration-1000"></div>
        
        <button 
          onClick={closePrompt}
          className="absolute top-4 right-4 p-2 text-muted-foreground/40 hover:text-white transition-all bg-white/5 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            <Smartphone className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              Install Roomie
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-muted-foreground/60 font-medium mt-1 leading-relaxed">
              {platform === "other" 
                ? "Switch to the standalone app for a faster, distraction-free experience." 
                : "Instantly access your management suite from your home screen."}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
          {platform === "ios" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                  1. Tap the <span className="text-primary italic">Share</span> button
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <PlusSquare className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                  2. Select <span className="text-primary italic">Add to Home Screen</span>
                </p>
              </div>
            </div>
          ) : platform === "android" || (platform === "other" && deferredPrompt) ? (
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                  <ArrowBigDownDash className="w-3.5 h-3.5" /> Direct Launch
               </div>
               <button 
                onClick={handleInstallClick}
                className="flex-1 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
               >
                 <Download className="w-4 h-4" /> Install Now
               </button>
            </div>
          ) : (
             <div className="space-y-3">
               <div className="flex items-center gap-3 text-white/70 text-[10px] font-bold uppercase tracking-widest px-2">
                 <Info className="w-4 h-4 text-primary" /> 
                 <span>Manual Installation</span>
               </div>
               <p className="text-[9px] text-muted-foreground/40 leading-relaxed px-2">
                 Click the <span className="text-white">Install icon</span> in your browser's address bar or find "Install Roomie" in the browser menu.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
