'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import apiClient from '@/lib/api-client';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

interface DataContextType {
  callApi: <T = any>(
    config: AxiosRequestConfig,
    showToast?: boolean
  ) => Promise<AxiosResponse<T> | null>;
  loadingStates: Record<string, boolean>;
  profile: any;
  refreshProfile: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<any>(null);
  const profileFetched = useRef(false);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, []);

  React.useEffect(() => {
    if (!profileFetched.current) {
      profileFetched.current = true;
      refreshProfile();
    }
  }, [refreshProfile]);

  const callApi = useCallback(async <T = any>(
    config: AxiosRequestConfig,
    showToast = true
  ): Promise<AxiosResponse<T> | null> => {
    const requestKey = `${config.method?.toUpperCase() || 'GET'}:${config.url}`;

    setLoadingStates((prev) => ({ ...prev, [requestKey]: true }));

    try {
      const response = await apiClient(config);
      return response;
    } catch (error: any) {
      if (error.isDuplicate) {
        return null;
      }
      if (showToast) {
        const message = error.response?.data?.msg || error.message || 'Something went wrong';
        toast.error(message);
      }
      throw error;
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[requestKey];
        return newState;
      });
    }
  }, []);

  return (
    <DataContext.Provider value={{ callApi, loadingStates, profile, refreshProfile }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
