'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';

export default function StudentRoutine() {
  const [routine, setRoutine] = useState([]);

  useEffect(() => {
    api.get('/my/routine').then((r) => setRoutine(r.data));
  }, []);

  const grouped = routine.reduce((acc, r) => {
    (acc[r.exam?.name] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="পরীক্ষার রুটিন" subtitle="আপনার সেশন/বিভাগ/সেকশন অনুযায়ী পরীক্ষার সময়সূচি" />

      {routine.length === 0 ? (
        <EmptyState title="এখনো কোনো রুটিন প্রকাশিত হয়নি" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([examName, items]) => (
            <div key={examName}>
              <h3 className="mb-3 font-display text-lg font-semibold text-navy-900">{examName}</h3>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                    <tr><th className="px-4 py-3">তারিখ</th><th className="px-4 py-3">বিষয়</th><th className="px-4 py-3">সময়</th><th className="px-4 py-3">রুম</th></tr>
                  </thead>
                  <tbody className="divide-y divide-navy-900/5">
                    {items.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-mono-tab">{r.exam_date}</td>
                        <td className="px-4 py-3 font-medium text-navy-900">{r.subject?.name}</td>
                        <td className="px-4 py-3 font-mono-tab">{r.start_time?.slice(0, 5)} — {r.end_time?.slice(0, 5)}</td>
                        <td className="px-4 py-3">{r.room ? <Badge>{r.room}</Badge> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
