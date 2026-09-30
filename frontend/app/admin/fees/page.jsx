'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Wallet, BarChart2, Users, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { showSuccess, showError } from '@/lib/swal';

const TYPE_LABEL = { tuition: 'টিউশন', exam: 'পরীক্ষা', admission: 'ভর্তি', library: 'লাইব্রেরি', transport: 'পরিবহন', other: 'অন্যান্য' };
const TYPE_COLOR = { tuition: 'bg-blue-100 text-blue-700', exam: 'bg-purple-100 text-purple-700', admission: 'bg-green-100 text-green-700', library: 'bg-yellow-100 text-yellow-700', transport: 'bg-orange-100 text-orange-700', other: 'bg-slate-100 text-slate-700' };
const STATUS_TONE = { paid: 'success', due: 'danger', partial: 'warn' };
const STATUS_LABEL = { paid: 'পরিশোধিত', due: 'বকেয়া', partial: 'আংশিক' };
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function AdminFees() {
  const [tab, setTab]                   = useState('fees');
  const [fees, setFees]                 = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [semesters, setSemesters]       = useState([]);
  const [students, setStudents]         = useState([]);
  const [report, setReport]             = useState([]);
  const [monthlyData, setMonthlyData]   = useState(null);
  const [studentSummary, setStudentSummary] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [modalOpen, setModalOpen]       = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [form, setForm]                 = useState({ type: 'tuition' });
  const [payForm, setPayForm]           = useState({ method: 'cash' });
  const [payResult, setPayResult]       = useState(null);
  const [saving, setSaving]             = useState(false);

  const load = () => {
    api.get('/fees').then((r) => setFees(r.data));
    api.get('/fees/report').then((r) => setReport(r.data.data || []));
  };

  const loadMonthly = (year) => {
    api.get('/fees/monthly-report', { params: { year } }).then((r) => setMonthlyData(r.data));
  };

  const loadStudentSummary = (studentId) => {
    if (!studentId) { setStudentSummary([]); return; }
    api.get('/fees/student-summary', { params: { student_id: studentId } }).then((r) => setStudentSummary(r.data));
  };

  useEffect(() => {
    load();
    api.get('/departments').then((r) => setDepartments(r.data));
    api.get('/semesters').then((r) => setSemesters(r.data));
    api.get('/users', { params: { role: 'student', per_page: 300 } }).then((r) => setStudents(r.data.data || []));
  }, []);

  useEffect(() => {
    if (tab === 'monthly') loadMonthly(selectedYear);
  }, [tab, selectedYear]);

  useEffect(() => {
    if (tab === 'student') loadStudentSummary(selectedStudent);
  }, [selectedStudent, tab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/fees', form);
      setModalOpen(false);
      showSuccess('নতুন ফি তৈরি হয়েছে এবং ছাত্রদের জন্য রেকর্ড তৈরি হয়েছে');
      load();
    } catch (err) {
      showError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPayResult(null);
    try {
      const res = await api.post('/fees/collect-payment', payForm);
      setPayResult(res.data);
      showSuccess('পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে');
      load();
      if (selectedStudent) loadStudentSummary(selectedStudent);
    } catch (err) {
      showError(err.response?.data?.message || 'পেমেন্ট গ্রহণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const maxMonthly = monthlyData?.monthly?.reduce((m, d) => Math.max(m, Number(d.total_collected)), 0) || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ফি ব্যবস্থাপনা"
        subtitle="ফি তৈরি, পেমেন্ট গ্রহণ এবং আয়ের হিসাব"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setPayForm({ method: 'cash' }); setPayResult(null); setPayModalOpen(true); }}>
              <Wallet size={16} /> পেমেন্ট নিন
            </Button>
            <Button onClick={() => { setForm({ type: 'tuition' }); setModalOpen(true); }} className="bg-gold-500 text-navy-950 font-bold">
              <Plus size={16} /> নতুন ফি
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-navy-900/10">
        {[
          { key: 'fees', label: 'ফি তালিকা', icon: <Plus size={14} /> },
          { key: 'report', label: 'পেমেন্ট রিপোর্ট', icon: <Users size={14} /> },
          { key: 'student', label: 'ছাত্রভিত্তিক', icon: <Users size={14} /> },
          { key: 'monthly', label: 'মাসিক আয়', icon: <BarChart2 size={14} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-bold transition rounded-t-xl ${
              tab === t.key
                ? 'border-gold-500 text-navy-950 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-navy-900 hover:bg-slate-50'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Fee List */}
      {tab === 'fees' && (
        <Card>
          {fees.length === 0 ? (
            <EmptyState title="কোনো ফি তৈরি করা হয়নি" subtitle="উপরে 'নতুন ফি' বাটনে ক্লিক করুন" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">শিরোনাম</th>
                    <th className="px-4 py-3">ধরন</th>
                    <th className="px-4 py-3">পরিমাণ</th>
                    <th className="px-4 py-3">শেষ তারিখ</th>
                    <th className="px-4 py-3">বর্ষ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {fees.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-bold text-navy-900">{f.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${TYPE_COLOR[f.type]}`}>
                          {TYPE_LABEL[f.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-navy-900">৳{Number(f.amount).toLocaleString('bn-BD')}</td>
                      <td className="px-4 py-3 text-slate-600">{f.due_date}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{f.semester?.name || 'সব বর্ষ'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Payment Report */}
      {tab === 'report' && (
        <Card>
          {report.length === 0 ? (
            <EmptyState title="কোনো পেমেন্ট রেকর্ড নেই" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">শিক্ষার্থী</th>
                    <th className="px-4 py-3">ফি</th>
                    <th className="px-4 py-3">মোট ফি</th>
                    <th className="px-4 py-3">পরিশোধিত</th>
                    <th className="px-4 py-3">বাকি</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {report.map((p) => {
                    const remaining = (p.fee?.amount || 0) - (p.amount_paid || 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-bold text-navy-900">{p.student?.name}</td>
                        <td className="px-4 py-3 text-slate-600">{p.fee?.title}</td>
                        <td className="px-4 py-3 font-mono font-bold">৳{Number(p.fee?.amount).toLocaleString('bn-BD')}</td>
                        <td className="px-4 py-3 font-mono text-emerald-700 font-bold">৳{Number(p.amount_paid).toLocaleString('bn-BD')}</td>
                        <td className={`px-4 py-3 font-mono font-bold ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {remaining > 0 ? `৳${Number(remaining).toLocaleString('bn-BD')}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB: Student-wise Fee Summary */}
      {tab === 'student' && (
        <div className="space-y-4">
          <Card className="p-4">
            <Select
              label="শিক্ষার্থী নির্বাচন করুন"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">— নির্বাচন করুন —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.studentProfile?.roll_no ? `(রোল: ${s.studentProfile.roll_no})` : ''}
                </option>
              ))}
            </Select>
          </Card>

          {selectedStudent && studentSummary.length === 0 && (
            <EmptyState title="এই শিক্ষার্থীর কোনো ফি রেকর্ড নেই" />
          )}

          {studentSummary.length > 0 && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'মোট ফি', value: `৳${studentSummary.reduce((s, p) => s + Number(p.fee?.amount || 0), 0).toLocaleString('bn-BD')}`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { label: 'পরিশোধিত', value: `৳${studentSummary.reduce((s, p) => s + Number(p.amount_paid || 0), 0).toLocaleString('bn-BD')}`, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  { label: 'বকেয়া', value: `৳${studentSummary.reduce((s, p) => s + Math.max(0, Number(p.fee?.amount || 0) - Number(p.amount_paid || 0)), 0).toLocaleString('bn-BD')}`, color: 'bg-red-50 border-red-200 text-red-700' },
                  { label: 'মোট ফি সংখ্যা', value: studentSummary.length, color: 'bg-slate-50 border-slate-200 text-slate-700' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border p-4 ${item.color}`}>
                    <p className="text-xs font-medium opacity-70">{item.label}</p>
                    <p className="text-xl font-extrabold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">ফি শিরোনাম</th>
                        <th className="px-4 py-3">ধরন</th>
                        <th className="px-4 py-3">মোট ফি</th>
                        <th className="px-4 py-3">পরিশোধিত</th>
                        <th className="px-4 py-3">বাকি</th>
                        <th className="px-4 py-3">শেষ তারিখ</th>
                        <th className="px-4 py-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-900/5">
                      {studentSummary.map((p) => {
                        const total     = Number(p.fee?.amount || 0);
                        const paid      = Number(p.amount_paid || 0);
                        const remaining = Math.max(0, total - paid);
                        return (
                          <tr key={p.id} className={`hover:bg-slate-50 ${p.status === 'due' ? 'bg-red-50/30' : ''}`}>
                            <td className="px-4 py-3 font-bold text-navy-900">{p.fee?.title}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${TYPE_COLOR[p.fee?.type]}`}>
                                {TYPE_LABEL[p.fee?.type]}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold">৳{total.toLocaleString('bn-BD')}</td>
                            <td className="px-4 py-3 font-mono text-emerald-700 font-bold">৳{paid.toLocaleString('bn-BD')}</td>
                            <td className={`px-4 py-3 font-mono font-bold ${remaining > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                              {remaining > 0 ? `৳${remaining.toLocaleString('bn-BD')}` : '✓'}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{p.fee?.due_date}</td>
                            <td className="px-4 py-3">
                              <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB: Monthly Income Report */}
      {tab === 'monthly' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-700">বছর নির্বাচন:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-navy-900"
            >
              {[2023, 2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {!monthlyData ? (
            <EmptyState title="লোড হচ্ছে..." />
          ) : (
            <>
              {/* Overall Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'মোট সংগ্রহ', value: `৳${Number(monthlyData.overall?.total_collected || 0).toLocaleString('bn-BD')}`, icon: <TrendingUp size={18} />, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                  { label: 'সম্পূর্ণ পরিশোধিত', value: `${monthlyData.overall?.paid_count || 0} জন`, icon: <Users size={18} />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { label: 'বকেয়া রেকর্ড', value: `${monthlyData.overall?.due_count || 0} টি`, icon: <Calendar size={18} />, color: 'bg-red-50 border-red-200 text-red-700' },
                  { label: 'সক্রিয় মাস', value: `${monthlyData.monthly?.length || 0} মাস`, icon: <BarChart2 size={18} />, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border p-4 ${item.color}`}>
                    <div className="flex items-center gap-2 mb-2 opacity-70">{item.icon}<p className="text-xs font-medium">{item.label}</p></div>
                    <p className="text-xl font-extrabold">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Monthly Bar Chart */}
              <Card className="p-5">
                <h3 className="font-bold text-navy-900 mb-4">মাসভিত্তিক আয় ({selectedYear})</h3>
                {monthlyData.monthly?.length === 0 ? (
                  <EmptyState title="এই বছরে কোনো পেমেন্ট নেই" />
                ) : (
                  <div className="space-y-2">
                    {monthlyData.monthly.map((m) => (
                      <div key={m.month} className="flex items-center gap-3">
                        <span className="w-20 text-xs font-bold text-slate-600 text-right shrink-0">
                          {MONTHS_BN[m.month - 1]}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${Math.max(5, (Number(m.total_collected) / maxMonthly) * 100)}%` }}
                          >
                            <span className="text-[10px] font-bold text-white whitespace-nowrap">
                              ৳{Number(m.total_collected).toLocaleString('bn-BD')}
                            </span>
                          </div>
                        </div>
                        <span className="w-16 text-xs text-slate-500 shrink-0">{m.total_transactions} টি</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Fee Type Breakdown */}
              <Card className="p-5">
                <h3 className="font-bold text-navy-900 mb-4">ফির ধরন অনুযায়ী আয়</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {monthlyData.by_type?.map((t) => (
                    <div key={t.type} className={`rounded-2xl border p-4 ${TYPE_COLOR[t.type]}`}>
                      <p className="text-xs font-bold">{TYPE_LABEL[t.type]}</p>
                      <p className="text-lg font-extrabold mt-1">৳{Number(t.total_collected).toLocaleString('bn-BD')}</p>
                      <p className="text-xs opacity-70 mt-0.5">{t.count} টি পেমেন্ট</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Create Fee Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="নতুন ফি তৈরি করুন">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="শিরোনাম (যেমন: ১ম বর্ষ টিউশন ফি ২০২৬)" required onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="ধরন" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Input label="পরিমাণ (৳)" type="number" required onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select
            label="বর্ষ (নির্দিষ্ট করলে সেই বর্ষের সবার জন্য প্রযোজ্য হবে)"
            onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
          >
            <option value="">সব বর্ষ</option>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.department?.name} - {s.name}</option>)}
          </Select>
          <Input label="শেষ তারিখ" type="date" required onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <p className="text-xs text-slate-500 bg-blue-50 rounded-xl px-3 py-2">
            💡 ফি তৈরি হলে স্বয়ংক্রিয়ভাবে নির্বাচিত বর্ষের সব শিক্ষার্থীর জন্য "বকেয়া" রেকর্ড তৈরি হবে।
          </p>
          <Button type="submit" className="w-full bg-navy-900 text-white font-bold" disabled={saving}>
            {saving ? 'তৈরি হচ্ছে...' : 'ফি তৈরি করুন'}
          </Button>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal open={payModalOpen} onClose={() => { setPayModalOpen(false); setPayResult(null); }} title="পেমেন্ট গ্রহণ করুন">
        <form onSubmit={handlePay} className="space-y-3">
          <Select label="শিক্ষার্থী *" required onChange={(e) => setPayForm({ ...payForm, student_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.studentProfile?.roll_no ? `(রোল: ${s.studentProfile.roll_no})` : ''}
              </option>
            ))}
          </Select>
          <Select label="ফি *" required onChange={(e) => setPayForm({ ...payForm, fee_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {fees.map((f) => <option key={f.id} value={f.id}>{f.title} — ৳{f.amount}</option>)}
          </Select>
          <Input label="পরিমাণ (৳) *" type="number" required onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} />
          <Select label="মাধ্যম" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
            <option value="cash">নগদ (Cash)</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="bank">ব্যাংক</option>
            <option value="card">কার্ড</option>
          </Select>
          <Input label="ট্রানজেকশন আইডি (ঐচ্ছিক)" onChange={(e) => setPayForm({ ...payForm, transaction_id: e.target.value })} />

          {/* Payment Result Summary */}
          {payResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1 text-sm">
              <p className="font-bold text-emerald-800">✓ পেমেন্ট সম্পন্ন</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="bg-white rounded-xl border p-2">
                  <p className="text-slate-500">আগে পরিশোধিত</p>
                  <p className="font-bold text-navy-900">৳{Number(payResult.previous_paid || 0).toLocaleString('bn-BD')}</p>
                </div>
                <div className="bg-white rounded-xl border p-2">
                  <p className="text-slate-500">এবার দিয়েছে</p>
                  <p className="font-bold text-emerald-700">+ ৳{Number(payResult.new_payment || 0).toLocaleString('bn-BD')}</p>
                </div>
                <div className="bg-white rounded-xl border p-2">
                  <p className="text-slate-500">মোট পরিশোধিত</p>
                  <p className="font-bold text-navy-900">৳{Number(payResult.total_paid || 0).toLocaleString('bn-BD')}</p>
                </div>
                <div className={`rounded-xl border p-2 ${payResult.remaining > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <p className="text-slate-500">বাকি</p>
                  <p className={`font-bold ${payResult.remaining > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {payResult.remaining > 0 ? `৳${Number(payResult.remaining).toLocaleString('bn-BD')}` : '✓ সম্পূর্ণ পরিশোধিত'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-navy-900 text-white font-bold" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'পেমেন্ট সংরক্ষণ করুন'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
