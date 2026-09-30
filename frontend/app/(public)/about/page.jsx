'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Target, Eye, Quote, Award, GraduationCap, CheckCircle } from 'lucide-react';

export default function About() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/public/settings').then((r) => setSettings(r.data));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Page Header */}
      <section className="bg-navy-950 text-white py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="inline-block rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-bold text-gold-300 mb-3">
            প্রতিষ্ঠিত {settings?.established_year || '২০১২'} সাল
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-cream-50">
            {settings?.college_name || 'Commerce College'}
          </h1>
          <p className="mt-3 text-lg text-gold-400 font-semibold">{settings?.tagline}</p>
        </div>
      </section>

      {/* College Story */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider bg-slate-200/70 px-3 py-1 rounded-md">
              আমাদের কথা
            </span>
            <h2 className="font-display text-3xl font-extrabold text-navy-950 mt-3 mb-4">
              ইতিহাস ও পথচলা
            </h2>
            <p className="leading-relaxed text-slate-700 text-base whitespace-pre-line">
              {settings?.about_text || 'মানসম্মত শিক্ষা প্রদানের লক্ষ্যে আমাদের পরিচালিত অন্যতম সেরা শিক্ষা প্রতিষ্ঠান।'}
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="p-8 rounded-3xl bg-navy-900 text-white text-center shadow-xl border-4 border-gold-500/30 max-w-sm w-full">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-24 w-24 object-contain mx-auto mb-4" />
              ) : (
                <GraduationCap size={64} className="mx-auto text-gold-400 mb-4" />
              )}
              <h3 className="text-2xl font-bold font-display text-gold-400">{settings?.college_name}</h3>
              <p className="mt-2 text-xs text-slate-300">শিক্ষার্থীর সুপ্ত প্রতিভা বিকাশ ও আদর্শ নাগরিক গঠনের অঙ্গীকার</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-slate-100 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
            <div className="mb-4 inline-flex rounded-xl bg-gold-500 p-3.5 text-navy-950 shadow-md">
              <Target size={26} />
            </div>
            <h3 className="font-display text-2xl font-bold text-navy-950">আমাদের লক্ষ্য (Mission)</h3>
            <p className="mt-3 leading-relaxed text-slate-600 text-sm">{settings?.mission_text}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
            <div className="mb-4 inline-flex rounded-xl bg-gold-500 p-3.5 text-navy-950 shadow-md">
              <Eye size={26} />
            </div>
            <h3 className="font-display text-2xl font-bold text-navy-950">আমাদের দৃষ্টিভঙ্গি (Vision)</h3>
            <p className="mt-3 leading-relaxed text-slate-600 text-sm">{settings?.vision_text}</p>
          </div>
        </div>
      </section>

      {/* Principal Section */}
      {(settings?.principal_name || settings?.principal_message) && (
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl bg-navy-950 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-gold-500 shadow-xl mb-4 bg-navy-900">
                  {settings?.principal_image_url ? (
                    <img src={settings.principal_image_url} alt={settings.principal_name} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap size={48} className="text-gold-400 m-auto" />
                  )}
                </div>
                <h4 className="font-display text-xl font-bold text-gold-400">{settings?.principal_name}</h4>
                <p className="text-xs text-slate-300 mt-1">{settings?.principal_title || 'অধ্যক্ষ'}</p>
              </div>
              <div className="md:col-span-8">
                <Quote className="text-gold-400 mb-3" size={36} />
                <p className="text-lg leading-relaxed text-slate-200 italic font-medium">"{settings?.principal_message}"</p>
                {settings?.principal_bio && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300">
                    <p className="font-bold text-gold-300 mb-1">জীবনবৃত্তান্ত:</p>
                    <p>{settings.principal_bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
