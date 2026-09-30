'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Select, Badge } from '@/components/ui';

/* =====================================================================
   HSC পাস / গ্রেড ক্যালকুলেশন (frontend preview - backend-ও হিসাব করে)
   ===================================================================== */
function calcHscPassFail(subject, written, mcq, practical) {
  if (written === null && mcq === null && practical === null) return null;

  const w   = parseFloat(written)   || 0;
  const m   = parseFloat(mcq)       || 0;
  const p   = parseFloat(practical) || 0;
  const total = w + m + p;

  const reasons = [];

  // Written পাস চেক
  if (subject.require_written_pass && (subject.full_marks_written ?? 0) > 0) {
    const passW = subject.pass_marks_written ?? 23;
    if (w < passW) reasons.push(`CQ/লিখিত ন্যূনতম ${passW} দরকার (পেয়েছে ${w})`);
  }

  // MCQ পাস চেক
  if (subject.require_mcq_pass && (subject.full_marks_mcq ?? 0) > 0) {
    const passM = subject.pass_marks_mcq ?? 10;
    if (m < passM) reasons.push(`MCQ ন্যূনতম ${passM} দরকার (পেয়েছে ${m})`);
  }

  // Practical পাস চেক
  if (subject.require_practical_pass && (subject.full_marks_practical ?? 0) > 0) {
    const passP = subject.pass_marks_practical ?? 0;
    if (p < passP) reasons.push(`Practical ন্যূনতম ${passP} দরকার (পেয়েছে ${p})`);
  }

  // Overall পাস চেক
  if (subject.require_overall_pass !== false) {
    const passOverall = subject.pass_marks_overall || 33;
    if (total < passOverall) reasons.push(`মোট ন্যূনতম ${passOverall} দরকার (পেয়েছে ${total})`);
  }

  return { is_pass: reasons.length === 0, reasons, total };
}

function getGrade(percentage, isPass) {
  if (!isPass) return { grade: 'F', gp: 0 };
  if (percentage >= 80) return { grade: 'A+', gp: 5.0 };
  if (percentage >= 70) return { grade: 'A',  gp: 4.0 };
  if (percentage >= 60) return { grade: 'A-', gp: 3.5 };
  if (percentage >= 50) return { grade: 'B',  gp: 3.0 };
  if (percentage >= 40) return { grade: 'C',  gp: 2.0 };
  if (percentage >= 33) return { grade: 'D',  gp: 1.0 };
  return { grade: 'F', gp: 0 };
}

/* =====================================================================
   Step Indicator Component
   ===================================================================== */
