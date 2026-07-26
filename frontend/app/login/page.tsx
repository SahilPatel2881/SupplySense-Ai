'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  BrainCircuit,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
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
  ChevronLeft
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
    id: 'admin',
    roleName: 'Admin',
    title: 'Admin',
    subtitle: 'Executive Access',
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
    title: 'Warehouse Mgr',
    subtitle: 'CDC Operations',
    username: 'Krish',
    icon: Building2,
    textClass: 'text-blue-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-blue-500/80 border-blue-500/80',
    activeBg: 'bg-blue-500/15',
  },
  {
    id: 'inv_manager',
    roleName: 'Inventory Manager',
    title: 'Inventory Mgr',
    subtitle: 'Audits & Accuracy',
    username: 'Dhyan',
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
    username: 'Shreya',
    icon: Package,
    textClass: 'text-purple-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-purple-500/80 border-purple-500/80',
    activeBg: 'bg-purple-500/15',
  },
  {
    id: 'purchase_manager',
    roleName: 'Purchase Manager',
    title: 'Purchase Mgr',
    subtitle: 'Suppliers & POs',
    username: 'Aarav',
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
    username: 'Priya',
    icon: Receipt,
    textClass: 'text-teal-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-teal-500/80 border-teal-500/80',
    activeBg: 'bg-teal-500/15',
  }
];

const employeeRoles: RolePreset[] = [
  {
    id: 'emp1',
    roleName: 'Warehouse Employee 1',
    title: 'Employee 1',
    subtitle: 'Floor Ops',
    username: 'employee1',
    icon: UserCheck,
    textClass: 'text-indigo-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500/80',
    activeBg: 'bg-indigo-500/15',
  },
  {
    id: 'emp2',
    roleName: 'Warehouse Employee 2',
    title: 'Employee 2',
    subtitle: 'Floor Ops',
    username: 'employee2',
    icon: UserCheck,
    textClass: 'text-indigo-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500/80',
    activeBg: 'bg-indigo-500/15',
  },
  {
    id: 'emp3',
    roleName: 'Warehouse Employee 3',
    title: 'Employee 3',
    subtitle: 'Floor Ops',
    username: 'employee3',
    icon: UserCheck,
    textClass: 'text-indigo-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500/80',
    activeBg: 'bg-indigo-500/15',
  },
  {
    id: 'emp4',
    roleName: 'Warehouse Employee 4',
    title: 'Employee 4',
    subtitle: 'Floor Ops',
    username: 'employee4',
    icon: UserCheck,
    textClass: 'text-indigo-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500/80',
    activeBg: 'bg-indigo-500/15',
  },
  {
    id: 'emp5',
    roleName: 'Warehouse Employee 5',
    title: 'Employee 5',
    subtitle: 'Floor Ops',
    username: 'employee5',
    icon: UserCheck,
    textClass: 'text-indigo-400',
    borderClass: 'border-slate-700/80',
    activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500/80',
    activeBg: 'bg-indigo-500/15',
  }
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // 2FA Step State
  const [step, setStep] = useState<'LOGIN' | 'VERIFYING' | 'OTP' | 'LOCKED'>('LOGIN');
  const [verificationBanner, setVerificationBanner] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('s********@gmail.com');
  const [activeDemoOTP, setActiveDemoOTP] = useState<string | null>(null);
  
  // 6-digit OTP Inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & Locks
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(600); // 10 minutes = 600s

  const { login, verifyOTP, resendOTP, loading, error: authError } = useAuth();
  const router = useRouter();

  // Resend Timer Countdown
  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Account Lock Timer Countdown
  useEffect(() => {
    let interval: any;
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

  const handleSelectRolePreset = (preset: RolePreset) => {
    setSelectedRoleId(preset.id);
    setUsername(preset.username);
    setPassword(''); // Privacy protection: password remains blank
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const allPresets = [...mainRoles, ...employeeRoles];
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
            <BrainCircuit className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SupplySense AI</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Supply Chain & 7-Role Hierarchy Management</p>
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
                    <span>Sending 6-digit OTP code to your registered email...</span>
                  </p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username / Email</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-medium transition-all"
                      placeholder="Enter username"
                    />
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
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-medium transition-all"
                      placeholder="Enter password"
                    />
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
                
                {/* Main Manager & Admin Roles */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {mainRoles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRoleId === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRolePreset(role)}
                        className={`p-2.5 rounded-xl font-semibold border flex flex-col text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${role.activeBg} ${role.activeRing} ${role.textClass}`
                            : `bg-slate-800/80 hover:bg-slate-800 ${role.borderClass} ${role.textClass}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 shrink-0 ${role.textClass}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold leading-none">{role.title}</p>
                            <span className="text-[9px] text-slate-400 font-normal">{role.subtitle}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <p className="text-[9px] text-amber-400 font-medium mt-1.5 pt-1 border-t border-amber-500/20 leading-tight">
                            Username Loaded ({role.username}) - Enter Password & Click Sign In
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Warehouse Employees Sub-Section */}
                <div className="mt-3 pt-2">
                  <p className="text-[10px] uppercase tracking-wider text-indigo-400/90 font-bold mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Warehouse Employees (Daily Floor Ops)</span>
                  </p>
                  
                  <div className="grid grid-cols-5 gap-1.5">
                    {employeeRoles.map((emp) => {
                      const isSelected = selectedRoleId === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleSelectRolePreset(emp)}
                          className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/80 text-indigo-300'
                              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-indigo-400'
                          }`}
                        >
                          <p className="font-bold text-[10px] leading-tight">Emp {emp.id.replace('emp', '')}</p>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPreset && selectedPreset.id.startsWith('emp') && (
                    <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-[10px] font-semibold text-indigo-300 text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Username Loaded ({selectedPreset.username}) - Enter Password & Click Sign In</span>
                    </div>
                  )}
                </div>

                {selectedPreset && !selectedPreset.id.startsWith('emp') && (
                  <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] font-semibold text-amber-300 text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Username Loaded ({selectedPreset.username}) - Enter Password & Click Sign In</span>
                  </div>
                )}
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
                  We have sent a 6-digit OTP to
                </p>
                <p className="text-xs font-mono font-bold text-blue-400 tracking-wider">
                  {maskedEmail}
                </p>

                <p className="text-[11px] text-emerald-400 font-semibold mt-2 flex items-center justify-center gap-1">
                  <span>📧 Real Email OTP sent to {maskedEmail}. Check your inbox for 2-Step Verification.</span>
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
