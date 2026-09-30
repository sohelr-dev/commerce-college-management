'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { SectionHeading } from '@/components/public/ui';
import { FileText, ClipboardCheck, Users2, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { icon: FileText, title: 'আবেদন ফর্ম পূরণ', desc: 'অনলাইনে বা সরাসরি কলেজ অফিস থেকে আবেদন ফর্ম সংগ্রহ ও পূরণ করুন।' },
  { icon: ClipboardCheck, title: 'ভর্তি পরীক্ষা', desc: 'নির্ধারিত তারিখে ভর্তি পরীক্ষায় অংশগ্রহণ করুন।' },
  { icon: Users2, title: 'মৌখিক সাক্ষাৎকার', desc: 'লিখিত পরীক্ষায় উত্তীর্ণদের জন্য মৌখিক সাক্ষাৎকার অনুষ্ঠিত হবে।' },
  { icon: CheckCircle2, title: 'চূড়ান্ত ভর্তি', desc: 'নির্বাচিত শিক্ষার্থীরা নির্ধারিত ফি জমা দিয়ে ভর্তি সম্পন্ন করবেন।' },
];

export default function Admissions() {
  const [settings, setSettings] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/public/settings').then((r) => setSettings(r.data));
    api.get('/public/departments').then((r) => setDepartments(r.data));
  }, []);

  return (
    <div>
      <section className="bg-navy-900 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-cream-50 sm:text-4xl">ভর্তি তথ্য</h1>
          <p className="mt-3 text-cream-100/70">শিক্ষাবর্ষ {new Date().getFullYear()}-{new Date().getFullYear() + 1} এর জন্য ভর্তি চলছে</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="প্রাথমিক তথ্য" title="ভর্তি সংক্রান্ত নির্দেশনা" />
        <p className="leading-relaxed text-ink-600">{settings?.admission_info}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {departments.map((d) => (
            <span key={d.id} className="rounded-full border border-navy-900/15 px-3.5 py-1.5 text-sm text-navy-900">{d.name}</span>
          ))}
        </div>
      </section>

      <section className="bg-navy-900/[0.03] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="ধাপসমূহ" title="ভর্তি প্রক্রিয়া" center />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={i} className="relative rounded-xl border border-navy-900/10 bg-white p-6 text-center">
                <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">{i + 1}</div>
                <div className="mx-auto mt-2 mb-3 inline-flex rounded-lg bg-navy-900/5 p-3 text-navy-700"><s.icon size={22} /></div>
                <h3 className="font-display text-base font-semibold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-navy-900">আরও তথ্যের প্রয়োজন?</h2>
        <p className="mt-2 text-ink-600">ভর্তি সংক্রান্ত যেকোনো প্রশ্নে সরাসরি আমাদের সাথে যোগাযোগ করুন।</p>
        <Link href="/contact" className="mt-6 inline-block rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-navy-800">
          যোগাযোগ করুন
        </Link>
      </section>
    </div>
  );
}
