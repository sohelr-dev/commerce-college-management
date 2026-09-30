'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus } from 'lucide-react';

const TYPE_LABEL = { quiz: 'কুইজ', midterm: 'মিডটার্ম', final: 'ফাইনাল', assignment: 'অ্যাসাইনমেন্ট' };
const STATUS_LABEL = { upcoming: 'আসন্ন', ongoing: 'চলমান', completed: 'সম্পন্ন', result_published: 'ফলাফল প্রকাশিত' };
const STATUS_TONE = { upcoming: 'neutral', ongoing: 'warn', completed: 'success', result_published: 'gold' };

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'midterm' });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/exams').then((r) => setExams(r.data));

  useEffect(() => {
    load();
    api.get('/departments').then((r) => setDepartments(r.data));
    api.get('/semesters').then((r) => setSemesters(r.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/exams', form);
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="পরীক্ষা ব্যবস্থাপনা"
        subtitle="নতুন পরীক্ষা তৈরি করুন — শিক্ষকরা এই পরীক্ষার আওতায় নম্বর দেবেন"
        action={<Button onClick={() => { setForm({ type: 'midterm' }); setModalOpen(true); }}><Plus size={16} /> নতুন পরীক্ষা</Button>}
      />

      <Card>
        {exams.length === 0 ? (
          <EmptyState title="কোনো পরীক্ষা নেই" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">নাম</th><th className="px-4 py-3">ধরন</th><th className="px-4 py-3">বিভাগ/বর্ষ</th><th className="px-4 py-3">তারিখ</th><th className="px-4 py-3">স্ট্যাটাস</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {exams.map((ex) => (
                <tr key={ex.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">{ex.name}</td>
                  <td className="px-4 py-3">{TYPE_LABEL[ex.type]}</td>
                  <td className="px-4 py-3">{ex.department?.name} / {ex.semester?.name}</td>
                  <td className="px-4 py-3 font-mono-tab">{ex.start_date} — {ex.end_date}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[ex.status]}>{STATUS_LABEL[ex.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="নতুন পরীক্ষা যোগ করুন">
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="পরীক্ষার নাম" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="ধরন" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select label="বিভাগ" required onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select label="বর্ষ" required onChange={(e) => setForm({ ...form, semester_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.department?.name} - {s.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="শুরুর তারিখ" type="date" required onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="শেষের তারিখ" type="date" required onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
        </form>
      </Modal>
    </div>
  );
}
