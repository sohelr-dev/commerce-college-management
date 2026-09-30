'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Trash2, UserPlus, Layers, Edit, CheckSquare, Settings } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';

const TABS = [
  { key: 'departments', label: 'বিভাগ' },
  { key: 'semesters', label: 'বর্ষ' },
  { key: 'sections', label: 'সেকশন' },
  { key: 'subjects', label: 'বিষয় ও মার্কস কনফিগারেশন' },
  { key: 'selection_groups', label: 'গুচ্ছ (ক/খ)' },
  { key: 'grade_scales', label: 'গ্রেড ও জিপিএ স্কেল' },
];

const CATEGORY_LABEL = { compulsory: 'আবশ্যিক', group_a: 'ক-গুচ্ছ', group_b: 'খ-গুচ্ছ (৪র্থ বিষয়)' };
const CATEGORY_TONE = { compulsory: 'neutral', group_a: 'gold', group_b: 'warn' };

export default function AcademicSetup() {
  const [tab, setTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectionGroups, setSelectionGroups] = useState([]);
  const [gradeScales, setGradeScales] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({});

  const [form, setForm] = useState({});
  const [subjectFormTab, setSubjectFormTab] = useState('basic');
  const [groupForm, setGroupForm] = useState({ code: 'group_a', required_count: 1, is_mandatory_pass: true, subject_ids: [] });
  const [gradeForm, setGradeForm] = useState({ min_percentage: 0, max_percentage: 100, grade_letter: 'A+', grade_point: 5.00, remarks: '', sort_order: 1 });
  const [editingGrade, setEditingGrade] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const GRADING_PRESETS = {
    english: {
      label: 'বাংলা ২য় পত্র / ইংরেজি ১ম ও ২য় পত্র — শুধু Written ১০০, পাস ৩৩ (কোনো MCQ নেই)',
      full_marks: 100, full_marks_written: 100, full_marks_mcq: 0, full_marks_practical: 0,
      pass_marks_overall: 33, pass_marks_written: 33, pass_marks_mcq: 0, pass_marks_practical: 0,
      require_overall_pass: true, require_written_pass: false, require_mcq_pass: false, require_practical_pass: false,
    },
    ict_home_science: {
      label: 'ICT / গার্হস্থ্য বিজ্ঞান — Written ৫০ (পাস ১৭) + MCQ ২৫ (পাস ৮) + Practical ২৫ (পাস ৮)',
      full_marks: 100, full_marks_written: 50, full_marks_mcq: 25, full_marks_practical: 25,
      pass_marks_overall: 33, pass_marks_written: 17, pass_marks_mcq: 8, pass_marks_practical: 8,
      require_overall_pass: true, require_written_pass: true, require_mcq_pass: true, require_practical_pass: true,
    },
    general: {
      label: 'সাধারণ বিষয় / বাংলা ১ম পত্র — Written ৭০ (পাস ২৩) + MCQ ৩০ (পাস ১০)',
      full_marks: 100, full_marks_written: 70, full_marks_mcq: 30, full_marks_practical: 0,
      pass_marks_overall: 33, pass_marks_written: 23, pass_marks_mcq: 10, pass_marks_practical: 0,
      require_overall_pass: true, require_written_pass: true, require_mcq_pass: true, require_practical_pass: false,
    },
  };

  const applyGradingPreset = (type) => {
    if (!GRADING_PRESETS[type]) return;
    const preset = GRADING_PRESETS[type];
    setForm((f) => ({ ...f, grading_type: type, ...preset }));
  };

  const loadAll = () => {
    api.get('/departments').then((r) => setDepartments(r.data));
    api.get('/semesters').then((r) => setSemesters(r.data));
    api.get('/sections').then((r) => setSections(r.data));
    api.get('/subjects').then((r) => setSubjects(r.data));
    api.get('/subject-selection-groups').then((r) => setSelectionGroups(r.data));
    api.get('/grade-scales').then((r) => setGradeScales(r.data.data || []));
    api.get('/users', { params: { role: 'teacher', per_page: 100 } }).then((r) => setTeachers(r.data.data));
  };

  useEffect(loadAll, []);

  const openSubjectModal = (sub = null) => {
    setError('');
    setEditingSubject(sub);
    setSubjectFormTab('basic');
    if (sub) {
      setForm({
        department_id: sub.department_id,
        semester_id: sub.semester_id,
        name: sub.name,
        code: sub.code,
        credit: sub.credit || 3,
        full_marks: sub.full_marks || 100,
        full_marks_written: sub.full_marks_written ?? 70,
        full_marks_mcq: sub.full_marks_mcq ?? 30,
        full_marks_practical: sub.full_marks_practical ?? 0,
        pass_marks_overall: sub.pass_marks_overall ?? 33,
        pass_marks_written: sub.pass_marks_written ?? 23,
        pass_marks_mcq: sub.pass_marks_mcq ?? 10,
        pass_marks_practical: sub.pass_marks_practical ?? 0,
        require_overall_pass: sub.require_overall_pass ?? true,
        require_written_pass: sub.require_written_pass ?? true,
        require_mcq_pass: sub.require_mcq_pass ?? true,
        require_practical_pass: sub.require_practical_pass ?? false,
        subject_category: sub.subject_category || 'compulsory',
        subject_type: sub.subject_type || 'compulsory',
        parent_subject_id: sub.parent_subject_id || '',
      });
    } else {
      setForm({
        full_marks: 100,
        full_marks_written: 70,
        full_marks_mcq: 30,
        full_marks_practical: 0,
        pass_marks_overall: 33,
        pass_marks_written: 23,
        pass_marks_mcq: 10,
        pass_marks_practical: 0,
        require_overall_pass: true,
        require_written_pass: true,
        require_mcq_pass: true,
        require_practical_pass: false,
        subject_category: 'compulsory',
        subject_type: 'compulsory',
        credit: 3,
      });
    }
    setModalOpen(true);
  };

  const openModal = () => {
    setError('');
    if (tab === 'subjects') {
      openSubjectModal(null);
      return;
    }
    if (tab === 'selection_groups') {
      setGroupForm({ code: 'group_a', required_count: 1, is_mandatory_pass: true, subject_ids: [] });
    } else if (tab === 'grade_scales') {
      setEditingGrade(null);
      setGradeForm({ min_percentage: 80, max_percentage: 100, grade_letter: 'A+', grade_point: 5.00, remarks: '', sort_order: (gradeScales.length + 1) });
    } else if (tab === 'semesters') {
      setForm({ order: semesters.length + 1 });
    } else {
      setForm({});
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (tab === 'selection_groups') {
        await api.post('/subject-selection-groups', groupForm);
        showSuccess('গুচ্ছ তৈরি হয়েছে');
      } else if (tab === 'grade_scales') {
        if (editingGrade) {
          await api.put(`/grade-scales/${editingGrade.id}`, gradeForm);
          showSuccess('গ্রেড আপডেট করা হয়েছে');
        } else {
          await api.post('/grade-scales', gradeForm);
          showSuccess('নতুন গ্রেড স্কেল তৈরি হয়েছে');
        }
      } else if (tab === 'subjects') {
        if (editingSubject) {
          await api.put(`/subjects/${editingSubject.id}`, form);
          showSuccess('বিষয় ও পাস রুলস আপডেট হয়েছে');
        } else {
          await api.post('/subjects', form);
          showSuccess('নতুন বিষয় যুক্ত হয়েছে');
        }
      } else {
        await api.post(`/${tab}`, form);
        showSuccess('সংরক্ষণ সফল হয়েছে');
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে। সব তথ্য ঠিক আছে কিনা দেখুন।');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('আপনি কি নিশ্চিত মুছে ফেলতে চান?');
    if (!confirmed) return;
    const endpoint = tab === 'selection_groups' ? 'subject-selection-groups' : tab === 'grade_scales' ? 'grade-scales' : tab;
    await api.delete(`/${endpoint}/${id}`);
    showSuccess('মুছে ফেলা হয়েছে');
    loadAll();
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    await api.post(`/subjects/${assignModal.id}/assign-teacher`, assignForm);
    setAssignModal(null);
    showSuccess('শিক্ষক নিয়োগ সম্পন্ন হয়েছে');
    loadAll();
  };

  // ═══ ফিক্স: এখন সেমিস্টার + গুচ্ছের code (group_a/group_b) দুটো দিয়েই ফিল্টার হয় ═══
  // এর মানে "ক-গুচ্ছ" বানানোর সময় শুধু ঐ বিষয়গুলোই দেখাবে যেগুলোর subject_category = group_a করে রাখা আছে।
  // ফলে ভুলবশত "আবশ্যিক" বিষয় আর কখনো গুচ্ছের পুলে যোগ করা যাবে না।
  const semesterSubjects = subjects.filter(
    (s) =>
      (!groupForm.semester_id || String(s.semester_id) === String(groupForm.semester_id)) &&
      s.subject_category === groupForm.code
  );

  const toggleGroupSubject = (id) => {
    setGroupForm((f) => {
      const has = f.subject_ids.includes(id);
      return { ...f, subject_ids: has ? f.subject_ids.filter((x) => x !== id) : [...f.subject_ids, id] };
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="বিভাগ, বিষয় ও পাস রুলস কনফিগারেশন"
        subtitle="বিভাগ, বর্ষ, বিষয়ভিত্তিক লিখিত/MCQ/প্যাক্টিক্যাল পাস রুলস ও জিপিএ স্কেল পরিচালনা করুন"
        action={
          <Button onClick={openModal} className="bg-gold-500 text-navy-950 font-bold">
            <Plus size={16} /> নতুন যোগ করুন
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-navy-900/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              tab === t.key
                ? 'border-gold-500 text-navy-950 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-t-xl'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'departments' && (
        <Card>
          {departments.length === 0 ? (
            <EmptyState title="কোনো বিভাগ নেই" subtitle="নতুন যোগ করুন বাটনে ক্লিক করে একটি বিভাগ তৈরি করুন" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">নাম</th>
                    <th className="px-4 py-3">কোড</th>
                    <th className="px-4 py-3">বর্ষ সংখ্যা</th>
                    <th className="px-4 py-3">মোট বিষয়</th>
                    <th className="px-4 py-3 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {departments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-navy-900">{d.name}</td>
                      <td className="px-4 py-3"><Badge tone="gold">{d.code}</Badge></td>
                      <td className="px-4 py-3 font-mono-tab">{d.semesters_count}</td>
                      <td className="px-4 py-3 font-mono-tab">{d.subjects_count}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(d.id)} className="text-danger-600 hover:opacity-70 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'semesters' && (
        <Card>
          {semesters.length === 0 ? (
            <EmptyState title="কোনো বর্ষ নেই" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">বর্ষের নাম</th>
                    <th className="px-4 py-3">বিভাগ</th>
                    <th className="px-4 py-3">সেশন</th>
                    <th className="px-4 py-3">ক্রম</th>
                    <th className="px-4 py-3 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {semesters.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-navy-900">{s.name}</td>
                      <td className="px-4 py-3">{s.department?.name}</td>
                      <td className="px-4 py-3 font-mono-tab">{s.session || 'N/A'}</td>
                      <td className="px-4 py-3 font-mono-tab">{s.order ?? '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(s.id)} className="text-danger-600 hover:opacity-70 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'sections' && (
        <Card>
          {sections.length === 0 ? (
            <EmptyState title="কোনো সেকশন নেই" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">সেকশন</th>
                    <th className="px-4 py-3">বর্ষ</th>
                    <th className="px-4 py-3">বিভাগ</th>
                    <th className="px-4 py-3">শিক্ষার্থী সংখ্যা</th>
                    <th className="px-4 py-3 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {sections.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-navy-900">{s.name}</td>
                      <td className="px-4 py-3">{s.semester?.name}</td>
                      <td className="px-4 py-3">{s.semester?.department?.name}</td>
                      <td className="px-4 py-3 font-mono-tab">{s.students_count}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(s.id)} className="text-danger-600 hover:opacity-70 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'subjects' && (
        <Card>
          {subjects.length === 0 ? (
            <EmptyState title="কোনো বিষয় তৈরি করা হয়নি" subtitle="নতুন যোগ করুন বাটনে ক্লিক করে বিষয়ে নম্বর ও পাস রুলস সেটআপ করুন" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-600 font-bold bg-slate-100">
                  <tr>
                    <th className="px-4 py-3">বিষয় ও কোড</th>
                    <th className="px-4 py-3">বিভাগ ও বর্ষ</th>
                    <th className="px-4 py-3">মোট মার্কস</th>
                    <th className="px-4 py-3">CQ / MCQ / Practical</th>
                    <th className="px-4 py-3">পাস মার্কস রুলস</th>
                    <th className="px-4 py-3">ক্যাটেগরি</th>
                    <th className="px-4 py-3">শিক্ষক</th>
                    <th className="px-4 py-3 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/5">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <p className="font-bold text-navy-950">{s.name}</p>
                        <span className="text-xs text-slate-500 font-mono">কোড: {s.code}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-slate-800">{s.department?.name}</p>
                        <p className="text-slate-500">{s.semester?.name}</p>
                      </td>
                      <td className="px-4 py-3 font-bold text-navy-900 font-mono-tab">
                        {s.full_marks || 100}
                      </td>
                      <td className="px-4 py-3 text-xs space-y-0.5">
                        <p><span className="font-bold text-slate-700">CQ:</span> {s.full_marks_written ?? 70}</p>
                        <p><span className="font-bold text-slate-700">MCQ:</span> {s.full_marks_mcq ?? 30}</p>
                        {s.full_marks_practical > 0 && (
                          <p><span className="font-bold text-gold-600">Practical:</span> {s.full_marks_practical}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs space-y-1">
                        <p className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                          Overall Pass: {s.pass_marks_overall || 33}
                        </p>
                        <div className="text-[11px] text-slate-600 space-x-1">
                          {s.require_written_pass && <span>CQ: {s.pass_marks_written || 23}</span>}
                          {s.require_mcq_pass && <span>• MCQ: {s.pass_marks_mcq || 10}</span>}
                          {s.require_practical_pass && <span>• Practical: {s.pass_marks_practical || 8}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={CATEGORY_TONE[s.subject_category] || 'neutral'}>
                          {CATEGORY_LABEL[s.subject_category] || 'আবশ্যিক'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {s.teachers?.length ? (
                          s.teachers.map((t) => t.name).join(', ')
                        ) : (
                          <span className="text-slate-400 font-medium">নিয়োগ নেই</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openSubjectModal(s)}
                          className="p-1.5 text-navy-900 bg-slate-100 hover:bg-navy-900 hover:text-white rounded-lg transition"
                          title="সম্পাদনা ও মার্কস কনফিগারেশন"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => { setAssignModal(s); setAssignForm({}); }}
                          className="p-1.5 text-navy-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                          title="শিক্ষক নিয়োগ"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-lg"
                          title="মুছুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'selection_groups' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 bg-white p-4 rounded-xl border">
            <Layers size={16} className="mr-1.5 inline text-gold-500" />
            "ক-গুচ্ছ" ও "খ-গুচ্ছ" এখানে সংজ্ঞায়িত করুন — ছাত্র ভর্তির সময় এই পুল থেকে নির্দিষ্ট সংখ্যক বিষয় বাছাই করবে। শুধুমাত্র সেই বিষয়গুলোই পুলে দেখানো হবে যেগুলোর ক্যাটেগরি "বিষয়" ট্যাবে ঠিক এই গুচ্ছ হিসেবেই সেট করা আছে।
          </p>
          {selectionGroups.length === 0 ? (
            <EmptyState title="কোনো গুচ্ছ তৈরি করা হয়নি" />
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-500 font-bold bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">গুচ্ছের নাম</th>
                      <th className="px-4 py-3">বিভাগ/বর্ষ</th>
                      <th className="px-4 py-3">বাছাই সংখ্যা</th>
                      <th className="px-4 py-3">পাস বাধ্যতামূলক?</th>
                      <th className="px-4 py-3">বিষয় পুল</th>
                      <th className="px-4 py-3 text-right">একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-900/5">
                    {selectionGroups.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-navy-900">{g.name}</td>
                        <td className="px-4 py-3">{g.department?.name} / {g.semester?.name}</td>
                        <td className="px-4 py-3 font-mono-tab">{g.required_count}</td>
                        <td className="px-4 py-3">
                          <Badge tone={g.is_mandatory_pass ? 'gold' : 'warn'}>
                            {g.is_mandatory_pass ? 'হ্যাঁ' : 'না (৪র্থ বিষয়)'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs">{g.subjects?.map((s) => s.name).join(', ')}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(g.id)} className="text-danger-600 hover:opacity-70 p-1">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'grade_scales' && (
        <Card className="p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h3 className="font-bold text-lg text-navy-950">গ্রেড ও জিপিএ রুলস (Dynamic Grading Scale)</h3>
              <p className="text-xs text-slate-500">বোর্ড বা কলেজের নতুন নিয়ম অনুযায়ী শতকরা হারের ওপর ভিত্তিক গ্রেড ও পয়েন্ট ডায়নামিকালি পরিবর্তন করুন</p>
            </div>
            <Button onClick={() => openModal()} className="rounded-xl bg-gold-500 font-bold text-navy-950">
              <Plus size={16} /> নতুন গ্রেড রেঞ্জ যোগ করুন
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500 font-bold bg-slate-50">
                <tr>
                  <th className="px-4 py-3">শতাংশ সীমা (Percentage Range)</th>
                  <th className="px-4 py-3">লেটার গ্রেড (Letter Grade)</th>
                  <th className="px-4 py-3">গ্রেড পয়েন্ট (GP)</th>
                  <th className="px-4 py-3">মন্তব্য (Remarks)</th>
                  <th className="px-4 py-3 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {gradeScales.map((gs) => (
                  <tr key={gs.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono-tab font-bold text-navy-900">
                      {gs.min_percentage}% - {gs.max_percentage}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-lg font-extrabold text-sm ${gs.grade_letter === 'F' ? 'bg-danger-100 text-danger-600' : 'bg-emerald-100 text-emerald-800'}`}>
                        {gs.grade_letter}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-navy-950 font-mono-tab">
                      {Number(gs.grade_point).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{gs.remarks || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingGrade(gs);
                          setGradeForm({
                            min_percentage: gs.min_percentage,
                            max_percentage: gs.max_percentage,
                            grade_letter: gs.grade_letter,
                            grade_point: gs.grade_point,
                            remarks: gs.remarks || '',
                            sort_order: gs.sort_order || 0,
                          });
                          setModalOpen(true);
                        }}
                        className="p-1 text-navy-900 hover:bg-slate-100 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(gs.id)} className="p-1 text-danger-600 hover:bg-danger-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`কনফিগারেশন সেটিং`} wide={tab === 'subjects' || tab === 'selection_groups'}>
        <form onSubmit={handleSave} className="space-y-4">
          {tab === 'departments' && (
            <>
              <Input label="বিভাগের নাম" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="কোড (যেমন: BBA)" required onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </>
          )}

          {tab === 'semesters' && (
            <>
              <Select label="বিভাগ" required onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">নির্বাচন করুন</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
              <Input label="বর্ষের নাম (যেমন: ১ম বর্ষ)" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="সেশন (যেমন: 2025-2026)" onChange={(e) => setForm({ ...form, session: e.target.value })} />
              <Input
                label="ক্রম (Order) *"
                type="number"
                required
                value={form.order ?? ''}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              />
            </>
          )}

          {tab === 'sections' && (
            <>
              <Select label="বর্ষ" required onChange={(e) => setForm({ ...form, semester_id: e.target.value })}>
                <option value="">নির্বাচন করুন</option>
                {semesters.map((s) => <option key={s.id} value={s.id}>{s.department?.name} - {s.name}</option>)}
              </Select>
              <Input label="সেকশনের নাম (যেমন: A)" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </>
          )}

          {tab === 'subjects' && (
            <div className="space-y-4">
              <div className="flex border-b gap-2">
                <button
                  type="button"
                  onClick={() => setSubjectFormTab('basic')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition ${subjectFormTab === 'basic' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  ১. মূল তথ্য
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFormTab('marks')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition ${subjectFormTab === 'marks' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  ২. নম্বর বণ্টন (Marks Breakdown)
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectFormTab('pass')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition ${subjectFormTab === 'pass' ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  ৩. পাস রুলস (Pass Rules)
                </button>
              </div>

              {subjectFormTab === 'basic' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="বিভাগ *" required value={form.department_id || ''} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                      <option value="">নির্বাচন করুন</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </Select>
                    <Select label="বর্ষ *" required value={form.semester_id || ''} onChange={(e) => setForm({ ...form, semester_id: e.target.value })}>
                      <option value="">নির্বাচন করুন</option>
                      {semesters.map((s) => <option key={s.id} value={s.id}>{s.department?.name} - {s.name}</option>)}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input label="বিষয়ের নাম *" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="যেমন: বাংলা ২য় পত্র" />
                    <Input label="বিষয় কোড *" required value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="যেমন: 102" />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-emerald-800">⚡ বিষয়ের ধরন অনুযায়ী নম্বর বিভাজন ও পাস রুলস Auto-Fill</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.entries(GRADING_PRESETS).map(([key, preset]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyGradingPreset(key)}
                          className={`text-left p-3 rounded-xl border-2 text-xs transition ${
                            form.grading_type === key
                              ? 'border-emerald-500 bg-emerald-100 text-emerald-900 font-bold'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <span className="block font-bold text-[11px] mb-1">
                            {key === 'english' ? '🟦 বাংলা / ইংরেজি' : key === 'ict_home_science' ? '🟨 ICT / গার্হস্থ্য' : '🟩 সাধারণ বিষয়'}
                          </span>
                          <span className="text-[10px] text-slate-500 leading-snug block">{preset.label.split('—')[1]?.trim()}</span>
                        </button>
                      ))}
                    </div>
                    {form.grading_type && (
                      <p className="text-xs text-emerald-700 font-medium">✓ {GRADING_PRESETS[form.grading_type]?.label} — নম্বর ও পাস রুলস ট্যাবে auto-fill হয়েছে</p>
                    )}
                  </div>

                  {/* ═══ ফিক্স: ২ অপশনের বদলে ৩ অপশনের ক্যাটেগরি সিলেক্ট ═══ */}
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="বিষয়ের ক্যাটেগরি (Subject Category) *"
                      required
                      value={form.subject_category || 'compulsory'}
                      onChange={(e) => {
                        const category = e.target.value;
                        setForm({
                          ...form,
                          subject_category: category,
                          subject_type: category === 'group_b' ? 'optional' : 'compulsory',
                        });
                      }}
                    >
                      <option value="compulsory">আবশ্যিক (সবার জন্য বাধ্যতামূলক)</option>
                      <option value="group_a">ক-গুচ্ছ (নির্বাচনী, পাস বাধ্যতামূলক)</option>
                      <option value="group_b">খ-গুচ্ছ / ৪র্থ বিষয় (ফেল করলেও ওভারঅল ফেল হবে না)</option>
                    </Select>

                    <Select label="প্যারেন্ট সাবজেক্ট (Paper-wise Support)" value={form.parent_subject_id || ''} onChange={(e) => setForm({ ...form, parent_subject_id: e.target.value })}>
                      <option value="">কোনো প্যারেন্ট নেই (একক বিষয়)</option>
                      {subjects.filter((s) => s.id !== editingSubject?.id).map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </Select>
                  </div>

                  {form.subject_category && form.subject_category !== 'compulsory' && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      ℹ️ এই বিষয়টি সেভ করার পর "গুচ্ছ (ক/খ)" ট্যাবে গিয়ে এটাকে {form.subject_category === 'group_a' ? 'ক-গুচ্ছ' : 'খ-গুচ্ছ'}-এর পুলে যোগ করুন, নাহলে ছাত্র ভর্তির ফর্মে এটা দেখাবে না।
                    </p>
                  )}
                </div>
              )}

              {subjectFormTab === 'marks' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border">
                  <h4 className="font-bold text-sm text-navy-950 border-b pb-2">নম্বর বণ্টন কনফিগারেশন (Total & Section Marks)</h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সর্বমোট নম্বর (Total Subject Marks) *</label>
                    <input
                      type="number"
                      required
                      value={form.full_marks ?? 100}
                      onChange={(e) => setForm({ ...form, full_marks: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold outline-none focus:border-navy-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Written / CQ Marks</label>
                      <input
                        type="number"
                        value={form.full_marks_written ?? 70}
                        onChange={(e) => setForm({ ...form, full_marks_written: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                        placeholder="যেমন: 70"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">MCQ Marks</label>
                      <input
                        type="number"
                        value={form.full_marks_mcq ?? 30}
                        onChange={(e) => setForm({ ...form, full_marks_mcq: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                        placeholder="যেমন: 30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Practical Marks</label>
                      <input
                        type="number"
                        value={form.full_marks_practical ?? 0}
                        onChange={(e) => setForm({ ...form, full_marks_practical: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                        placeholder="যেমন: 25 (না থাকলে 0)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {subjectFormTab === 'pass' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border">
                  <h4 className="font-bold text-sm text-navy-950 border-b pb-2">পাস মার্কস ও সেকশন রুলস (Subject Pass Rules)</h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সর্বমোট পাস মার্ক (Overall Minimum Pass Mark)</label>
                    <input
                      type="number"
                      value={form.pass_marks_overall ?? 33}
                      onChange={(e) => setForm({ ...form, pass_marks_overall: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-emerald-800 outline-none focus:border-navy-900"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.require_written_pass ?? true}
                          onChange={(e) => setForm({ ...form, require_written_pass: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-navy-900"
                        />
                        CQ / Written অংশে আলাদা পাস লাগবে
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">পাস মার্ক:</span>
                        <input
                          type="number"
                          value={form.pass_marks_written ?? 23}
                          onChange={(e) => setForm({ ...form, pass_marks_written: parseFloat(e.target.value) || 0 })}
                          className="w-20 rounded-lg border border-slate-300 p-1 text-xs text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.require_mcq_pass ?? true}
                          onChange={(e) => setForm({ ...form, require_mcq_pass: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-navy-900"
                        />
                        MCQ অংশে আলাদা পাস লাগবে
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">পাস মার্ক:</span>
                        <input
                          type="number"
                          value={form.pass_marks_mcq ?? 10}
                          onChange={(e) => setForm({ ...form, pass_marks_mcq: parseFloat(e.target.value) || 0 })}
                          className="w-20 rounded-lg border border-slate-300 p-1 text-xs text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.require_practical_pass ?? false}
                          onChange={(e) => setForm({ ...form, require_practical_pass: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-navy-900"
                        />
                        Practical অংশে আলাদা পাস লাগবে
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">পাস মার্ক:</span>
                        <input
                          type="number"
                          value={form.pass_marks_practical ?? 8}
                          onChange={(e) => setForm({ ...form, pass_marks_practical: parseFloat(e.target.value) || 0 })}
                          className="w-20 rounded-lg border border-slate-300 p-1 text-xs text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'selection_groups' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Select label="বিভাগ" required value={groupForm.department_id || ''} onChange={(e) => setGroupForm({ ...groupForm, department_id: e.target.value })}>
                  <option value="">নির্বাচন করুন</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                <Select label="বর্ষ" required value={groupForm.semester_id || ''} onChange={(e) => setGroupForm({ ...groupForm, semester_id: e.target.value, subject_ids: [] })}>
                  <option value="">নির্বাচন করুন</option>
                  {semesters.map((s) => <option key={s.id} value={s.id}>{s.department?.name} - {s.name}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Select
                  label="গুচ্ছ"
                  value={groupForm.code}
                  onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value, is_mandatory_pass: e.target.value === 'group_a', subject_ids: [] })}
                >
                  <option value="group_a">ক-গুচ্ছ</option>
                  <option value="group_b">খ-গুচ্ছ (৪র্থ বিষয়)</option>
                </Select>
                <Input label="গুচ্ছের নাম" required value={groupForm.name || ''} placeholder="ক-গুচ্ছ" onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} />
                <Input label="কয়টি বাছাই করতে হবে" type="number" min={1} value={groupForm.required_count} onChange={(e) => setGroupForm({ ...groupForm, required_count: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  বিষয় নির্বাচন করুন (Subject Pool) * — শুধু "{groupForm.code === 'group_a' ? 'ক-গুচ্ছ' : 'খ-গুচ্ছ'}" ক্যাটেগরির বিষয় দেখানো হচ্ছে
                </label>
                {!groupForm.semester_id ? (
                  <p className="text-xs text-slate-400 bg-slate-50 border rounded-xl p-3">আগে উপরে থেকে "বর্ষ" নির্বাচন করুন, তাহলে সেই বর্ষের বিষয়গুলো এখানে দেখাবে।</p>
                ) : semesterSubjects.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    এই বর্ষে "{groupForm.code === 'group_a' ? 'ক-গুচ্ছ' : 'খ-গুচ্ছ'}" ক্যাটেগরির কোনো বিষয় নেই। আগে "বিষয় ও মার্কস কনফিগারেশন" ট্যাবে গিয়ে সংশ্লিষ্ট বিষয়ের ক্যাটেগরি এটা হিসেবে সেট করুন।
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-xl p-3">
                    {semesterSubjects.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-xs bg-slate-50 hover:bg-slate-100 rounded-lg p-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={groupForm.subject_ids.includes(s.id)}
                          onChange={() => toggleGroupSubject(s.id)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        {s.name} <span className="text-slate-400">({s.code})</span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-500">নির্বাচিত: {groupForm.subject_ids.length} টি বিষয়</p>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={groupForm.is_mandatory_pass} onChange={(e) => setGroupForm({ ...groupForm, is_mandatory_pass: e.target.checked })} />
                পাস করা বাধ্যতামূলক (আনচেক করলে এটি ৪ নম্বর বিষয় হিসেবে গণ্য হবে)
              </label>
            </>
          )}

          {tab === 'grade_scales' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সর্বনিম্ন % (Min %)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={gradeForm.min_percentage}
                    onChange={(e) => setGradeForm({ ...gradeForm, min_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সর্বোচ্চ % (Max %)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={gradeForm.max_percentage}
                    onChange={(e) => setGradeForm({ ...gradeForm, max_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">লেটার গ্রেড (e.g. A+)</label>
                  <input
                    type="text"
                    required
                    value={gradeForm.grade_letter}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade_letter: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm font-bold outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">গ্রেড পয়েন্ট (GP e.g. 5.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={gradeForm.grade_point}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade_point: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-sm font-bold outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মন্তব্য (Remarks)</label>
                <input
                  type="text"
                  value={gradeForm.remarks}
                  onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-navy-900"
                  placeholder="যেমন: Outstanding, Excellent"
                />
              </div>
            </div>
          )}

          {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">{error}</p>}

          <Button type="submit" className="w-full rounded-xl py-3 bg-navy-900 text-white font-bold" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </Button>
        </form>
      </Modal>

      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={`"${assignModal?.name}" এর জন্য শিক্ষক নিয়োগ`}>
        <form onSubmit={handleAssignTeacher} className="space-y-3">
          <Select label="শিক্ষক" required onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Select label="সেকশন" required onChange={(e) => setAssignForm({ ...assignForm, section_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {sections.filter((sec) => sec.semester_id === assignModal?.semester_id).map((sec) => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
          </Select>
          <Button type="submit" className="w-full rounded-xl bg-navy-900 text-white font-bold">নিয়োগ করুন</Button>
        </form>
      </Modal>
    </div>
  );
}