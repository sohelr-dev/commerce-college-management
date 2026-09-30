'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { StatCard, Card, PageHeader } from '@/components/ui';
import { CalendarCheck, GraduationCap, Wallet } from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-sm text-ink-600">লোড হচ্ছে...</p>;
  const p = stats.profile;

  return (
    <div>
      <PageHeader
        title="শিক্ষার্থী ড্যাশবোর্ড"
        subtitle={p ? `${p.department?.name} • ${p.semester?.name} • সেকশন ${p.section?.name} • রোল ${p.roll_no}` : ''}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="উপস্থিতির হার" value={`${stats.attendance_percentage}%`} icon={CalendarCheck} />
        <StatCard label="সর্বশেষ জিপিএ" value={stats.latest_gpa || '—'} icon={GraduationCap} />
        <StatCard label="বকেয়া ফি" value={`৳${Number(stats.total_due || 0).toLocaleString('bn-BD')}`} icon={Wallet} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">সাম্প্রতিক নোটিশ</h2>
        <Card className="divide-y divide-navy-900/10">
          {stats.recent_notices?.length ? (
            stats.recent_notices.map((n) => (
              <div key={n.id} className="p-4">
                <p className="text-sm font-medium text-navy-900">{n.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-600">{n.description}</p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-ink-600">কোনো নোটিশ নেই</p>
          )}
        </Card>
      </div>
    </div>
  );
}
