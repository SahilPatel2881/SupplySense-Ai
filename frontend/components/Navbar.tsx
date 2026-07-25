'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import AICoPilot from './AICoPilot';
import { NotificationItem } from '../types';
import { Bell, LogOut, AlertTriangle, CheckCircle2, Shield, BrainCircuit } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAICoPilot, setShowAICoPilot] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs text-slate-900">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Enterprise Supply Chain Console
          </h2>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span> Live Next.js v15 Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Co-Pilot Quick Launcher Button */}
          <button
            onClick={() => setShowAICoPilot(!showAICoPilot)}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 animate-pulse" />
            <span>AI Co-Pilot</span>
          </button>

          {/* Role Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isAdmin ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>{user?.role}</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">System Notifications</h4>
                  <span className="text-[11px] text-slate-500 font-semibold">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 text-center">No alerts at present</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs cursor-pointer transition-colors ${n.is_read ? 'bg-white opacity-70' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'LOW_STOCK' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{n.title}</p>
                            <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">{n.created_at?.slice(0, 16)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.full_name || user?.username}</p>
              <p className="text-[10px] text-slate-500 font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI Co-Pilot Drawer */}
      <AICoPilot isOpen={showAICoPilot} onClose={() => setShowAICoPilot(false)} />
    </>
  );
};

export default Navbar;
