'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SectionHeading } from '@/components/public/ui';
import { BookOpen, Layers } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get('/public/departments').then((r) => setDepartments(r.data));
  }, []);

  return (
    <div>
      <section className="bg-navy-900 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-cream-50 sm:text-4xl">একাডেমিক বিভাগসমূহ</h1>
          <p className="mt-3 text-cream-100/70">আমাদের প্রতিটি বিভাগ আধুনিক ও বাস্তবমুখী পাঠ্যক্রম নিয়ে গঠিত</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d.id} className="flex flex-col rounded-xl border border-navy-900/10 bg-white p-7 shadow-sm">
              <span className="mb-3 w-fit rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-600">{d.code}</span>
              <h3 className="font-display text-xl font-semibold text-navy-900">{d.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{d.description}</p>
              <div className="mt-5 flex gap-4 border-t border-navy-900/10 pt-4 text-xs text-ink-600">
                <span className="flex items-center gap-1.5"><Layers size={14} /> {d.semesters_count} বর্ষ</span>
                <span className="flex items-center gap-1.5"><BookOpen size={14} /> {d.subjects_count} বিষয়</span>
              </div>
            </div>
          ))}
        </div>
        {departments.length === 0 && <p className="text-center text-sm text-ink-600">কোনো বিভাগ পাওয়া যায়নি।</p>}
      </section>
    </div>
  );
}