function StepIndicator({ current }) {
  const steps = [
    { num: 1, label: 'পরীক্ষা নির্বাচন' },
    { num: 2, label: 'Section নির্বাচন' },
    { num: 3, label: 'বিষয় নির্বাচন' },
    { num: 4, label: 'নম্বর এন্ট্রি' },
  ];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                current >= s.num
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              {current > s.num ? '✓' : s.num}
            </div>
            <span className={`text-[10px] mt-1 font-medium text-center ${current >= s.num ? 'text-navy-900' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 -mt-4 ${current > s.num ? 'bg-navy-900' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
   Main Component
   ===================================================================== */
export default function EnterResults() {
  // ─── State ──────────────────────────────────────────────────────────
  const [exams,              setExams]              = useState([]);
  const [sectionsWithSubs,   setSectionsWithSubs]   = useState([]);   // teacher-র sections+subjects
  const [loadingMeta,        setLoadingMeta]        = useState(true);

  const [examId,             setExamId]             = useState('');
  const [sectionId,          setSectionId]          = useState('');
  const [subjectId,          setSubjectId]          = useState('');

  const [students,           setStudents]           = useState([]);
  const [loadingStudents,    setLoadingStudents]     = useState(false);

  const [saving,             setSaving]             = useState(false);
  const [saved,              setSaved]              = useState(false);
  const [saveError,          setSaveError]          = useState('');

  // ─── Derived / Memoized ─────────────────────────────────────────────
  const step = useMemo(() => {
    if (!examId)    return 1;
    if (!sectionId) return 2;
    if (!subjectId) return 3;
    return 4;
  }, [examId, sectionId, subjectId]);

  const selectedSection = useMemo(
    () => sectionsWithSubs.find(sw => String(sw.section.id) === String(sectionId)),
    [sectionsWithSubs, sectionId]
  );

  const availableSubjects = useMemo(
    () => selectedSection?.subjects ?? [],
    [selectedSection]
  );

  const selectedSubject = useMemo(
    () => availableSubjects.find(s => String(s.id) === String(subjectId)),
    [availableSubjects, subjectId]
  );

  const fullMarks = useMemo(() => {
    if (!selectedSubject) return 100;
    if (selectedSubject.full_marks > 0) return selectedSubject.full_marks;
    return (selectedSubject.full_marks_written ?? 0)
         + (selectedSubject.full_marks_mcq ?? 0)
         + (selectedSubject.full_marks_practical ?? 0) || 100;
  }, [selectedSubject]);

  const hasWritten   = selectedSubject && ((selectedSubject.full_marks_written  ?? 0) > 0 || selectedSubject.require_written_pass);
  const hasMcq       = selectedSubject && ((selectedSubject.full_marks_mcq      ?? 0) > 0 || selectedSubject.require_mcq_pass);
  const hasPractical = selectedSubject && ((selectedSubject.full_marks_practical ?? 0) > 0 || selectedSubject.require_practical_pass);

  // ─── Load metadata ──────────────────────────────────────────────────
  useEffect(() => {
    setLoadingMeta(true);
    Promise.all([
      api.get('/exams'),
      api.get('/my/sections-with-subjects'),
    ]).then(([examRes, secRes]) => {
      setExams(examRes.data);
      setSectionsWithSubs(secRes.data);
    }).catch(console.error)
      .finally(() => setLoadingMeta(false));
  }, []);

  // ─── Load students when all 3 selections are done ───────────────────
  const loadStudents = useCallback(() => {
    if (!examId || !sectionId || !subjectId) return;
    setLoadingStudents(true);
    setSaved(false);
    setSaveError('');
    api.get(`/exams/${examId}/results/students`, {
      params: { section_id: sectionId, subject_id: subjectId },
    })
      .then(r => setStudents(r.data))
      .catch(err => {
        console.error(err);
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [examId, sectionId, subjectId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // ─── Reset downstream selections ────────────────────────────────────
  const handleExamChange = (v) => { setExamId(v); setSectionId(''); setSubjectId(''); setStudents([]); };
  const handleSectionChange = (v) => { setSectionId(v); setSubjectId(''); setStudents([]); };
  const handleSubjectChange = (v) => { setSubjectId(v); setStudents([]); };

  // ─── Update a single student's marks field ───────────────────────────
  const updateField = (studentId, field, value) => {
    setStudents(prev =>
      prev.map(s => (s.student_id === studentId ? { ...s, [field]: value } : s))
    );
  };

  // ─── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      const records = students
        .filter(s =>
          (s.marks_written  !== '' && s.marks_written  !== null && s.marks_written  !== undefined) ||
          (s.marks_mcq      !== '' && s.marks_mcq      !== null && s.marks_mcq      !== undefined) ||
          (s.marks_practical!== '' && s.marks_practical!== null && s.marks_practical!== undefined)
        )
        .map(s => ({
          student_id:      s.student_id,
          marks_written:   s.marks_written   === '' || s.marks_written   == null ? null : s.marks_written,
          marks_mcq:       s.marks_mcq       === '' || s.marks_mcq       == null ? null : s.marks_mcq,
          marks_practical: s.marks_practical === '' || s.marks_practical == null ? null : s.marks_practical,
        }));

      if (records.length === 0) {
        setSaveError('কোনো নম্বর এন্ট্রি করা হয়নি।');
        return;
      }

      await api.post(`/exams/${examId}/results/bulk`, {
        subject_id: subjectId,
        records,
      });
      setSaved(true);
      loadStudents(); // reload with calculated grade
    } catch (err) {
      setSaveError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────
  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <svg className="animate-spin w-6 h-6 mr-2 text-navy-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ফলাফল এন্ট্রি"
        subtitle="পরীক্ষা → Section → বিষয় নির্বাচন করুন, তারপর নম্বর দিন — পাস/ফেল ও GPA স্বয়ংক্রিয়ভাবে হিসাব হবে"
      />

      {/* Step Indicator */}
      <StepIndicator current={step} />

      {/* ── Step 1: Exam ── */}
      <Card className="p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
          ধাপ ১ — পরীক্ষা নির্বাচন করুন
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {exams.length === 0 ? (
            <p className="text-sm text-slate-500 col-span-3">কোনো পরীক্ষা পাওয়া যায়নি। Admin প্যানেল থেকে পরীক্ষা তৈরি করুন।</p>
          ) : (
            exams.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleExamChange(String(ex.id))}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
                  String(examId) === String(ex.id)
                    ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                    : 'border-slate-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50'
                }`}
              >
                <span className="block text-base">{ex.name}</span>
                {ex.start_date && (
                  <span className={`text-xs mt-0.5 block ${String(examId) === String(ex.id) ? 'text-white/70' : 'text-slate-400'}`}>
                    {ex.start_date} থেকে
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </Card>

      {/* ── Step 2: Section ── */}
      {examId && (
        <Card className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
            ধাপ ২ — Section / Group নির্বাচন করুন
          </h3>
          {sectionsWithSubs.length === 0 ? (
            <p className="text-sm text-slate-500">
              আপনাকে কোনো section-এ assign করা হয়নি। Admin প্যানেল থেকে বিষয় assign করুন।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sectionsWithSubs.map(sw => (
                <button
                  key={sw.section.id}
                  onClick={() => handleSectionChange(String(sw.section.id))}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
                    String(sectionId) === String(sw.section.id)
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                      : 'border-slate-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50'
                  }`}
                >
                  <span className="block text-base">{sw.section.name}</span>
                  <span className={`text-xs mt-0.5 block ${String(sectionId) === String(sw.section.id) ? 'text-white/70' : 'text-slate-400'}`}>
                    {sw.section.semester?.name}
                    {sw.section.semester?.department?.name ? ` · ${sw.section.semester.department.name}` : ''}
                  </span>
                  <span className={`text-[11px] mt-1 block ${String(sectionId) === String(sw.section.id) ? 'text-white/60' : 'text-slate-400'}`}>
                    {sw.subjects.length} টি বিষয়
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Step 3: Subject ── */}
      {sectionId && (
        <Card className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">
            ধাপ ৩ — বিষয় নির্বাচন করুন
          </h3>
          {availableSubjects.length === 0 ? (
            <p className="text-sm text-slate-500">এই section-এ আপনার কোনো বিষয় নেই।</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableSubjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSubjectChange(String(s.id))}
                  className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    String(subjectId) === String(s.id)
                      ? 'border-navy-900 bg-navy-900 text-white shadow-md'
                      : 'border-slate-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50'
                  }`}
                >
                  <span className="block text-sm font-bold">{s.name}</span>
                  <span className={`text-xs mt-0.5 block font-mono ${String(subjectId) === String(s.id) ? 'text-white/70' : 'text-slate-400'}`}>
                    {s.code}
                  </span>
                  {/* HSC marks breakdown info */}
                  <div className={`flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] ${String(subjectId) === String(s.id) ? 'text-white/70' : 'text-slate-500'}`}>
                    {(s.full_marks_written ?? 0) > 0 && <span>CQ: {s.full_marks_written}</span>}
                    {(s.full_marks_mcq     ?? 0) > 0 && <span>MCQ: {s.full_marks_mcq}</span>}
                    {(s.full_marks_practical?? 0) > 0 && <span>Practical: {s.full_marks_practical}</span>}
                    <span className="font-semibold">পাস: {s.pass_marks_overall || 33}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Subject info card ── */}
      {selectedSubject && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <p className="font-bold text-emerald-900 mb-1">
            📋 {selectedSubject.name} ({selectedSubject.code}) — পূর্ণমান: {fullMarks}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-emerald-800">
            {hasWritten   && <span>✏️ CQ/লিখিত: <strong>{selectedSubject.full_marks_written ?? 70}</strong> (পাস: {selectedSubject.pass_marks_written ?? 23})</span>}
            {hasMcq       && <span>☑️ MCQ: <strong>{selectedSubject.full_marks_mcq ?? 30}</strong> (পাস: {selectedSubject.pass_marks_mcq ?? 10})</span>}
            {hasPractical && <span>🔬 Practical: <strong>{selectedSubject.full_marks_practical}</strong> (পাস: {selectedSubject.pass_marks_practical})</span>}
            <span className="font-bold text-emerald-900">মোট পাস মার্ক: {selectedSubject.pass_marks_overall || 33}</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            * প্রতিটি অংশে (CQ ও MCQ) আলাদাভাবে পাস করতে হবে এবং মোটেও পাস মার্ক পেতে হবে।
          </p>
        </div>
      )}

      {/* ── Step 4: Students table ── */}
      {subjectId && (
        <Card>
          {loadingStudents ? (
            <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
              <svg className="animate-spin w-5 h-5 text-navy-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              শিক্ষার্থী তালিকা লোড হচ্ছে...
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
              <span className="text-4xl">👥</span>
              <p className="font-medium">এই section-এ কোনো শিক্ষার্থী নেই।</p>
              <p className="text-xs text-slate-400">Admin প্যানেল থেকে শিক্ষার্থীদের এই section-এ assign করুন।</p>
            </div>
          ) : (
            <>
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h3 className="font-bold text-navy-900 text-sm">
                  ধাপ ৪ — নম্বর এন্ট্রি করুন ({students.length} জন শিক্ষার্থী)
                </h3>
                <span className="text-xs text-slate-500">
                  {selectedSection?.section?.name} · {selectedSubject?.name}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-y border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 w-16">রোল</th>
                      <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                      {hasWritten   && <th className="px-4 py-3 text-blue-700">CQ / লিখিত<br/><span className="normal-case text-[10px] font-normal text-blue-500">পূর্ণমান: {selectedSubject?.full_marks_written ?? 70} | পাস: {selectedSubject?.pass_marks_written ?? 23}</span></th>}
                      {hasMcq       && <th className="px-4 py-3 text-purple-700">MCQ<br/><span className="normal-case text-[10px] font-normal text-purple-500">পূর্ণমান: {selectedSubject?.full_marks_mcq ?? 30} | পাস: {selectedSubject?.pass_marks_mcq ?? 10}</span></th>}
                      {hasPractical && <th className="px-4 py-3 text-teal-700">Practical<br/><span className="normal-case text-[10px] font-normal text-teal-500">পূর্ণমান: {selectedSubject?.full_marks_practical} | পাস: {selectedSubject?.pass_marks_practical}</span></th>}
                      <th className="px-4 py-3">মোট</th>
                      <th className="px-4 py-3">ফলাফল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-900/5">
                    {students.map(s => {
                      // Live preview of pass/fail/grade
                      const wVal = s.marks_written   !== '' && s.marks_written   != null ? s.marks_written   : null;
                      const mVal = s.marks_mcq       !== '' && s.marks_mcq       != null ? s.marks_mcq       : null;
                      const pVal = s.marks_practical !== '' && s.marks_practical != null ? s.marks_practical : null;

                      const anyEntered = wVal !== null || mVal !== null || pVal !== null;

                      const preview = anyEntered && selectedSubject
                        ? calcHscPassFail(selectedSubject, wVal, mVal, pVal)
                        : null;

                      const total = preview ? preview.total : null;
                      const pct   = total !== null && fullMarks > 0 ? (total / fullMarks) * 100 : null;
                      const gradeInfo = preview
                        ? getGrade(pct, preview.is_pass)
                        : null;

                      // If already saved in DB and no current editing
                      const dbResult = !anyEntered && s.is_pass !== null && s.is_pass !== undefined;

                      return (
                        <tr key={s.student_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-600 text-xs">{s.roll_no}</td>
                          <td className="px-4 py-3 font-semibold text-navy-900">{s.name}</td>

                          {hasWritten && (
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={selectedSubject?.full_marks_written ?? 70}
                                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                value={s.marks_written ?? ''}
                                onChange={e => updateField(s.student_id, 'marks_written', e.target.value)}
                                placeholder="CQ"
                              />
                            </td>
                          )}
                          {hasMcq && (
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={selectedSubject?.full_marks_mcq ?? 30}
                                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                                value={s.marks_mcq ?? ''}
                                onChange={e => updateField(s.student_id, 'marks_mcq', e.target.value)}
                                placeholder="MCQ"
                              />
                            </td>
                          )}
                          {hasPractical && (
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={selectedSubject?.full_marks_practical ?? 100}
                                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-bold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                                value={s.marks_practical ?? ''}
                                onChange={e => updateField(s.student_id, 'marks_practical', e.target.value)}
                                placeholder="Prac."
                              />
                            </td>
                          )}

                          {/* Total */}
                          <td className="px-4 py-3 font-extrabold text-navy-950 text-base">
                            {total !== null ? total : (dbResult ? (s.marks_obtained ?? '-') : '-')}
                          </td>

                          {/* Result */}
                          <td className="px-4 py-3 text-xs min-w-[160px]">
                            {preview ? (
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${preview.is_pass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                                  {preview.is_pass ? `✓ PASS — ${gradeInfo?.grade} (${gradeInfo?.gp.toFixed(2)})` : `✗ FAIL — ${gradeInfo?.grade}`}
                                </span>
                                {!preview.is_pass && preview.reasons.length > 0 && (
                                  <ul className="mt-1 space-y-0.5">
                                    {preview.reasons.map((r, i) => (
                                      <li key={i} className="text-[10px] text-red-600 leading-tight">• {r}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : dbResult ? (
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${s.is_pass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                                  {s.is_pass
                                    ? `✓ PASS — ${s.grade} (${Number(s.grade_point).toFixed(2)})`
                                    : `✗ FAIL — ${s.grade}`}
                                </span>
                                {!s.is_pass && s.fail_reason && (
                                  <p className="mt-1 text-[10px] text-red-600">• {s.fail_reason}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">এন্ট্রি হয়নি</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer: save button */}
              <div className="flex items-center justify-between border-t border-navy-900/10 p-4 bg-slate-50 gap-4 flex-wrap">
                <div className="text-sm">
                  {saved && (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ফলাফল সফলভাবে সংরক্ষণ হয়েছে!
                    </span>
                  )}
                  {saveError && (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      ⚠ {saveError}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="ml-auto rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-navy-800 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'ফলাফল সংরক্ষণ করুন'}
                </button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
