"use client";

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Reload the page
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-all flex items-center justify-center group active:scale-95 ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
      title="Refresh Data"
    >
      <RefreshCw 
        className={`w-3.5 md:w-4 h-3.5 md:h-4 group-hover:rotate-180 transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
    </button>
  );
}
