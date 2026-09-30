'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  ArrowRight,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Pin,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Download,
  Eye,
  Sparkles,
  Quote,
  Building
} from 'lucide-react';

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [sectionsMap, setSectionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Parallel fast fetch to eliminate delay
    Promise.all([
      api.get('/public/settings'),
      api.get('/public/stats'),
      api.get('/public/banners'),
      api.get('/public/departments'),
      api.get('/public/notices', { params: { per_page: 5 } }),
      api.get('/public/faculty'),
      api.get('/public/events'),
      api.get('/public/gallery'),
      api.get('/public/sections')
    ]).then(([sRes, stRes, bRes, dRes, nRes, fRes, eRes, gRes, secRes]) => {
      setSettings(sRes.data);
      setStats(stRes.data);
      setBanners(bRes.data?.data || []);
      setDepartments((dRes.data || []).slice(0, 4));
      setNotices(nRes.data?.data || []);
      setTeachers((fRes.data || []).slice(0, 4));
      setEvents((eRes.data?.data || []).slice(0, 3));
      setGallery((gRes.data?.data || []).slice(0, 6));

      const map = {};
      (secRes.data?.data || []).forEach((sec) => {
        map[sec.section_key] = sec;
      });
      setSectionsMap(map);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Banner autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners]);

  const isSecEnabled = (key) => {
    if (!sectionsMap[key]) return true;
    return sectionsMap[key].is_enabled;
  };

  const getSecTitle = (key, defaultTitle) => {
    return sectionsMap[key]?.title || defaultTitle;
  };

  const getSecSubtitle = (key, defaultSubtitle) => {
    return sectionsMap[key]?.subtitle || defaultSubtitle;
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* 1. HERO SLIDER BANNER */}
      {isSecEnabled('banners') && (
        <section className="relative bg-navy-950 overflow-hidden min-h-[500px] sm:min-h-[600px] flex items-center">
          {banners.length > 0 ? (
            <div className="relative w-full h-full min-h-[500px] sm:min-h-[600px] flex items-center">
              {banners.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* High Quality Clear Image Background */}
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'College Banner'}
                    className="absolute inset-0 w-full h-full object-cover object-center transform scale-[1.01] transition-transform duration-700"
                  />
                  {/* Modern Glassmorphic Crisp Overlay - Left readable gradient without dulling image */}
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/60 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent z-10" />

                  {/* Content Container */}
                  <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 py-16 h-full flex flex-col justify-center">
                    <div className="max-w-2xl text-left">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 border border-gold-400/50 px-4 py-1.5 text-xs font-bold text-gold-300 backdrop-blur-md mb-4 shadow">
                        <Sparkles size={14} /> {settings?.college_name || 'Commerce College'}
                      </span>
                      {slide.title && (
                        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
                          {slide.title}
                        </h1>
                      )}
                      {slide.description && (
                        <p className="mt-4 text-base sm:text-lg text-slate-100 leading-relaxed font-medium max-w-xl drop-shadow">
                          {slide.description}
                        </p>
                      )}
                      <div className="mt-8 flex flex-wrap gap-4">
                        {slide.button_text && (
                          <Link
                            href={slide.button_link || '/admissions'}
                            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-7 py-3.5 text-sm font-bold text-navy-950 shadow-xl transition hover:bg-gold-400 hover:scale-[1.02]"
                          >
                            {slide.button_text} <ArrowRight size={18} />
                          </Link>
                        )}
                        <Link
                          href="/about"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-black/30 backdrop-blur-md px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
                        >
                          আমাদের সম্পর্কে জানুন
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Slider Arrows & Dots */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                    className="absolute left-4 z-30 p-3 rounded-full bg-navy-950/60 text-white hover:bg-gold-500 hover:text-navy-950 transition backdrop-blur-md shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                    className="absolute right-4 z-30 p-3 rounded-full bg-navy-950/60 text-white hover:bg-gold-500 hover:text-navy-950 transition backdrop-blur-md shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-3 rounded-full transition-all ${
                          i === currentSlide ? 'w-9 bg-gold-400' : 'w-3 bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Default Hero fallback when no banners uploaded */
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 border border-gold-400/30 px-4 py-1.5 text-xs font-bold text-gold-300 mb-5">
                  প্রতিষ্ঠিত {settings?.established_year || '২০১২'} সাল
                </span>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-cream-50 leading-tight">
                  {settings?.college_name || 'Commerce College'}
                </h1>
                <p className="mt-3 text-xl text-gold-400 font-semibold">{settings?.tagline}</p>
                <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
                  {settings?.hero_text || 'শিক্ষা ও সততার মেলবন্ধনে নির্মিত একটি আধুনিক ও সমৃদ্ধ শিক্ষাঙ্গন।'}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/admissions"
                    className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-7 py-3.5 text-sm font-bold text-navy-950 shadow-lg hover:bg-gold-400 transition"
                  >
                    ভর্তি তথ্য জানুন <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-cream-50 hover:bg-white/20 transition"
                  >
                    কলেজ পরিচিতি
                  </Link>
                </div>
              </div>
              <div className="relative flex justify-center">
                <div className="relative w-full max-w-md h-80 rounded-2xl bg-gradient-to-tr from-gold-500 to-navy-800 p-1 shadow-2xl overflow-hidden">
                  <div className="h-full w-full bg-navy-900 rounded-xl p-8 flex flex-col justify-center text-center items-center">
                    <GraduationCap size={64} className="text-gold-400 mb-4 animate-bounce" />
                    <h3 className="text-2xl font-bold text-white font-display">উন্নতমানের ডিজিটাল শিক্ষা ব্যবস্থা</h3>
                    <p className="mt-2 text-sm text-slate-300">অনলাইন পোর্টাল, ডিজিটাল ল্যাব ও সমৃদ্ধ লাইব্রেরি</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 2. NOTICE TICKER */}
      {notices.length > 0 && (
        <div className="bg-navy-900 text-white py-2.5 px-4 border-b border-navy-800 shadow-sm">
          <div className="mx-auto max-w-7xl flex items-center gap-3">
            <span className="shrink-0 flex items-center gap-1.5 rounded-md bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950 uppercase tracking-wide">
              <Pin size={14} /> বিশেষ নোটিশ
            </span>
            <div className="overflow-hidden whitespace-nowrap text-sm font-medium text-slate-200">
              <span className="inline-block text-gold-300 font-semibold mr-2">
                [{new Date(notices[0].created_at).toLocaleDateString('bn-BD')}]:
              </span>
              <span>{notices[0].title}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATS SECTION */}
      {isSecEnabled('stats') && (
        <section className="bg-white py-12 border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-md transition">
                <Users size={32} className="text-navy-900 mb-2" />
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {stats ? `${stats.total_students}+` : '—'}
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-600">বর্তমান শিক্ষার্থী</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-md transition">
                <GraduationCap size={32} className="text-navy-900 mb-2" />
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {stats ? `${stats.total_teachers}+` : '—'}
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-600">অভিজ্ঞ শিক্ষক</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-md transition">
                <Building size={32} className="text-navy-900 mb-2" />
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {stats?.total_departments ?? '—'}
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-600">একাডেমিক বিভাগ</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:shadow-md transition">
                <Award size={32} className="text-navy-900 mb-2" />
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {stats?.established_year ? new Date().getFullYear() - stats.established_year : '১২+'}
                </span>
                <span className="mt-1 text-sm font-semibold text-slate-600">বছরের গৌরবময় ইতিহাস</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. PRINCIPAL MESSAGE SECTION */}
      {isSecEnabled('principal') && (settings?.principal_name || settings?.principal_message) && (
        <section className="py-20 bg-slate-100/70 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-xl border-4 border-gold-500/30 mb-5">
                  {settings?.principal_image_url ? (
                    <img
                      src={settings.principal_image_url}
                      alt={settings.principal_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-navy-900 flex flex-col items-center justify-center text-gold-400">
                      <GraduationCap size={64} />
                    </div>
                  )}
                </div>
                <h3 className="font-display text-2xl font-bold text-navy-950">{settings?.principal_name || 'অধ্যক্ষ'}</h3>
                <p className="text-sm font-semibold text-gold-600 mt-1">{settings?.principal_title || 'অধ্যক্ষ, কমার্স কলেজ'}</p>
              </div>
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3.5 py-1 text-xs font-bold text-gold-700 mb-4">
                  <Quote size={14} /> {getSecTitle('principal', 'অধ্যক্ষের বাণী')}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-navy-950 mb-4">
                  {getSecSubtitle('principal', 'আমাদের শিক্ষার লক্ষ্য ও ভবিষ্যৎ দৃষ্টিভঙ্গি')}
                </h2>
                <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
                  {settings?.principal_message || settings?.about_text}
                </p>
                {settings?.principal_bio && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-sm text-slate-700">
                    <span className="font-bold text-navy-900 block mb-1">জীবনবৃত্তান্ত ও অভিজ্ঞতা:</span>
                    <p>{settings.principal_bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. WHY US SECTION */}
      {isSecEnabled('why_us') && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-block rounded-full bg-navy-900/10 px-4 py-1 text-xs font-bold text-navy-900 mb-3">
                আমাদের বৈশিষ্ট্য
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                {getSecTitle('why_us', 'কেন আমাদের কলেজ বেছে নেবেন?')}
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                {getSecSubtitle('why_us', settings?.mission_text || 'আমরা নিশ্চিত করি আধুনিক ও নৈতিক শিক্ষার চমৎকার পরিবেশ।')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-8 transition hover:-translate-y-1 hover:shadow-xl hover:border-gold-400">
                <div className="mb-5 inline-flex rounded-xl bg-navy-900 p-4 text-gold-400 shadow-md">
                  <GraduationCap size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-950">দক্ষ ও অভিজ্ঞ শিক্ষকমণ্ডলী</h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  দেশের খ্যাতনামা বিশ্ববিদ্যালয় থেকে ডিগ্রীপ্রাপ্ত অভিজ্ঞ শিক্ষকদের দ্বারা পাঠদান সম্পন্ন করা হয়।
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-8 transition hover:-translate-y-1 hover:shadow-xl hover:border-gold-400">
                <div className="mb-5 inline-flex rounded-xl bg-navy-900 p-4 text-gold-400 shadow-md">
                  <BookOpen size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-950">আধুনিক ও বাস্তবমুখী সিলেবাস</h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  BBA, Accounting ও Management সহ বিজ্ঞান ও মানবিক শাখার যুগোপযোগী কারিকুলাম ও নোট প্রদান।
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-8 transition hover:-translate-y-1 hover:shadow-xl hover:border-gold-400">
                <div className="mb-5 inline-flex rounded-xl bg-navy-900 p-4 text-gold-400 shadow-md">
                  <Award size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-950">১০০% ডিজিটাল অটোমেশন</h3>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  ডিজিটাল পোর্টালের মাধ্যমে শিক্ষার্থী হাজিরা, রেজাল্ট, রুটিন ও ফি আদায় সম্পূর্ণ স্বচ্ছভাবে পরিচালিত।
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. DEPARTMENTS SECTION */}
      {isSecEnabled('departments') && (
        <section className="py-20 bg-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="inline-block rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-bold text-gold-700 mb-3">
                  শিক্ষা কার্যক্রম
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {getSecTitle('departments', 'আমাদের একাডেমিক বিভাগসমূহ')}
                </h2>
                <p className="mt-2 text-slate-600 text-base">
                  {getSecSubtitle('departments', 'মানসম্মত পাঠদানের লক্ষ্যে আমাদের পরিচালিত বিভাগসমূহ')}
                </p>
              </div>
              <Link
                href="/departments"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-bold text-navy-900 hover:text-gold-600"
              >
                সব বিভাগ দেখুন <ChevronRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl bg-white p-6 shadow-md border border-slate-200/70 hover:shadow-xl transition flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block rounded-lg bg-navy-900 px-3 py-1 text-xs font-bold text-gold-400 mb-3">
                      {d.code}
                    </span>
                    <h3 className="font-display text-xl font-bold text-navy-950">{d.name}</h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {d.description || 'বিভাগের কারিকুলাম ও ক্লাসের তথ্য বিস্তারিত দেখুন।'}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{d.semesters_count || 4} টি বর্ষ</span>
                    <span>{d.subjects_count || 12} টি বিষয়</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. TEACHERS SECTION */}
      {isSecEnabled('teachers') && teachers.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-block rounded-full bg-navy-900/10 px-4 py-1 text-xs font-bold text-navy-900 mb-3">
                শিক্ষকমণ্ডলী
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                {getSecTitle('teachers', 'আমাদের সম্মানিত শিক্ষকবৃন্দ')}
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                {getSecSubtitle('teachers', 'দক্ষ ও নিবেদিতপ্রাণ শিক্ষকদের নির্দেশনায় তৈরি হয় উজ্জ্বল ভবিষ্যৎ')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teachers.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-sm hover:shadow-xl transition group text-center"
                >
                  <div className="h-56 w-full bg-navy-900 overflow-hidden relative">
                    {t.avatar_url ? (
                      <img
                        src={t.avatar_url}
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Users size={56} />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-navy-950">{t.name}</h3>
                    <p className="text-xs font-semibold text-gold-600 mt-1">{t.designation || 'প্রভাষক'}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.department || 'শিক্ষক'}</p>
                    {t.specialty && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-200/60 py-1 px-2.5 rounded-md inline-block">
                        {t.specialty}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/faculty"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white hover:bg-navy-800 transition shadow"
              >
                সকল শিক্ষক দেখুন <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 8. NOTICES SECTION */}
      {isSecEnabled('notices') && (
        <section className="py-20 bg-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="inline-block rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-bold text-gold-700 mb-3">
                  জরুরি ঘোষণা
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {getSecTitle('notices', 'সাম্প্রতিক নোটিশ ও নোটিফিকেশন')}
                </h2>
                <p className="mt-2 text-slate-600 text-base">
                  {getSecSubtitle('notices', 'কলেজ সংক্রান্ত সকল অফিসিয়াল আপডেট')}
                </p>
              </div>
              <Link
                href="/notices"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-bold text-navy-900 hover:text-gold-600"
              >
                সকল নোটিশ দেখুন <ChevronRight size={18} />
              </Link>
            </div>

            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl text-slate-500">কোনো সাম্প্রতিক নোটিশ নেই।</div>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-navy-900 text-white shrink-0">
                        <span className="text-xs font-medium uppercase">
                          {new Date(n.created_at).toLocaleString('bn-BD', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold">
                          {new Date(n.created_at).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {n.is_pinned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-700">
                              <Pin size={12} /> পিন করা নোটিশ
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(n.created_at).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-navy-950 mt-1">{n.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{n.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {n.attachment_url && (
                        <a
                          href={n.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-navy-900 hover:bg-slate-100 transition"
                        >
                          <Download size={14} /> ফাইল ডাউনলোড
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedNotice(n)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-navy-800 transition"
                      >
                        <Eye size={14} /> বিস্তারিত দেখুন
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* 9. EVENTS SECTION */}
      {isSecEnabled('events') && events.length > 0 && (
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-block rounded-full bg-gold-500/20 px-4 py-1 text-xs font-bold text-gold-700 mb-3">
                ক্যাম্পাস ইভেন্ট
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                {getSecTitle('events', 'আসন্ন ইভেন্ট ও অনুষ্ঠানসমূহ')}
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                {getSecSubtitle('events', 'কলেজে আয়োজিত বিভিন্ন সাংস্কৃতিক ও একাডেমিক কার্যক্রম')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50 overflow-hidden shadow-md hover:shadow-xl transition group flex flex-col justify-between"
                >
                  <div>
                    {ev.image_url && (
                      <div className="h-48 w-full overflow-hidden">
                        <img
                          src={ev.image_url}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {ev.event_date && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 mb-2">
                          <Calendar size={14} /> {new Date(ev.event_date).toLocaleDateString('bn-BD')}
                        </span>
                      )}
                      <h3 className="font-display text-xl font-bold text-navy-950">{ev.title}</h3>
                      {ev.location && (
                        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={13} /> {ev.location}
                        </p>
                      )}
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. GALLERY SECTION */}
      {isSecEnabled('gallery') && gallery.length > 0 && (
        <section className="py-20 bg-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="inline-block rounded-full bg-navy-900/10 px-3.5 py-1 text-xs font-bold text-navy-900 mb-3">
                  ফটো মেমোরি
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">
                  {getSecTitle('gallery', 'ক্যাম্পাস ফটো গ্যালারি')}
                </h2>
                <p className="mt-2 text-slate-600 text-base">
                  {getSecSubtitle('gallery', 'আমাদের বিভিন্ন আয়োজন ও সুন্দর মুহূর্তগুলো')}
                </p>
              </div>
              <Link
                href="/gallery"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-bold text-navy-900 hover:text-gold-600"
              >
                সম্পূর্ণ গ্যালারি দেখুন <ChevronRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {gallery.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedImage(g)}
                  className="relative group h-40 rounded-xl overflow-hidden cursor-pointer shadow-md border border-slate-200"
                >
                  <img
                    src={g.image_url}
                    alt={g.title || 'Gallery Image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center">
                    <span className="text-xs font-bold text-white">{g.title || g.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. CTA SECTION */}
      {isSecEnabled('cta') && (
        <section className="bg-navy-950 py-16 text-white text-center relative overflow-hidden">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-cream-50">
              আজই {settings?.college_name || 'Commerce College'}-এ আপনার শিক্ষা সফর শুরু করুন
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              ভর্তি সংক্রান্ত তথ্য, যোগ্যতা ও অন্যান্য বিষয়ের জন্য আমাদের সাথে যোগাযোগ করুন।
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/admissions"
                className="rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition shadow-lg"
              >
                অনলাইন ভর্তি আবেদন
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-bold text-cream-50 hover:bg-white/20 transition"
              >
                যোগাযোগ করুন
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1 rounded-full">
                {new Date(selectedNotice.created_at).toLocaleDateString('bn-BD')}
              </span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <h3 className="font-display text-xl font-bold text-navy-950">{selectedNotice.title}</h3>
            <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">{selectedNotice.description}</p>
            {selectedNotice.attachment_url && (
              <div className="pt-4 border-t">
                <a
                  href={selectedNotice.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
                >
                  <Download size={16} /> সংযুক্ত নথি ডাউনলোড করুন
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || 'Gallery'}
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            {selectedImage.title && (
              <p className="mt-3 text-white font-bold text-base text-center bg-black/50 px-4 py-2 rounded-lg">
                {selectedImage.title} ({selectedImage.category})
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
