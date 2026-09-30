'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminRoutine() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [examId, setExamId] = useState('');
  const [routine, setRoutine] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/exams').then((r) => setExams(r.data));
    api.get('/subjects').then((r) => setSubjects(r.data));
    api.get('/sections').then((r) => setSections(r.data));
  }, []);

  const loadRoutine = () => {
    if (!examId) return setRoutine([]);
    api.get('/exam-routines', { params: { exam_id: examId } }).then((r) => setRoutine(r.data));
  };

  useEffect(loadRoutine, [examId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/exam-routines', { ...form, exam_id: examId });
      setModalOpen(false);
      setForm({});
      loadRoutine();
    } catch (err) {
      alert(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('রুটিন এন্ট্রি মুছে ফেলতে চান?')) return;
    await api.delete(`/exam-routines/${id}`);
    loadRoutine();
  };

  const selectedExam = exams.find((ex) => String(ex.id) === String(examId));
  const relevantSubjects = subjects.filter((s) => !selectedExam || String(s.semester_id) === String(selectedExam.semester_id));
  const relevantSections = sections.filter((s) => !selectedExam || String(s.semester_id) === String(selectedExam.semester_id));

  return (
    <div>
      <PageHeader
        title="পরীক্ষার রুটিন"
        subtitle="তারিখ অনুযায়ী কোন বিষয়ের পরীক্ষা কবে হবে তা নির্ধারণ করুন — ছাত্র পোর্টালে স্বয়ংক্রিয়ভাবে দেখাবে"
        action={<Button onClick={() => { setForm({}); setModalOpen(true); }} disabled={!examId}><Plus size={16} /> রুটিন এন্ট্রি যোগ করুন</Button>}
      />

      <div className="mb-5 w-full sm:w-1/2">
        <Select label="পরীক্ষা নির্বাচন করুন" value={examId} onChange={(e) => setExamId(e.target.value)}>
          <option value="">নির্বাচন করুন</option>
          {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </Select>
      </div>

      {!examId ? (
        <EmptyState title="একটি পরীক্ষা নির্বাচন করুন" subtitle="রুটিন দেখতে বা যোগ করতে প্রথমে উপরে থেকে একটি পরীক্ষা বেছে নিন" />
      ) : routine.length === 0 ? (
        <EmptyState title="এই পরীক্ষার জন্য এখনো রুটিন তৈরি করা হয়নি" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">তারিখ</th><th className="px-4 py-3">বিষয়</th><th className="px-4 py-3">সেকশন</th><th className="px-4 py-3">সময়</th><th className="px-4 py-3">রুম</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {routine.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono-tab">{r.exam_date}</td>
                  <td className="px-4 py-3 font-medium text-navy-900">{r.subject?.name}</td>
                  <td className="px-4 py-3">{r.section?.name}</td>
                  <td className="px-4 py-3 font-mono-tab">{r.start_time?.slice(0, 5)} — {r.end_time?.slice(0, 5)}</td>
                  <td className="px-4 py-3">{r.room ? <Badge>{r.room}</Badge> : '—'}</td>
                  <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(r.id)} className="text-danger-600 hover:opacity-70"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="রুটিন এন্ট্রি যোগ করুন">
        <form onSubmit={handleSave} className="space-y-3">
          <Select label="বিষয়" required onChange={(e) => setForm({ ...form, subject_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {relevantSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="সেকশন" required onChange={(e) => setForm({ ...form, section_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {relevantSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input label="পরীক্ষার তারিখ" type="date" required onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="শুরুর সময়" type="time" onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <Input label="শেষের সময়" type="time" onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <Input label="রুম নং (ঐচ্ছিক)" onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
        </form>
      </Modal>
    </div>
  );
}
