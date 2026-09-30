'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui';
import { ShieldCheck, BookOpen, GraduationCap, AlertCircle, Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/public/settings').then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড সঠিক কিনা নিশ্চিত করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 font-sans">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[600px] w-[600px] rounded-full bg-slate-800/40 blur-[150px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition">
            <ArrowLeft size={14} /> মূল ওয়েবসাইটে ফিরা
          </Link>
          <span className="text-xs font-bold text-slate-400">অফিসিয়াল পোর্টাল</span>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Logo & Title */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 font-display text-2xl font-extrabold text-slate-950 shadow-lg">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-full w-full object-contain p-1 rounded-2xl" />
              ) : (
                'CC'
              )}
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white">
              {settings?.college_name || 'Commerce College'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">পোর্টালে প্রবেশ করতে আপনার অ্যাকাউন্টে সাইন ইন করুন</p>
          </div>

         

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">ইমেইল এড্রেস</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল নাম লিখুন"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-11 pr-4 py-3 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 pl-11 pr-11 py-3 text-sm font-medium text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-400 font-semibold">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 text-sm shadow-xl transition"
            >
              {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} {settings?.college_name || 'Commerce College'}. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    </div>
  );
}