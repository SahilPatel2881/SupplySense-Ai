'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { User, Warehouse, LoginAuditLog } from '../../types';
import {
  Users,
  Plus,
  ShieldCheck,
  Clock,
  Globe,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Search,
  RefreshCw,
  Activity,
  UserCheck,
  Trash2,
  Power,
  KeyRound,
  X
} from 'lucide-react';

export default function UsersPage() {
  const { user, isAdmin } = useAuth();
  const isFounderOrAdmin = ['Founder', 'Admin'].includes(user?.role || '');
  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT_LOGS'>('USERS');

  // Users State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Reset Password Modal State
  const [selectedResetUser, setSelectedResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<LoginAuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'WarehouseManager',
    assigned_warehouse_id: '',
    is_temporary_admin: false,
    temp_admin_duration_hours: 24
  });

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const fetchUsers = async () => {
    try {
      const [uRes, whRes] = await Promise.all([
        api.get('/users/'),
        api.get('/warehouses/')
      ]);
      setUsersList(uRes.data);
      setWarehouses(whRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load users:', err);
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/auth/login-history/');
      setAuditLogs(res.data);
      setLogsLoading(false);
    } catch (err) {
      console.error('Failed to load login audit logs:', err);
      setLogsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/', formData);
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}/`, { is_active: !user.is_active });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResetUser) return;
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      await api.put(`/users/${selectedResetUser.id}/`, { new_password: newPassword });
      alert(`Successfully reset password for user @${selectedResetUser.username}`);
      setSelectedResetUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}" from the database? This user will be completely removed and cannot log in.`)) {
      return;
    }
    try {
      await api.delete(`/users/${userId}/`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    let formattedStr = String(isoString);
    if (!formattedStr.endsWith('Z') && !formattedStr.includes('+') && !formattedStr.includes('-')) {
      formattedStr += 'Z';
    }
    try {
      const date = new Date(formattedStr);
      if (isNaN(date.getTime())) return String(isoString);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return String(isoString);
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm) ||
      log.browser.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && log.status === 'Success') ||
      (statusFilter === 'FAILED' && (log.status === 'Failed' || log.status === 'Locked Out'));

    return matchesSearch && matchesStatus;
  });

  const totalLogs = auditLogs.length;
  const successCount = auditLogs.filter(l => l.status === 'Success').length;
  const failedCount = auditLogs.filter(l => l.status === 'Failed' || l.status === 'Locked Out').length;
  const activeSessions = auditLogs.filter(l => l.session_active && l.status === 'Success').length;

  if (!isAdmin && !loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center max-w-7xl mx-auto w-full">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto font-black text-xl">
                403
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Admin Privileges Required</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                User management and system-wide RBAC controls are restricted to System Administrators. As a Warehouse Manager, you have operational access to your assigned warehouse.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Top Header & Navigation Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" /> User Accounts & Security Audit
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Manage user credentials, system-wide RBAC permissions, and inspect live login/logout audit logs.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab('USERS')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'USERS'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" /> User Credentials
              </button>
              <button
                onClick={() => setActiveTab('AUDIT_LOGS')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'AUDIT_LOGS'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Login Audit Logs
              </button>
            </div>
          </div>

          {/* User Credentials & Audit Logs or Skeleton */}
          {loading ? (
            <TableSkeleton rows={8} cols={6} />
          ) : (
            <>
              {/* TAB 1: USERS LIST & MANAGEMENT */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create User Account
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                      <th className="p-4">User Details</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Assigned Warehouse</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{u.full_name || u.username}</div>
                          <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block w-fit ${
                              u.is_temporary_admin ? 'bg-purple-100 text-purple-800 border-purple-300 font-extrabold' :
                              u.role === 'Founder' ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' :
                              u.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              u.role.includes('Manager') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {u.is_temporary_admin ? '⚡ TEMP ADMIN' : u.role === 'Founder' ? '👑 Founder' : u.role}
                            </span>
                            {u.is_temporary_admin && u.admin_expires_at && (
                              <span className="text-[9px] text-purple-600 font-mono font-semibold">
                                Exp: {formatDate(u.admin_expires_at)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium">{u.assigned_warehouse_name || 'System Wide'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedResetUser(u);
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            title="Reset User Password"
                            className="p-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Pwd</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            title={u.is_active ? 'Deactivate User Account' : 'Activate User Account'}
                            className={`p-1.5 rounded-lg border font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 ${
                              u.is_active
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{u.is_active ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            title="Delete User Permanently from MongoDB"
                            className="p-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LOGIN AUDIT LOGS (ADMIN PRIVILEGED AUDIT TRAIL) */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="space-y-6">
              {/* Audit Summary Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Login Attempts</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{totalLogs}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Recorded audit events</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Successful Logins</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-600">{successCount}</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {totalLogs > 0 ? `${Math.round((successCount / totalLogs) * 100)}% Success Rate` : '100%'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Failed / Locked Out</span>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><XCircle className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-2xl font-black text-rose-600">{failedCount}</h3>
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">Invalid credentials or 2FA lockout</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Sessions</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock className="w-4 h-4" /></div>
                  </div>
                  <h3 className="text-2xl font-black text-indigo-600">{activeSessions}</h3>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-1">Currently logged-in users</p>
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Username, Role, IP..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="SUCCESS">Success Only</option>
                    <option value="FAILED">Failed / Locked Out Only</option>
                  </select>

                  <button
                    onClick={fetchAuditLogs}
                    disabled={logsLoading}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
                    title="Refresh Audit Logs"
                  >
                    <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Login History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                      <th className="p-4">Username</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Login Time</th>
                      <th className="p-4">Logout Time</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Browser</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          No audit log history entries found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. Username */}
                          <td className="p-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                                {log.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{log.username}</p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Role */}
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              log.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              log.role.includes('Manager') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              log.role === 'WarehouseEmployee' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {log.role}
                            </span>
                          </td>

                          {/* 3. Login Time */}
                          <td className="p-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{formatDate(log.login_time)}</span>
                            </div>
                          </td>

                          {/* 4. Logout Time */}
                          <td className="p-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                            {log.session_active && log.status === 'Success' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Active Session
                              </span>
                            ) : log.logout_time ? (
                              <span>{formatDate(log.logout_time)}</span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>

                          {/* 5. IP Address */}
                          <td className="p-4 font-mono text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{log.ip_address}</span>
                            </div>
                          </td>

                          {/* 6. Browser */}
                          <td className="p-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{log.browser}</span>
                            </div>
                          </td>

                          {/* 7. Status (Success / Failed / Locked Out) */}
                          <td className="p-4">
                            {log.status === 'Success' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
                              </span>
                            ) : log.status === 'Locked Out' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                                <AlertOctagon className="w-3 h-3 text-amber-600" /> Locked Out
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" /> Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

          {/* Add User Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create User Credentials</h3>

                <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-900 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-900 bg-white"
                      >
                        <option value="WarehouseManager">🏭 Warehouse Manager</option>
                        <option value="Founder">👑 Founder / Super Admin</option>
                        <option value="OperationsHead">🏢 Operations Head</option>
                        <option value="Admin">🔑 Admin</option>
                        <option value="InventoryManager">📦 Inventory Manager</option>
                        <option value="StockManager">📊 Stock Manager</option>
                        <option value="PurchaseManager">🚚 Purchase Manager</option>
                        <option value="SalesManager">💰 Sales Manager</option>
                        <option value="WarehouseEmployee">👷 Warehouse Employee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Assigned Warehouse</label>
                      <select
                        value={formData.assigned_warehouse_id}
                        onChange={(e) => setFormData({ ...formData, assigned_warehouse_id: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-900 bg-white"
                      >
                        <option value="">System Wide (All)</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Temporary Admin Option */}
                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-purple-950 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_temporary_admin}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            is_temporary_admin: e.target.checked, 
                            role: e.target.checked ? 'Admin' : formData.role 
                          })}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Grant Temporary Admin Privileges</span>
                      </label>
                      <span className="text-[10px] bg-purple-200 text-purple-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Time-Gated</span>
                    </div>

                    {formData.is_temporary_admin && (
                      <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between text-xs">
                        <span className="text-purple-900 font-bold">Expiration Duration:</span>
                        <select
                          value={formData.temp_admin_duration_hours}
                          onChange={(e) => setFormData({ ...formData, temp_admin_duration_hours: Number(e.target.value) })}
                          className="p-1.5 bg-white border border-purple-300 rounded-xl text-purple-900 font-extrabold text-xs focus:outline-none focus:border-purple-500"
                        >
                          <option value={1}>1 Hour Access</option>
                          <option value={6}>6 Hours Access</option>
                          <option value={24}>24 Hours Access (1 Day)</option>
                          <option value={168}>168 Hours Access (7 Days)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {selectedResetUser && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-blue-600" /> Reset Password
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">User: @{selectedResetUser.username} ({selectedResetUser.full_name || 'No Name'})</p>
                  </div>
                  <button
                    onClick={() => setSelectedResetUser(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedResetUser(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Reset Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
