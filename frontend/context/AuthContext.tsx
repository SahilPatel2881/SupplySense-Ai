'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
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

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login/', { username, password });
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
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(msg);
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
