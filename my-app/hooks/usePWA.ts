"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export function usePWA() {
  const [platform, setPlatform] = useState<"ios" | "android" | "other" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const checkStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes("android-app://");

    setIsStandalone(checkStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "other");

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      setIsStandalone(true);
      localStorage.setItem("pwa_prompt_seen", "true");
      // Optionally notify the user
      toast.success("SIC CONSOLE installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // For iOS, we can always "install" via manual instructions if not standalone
    if (isIOS && !checkStandalone) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (isStandalone) {
      toast.success("SIC CONSOLE is already installed!");
      return;
    }

    if (platform === "ios") {
      // For iOS, we just tell them how to do it if they click a button manually
      toast("To install: Tap Share then 'Add to Home Screen'", {
        icon: '📱',
      });
      return;
    }

    if (!deferredPrompt) {
      toast.error("Installation prompt not available. Try via browser menu.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setCanInstall(false);
      localStorage.setItem("pwa_prompt_seen", "true");
    }
  };

  return {
    platform,
    isStandalone,
    canInstall,
    installApp,
    deferredPrompt
  };
}
