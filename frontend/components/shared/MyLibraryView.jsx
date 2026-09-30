'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Badge, EmptyState } from '@/components/ui';

const STATUS_TONE = { issued: 'warn', returned: 'success', overdue: 'danger' };
const STATUS_LABEL = { issued: 'ইস্যুকৃত', returned: 'ফেরত দেওয়া হয়েছে', overdue: 'মেয়াদোত্তীর্ণ' };

export default function MyLibraryView() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get('/library/my-issues').then((r) => setIssues(r.data));
  }, []);

  return (
    <div>
      <PageHeader title="আমার লাইব্রেরি" subtitle="আপনার ইস্যুকৃত বইয়ের তালিকা" />

      <Card>
        {issues.length === 0 ? (
          <EmptyState title="কোনো বই ইস্যু করা নেই" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">বই</th><th className="px-4 py-3">ইস্যু তারিখ</th><th className="px-4 py-3">ফেরতের শেষ তারিখ</th><th className="px-4 py-3">জরিমানা</th><th className="px-4 py-3">স্ট্যাটাস</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {issues.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">{i.book?.title}</td>
                  <td className="px-4 py-3 font-mono-tab">{i.issue_date}</td>
                  <td className="px-4 py-3 font-mono-tab">{i.due_date}</td>
                  <td className="px-4 py-3 font-mono-tab">{i.fine_amount > 0 ? `৳${i.fine_amount}` : '—'}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge></td>
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
