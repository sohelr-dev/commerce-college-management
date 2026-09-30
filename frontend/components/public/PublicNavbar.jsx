'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, GraduationCap } from 'lucide-react';
import api from '@/lib/api';
import LogoImg from '../assets/img/logo.png'

const LINKS = [
  { to: '/', label: 'হোম', end: true },
  { to: '/about', label: 'পরিচিতি' },
  { to: '/faculty', label: 'শিক্ষকমণ্ডলী' },
  { to: '/gallery', label: 'গ্যালারি' },
  { to: '/admissions', label: 'ভর্তি তথ্য' },
  { to: '/notices', label: 'নোটিশ' },
  { to: '/contact', label: 'যোগাযোগ' },
];

function isActive(pathname, to, end) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(to + '/');
}

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    api.get('/public/settings').then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top bar info */}
      <div className="bg-navy-950 px-4 py-2 text-xs text-cream-100/80 border-b border-navy-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            {settings?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-gold-400" /> {settings.phone}
              </span>
            )}
            {settings?.email && (
              <span className="hidden sm:flex items-center gap-1.5">
                <Mail size={13} className="text-gold-400" /> {settings.email}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {settings?.header_info && <span className="hidden md:inline text-gold-300 font-medium">{settings.header_info}</span>}
            <Link href="/login" className="flex items-center gap-1 text-gold-400 hover:underline font-medium">
              <GraduationCap size={14} /> পোর্টাল লগইন
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="bg-white/95 backdrop-blur border-b border-navy-900/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings?.college_name || 'College Logo'}
                className="h-11 w-11 object-contain rounded-lg"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl  font-display text-lg font-bold text-gold-400 shadow-md  transition">
                <img src={LogoImg} alt="" />
              </div>
            )}
            <div>
              <p className="font-display text-lg sm:text-xl font-bold leading-tight text-navy-950 group-hover:text-gold-600 transition">
                {settings?.college_name || 'Commerce College'}
              </p>
              <p className="text-xs text-ink-500 font-medium">
                {settings?.tagline || (settings?.established_year ? `প্রতিষ্ঠিত ${settings.established_year} সাল` : 'শিক্ষা ও শৃঙ্খলার প্রতীক')}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:gap-2 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  isActive(pathname, l.to, l.end)
                    ? 'bg-navy-900 text-cream-50 shadow-sm'
                    : 'text-slate-700 hover:bg-navy-900/5 hover:text-navy-900'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/admissions"
              className="rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 shadow-sm transition hover:bg-gold-400 hover:shadow"
            >
              ভর্তি আবেদন
            </Link>
          </div>

          <button className="text-navy-900 lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-navy-900/10 bg-white px-4 py-4 lg:hidden shadow-lg">
          <nav className="flex flex-col gap-1.5">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                  isActive(pathname, l.to, l.end) ? 'bg-navy-900 text-cream-50' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/admissions"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-lg bg-gold-500 px-4 py-3 text-center text-sm font-bold text-navy-950"
            >
              ভর্তি আবেদন
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}