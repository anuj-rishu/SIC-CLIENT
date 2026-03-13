"use client";

import React from 'react';
import { AlertOctagon, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onCancel} disabled={isLoading} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white transition-all rounded-xl hover:bg-white/5 disabled:opacity-50">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center sm:text-left mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-inner">
              <AlertOctagon className="w-7 h-7 text-rose-500" />
            </div>
            <div className="mt-2 sm:mt-0 flex-1">
              <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground/80 mt-2 font-semibold leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/5">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 bg-white/[0.03] hover:bg-white/10 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-rose-500/20 group active:scale-[0.98]"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
