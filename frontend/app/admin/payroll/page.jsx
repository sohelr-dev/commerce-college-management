'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, PlayCircle, Check } from 'lucide-react';

const MONTH_LABEL = ['', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function AdminPayroll() {
  const [tab, setTab] = useState('structures');
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [structModal, setStructModal] = useState(false);
  const [genModal, setGenModal] = useState(false);
  const [structForm, setStructForm] = useState({});
  const [genForm, setGenForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/payroll/structures').then((r) => setStructures(r.data));
    api.get('/payroll/report').then((r) => setPayments(r.data));
  };

  useEffect(() => {
    load();
    api.get('/users', { params: { role: 'teacher', per_page: 200 } }).then((r) => setTeachers(r.data.data));
  }, []);

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/payroll/structures', structForm);
      setStructModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/payroll/generate', genForm);
      alert(res.data.message);
      setGenModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'তৈরি করা ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id) => {
    await api.put(`/payroll/payments/${id}/mark-paid`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="বেতন ব্যবস্থাপনা (Payroll)"
        subtitle="শিক্ষকদের বেতন কাঠামো ও মাসিক পেমেন্ট পরিচালনা করুন"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGenModal(true)}><PlayCircle size={16} /> মাসিক বেতন তৈরি করুন</Button>
            <Button onClick={() => { setStructForm({}); setStructModal(true); }}><Plus size={16} /> বেতন কাঠামো</Button>
          </div>
        }
      />

      <div className="mb-5 flex gap-2 border-b border-navy-900/10">
        {[{ key: 'structures', label: 'বেতন কাঠামো' }, { key: 'payments', label: 'পেমেন্ট রিপোর্ট' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`border-b-2 px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'border-gold-500 text-navy-900' : 'border-transparent text-ink-400 hover:text-navy-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'structures' && (
        <Card>
          {structures.length === 0 ? <EmptyState title="কোনো বেতন কাঠামো নেই" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">শিক্ষক</th><th className="px-4 py-3">বেসিক</th><th className="px-4 py-3">ভাতাসমূহ</th><th className="px-4 py-3">কর্তন</th><th className="px-4 py-3">নিট বেতন</th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {structures.map((s) => {
                  const gross = Number(s.basic_salary) + Number(s.house_allowance) + Number(s.medical_allowance) + Number(s.other_allowance);
                  const net = gross - Number(s.deductions);
                  return (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-medium text-navy-900">{s.teacher?.name}</td>
                      <td className="px-4 py-3 font-mono-tab">৳{Number(s.basic_salary).toLocaleString('bn-BD')}</td>
                      <td className="px-4 py-3 font-mono-tab">৳{(Number(s.house_allowance) + Number(s.medical_allowance) + Number(s.other_allowance)).toLocaleString('bn-BD')}</td>
                      <td className="px-4 py-3 font-mono-tab">৳{Number(s.deductions).toLocaleString('bn-BD')}</td>
                      <td className="px-4 py-3 font-mono-tab font-semibold text-navy-900">৳{net.toLocaleString('bn-BD')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          {payments.length === 0 ? <EmptyState title="কোনো পেমেন্ট রেকর্ড নেই" subtitle="আগে বেতন কাঠামো তৈরি করুন, তারপর মাসিক বেতন তৈরি করুন" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">শিক্ষক</th><th className="px-4 py-3">মাস</th><th className="px-4 py-3">নিট বেতন</th><th className="px-4 py-3">স্ট্যাটাস</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{p.teacher?.name}</td>
                    <td className="px-4 py-3">{MONTH_LABEL[p.month]} {p.year}</td>
                    <td className="px-4 py-3 font-mono-tab">৳{Number(p.net_amount).toLocaleString('bn-BD')}</td>
                    <td className="px-4 py-3"><Badge tone={p.status === 'paid' ? 'success' : 'warn'}>{p.status === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমান'}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'pending' && (
                        <button onClick={() => handleMarkPaid(p.id)} className="text-success-600 hover:opacity-70" title="পরিশোধিত হিসেবে চিহ্নিত করুন"><Check size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={structModal} onClose={() => setStructModal(false)} title="বেতন কাঠামো নির্ধারণ করুন">
        <form onSubmit={handleSaveStructure} className="space-y-3">
          <Select label="শিক্ষক" required onChange={(e) => setStructForm({ ...structForm, teacher_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Input label="বেসিক বেতন (৳)" type="number" required onChange={(e) => setStructForm({ ...structForm, basic_salary: e.target.value })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="বাড়ি ভাড়া" type="number" onChange={(e) => setStructForm({ ...structForm, house_allowance: e.target.value })} />
            <Input label="মেডিকেল" type="number" onChange={(e) => setStructForm({ ...structForm, medical_allowance: e.target.value })} />
            <Input label="অন্যান্য" type="number" onChange={(e) => setStructForm({ ...structForm, other_allowance: e.target.value })} />
          </div>
          <Input label="কর্তন (৳)" type="number" onChange={(e) => setStructForm({ ...structForm, deductions: e.target.value })} />
          <Input label="কার্যকর তারিখ" type="date" required onChange={(e) => setStructForm({ ...structForm, effective_from: e.target.value })} />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
        </form>
      </Modal>

      <Modal open={genModal} onClose={() => setGenModal(false)} title="মাসিক বেতন তৈরি করুন">
        <form onSubmit={handleGenerate} className="space-y-3">
          <p className="text-sm text-ink-600">যাদের বেতন কাঠামো নির্ধারিত আছে তাদের জন্য এই মাসের বেতন এন্ট্রি তৈরি হবে (status: অপেক্ষমান)।</p>
          <div className="grid grid-cols-2 gap-3">
            <Select label="মাস" value={genForm.month} onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}>
              {MONTH_LABEL.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </Select>
            <Input label="বছর" type="number" value={genForm.year} onChange={(e) => setGenForm({ ...genForm, year: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}</Button>
        </form>
      </Modal>
    </div>
  );
}
