"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mail,
  User,
  Github,
  Linkedin,
  CheckCircle,
  IdCard,
  Loader2,
  Calendar,
  Globe,
  Key,
  RefreshCw,
  X,
  ExternalLink,
  Lock,
  MailWarning,
  ChevronRight,
  UserCircle,
  Fingerprint,
  Trash2,
} from "lucide-react";
import { authService } from "@/services";
import { startRegistration } from "@simplewebauthn/browser";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";


export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Email Change State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState(1);

  // Password Change State
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      const data = res.data;
      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setBio(data.bio || "");
      setGithub(data.githubProfile || "");
      setLinkedin(data.linkedinProfile || "");
      setPhotoPreview(data.profilePhoto || null);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("githubProfile", github);
      formData.append("linkedinProfile", linkedin);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);

      await authService.updateProfile(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      if (profilePhoto) fetchProfile();
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEmailRequest = async () => {
    setSaving(true);
    try {
      await authService.requestEmailChange(newEmail);
      setEmailStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Request failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailVerify = async () => {
    setSaving(true);
    try {
      await authService.verifyEmailChange({ otp: emailOtp });
      setShowEmailModal(false);
      setEmail(newEmail);
      setEmailStep(1);
      setNewEmail("");
      setEmailOtp("");
      toast.success("Email updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Verification failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePassChange = async () => {
    setSaving(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setShowPassModal(false);
      setOldPassword("");
      setNewPassword("");
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPasskey = async () => {
    try {
      setSaving(true);
      const res = await authService.generatePasskeyRegisterOptions();
      const options = res.data;

      const attResp = await startRegistration(options);
      
      const verificationResp = await authService.verifyPasskeyRegister(attResp);
      if (verificationResp.data.msg === "Passkey registered successfully") {
        toast.success("Passkey registered. You can now login with it.");
        fetchProfile();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to register passkey');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePasskey = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: "Remove Passkey",
      message: "Are you sure you want to remove this passkey?",
      onConfirm: async () => {
        setSaving(true);
        try {
          await authService.deletePasskey(id);
          fetchProfile();
          toast.success("Passkey removed");
        } catch (err: any) {
          console.error(err);
          toast.error("Failed to delete passkey");
        } finally {
          setSaving(false);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };


  const getRoleColor = (role: string) => {
    const r = role?.toUpperCase();
    if (r === "FOUNDER") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    if (r === "PRESIDENT") return "text-violet-400 bg-violet-500/10 border-violet-500/20";
    if (r === "MEMBER") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-primary bg-primary/10 border-primary/20";
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-4 animate-in fade-in duration-700">
      {/* Top Banner Identity */}
      <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-6 relative w-full">
          <div className="relative group/avatar">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-2xl bg-white/[0.02] border border-white/10 p-1 flex items-center justify-center relative overflow-hidden group-hover/avatar:border-primary/50 transition-all duration-500">
              {photoPreview ? (
                <img src={photoPreview} alt={name} className="w-full h-full object-cover rounded-[1.2rem] md:rounded-xl" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center rounded-[1.2rem] md:rounded-xl">
                  <UserCircle className="w-10 h-10 md:w-12 md:h-12 text-primary/40" />
                </div>
              )}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start md:gap-3 mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-2 md:mb-0">{name}</h1>
              <div className={`px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${getRoleColor(profile?.domain?.role)}`}>
                {profile?.domain?.role || "Member"}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 text-muted-foreground/40 text-[10px] uppercase font-bold tracking-widest">
              <span className="flex items-center gap-1.5"><IdCard className="w-3.5 h-3.5 opacity-50" /> {profile?.adminId}</span>
              <span className="hidden sm:block w-1 h-1 bg-white/10 rounded-full"></span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-50" /> Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full md:w-auto px-8 py-3.5 md:py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
            isSaved 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
          } disabled:opacity-50 relative z-10`}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : isSaved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {/* Bento Layout Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal & Bio */}
        <section className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identity</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 px-5 outline-none focus:border-primary text-white text-sm font-medium transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Email Identity</label>
                <button onClick={() => setShowEmailModal(true)} className="text-[10px] text-primary hover:underline transition-all font-black">Change</button>
              </div>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/20" />
                <input 
                  value={email}
                  disabled
                  className="w-full bg-white/[0.01] border border-white/5 rounded-2xl py-3.5 pl-12 text-muted-foreground/30 text-sm font-medium cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Biography</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 px-5 outline-none focus:border-primary text-white text-sm font-medium transition-all resize-none"
                placeholder="Share your role context..."
              />
            </div>
          </div>
        </section>

        <div className="space-y-8">
          {/* Support Social Connections */}
          <section className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Network</h3>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <Github className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                <input 
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="GitHub URL"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-10 outline-none focus:border-primary text-sm font-medium"
                />
              </div>
              <div className="relative group">
                <Linkedin className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                <input 
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-10 outline-none focus:border-primary text-sm font-medium"
                />
              </div>
            </div>
          </section>

          {/* Privacy Nodes */}
          <section className="bg-card/30 backdrop-blur-md border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Security Setup</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
               <button 
                 onClick={() => setShowPassModal(true)}
                 className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/50 transition-all"
               >
                 <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Password</span>
                 </div>
                 <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-white transition-all group-hover:translate-x-1" />
               </button>

               <button 
                 onClick={() => setShowEmailModal(true)}
                 className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/50 transition-all"
               >
                 <div className="flex items-center gap-3">
                    <MailWarning className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Root Email</span>
                 </div>
                 <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-white transition-all group-hover:translate-x-1" />
               </button>
            </div>

            <div className="border-t border-white/5 pt-5">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <Fingerprint className="w-4 h-4 text-emerald-400" />
                   <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Biometric Passkeys</h4>
                 </div>
                 <button 
                   onClick={handleAddPasskey}
                   disabled={saving}
                   className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-all"
                 >
                   Register New
                 </button>
              </div>
              
              {profile?.passkeys?.length > 0 ? (
                <div className="space-y-2">
                  {profile.passkeys.map((pk: any) => (
                    <div key={pk._id || pk.credentialID} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-xl gap-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Key className="w-3.5 h-3.5 text-emerald-400" />
                         </div>
                         <div>
                           <p className="text-[11px] font-bold text-white uppercase tracking-widest">{pk.label || 'Passkey Device'}</p>
                           <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 font-bold">Counter: {pk.counter}</p>
                         </div>
                       </div>
                       <button onClick={() => handleDeletePasskey(pk.credentialID)} className="text-red-400/50 hover:text-red-400 p-2 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all self-end sm:self-auto">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                   <Fingerprint className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">No passkeys registered</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => {setShowEmailModal(false); setEmailStep(1);}} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            <div className="text-left mb-6">
               <h3 className="text-xl font-bold text-white">Update Email</h3>
               <p className="text-xs text-muted-foreground mt-1">Enter your new administrative email root</p>
            </div>
            <div className="space-y-6 text-center">
              {emailStep === 1 ? (
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary text-white text-center font-bold" placeholder="new@sic.ai" />
              ) : (
                <input value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} maxLength={6} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.5em] outline-none focus:border-primary text-primary" placeholder="000000" />
              )}
              <button onClick={emailStep === 1 ? handleEmailRequest : handleEmailVerify} disabled={saving} className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-[0.98]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />}
                {emailStep === 1 ? "Next Step" : "Verify & Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowPassModal(false)} className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
            <div className="text-left mb-6">
               <h3 className="text-xl font-bold text-white">Change Password</h3>
               <p className="text-xs text-muted-foreground mt-1">Secure your account with a new password</p>
            </div>
            <div className="space-y-5">
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary text-white font-bold" placeholder="Current Password" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary text-white font-bold" placeholder="New Password" />
              <button onClick={handlePassChange} disabled={saving} className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 flex items-center justify-center gap-2 mt-4 group disabled:opacity-50 transition-all active:scale-[0.98]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        isLoading={saving}
        confirmText="Remove"
      />
    </div>
  );
}
