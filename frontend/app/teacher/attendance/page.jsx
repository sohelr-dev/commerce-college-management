'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Select, Input, Button, Badge } from '@/components/ui';

const STATUS_OPTIONS = [
  { value: 'present', label: 'উপস্থিত', tone: 'success' },
  { value: 'absent', label: 'অনুপস্থিত', tone: 'danger' },
  { value: 'late', label: 'দেরি', tone: 'warn' },
  { value: 'excused', label: 'অব্যাহতি', tone: 'neutral' },
];

export default function MarkAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/dashboard').then((r) => setSubjects(r.data.my_subjects || []));
  }, []);

  const selectedSubject = subjects.find((s) => String(s.id) === String(subjectId));

  useEffect(() => {
    if (selectedSubject) setSectionId(selectedSubject.pivot.section_id);
  }, [subjectId]);

  const loadStudents = () => {
    if (!subjectId || !sectionId || !date) return;
    api.get('/attendance/students', { params: { subject_id: subjectId, section_id: sectionId, date } })
      .then((r) => setStudents(r.data));
  };

  useEffect(loadStudents, [subjectId, sectionId, date]);

  const updateStatus = (studentId, status) => {
    setStudents((prev) => prev.map((s) => (s.student_id === studentId ? { ...s, status } : s)));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.post('/attendance/bulk', {
        subject_id: subjectId,
        section_id: sectionId,
        date,
        records: students.map((s) => ({ student_id: s.student_id, status: s.status })),
      });
      setSaved(true);
    } catch (err) {
      alert(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="হাজিরা নিন" subtitle="বিষয় ও তারিখ নির্বাচন করে শিক্ষার্থীদের উপস্থিতি দিন" />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:w-2/3">
        <Select label="বিষয়" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">নির্বাচন করুন</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
        </Select>
        <Input label="তারিখ" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {students.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">রোল</th><th className="px-4 py-3">নাম</th><th className="px-4 py-3">অবস্থা</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {students.map((s) => (
                <tr key={s.student_id}>
                  <td className="px-4 py-3 font-mono-tab">{s.roll_no}</td>
                  <td className="px-4 py-3 font-medium text-navy-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => updateStatus(s.student_id, opt.value)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                            s.status === opt.value
                              ? opt.tone === 'success' ? 'bg-success-600 text-white' : opt.tone === 'danger' ? 'bg-danger-600 text-white' : opt.tone === 'warn' ? 'bg-warn-600 text-white' : 'bg-navy-900 text-white'
                              : 'bg-navy-900/5 text-ink-600 hover:bg-navy-900/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="flex items-center justify-between border-t border-navy-900/10 p-4">
            {saved && <span className="text-sm text-success-600">✓ সংরক্ষণ হয়েছে</span>}
            <Button onClick={handleSubmit} disabled={saving} className="ml-auto">{saving ? 'সংরক্ষণ হচ্ছে...' : 'হাজিরা সংরক্ষণ করুন'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
