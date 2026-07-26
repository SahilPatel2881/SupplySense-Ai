'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { User } from '../types';

interface LoginResult {
  success: boolean;
  requireOTP?: boolean;
  username?: string;
  maskedEmail?: string;
  demoOTP?: string;
  error?: string;
  locked?: boolean;
}

interface VerifyOTPResult {
  success: boolean;
  role?: string;
  error?: string;
  locked?: boolean;
  attemptsRemaining?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  verifyOTP: (username: string, otp: string) => Promise<VerifyOTPResult>;
  resendOTP: (username: string) => Promise<{ success: boolean; demoOTP?: string; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isWarehouseManager: boolean;
  isInventoryManager: boolean;
  isStockManager: boolean;
  isPurchaseManager: boolean;
  isSalesManager: boolean;
  isWarehouseEmployee: boolean;
  assignedWarehouseId: string | null;
  assignedWarehouseName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedToken) setToken(savedToken);
    }
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login/', { username, password });
      setLoading(false);
      if (res.data.status === 'OTP_REQUIRED') {
        return {
          success: true,
          requireOTP: true,
          username: res.data.username,
          maskedEmail: res.data.masked_email,
          demoOTP: res.data.demo_otp
        };
      }
      // Direct login fallback if ever returned
      const { access, user: userData } = res.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setToken(access);
      setUser(userData);
      return { success: true, requireOTP: false };
    } catch (err: any) {
      setLoading(false);
      const isLocked = err.response?.status === 423 || err.response?.data?.locked;
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, error: msg, locked: isLocked };
    }
  };

  const verifyOTP = async (username: string, otp: string): Promise<VerifyOTPResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/verify-otp/', { username, otp });
      const { access, user: userData } = res.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setToken(access);
      setUser(userData);
      setLoading(false);
      return { success: true, role: userData.role };
    } catch (err: any) {
      setLoading(false);
      const isLocked = err.response?.status === 423 || err.response?.data?.locked;
      const attemptsRemaining = err.response?.data?.attempts_remaining;
      const msg = err.response?.data?.error || 'Verification failed. Please check your OTP.';
      setError(msg);
      return { success: false, error: msg, locked: isLocked, attemptsRemaining };
    }
  };

  const resendOTP = async (username: string) => {
    try {
      const res = await api.post('/auth/resend-otp/', { username });
      return { success: true, demoOTP: res.data.demo_otp };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to resend OTP.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setUser(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const role = user?.role;

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    verifyOTP,
    resendOTP,
    logout,
    refreshProfile,
    isAdmin: role === 'Admin',
    isWarehouseManager: role === 'WarehouseManager',
    isInventoryManager: role === 'InventoryManager',
    isStockManager: role === 'StockManager',
    isPurchaseManager: role === 'PurchaseManager',
    isSalesManager: role === 'SalesManager',
    isWarehouseEmployee: role === 'WarehouseEmployee',
    assignedWarehouseId: user?.assigned_warehouse_id || null,
    assignedWarehouseName: user?.assigned_warehouse_name || 'All Warehouses'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
