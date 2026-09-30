'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';

const STATUS_TONE = { present: 'success', absent: 'danger', late: 'warn', excused: 'neutral' };
const STATUS_LABEL = { present: 'উপস্থিত', absent: 'অনুপস্থিত', late: 'দেরি', excused: 'অব্যাহতিপ্রাপ্ত' };

export default function StudentAttendance() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/my/attendance').then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-sm text-ink-600">লোড হচ্ছে...</p>;

  return (
    <div>
      <PageHeader title="আমার উপস্থিতি" subtitle="বিষয়ভিত্তিক উপস্থিতির হার ও বিস্তারিত রেকর্ড" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.summary.map((s, i) => (
          <Card key={i} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{s.subject}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-navy-900">{s.percentage}%</p>
            <p className="mt-1 text-xs text-ink-600">{s.present} / {s.total} ক্লাস</p>
          </Card>
        ))}
      </div>

      <Card>
        {data.records.length === 0 ? (
          <EmptyState title="কোনো উপস্থিতি রেকর্ড নেই" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">তারিখ</th><th className="px-4 py-3">বিষয়</th><th className="px-4 py-3">অবস্থা</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {data.records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono-tab">{r.date}</td>
                  <td className="px-4 py-3">{r.subject?.name}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
