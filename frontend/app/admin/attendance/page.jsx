'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Select, Badge, EmptyState } from '@/components/ui';

const STATUS_TONE = { present: 'success', absent: 'danger', late: 'warn', excused: 'neutral' };
const STATUS_LABEL = { present: 'উপস্থিত', absent: 'অনুপস্থিত', late: 'দেরি', excused: 'অব্যাহতিপ্রাপ্ত' };

export default function AdminAttendance() {
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get('/sections').then((r) => setSections(r.data));
    api.get('/subjects').then((r) => setSubjects(r.data));
  }, []);

  useEffect(() => {
    api.get('/attendance/report', { params: { section_id: sectionId || undefined, subject_id: subjectId || undefined } })
      .then((r) => setRecords(r.data.data));
  }, [sectionId, subjectId]);

  return (
    <div>
      <PageHeader title="উপস্থিতি রিপোর্ট" subtitle="সেকশন ও বিষয় অনুযায়ী উপস্থিতির তথ্য দেখুন" />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:w-2/3">
        <Select label="সেকশন" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">সব সেকশন</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.semester?.department?.name} - {s.semester?.name} - {s.name}</option>)}
        </Select>
        <Select label="বিষয়" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">সব বিষয়</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      <Card>
        {records.length === 0 ? (
          <EmptyState title="কোনো তথ্য নেই" subtitle="উপরের ফিল্টার পরিবর্তন করে দেখুন" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
              <tr><th className="px-4 py-3">তারিখ</th><th className="px-4 py-3">শিক্ষার্থী</th><th className="px-4 py-3">বিষয়</th><th className="px-4 py-3">সেকশন</th><th className="px-4 py-3">অবস্থা</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-900/5">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono-tab">{r.date}</td>
                  <td className="px-4 py-3 font-medium text-navy-900">{r.student?.name}</td>
                  <td className="px-4 py-3">{r.subject?.name}</td>
                  <td className="px-4 py-3">{r.section?.name}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
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
