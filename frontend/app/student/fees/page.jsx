'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';

const STATUS_TONE = { paid: 'success', due: 'danger', partial: 'warn' };
const STATUS_LABEL = { paid: 'পরিশোধিত', due: 'বকেয়া', partial: 'আংশিক পরিশোধিত' };

export default function StudentFees() {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    api.get('/my/fees').then((r) => setFees(r.data));
  }, []);

  return (
    <div>
      <PageHeader title="আমার ফি" subtitle="ফি পরিশোধের অবস্থা দেখুন" />

      <Card>
        {fees.length === 0 ? (
          <EmptyState title="কোনো ফি রেকর্ড নেই" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">ফি</th><th className="px-4 py-3">মোট পরিমাণ</th><th className="px-4 py-3">পরিশোধিত</th><th className="px-4 py-3">শেষ তারিখ</th><th className="px-4 py-3">স্ট্যাটাস</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {fees.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">{f.fee?.title}</td>
                  <td className="px-4 py-3 font-mono-tab">৳{Number(f.fee?.amount).toLocaleString('bn-BD')}</td>
                  <td className="px-4 py-3 font-mono-tab">৳{Number(f.amount_paid).toLocaleString('bn-BD')}</td>
                  <td className="px-4 py-3 font-mono-tab">{f.fee?.due_date}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[f.status]}>{STATUS_LABEL[f.status]}</Badge></td>
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
