"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  CreditCard, 
  Save, 
  Loader2, 
  Server,
  Mail,
  ShieldCheck,
  X
} from "lucide-react";
import { roomieConfigService } from "@/services";
import { toast } from "react-hot-toast";

export default function WebsiteControlPage() {
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    fetchPaymentAmount();
  }, []);

  const fetchPaymentAmount = async () => {
    try {
      setIsFetching(true);
      setError(null);
      const res = await roomieConfigService.getConfig("PAYMENT_AMOUNT");
      if (res.data && res.data.value) {
        setCurrentAmount(res.data.value);
        setNewAmount(res.data.value);
      }
    } catch (err: any) {
      console.error("Failed to fetch payment amount", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Access Denied: You do not have permission to view or edit this configuration.");
        toast.error("Access Denied");
      } else {
        setError(err.response?.data?.msg || "Failed to fetch the current payment amount.");
        toast.error(err.response?.data?.msg || "Failed to fetch payment amount");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount.trim()) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      await roomieConfigService.requestPriceChangeOTP("PAYMENT_AMOUNT", newAmount);
      setShowOtpModal(true);
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      console.error("Failed to request OTP", err);
      setError(err.response?.data?.msg || "Failed to initiate verification.");
      toast.error(err.response?.data?.msg || "Failed to initiate verification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    try {
      setIsSaving(true);
      const res = await roomieConfigService.updateConfig("PAYMENT_AMOUNT", newAmount, otp);
      
      if (res.data && res.data.value) {
        setCurrentAmount(res.data.value);
        setSuccess("Payment amount updated successfully across the SRM Roomie website.");
        toast.success("Price updated successfully");
        setShowOtpModal(false);
        setOtp("");
      }
    } catch (err: any) {
      console.error("Failed to verify OTP", err);
      toast.error(err.response?.data?.msg || "Verification failed. Please check the code.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-4">
      {/* Main Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Payment Control Card */}
        <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[2rem] p-5 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 bg-amber-500/10 rounded-xl">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white leading-tight">SRM ROOMIE</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground/40 uppercase tracking-widest font-black mt-0.5 md:mt-1">Payment Configuration</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] md:text-xs font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateAmount} className="space-y-5 md:space-y-6">
            <div className="bg-black/20 rounded-2xl p-4 md:p-6 border border-white/5">
              <div className="flex justify-between items-center mb-5 md:mb-6">
                 <div>
                   <span className="text-[9px] md:text-[10px] text-muted-foreground/50 uppercase tracking-widest font-black">Current Price (INR)</span>
                   <p className="text-2xl md:text-3xl font-black text-white tracking-tighter mt-0.5 md:mt-1 hover:text-primary transition-colors cursor-default">₹{currentAmount || "---"}</p>
                 </div>
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                   <Server className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/40" />
                 </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                   Update Price
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none">
                    <span className="text-muted-foreground/50 font-black group-focus-within/input:text-primary transition-colors text-sm md:text-base">₹</span>
                  </div>
                  <input 
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Enter new payment amount..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-9 md:pl-10 pr-4 md:pr-6 text-base text-white font-bold outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-muted-foreground/20 disabled:opacity-50"
                    required
                    disabled={error?.includes("permission") || error?.includes("Access Denied") || isSaving}
                  />
                </div>
                <p className="text-[9px] md:text-[10px] text-muted-foreground/40 font-medium px-1 flex items-center gap-1.5 leading-tight">
                  <Globe className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" /> Instantly syncs across all interconnected platforms.
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving || newAmount === currentAmount || error?.includes("permission") || error?.includes("Access Denied")}
              className="w-full flex items-center justify-center gap-2 md:gap-3 py-3.5 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
              {isSaving ? "Requesting Code..." : "Change Account Price"}
            </button>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-8 w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => { setShowOtpModal(false); setOtp(""); }} 
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-muted-foreground/40 hover:text-white transition-all"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <div className="text-center mb-6 md:mb-8">
               <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 border border-primary/20">
                  <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
               </div>
               <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Verify Change</h3>
               <p className="text-[10px] md:text-xs text-muted-foreground/60 mt-2 font-medium">Entering ₹{newAmount} as new payment amount. Please enter the 6-digit code sent to your email.</p>
            </div>

            <form onSubmit={handleVerifyAndSave} className="space-y-4 md:space-y-6">
              <div className="relative group">
                <Mail className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-10 md:pl-14 text-center text-2xl md:text-3xl font-black tracking-[0.3em] md:tracking-[0.4em] outline-none focus:border-primary/50 text-white placeholder:text-white/5"
                  placeholder="000000"
                  required
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving || otp.length < 6}
                className="w-full py-3.5 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-blue-600 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                Authorize & Sync
              </button>

              <button 
                type="button"
                onClick={handleUpdateAmount}
                disabled={isSaving}
                className="w-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-all text-center"
              >
                Resend Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
