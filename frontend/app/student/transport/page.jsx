'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, EmptyState } from '@/components/ui';
import { Bus, MapPin, Phone, Wallet } from 'lucide-react';

export default function StudentTransport() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    api.get('/my/transport').then((r) => setData(r.data));
  }, []);

  if (data === undefined) return <p className="text-sm text-ink-600">লোড হচ্ছে...</p>;

  return (
    <div>
      <PageHeader title="আমার পরিবহন" subtitle="আপনার বাস রুট ও যানবাহনের তথ্য" />

      {!data ? (
        <EmptyState title="আপনার জন্য কোনো পরিবহন বরাদ্দ করা হয়নি" subtitle="প্রয়োজন হলে অফিসে যোগাযোগ করুন" />
      ) : (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-navy-900/5 p-3 text-navy-700"><Bus size={24} /></div>
            <div>
              <p className="font-display text-xl font-semibold text-navy-900">{data.route?.name}</p>
              <p className="text-sm text-ink-600">{data.vehicle?.vehicle_number}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-navy-900/10 pt-4 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-ink-400" />
              <div>
                <p className="text-xs text-ink-400">পিকআপ পয়েন্ট</p>
                <p className="text-sm font-medium text-navy-900">{data.pickup_point || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Wallet size={16} className="mt-0.5 text-ink-400" />
              <div>
                <p className="text-xs text-ink-400">মাসিক ভাড়া</p>
                <p className="text-sm font-medium text-navy-900">৳{Number(data.route?.fare_amount).toLocaleString('bn-BD')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <Phone size={16} className="mt-0.5 text-ink-400" />
              <div>
                <p className="text-xs text-ink-400">চালক</p>
                <p className="text-sm font-medium text-navy-900">{data.vehicle?.driver_name} — {data.vehicle?.driver_phone}</p>
              </div>
            </div>
            {data.route?.stoppages && (
              <div className="sm:col-span-2">
                <p className="text-xs text-ink-400">স্টপেজসমূহ</p>
                <p className="mt-1 text-sm text-ink-600">{data.route.stoppages}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
