'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MapPin, Phone, Mail, Globe, Facebook, Youtube, Instagram, Linkedin } from 'lucide-react';

export default function PublicFooter() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/public/settings').then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-navy-950 text-cream-100/80 pt-16 pb-8 border-t border-navy-800">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Col 1: About */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 font-display text-lg font-bold text-navy-950">
                CC
              </div>
            )}
            <p className="font-display text-lg font-bold text-cream-50">{settings?.college_name || 'Commerce College'}</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            {settings?.footer_info || settings?.about_text?.substring(0, 160) || settings?.tagline || 'মানসম্মত শিক্ষা ও সৎ চরিত্র গঠনের অঙ্গীকারে পরিচালিত ঐতিহ্যবাহী শিক্ষা প্রতিষ্ঠান।'}
          </p>
          {settings?.facebook_url && (
            <div className="mt-5 flex items-center gap-3">
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream-100 transition hover:bg-gold-500 hover:text-navy-950"
              >
                <Facebook size={18} />
              </a>
            </div>
          )}
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="mb-4 font-display text-base font-bold text-cream-50 border-b border-gold-500/30 pb-2 inline-block">
            দ্রুত নেভিগেশন
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/about" className="transition hover:text-gold-400">কলেজ পরিচিতি</Link></li>
            <li><Link href="/departments" className="transition hover:text-gold-400">বিভাগ ও বিষয়সমূহ</Link></li>
            <li><Link href="/faculty" className="transition hover:text-gold-400">সম্মানিত শিক্ষকমণ্ডলী</Link></li>
            <li><Link href="/gallery" className="transition hover:text-gold-400">ক্যাম্পাস ফটো গ্যালারি</Link></li>
            <li><Link href="/admissions" className="transition hover:text-gold-400">অনলাইন ভর্তি তথ্য</Link></li>
          </ul>
        </div>

        {/* Col 3: Student & General */}
        <div>
          <h4 className="mb-4 font-display text-base font-bold text-cream-50 border-b border-gold-500/30 pb-2 inline-block">
            পাবলিক তথ্য
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/notices" className="transition hover:text-gold-400">জরুরি নোটিশ বোর্ড</Link></li>
            <li><Link href="/contact" className="transition hover:text-gold-400">যোগাযোগ ও হেল্পডেস্ক</Link></li>
            <li><Link href="/login" className="transition hover:text-gold-400">শিক্ষার্থী পোর্টাল লগইন</Link></li>
            <li><Link href="/login" className="transition hover:text-gold-400">শিক্ষক ও স্টাফ পোর্টাল</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div>
          <h4 className="mb-4 font-display text-base font-bold text-cream-50 border-b border-gold-500/30 pb-2 inline-block">
            যোগাযোগের ঠিকানা
          </h4>
          <ul className="space-y-3 text-sm">
            {settings?.address && (
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold-400" />
                <span className="text-slate-300">{settings.address}</span>
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="shrink-0 text-gold-400" />
                <span className="text-slate-300">{settings.phone}</span>
              </li>
            )}
            {settings?.email && (
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="shrink-0 text-gold-400" />
                <span className="text-slate-300">{settings.email}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {settings?.college_name || 'Commerce College'}. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
