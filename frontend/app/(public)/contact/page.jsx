'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SectionHeading } from '@/components/public/ui';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/public/settings').then((r) => setSettings(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await api.post('/public/contact', form);
      setStatus({ type: 'success', message: res.data.message });
      setForm({});
      e.target.reset();
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'বার্তা পাঠানো ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <section className="bg-navy-900 py-14">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-display text-3xl font-semibold text-cream-50 sm:text-4xl">যোগাযোগ করুন</h1>
          <p className="mt-3 text-cream-100/70">যেকোনো প্রশ্ন বা তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <SectionHeading title="যোগাযোগের তথ্য" />
            <div className="space-y-5">
              {settings?.address && (
                <div className="flex gap-3">
                  <div className="rounded-lg bg-navy-900/5 p-2.5 text-navy-700"><MapPin size={18} /></div>
                  <div><p className="text-xs text-ink-400">ঠিকানা</p><p className="text-sm font-medium text-navy-900">{settings.address}</p></div>
                </div>
              )}
              {settings?.phone && (
                <div className="flex gap-3">
                  <div className="rounded-lg bg-navy-900/5 p-2.5 text-navy-700"><Phone size={18} /></div>
                  <div><p className="text-xs text-ink-400">ফোন</p><p className="text-sm font-medium text-navy-900">{settings.phone}</p></div>
                </div>
              )}
              {settings?.email && (
                <div className="flex gap-3">
                  <div className="rounded-lg bg-navy-900/5 p-2.5 text-navy-700"><Mail size={18} /></div>
                  <div><p className="text-xs text-ink-400">ইমেইল</p><p className="text-sm font-medium text-navy-900">{settings.email}</p></div>
                </div>
              )}
            </div>

            {settings?.google_map_embed && (
              <div className="mt-8 overflow-hidden rounded-xl border border-navy-900/10 shadow-sm">
                <div
                  className="h-64 w-full"
                  dangerouslySetInnerHTML={{ __html: settings.google_map_embed }}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-navy-900/10 bg-white p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-600">নাম</span>
                  <input required className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15" onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-600">ইমেইল</span>
                  <input type="email" required className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15" onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-600">ফোন (ঐচ্ছিক)</span>
                  <input className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-600">বিষয়</span>
                  <input className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15" onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-600">বার্তা</span>
                <textarea required rows={5} className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15" onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>

              {status && (
                <p className={`rounded-lg px-3 py-2 text-sm ${status.type === 'success' ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'}`}>{status.message}</p>
              )}

              <button type="submit" disabled={saving} className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-cream-50 transition hover:bg-navy-800 disabled:opacity-50">
                {saving ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
