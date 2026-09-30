'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Building2, Users, CalendarCheck, ClipboardList,
  Wallet, Megaphone, LogOut, BookOpen, GraduationCap, Library, Bus, Banknote, Globe, CalendarDays, Table, Camera, Calendar,
} from 'lucide-react';

const NAV = {
  admin: [
    { to: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
    { to: '/admin/website', label: 'ওয়েবসাইট সিএমএস', icon: Globe },
    { to: '/admin/gallery', label: 'ফটো গ্যালারি', icon: Camera },
    { to: '/admin/events', label: 'ইভেন্টস', icon: Calendar },
    { to: '/admin/users', label: 'শিক্ষক ও শিক্ষার্থী', icon: Users },
    { to: '/admin/academic', label: 'বিভাগ ও বিষয়', icon: Building2 },
    { to: '/admin/attendance', label: 'উপস্থিতি রিপোর্ট', icon: CalendarCheck },
    { to: '/admin/exams', label: 'পরীক্ষা', icon: ClipboardList },
    { to: '/admin/routine', label: 'পরীক্ষার রুটিন', icon: CalendarDays },
    { to: '/admin/tabulation', label: 'ট্যাবুলেশন শিট', icon: Table },
    { to: '/admin/fees', label: 'ফি ব্যবস্থাপনা', icon: Wallet },
    { to: '/admin/library', label: 'লাইব্রেরি', icon: Library },
    { to: '/admin/transport', label: 'পরিবহন', icon: Bus },
    { to: '/admin/payroll', label: 'বেতন (Payroll)', icon: Banknote },
    { to: '/admin/notices', label: 'নোটিশ', icon: Megaphone },
  ],
  teacher: [
    { to: '/teacher', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
    { to: '/teacher/attendance', label: 'হাজিরা নিন', icon: CalendarCheck },
    { to: '/teacher/results', label: 'ফলাফল এন্ট্রি', icon: ClipboardList },
    { to: '/teacher/library', label: 'আমার লাইব্রেরি', icon: Library },
    { to: '/teacher/payroll', label: 'আমার বেতন', icon: Banknote },
    { to: '/teacher/notices', label: 'নোটিশ', icon: Megaphone },
  ],
  student: [
    { to: '/student', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
    { to: '/student/attendance', label: 'আমার উপস্থিতি', icon: CalendarCheck },
    { to: '/student/results', label: 'আমার ফলাফল', icon: GraduationCap },
    { to: '/student/routine', label: 'পরীক্ষার রুটিন', icon: CalendarDays },
    { to: '/student/fees', label: 'আমার ফি', icon: Wallet },
    { to: '/student/library', label: 'আমার লাইব্রেরি', icon: Library },
    { to: '/student/transport', label: 'আমার পরিবহন', icon: Bus },
    { to: '/student/notices', label: 'নোটিশ', icon: Megaphone },
  ],
};

const ROLE_LABEL = { admin: 'প্রশাসক', teacher: 'শিক্ষক', student: 'শিক্ষার্থী' };

function isActivePath(pathname, to, end) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(to + '/');
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const items = NAV[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy-950 text-slate-200 md:flex z-30 shadow-xl border-r border-navy-900">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 font-display text-sm font-bold text-navy-950 shadow">
            CC
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight text-white">Commerce College</p>
            <p className="text-[11px] text-gold-400 font-semibold">{ROLE_LABEL[user?.role]} সিএমএস প্যানেল</p>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
          {items.map(({ to, label, icon: Icon, end }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <Link
                key={to}
                href={to}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-gold-500 font-bold text-navy-950 shadow' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-navy-900 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition"
          >
            <LogOut size={18} />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:ml-64">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8 shadow-sm">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-950 font-display text-xs font-bold text-gold-400">CC</div>
            <span className="font-display text-sm font-bold text-navy-950">Commerce College</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-navy-950">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-950 text-gold-400 font-display text-sm font-bold shadow">
              {user?.name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden shadow-lg">
          {items.slice(0, 5).map(({ to, icon: Icon, end }) => {
            const active = isActivePath(pathname, to, end);
            return (
              <Link key={to} href={to} className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${active ? 'text-gold-600 font-bold' : 'text-slate-500'}`}>
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
