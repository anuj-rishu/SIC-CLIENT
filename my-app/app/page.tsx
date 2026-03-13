"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';
import { authService } from '@/services/authService';
import { setCookie } from 'cookies-next';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      const { token } = response.data;
      
      setCookie('token', token, { maxAge: 60 * 60 * 24 }); // 24 hours
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Allow discoverable login if no email is entered
      const optRes = await authService.generatePasskeyLoginOptions(email || undefined);
      const { options, challengeId } = optRes.data;

      const authResp = await startAuthentication(options);
      
      const verRes = await authService.verifyPasskeyLogin(authResp, email || undefined, challengeId);
      const { token } = verRes.data;
      
      setCookie('token', token, { maxAge: 60 * 60 * 24 });
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.msg || err.message || 'Passkey login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.forgotPassword(email);
      setSuccess('OTP has been sent to your email');
      setView('reset');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.resetPassword({ email, otp, newPassword });
      setSuccess('Password reset successful. You can now login.');
      setView('login');
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[140px]"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-[440px] z-10">
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-[-0.05em] text-white mb-2 text-center drop-shadow-2xl">
            SIC <span className="text-primary italic drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">CONSOLE</span>
          </h1>
          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-gradient-to-r from-transparent to-muted-foreground/20"></div>
             <p className="text-muted-foreground/40 font-black tracking-[0.4em] uppercase text-[8px] md:text-[10px] text-center">
               Admin console accesss
             </p>
             <div className="h-px w-8 bg-gradient-to-l from-transparent to-muted-foreground/20"></div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative group overflow-hidden">
          {/* Subtle top light effect */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          {view === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-7">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] md:text-xs font-bold py-3 px-4 rounded-xl text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-bold py-3 px-4 rounded-xl text-center">
                  {success}
                </div>
              )}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] ml-1">Account Email</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sicportal.com"
                    className="block w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 text-white text-xs md:text-sm font-medium shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); setSuccess(''); }}
                    className="text-[11px] font-bold text-primary hover:text-white transition-colors tracking-tight"
                  >
                    Loss Access?
                  </button>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 text-white text-xs md:text-sm font-medium shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white font-black py-4 md:py-4.5 rounded-xl md:rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_20px_40px_-12px_rgba(59,130,246,0.4)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed text-[11px] md:text-xs uppercase tracking-widest"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Authenticating...' : 'Authorize Session'} <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${loading ? 'opacity-0' : ''}`} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"></div>
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground/30 text-[9px] uppercase tracking-widest font-black">or utilize</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all hover:border-primary/30 active:scale-[0.99] disabled:opacity-50 text-[11px] uppercase tracking-widest"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                Biometric Passkey
              </button>

            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6 md:space-y-8">
              <div className="text-center">
                 <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Recover Access</h2>
                 <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                    Enter your registered email below to receive a secure verification code.
                 </p>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] md:text-xs font-bold py-3 px-4 rounded-xl text-center">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] ml-1">Account Email</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sicportal.com"
                    className="block w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 text-white text-xs md:text-sm font-medium shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-[0_20px_40px_-12px_rgba(59,130,246,0.4)] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 text-[11px] md:text-xs uppercase tracking-widest overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Processing...' : 'Send OTP'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"></div>
                </button>
                <button 
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                  className="w-full text-[11px] font-bold text-muted-foreground/40 hover:text-white transition-all tracking-widest py-2 text-center flex items-center justify-center gap-2 group/back uppercase"
                >
                  <ArrowRight className="w-3 h-3 rotate-180 group-hover:text-primary transition-colors" />
                  Return to Console
                </button>
              </div>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6 md:space-y-8">
              <div className="text-center">
                 <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Security Check</h2>
                 <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-[280px] mx-auto">
                    A secure terminal code was dispatched to your registry. Verify it to establish a new password.
                 </p>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] md:text-xs font-bold py-3 px-4 rounded-xl text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] md:text-xs font-bold py-3 px-4 rounded-xl text-center">
                  {success}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] ml-1">Verification OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••••"
                    className="block w-full px-4 py-3.5 md:py-4 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 placeholder:tracking-normal text-white text-center font-black tracking-[0.5em] shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em] ml-1">New Terminal Password</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30 text-white text-xs md:text-sm font-medium shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-[0_20px_40px_-12px_rgba(59,130,246,0.4)] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 text-[11px] md:text-xs uppercase tracking-widest overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Processing...' : 'Confirm Reset'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"></div>
                </button>
                <button 
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                  className="w-full text-[11px] font-bold text-muted-foreground/40 hover:text-white transition-all tracking-widest py-2 text-center flex items-center justify-center gap-2 group/back uppercase"
                >
                  <ArrowRight className="w-3 h-3 rotate-180 group-hover:text-primary transition-colors" />
                  Back to Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
      
      
    </div>
  );
}
