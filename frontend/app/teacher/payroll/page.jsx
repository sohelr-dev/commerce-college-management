'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';

const MONTH_LABEL = ['', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function MyPayroll() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/my/payroll').then((r) => setPayments(r.data));
  }, []);

  return (
    <div>
      <PageHeader title="আমার বেতন" subtitle="মাসিক বেতন পরিশোধের অবস্থা" />

      <Card>
        {payments.length === 0 ? (
          <EmptyState title="কোনো বেতন রেকর্ড নেই" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">মাস</th><th className="px-4 py-3">মোট বেতন</th><th className="px-4 py-3">নিট বেতন</th><th className="px-4 py-3">পরিশোধের তারিখ</th><th className="px-4 py-3">স্ট্যাটাস</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">{MONTH_LABEL[p.month]} {p.year}</td>
                  <td className="px-4 py-3 font-mono-tab">৳{Number(p.gross_amount).toLocaleString('bn-BD')}</td>
                  <td className="px-4 py-3 font-mono-tab font-semibold">৳{Number(p.net_amount).toLocaleString('bn-BD')}</td>
                  <td className="px-4 py-3 font-mono-tab">{p.payment_date || '—'}</td>
                  <td className="px-4 py-3"><Badge tone={p.status === 'paid' ? 'success' : 'warn'}>{p.status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}</Badge></td>
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
