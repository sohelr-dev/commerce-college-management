'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { StatCard, Card, PageHeader, Badge } from '@/components/ui';
import { Users, GraduationCap, Building2, Wallet, BookOpen, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-sm text-ink-600">লোড হচ্ছে...</p>;

  return (
    <div>
      <PageHeader title="প্রশাসন ড্যাশবোর্ড" subtitle="কমার্স কলেজের সার্বিক অবস্থা এক নজরে" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="মোট শিক্ষার্থী" value={stats.total_students} icon={GraduationCap} />
        <StatCard label="মোট শিক্ষক" value={stats.total_teachers} icon={Users} />
        <StatCard label="বিভাগ" value={stats.total_departments} icon={Building2} />
        <StatCard label="সেকশন" value={stats.total_sections} icon={Layers} />
        <StatCard label="বিষয়" value={stats.total_subjects} icon={BookOpen} />
        <StatCard
          label="ফি আদায়"
          value={`৳${Number(stats.fee_collected || 0).toLocaleString('bn-BD')}`}
          sub={`বকেয়া: ৳${Number(stats.fee_due || 0).toLocaleString('bn-BD')}`}
          icon={Wallet}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">সাম্প্রতিক নোটিশ</h2>
        <Card className="divide-y divide-navy-900/10">
          {stats.recent_notices?.length ? (
            stats.recent_notices.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-navy-900">{n.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-600">{n.description}</p>
                </div>
                {n.is_pinned ? <Badge tone="gold">পিন করা</Badge> : null}
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
