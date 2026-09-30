'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { StatCard, Card, PageHeader, Badge } from '@/components/ui';
import { BookOpen, CalendarCheck, Megaphone } from 'lucide-react';

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-sm text-ink-600">লোড হচ্ছে...</p>;

  return (
    <div>
      <PageHeader title="শিক্ষক ড্যাশবোর্ড" subtitle="আপনার বিষয়সমূহ ও কার্যক্রম" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="আমার বিষয়সমূহ" value={stats.my_subjects?.length || 0} icon={BookOpen} />
        <StatCard label="আজকের হাজিরা এন্ট্রি" value={stats.today_attendance_marked || 0} icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">আমার বিষয়সমূহ</h2>
          <Card className="divide-y divide-navy-900/10">
            {stats.my_subjects?.length ? (
              stats.my_subjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-navy-900">{s.name}</p>
                    <p className="text-xs text-ink-600">{s.department?.name}</p>
                  </div>
                  <Badge>{s.code}</Badge>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-ink-600">কোনো বিষয় নিয়োগ করা হয়নি</p>
            )}
          </Card>
        </div>
        <div>
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
    </div>
  );
}
