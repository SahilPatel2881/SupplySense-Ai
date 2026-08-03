'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../lib/api';
import {
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Building,
  Building2,
  Boxes,
  Truck,
  Receipt,
  UserCheck,
  Package,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Clock,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';

interface RolePreset {
  id: string;
  roleName: string;
  title: string;
  subtitle: string;
  username: string;
  icon: React.ElementType;
  textClass: string;
  borderClass: string;
  activeRing: string;
  activeBg: string;
}

const mainRoles: RolePreset[] = [
  {
    id: 'founder',
    roleName: 'Founder',
    title: '👑 Admin',
    subtitle: 'Global Unrestricted Access',
    username: 'Sahil Patel',
    icon: ShieldCheck,
    textClass: 'text-amber-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-amber-500/80 border-amber-500/80',
    activeBg: 'bg-amber-500/15',
  },
  {
    id: 'wh_manager',
    roleName: 'Warehouse Manager',
    title: '🏭 Warehouse Manager',
    subtitle: 'Facility Operations',
    username: 'war_mgr1',
    icon: Building2,
    textClass: 'text-blue-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-blue-500/80 border-blue-500/80',
    activeBg: 'bg-blue-500/15',
  },
  {
    id: 'inv_manager',
    roleName: 'Inventory Manager',
    title: 'Inventory Manager',
    subtitle: 'Audits & Stock Levels',
    username: 'inv_mgr1',
    icon: Boxes,
    textClass: 'text-emerald-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-emerald-500/80 border-emerald-500/80',
    activeBg: 'bg-emerald-500/15',
  },
  {
    id: 'stock_manager',
    roleName: 'Stock Manager',
    title: 'Stock Manager',
    subtitle: 'In/Out & Transfers',
    username: 'stk_mgr1',
    icon: Package,
    textClass: 'text-purple-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-purple-500/80 border-purple-500/80',
    activeBg: 'bg-purple-500/15',
  },
  {
    id: 'purchase_manager',
    roleName: 'Purchase Manager',
    title: 'Purchase Manager',
    subtitle: 'Suppliers & POs',
    username: 'pur_mgr1',
    icon: Truck,
    textClass: 'text-cyan-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-cyan-500/80 border-cyan-500/80',
    activeBg: 'bg-cyan-500/15',
  },
  {
    id: 'sales_manager',
    roleName: 'Sales Manager',
    title: 'Sales Manager',
    subtitle: 'Sales & Billing',
    username: 'sal_mgr1',
    icon: Receipt,
    textClass: 'text-teal-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-teal-500/80 border-teal-500/80',
    activeBg: 'bg-teal-500/15',
  },
  {
    id: 'wh_employee',
    roleName: 'Warehouse Employee',
    title: 'Warehouse Employee',
    subtitle: 'Floor Operations & Staff',
    username: 'emp1_wh1',
    icon: UserCheck,
    textClass: 'text-indigo-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500/80',
    activeBg: 'bg-indigo-500/15',
  }
];

export default function LoginPage() {
  const [username, setUsername] = useState('Sahil Patel');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>('founder');

  const [publicUsers, setPublicUsers] = useState<{ id: string; username: string; full_name: string; role: string }[]>([]);
  const [mainRolesList, setMainRolesList] = useState<RolePreset[]>(mainRoles);

  useEffect(() => {
    const fetchPublicUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/public-users/`);
        if (res.ok) {
          const users = await res.json();
          if (Array.isArray(users) && users.length > 0) {
            setPublicUsers(users);
            const adminUser = users.find((u: any) => (u.role || '').toLowerCase().includes('admin'));
            if (adminUser) {
              setUsername(adminUser.username);
              setPassword('');
              setSelectedRoleId('founder');
            } else if (users[0]) {
              setUsername(users[0].username);
              setPassword('');
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch public users:', err);
      }
    };

    fetchPublicUsers();
  }, []);

  // 2FA Step State
  const [step, setStep] = useState<'LOGIN' | 'VERIFYING' | 'OTP' | 'LOCKED'>('LOGIN');
  const [verificationBanner, setVerificationBanner] = useState(false);
  const [activeDemoOTP, setActiveDemoOTP] = useState<string | null>(null);

  // 6-digit OTP Inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { login, verifyOTP, resendOTP } = useAuth();

  // Resend Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && resendTimer > 0 && !canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer, canResend]);

  // Account Lock Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'LOCKED' && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (lockTimeRemaining === 0) {
      setStep('LOGIN');
      setOtpError(null);
      setFailedAttempts(0);
    }
    return () => clearInterval(interval);
  }, [step, lockTimeRemaining]);

  const handleUsernameChange = (newVal: string) => {
    setUsername(newVal);
  };

  const handleSelectRolePreset = (preset: RolePreset) => {
    setSelectedRoleId(preset.id);
    setUsername(preset.username);
    setPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(username, password);
    if (result.success) {
      router.push('/dashboard');
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance focus to next input box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    setOtpError(null);
    const result = await verifyOTP(username, fullOtp);

    if (result.success) {
      router.push('/dashboard');
    } else {
      if (result.locked || (result.attemptsRemaining !== undefined && result.attemptsRemaining <= 0)) {
        setStep('LOCKED');
        setLockTimeRemaining(600);
      } else {
        const remaining = result.attemptsRemaining !== undefined ? result.attemptsRemaining : 3 - (failedAttempts + 1);
        setFailedAttempts((prev) => prev + 1);
        setOtpError(result.error || `Invalid OTP. ${remaining} attempt(s) remaining.`);
      }
    }
  };

  const handleResendOTPClick = async () => {
    if (!canResend) return;
    setOtpError(null);
    const res = await resendOTP(username);
    if (res.success) {
      if (res.demoOTP) setActiveDemoOTP(res.demoOTP);
      setResendTimer(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } else {
      setOtpError(res.error || 'Failed to resend OTP.');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const allPresets = mainRolesList;
  const selectedPreset = allPresets.find(p => p.id === selectedRoleId);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-6">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/30 mb-3">
            <Boxes className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SupplySense ERP</h1>
          <p className="text-xs text-slate-400 mt-1">Ai Warehouse & Supply Chain Intelligent</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">

          {/* STEP 1: LOGIN CREDENTIALS FORM */}
          {(step === 'LOGIN' || verificationBanner) && (
            <div>
              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {authError}
                </div>
              )}

              {/* Verification & Sending OTP Banner */}
              {verificationBanner && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-2 text-sm text-emerald-300 font-extrabold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>✓ Credentials Verified</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80 flex items-center gap-1.5 font-normal">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating 6-digit 2FA verification code...</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                    <input
                      type="text"
                      required
                      list="username-options"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      style={{ color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.8)', WebkitTextFillColor: '#ffffff', opacity: 1 }}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-semibold transition-all"
                      placeholder="Enter username"
                    />
                    <datalist id="username-options">
                      {publicUsers.map((u) => (
                        <option key={u.id} value={u.username}>
                          {u.full_name ? `${u.full_name} (${u.role})` : u.role}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                    <span className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-400" /> Enter password manually for privacy
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ color: '#ffffff', backgroundColor: 'rgba(30, 41, 59, 0.8)', WebkitTextFillColor: '#ffffff', opacity: 1 }}
                      className="w-full pl-10 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-semibold transition-all"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationBanner}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Console'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Role Selectors */}
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold text-center mb-1">
                  Select Role Preset to Prefill Username
                </p>

                {/* Role Preset Cards */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {mainRolesList.map((role, idx) => {
                    const Icon = role.icon;
                    const isSelected = selectedRoleId === role.id;
                    const isFullWidth = idx === mainRolesList.length - 1 && mainRolesList.length % 2 !== 0;

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRolePreset(role)}
                        className={`p-2.5 rounded-xl font-semibold border flex flex-col text-left transition-all cursor-pointer ${isFullWidth ? 'col-span-2' : ''
                          } ${isSelected
                            ? `${role.activeBg} ${role.activeRing} ${role.textClass}`
                            : `bg-slate-800/80 hover:bg-slate-800 ${role.borderClass} ${role.textClass}`
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 shrink-0 ${role.textClass}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold leading-none truncate">{role.title}</p>
                            <span className="text-[9px] text-slate-400 font-normal truncate block">{role.subtitle}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <p className="text-[9px] text-amber-400 font-medium mt-1.5 pt-1 border-t border-amber-500/20 leading-tight">
                            Role Selected ({role.title}) — Enter Password & Click Sign In
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION PAGE */}
          {step === 'OTP' && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setStep('LOGIN')}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Login
              </button>

              <div className="text-center space-y-1">
                <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl mb-2">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Verify Your Identity</h2>
                <p className="text-xs text-slate-400">
                  Enter your 6-digit 2FA authentication code below to complete sign in.
                </p>

                {activeDemoOTP && selectedPreset?.id.startsWith('emp') && (
                  <div className="mt-2.5 inline-block px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-xs font-semibold rounded-xl space-x-1.5 shadow-md">
                    <span>Employee Demo OTP Code:</span>
                    <span className="font-mono font-black tracking-widest text-indigo-400 text-sm">{activeDemoOTP}</span>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                {/* 6-Digit OTP Boxes */}
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-800/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Resend OTP Section */}
              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTPClick}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <p className="text-xs text-slate-400 font-medium">
                    Resend OTP in <span className="font-mono font-bold text-slate-200">{resendTimer} sec</span>
                  </p>
                )}
              </div>

              {/* Security Features Box */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Security Features</span>
                </p>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✅</span>
                    <span>OTP expires after <strong>5 minutes</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✅</span>
                    <span>Maximum <strong>3 attempts</strong></span>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 font-medium mt-2">
                  <p className="font-bold text-rose-400 mb-0.5">After 3 wrong OTPs:</p>
                  <p className="text-slate-300">Account temporarily locked. Try again after 10 minutes.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACCOUNT TEMPORARILY LOCKED */}
          {step === 'LOCKED' && (
            <div className="text-center space-y-4 py-3">
              <div className="inline-flex p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-2xl mb-1">
                <ShieldAlert className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Account Temporarily Locked</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You have exceeded the maximum of 3 failed OTP verification attempts. For your security, this account has been locked.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 max-w-xs mx-auto space-y-2">
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Lockout Countdown
                </p>
                <p className="text-3xl font-mono font-black text-amber-400 tracking-widest">
                  {formatSeconds(lockTimeRemaining)}
                </p>
                <p className="text-[10px] text-slate-400">Try again after 10 minutes</p>
              </div>

              <button
                type="button"
                onClick={() => setStep('LOGIN')}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Return to Login Page
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
