'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Trash2, Edit, Eye, Image as ImageIcon, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';

/* ── current academic session auto-generate ── */
function getCurrentSession() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  // Bangladesh academic year: July–June
  if (month >= 7) return `${year}-${String(year + 1).slice(-2)}`;
  return `${year - 1}-${String(year).slice(-2)}`;
}

/* ── Check if subject is Islamic History ── */
function isIslamicHistorySubject(s) {
  if (!s) return false;
  const name = s.name || '';
  const code = String(s.code || '');
  return (
    name.includes('ইসলামের ইতিহাস') ||
    name.toLowerCase().includes('islamic history') ||
    code.includes('267') ||
    code.includes('268')
  );
}

/* ── Subject Selection Box ── */
function SubjectBox({ label, tone = 'blue', subjects = [], selected = [], max, onToggle, disabledMap = {}, readOnly = false }) {
  const colors = {
    blue: { wrap: 'border-blue-200 bg-blue-50', head: 'bg-blue-600 text-white', chip: 'bg-blue-100 border-blue-300 text-blue-800', active: 'bg-blue-600 text-white border-blue-600' },
    green: { wrap: 'border-green-200 bg-green-50', head: 'bg-green-600 text-white', chip: 'bg-green-100 border-green-300 text-green-800', active: 'bg-green-600 text-white border-green-600' },
    gray: { wrap: 'border-slate-200 bg-slate-50', head: 'bg-slate-500 text-white', chip: 'bg-white border-slate-200 text-slate-600', active: '' },
  };
  const c = colors[tone] || colors.blue;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${c.wrap} ${readOnly ? 'opacity-80' : ''}`}>
      <div className={`px-3 py-2 text-xs font-bold ${c.head} flex items-center justify-between`}>
        <span>{label}</span>
        {max && !readOnly && <span className="opacity-75">({selected.length}/{max} নির্বাচিত)</span>}
        {readOnly && <span className="opacity-75 flex items-center gap-1">🔒 লক করা</span>}
      </div>
      <div className="p-3 flex flex-wrap gap-2">
        {subjects.length === 0 && <p className="text-xs text-slate-400 w-full text-center py-2">কোনো বিষয় নেই</p>}
        {subjects.map((s) => {
          const disabledReason = disabledMap[s.id];
          const isSelected = selected.includes(s.id) && !disabledReason;
          const isMaxDisabled = !isSelected && max && selected.length >= max;
          const isDisabled = readOnly || ((isMaxDisabled || Boolean(disabledReason)) && tone !== 'gray');
          return (
            <button
              key={s.id}
              type="button"
              disabled={isDisabled}
              onClick={() => !readOnly && onToggle && !disabledReason && onToggle(s.id)}
              title={readOnly ? '২য় বর্ষে বিষয় পরিবর্তন করা যাবে না' : (disabledReason || '')}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition
                ${tone === 'gray' ? c.chip
                  : readOnly
                    ? `${isSelected ? c.active + ' opacity-90' : c.chip + ' opacity-50'} cursor-not-allowed`
                    : isSelected ? c.active
                    : `${c.chip} ${isDisabled ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' : 'hover:opacity-80 cursor-pointer'}`}`}
            >
              {tone !== 'gray' && (isSelected ? <CheckSquare size={12} /> : <Square size={12} />)}
              <span>{s.name}</span>
              {s.code && <span className="opacity-60">({s.code})</span>}
              {!readOnly && disabledReason && <span className="text-[10px] text-red-600 font-bold bg-white/90 px-1 py-0.5 rounded shadow-sm">({disabledReason})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [roleTab, setRoleTab] = useState('student');

  /* ── List state ── */
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /* ── Filter state (for list) ── */
  const [filterSession, setFilterSession] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [sessions, setSessions] = useState([]);

  /* ── Reference data ── */
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  /* ── Subject selection state ── */
  const [subjectOptions, setSubjectOptions] = useState(null); // { compulsory, groups }
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  /* ── Modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /* ── Details modal state ── */
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const openDetails = async (u) => {
    setViewingUser(u);
    setViewModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/users/${u.id}`);
      setViewingUser(res.data);
    } catch {
      // fallback to current u
    } finally {
      setLoadingDetails(false);
    }
  };

  /* ════════════════════════════════════════════
     Reference data — load once
  ════════════════════════════════════════════ */
  useEffect(() => {
    api.get('/departments').then((r) => setDepartments(r.data));
    api.get('/semesters').then((r) => setSemesters(r.data));
    api.get('/sections').then((r) => setSections(r.data));
    // session list for filter (students only)
    api.get('/students/sessions').then((r) => setSessions(r.data)).catch(() => {});
  }, []);

  /* ════════════════════════════════════════════
     Load users — with filters
  ════════════════════════════════════════════ */
  const loadUsers = useCallback(() => {
    setLoadingUsers(true);
    const params = { role: roleTab, per_page: 100 };
    if (roleTab === 'student') {
      if (filterSession) params.session = filterSession;
      if (filterYear)    params.year    = filterYear;
      if (filterDept)    params.department_id = filterDept;
    }
    api
      .get('/users', { params })
      .then((r) => setUsers(r.data.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [roleTab, filterSession, filterYear, filterDept]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  /* ════════════════════════════════════════════
     Subject options — load when dept+semester selected
  ════════════════════════════════════════════ */
  useEffect(() => {
    if (roleTab === 'student' && form.department_id && form.semester_id && !editingUser) {
      setLoadingSubjects(true);
      api
        .get('/subject-selection-options', {
          params: { department_id: form.department_id, semester_id: form.semester_id },
        })
        .then((r) => setSubjectOptions(r.data))
        .catch(() => setSubjectOptions(null))
        .finally(() => setLoadingSubjects(false));
    } else {
      setSubjectOptions(null);
    }
  }, [roleTab, form.department_id, form.semester_id, editingUser]);

  /* ════════════════════════════════════════════
     Derived / Filtered lists
  ════════════════════════════════════════════ */
  const filteredSemesters = semesters.filter(
    (s) => !form.department_id || String(s.department_id) === String(form.department_id)
  );
  const filteredSections = sections.filter(
    (s) => !form.semester_id || String(s.semester_id) === String(form.semester_id)
  );

  const groupA = subjectOptions?.groups?.find((g) => g.code === 'group_a');
  const groupB = subjectOptions?.groups?.find((g) => g.code === 'group_b');
  const selectedGroupA = Array.isArray(form.group_a_subject_ids) ? form.group_a_subject_ids : [];
  const selectedGroupB = form.group_b_subject_id ? [form.group_b_subject_id] : [];

  const toggleGroupA = (id) => {
    if (form.group_b_subject_id === id) {
      showError('এই বিষয়টি ইতিমধ্যে খ-গুচ্ছে (৪র্থ বিষয়) নির্বাচিত রয়েছে। একই বিষয় দুই গুচ্ছে নেওয়া যাবে না।');
      return;
    }
    const aSub = groupA?.subjects?.find((s) => s.id === id);
    if (isIslamicHistorySubject(aSub) && form.religion !== 'islam') {
      showError('"ইসলামের ইতিহাস ও সংস্কৃতি" বিষয়টি শুধুমাত্র মুসলিম ছাত্র-ছাত্রীদের জন্য প্রযোজ্য। হিন্দু বা অন্যান্য ধর্মের শিক্ষার্থীদের জন্য এটি প্রযোজ্য নয়।');
      return;
    }
    setForm((f) => {
      const cur = f.group_a_subject_ids || [];
      if (cur.includes(id)) return { ...f, group_a_subject_ids: cur.filter((x) => x !== id) };
      if (groupA && cur.length >= groupA.required_count) return f; // max reached
      return { ...f, group_a_subject_ids: [...cur, id] };
    });
  };

  const toggleGroupB = (id) => {
    if (selectedGroupA.includes(id)) {
      showError('এই বিষয়টি ইতিমধ্যে ক-গুচ্ছে (প্রধান বিষয়) নির্বাচিত রয়েছে। একই বিষয় দুই গুচ্ছে নেওয়া যাবে না।');
      return;
    }
    const bSub = groupB?.subjects?.find((s) => s.id === id);
    const isHomeEco = bSub && (bSub.name.includes('গার্হস্থ্য') || (bSub.code && bSub.code.includes('273')));
    if (isHomeEco && form.gender !== 'female') {
      showError('গার্হস্থ্য বিজ্ঞান বিষয়টি শুধুমাত্র ছাত্রীদের জন্য প্রযোজ্য।');
      return;
    }
    // ইসলামের ইতিহাস ও সংস্কৃতি — শুধুমাত্র মুসলিমদের জন্য
    if (isIslamicHistorySubject(bSub) && form.religion !== 'islam') {
      showError('"ইসলামের ইতিহাস ও সংস্কৃতি" বিষয়টি শুধুমাত্র মুসলিম ছাত্র-ছাত্রীদের জন্য প্রযোজ্য। হিন্দু বা অন্যান্য ধর্মের শিক্ষার্থীদের জন্য এটি প্রযোজ্য নয়।');
      return;
    }
    setForm((f) => ({
      ...f,
      group_b_subject_id: f.group_b_subject_id === id ? '' : id,
    }));
  };

  /* ════════════════════════════════════════════
     Modal open / close
  ════════════════════════════════════════════ */
  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      const sp = user.studentProfile || user.student_profile || {};
      const tp = user.teacherProfile || user.teacher_profile || {};
      setForm({
        name:     user.name || '',
        email:    user.email || '',
        phone:    user.phone || '',
        gender:   user.gender || '',
        religion: user.religion || '',
        address:  user.address || '',
        status:   user.status || 'active',
        role:     user.role,

        // Teacher fields
        designation:       tp.designation || '',
        qualification:     tp.qualification || '',
        bio:               tp.bio || '',
        subject_specialty: tp.subject_specialty || '',
        department_id:     tp.department_id || '',

        // Student fields
        roll_no:        sp.roll_no || '',
        registration_no:sp.registration_no || '',
        session:        sp.session || '',
        year:           sp.year || '1st',
        department_id:  sp.department_id || '',
        semester_id:    sp.semester_id || '',
        section_id:     sp.section_id || '',
        guardian_name:  sp.guardian_name || '',
        guardian_phone: sp.guardian_phone || '',
      });
      setAvatarPreview(user.avatar_url);
    } else {
      // New user defaults
      setForm({
        role:    roleTab,
        status:  'active',
        gender:  '',
        religion: '',
        session: getCurrentSession(),
        year:    '1st',
      });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setSubjectOptions(null);
    setError('');
    setModalOpen(true);
  };

  /* ════════════════════════════════════════════
     Save
  ════════════════════════════════════════════ */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
          if (Array.isArray(form[key])) {
            form[key].forEach((v) => fd.append(`${key}[]`, v));
          } else {
            fd.append(key, form[key]);
          }
        }
      });

      if (avatarFile) fd.append('avatar_file', avatarFile);

      if (editingUser) {
        fd.append('_method', 'PUT');
        await api.post(`/users/${editingUser.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showSuccess('ব্যবহারকারীর তথ্য আপডেট হয়েছে');
      } else {
        await api.post('/users', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showSuccess('নতুন ব্যবহারকারী সফলভাবে তৈরি হয়েছে');
      }

      setModalOpen(false);
      loadUsers();
      // Refresh session list
      api.get('/students/sessions').then((r) => setSessions(r.data)).catch(() => {});
    } catch (err) {
      const msgs = err.response?.data?.errors;
      const msg = msgs ? Object.values(msgs).flat().join(' | ') : (err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ════════════════════════════════════════════
     Delete
  ════════════════════════════════════════════ */
  const handleDelete = async (id) => {
    const ok = await showConfirm('এই ব্যবহারকারীকে মুছে ফেলবেন?');
    if (!ok) return;
    try {
      await api.delete(`/users/${id}`);
      showSuccess('মুছে ফেলা হয়েছে');
      loadUsers();
    } catch {
      showError('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  /* ════════════════════════════════════════════
     Latest session for auto-show
  ════════════════════════════════════════════ */
  const latestSession = sessions[0] || '';
  const displaySession = filterSession || latestSession;
  const otherSessions = sessions.filter((s) => s !== displaySession);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      <PageHeader
        title="শিক্ষক ও শিক্ষার্থী ব্যবস্থাপনা"
        subtitle="নতুন শিক্ষার্থী বা শিক্ষক যোগ করুন এবং তথ্য সম্পাদনা করুন"
        action={
          <Button onClick={() => openModal()} className="rounded-xl bg-gold-500 text-navy-950 font-bold">
            <Plus size={16} /> নতুন যোগ করুন
          </Button>
        }
      />

      {/* ── Role tabs ── */}
      <div className="flex gap-2 border-b border-navy-900/10">
        {[
          { key: 'student', label: 'শিক্ষার্থী' },
          { key: 'teacher', label: 'শিক্ষক' },
          { key: 'admin',   label: 'প্রশাসক' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setRoleTab(t.key); setFilterSession(''); setFilterYear(''); setFilterDept(''); }}
            className={`border-b-2 px-5 py-2.5 text-sm font-bold transition ${
              roleTab === t.key ? 'border-gold-500 text-navy-900' : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Student filters: session (latest auto-show) + year tab + dept ── */}
      {roleTab === 'student' && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-navy-900/10 bg-slate-50 px-4 py-3">
          {/* Session — latest auto-selected */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">সেশন:</span>
            <span className="rounded-lg bg-navy-900 px-3 py-1 text-xs font-bold text-white">
              {displaySession || 'লোড হচ্ছে...'}
            </span>
            {otherSessions.length > 0 && (
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="rounded-lg border border-navy-900/20 bg-white px-2 py-1 text-xs outline-none"
              >
                <option value="">— অন্য সেশন —</option>
                {sessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          {/* Year tab */}
          <div className="flex rounded-lg border border-navy-900/20 overflow-hidden">
            {['', '1st', '2nd'].map((y) => (
              <button
                key={y}
                onClick={() => setFilterYear(y)}
                className={`px-3 py-1 text-xs font-bold transition ${
                  filterYear === y ? 'bg-navy-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {y === '' ? 'সকল' : y === '1st' ? '১ম বর্ষ' : '২য় বর্ষ'}
              </button>
            ))}
          </div>

          {/* Department filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg border border-navy-900/20 bg-white px-2 py-1.5 text-xs outline-none"
          >
            <option value="">সব বিভাগ</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <span className="ml-auto text-xs text-slate-400">মোট: {users.length} জন</span>
        </div>
      )}

      {/* ── Users table ── */}
      <Card>
        {loadingUsers ? (
          <div className="py-12 text-center text-sm text-slate-400">লোড হচ্ছে...</div>
        ) : users.length === 0 ? (
          <EmptyState title="কোনো ব্যবহারকারী নেই" subtitle="নতুন যোগ করুন অথবা ফিল্টার পরিবর্তন করুন" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-slate-400 bg-slate-50">
                <tr>
                  <th className="px-4 py-3">ছবি ও নাম</th>
                  <th className="px-4 py-3">ইমেইল / ফোন</th>
                  {roleTab === 'student' && (
                    <>
                      <th className="px-4 py-3">রোল নং</th>
                      <th className="px-4 py-3">বিভাগ / সেকশন</th>
                      <th className="px-4 py-3">বর্ষ</th>
                      <th className="px-4 py-3">সেশন</th>
                    </>
                  )}
                  {roleTab === 'teacher' && (
                    <>
                      <th className="px-4 py-3">কর্মচারী আইডি</th>
                      <th className="px-4 py-3">পদবি ও বিভাগ</th>
                    </>
                  )}
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {users.map((u) => {
                  const sp = u.studentProfile || u.student_profile;
                  const tp = u.teacherProfile || u.teacher_profile;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-navy-900 flex items-center justify-center text-white shrink-0 font-bold border">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-navy-900">{u.name}</p>
                            {(u.religion || u.gender) && (
                              <span className="text-[11px] font-medium text-slate-500">
                                {u.religion === 'islam' ? 'ইসলাম' : u.religion === 'hinduism' ? 'হিন্দু' : u.religion === 'christianity' ? 'খ্রিস্টান' : u.religion === 'buddhism' ? 'বৌদ্ধ' : u.religion || ''}
                                {u.religion && u.gender ? ' • ' : ''}
                                {u.gender === 'female' ? 'ছাত্রী' : u.gender === 'male' ? 'ছাত্র' : u.gender || ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <p>{u.email}</p>
                        {u.phone && <p className="text-xs text-slate-400">{u.phone}</p>}
                      </td>
                      {roleTab === 'student' && (
                        <>
                          <td className="px-4 py-3 font-mono font-bold text-navy-900">{sp?.roll_no || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {sp?.department?.name || '—'} / {sp?.section?.name || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={sp?.year === '2nd' ? 'gold' : 'neutral'}>
                              {sp?.year === '2nd' ? '২য় বর্ষ' : '১ম বর্ষ'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{sp?.session || '—'}</td>
                        </>
                      )}
                      {roleTab === 'teacher' && (
                        <>
                          <td className="px-4 py-3 font-mono font-bold text-navy-900">{tp?.employee_id || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {tp?.designation || 'প্রভাষক'} ({tp?.department?.name || 'সাধারণ'})
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3">
                        <Badge tone={u.status === 'active' ? 'success' : 'danger'}>
                          {u.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            title="বিস্তারিত প্রোফাইল দেখুন"
                            onClick={() => openDetails(u)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="সম্পাদনা করুন"
                            onClick={() => openModal(u)}
                            className="p-1.5 text-navy-900 hover:bg-slate-200 rounded-lg transition"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="মুছে ফেলুন"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ════════════════════════════════════════════
          MODAL — Create / Edit
      ════════════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `${editingUser.name} — তথ্য সম্পাদনা` : `নতুন ${form.role === 'student' ? 'শিক্ষার্থী' : form.role === 'teacher' ? 'শিক্ষক' : 'প্রশাসক'} যোগ করুন`}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">

          {/* Avatar */}
          <div className="bg-slate-50 p-4 rounded-2xl border flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-300" size={24} />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রোফাইল ছবি আপলোড (Photo Upload)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white"
              />
            </div>
          </div>

          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="নাম *" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="ইমেইল *" type="email" required value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          {!editingUser && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Input label="পাসওয়ার্ড *" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <Input label="ফোন" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Select
                  label={form.role === 'student' ? 'শিক্ষার্থীর লিঙ্গ *' : 'লিঙ্গ'}
                  required={form.role === 'student'}
                  value={form.gender || ''}
                  onChange={(e) => {
                    const g = e.target.value;
                    setForm((prev) => {
                      const next = { ...prev, gender: g };
                      if (g !== 'female') {
                        const bSub = groupB?.subjects?.find((s) => s.id === prev.group_b_subject_id);
                        if (bSub && (bSub.name.includes('গার্হস্থ্য') || (bSub.code && bSub.code.includes('273')))) {
                          next.group_b_subject_id = '';
                        }
                      }
                      return next;
                    });
                  }}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="male">ছাত্র (Male)</option>
                  <option value="female">ছাত্রী (Female)</option>
                </Select>
              </div>
              {/* ধর্ম — মানবিক বিভাগে ইসলামের ইতিহাসের জন্য প্রয়োজন */}
              {(form.role === 'student' || roleTab === 'student') && (
                <Select
                  label="ধর্ম (Religion) *"
                  required
                  value={form.religion || ''}
                  onChange={(e) => {
                    const r = e.target.value;
                    setForm((prev) => {
                      const next = { ...prev, religion: r };
                      // যদি ইসলাম না হয় (যেমন: হিন্দু), তাহলে ক এবং খ উভয় গুচ্ছ থেকেই ইসলামের ইতিহাস বাদ দাও
                      if (r !== 'islam') {
                        const bSub = groupB?.subjects?.find((s) => s.id === prev.group_b_subject_id);
                        if (isIslamicHistorySubject(bSub)) {
                          next.group_b_subject_id = '';
                        }
                        const islamicAIds = (groupA?.subjects || [])
                          .filter(isIslamicHistorySubject)
                          .map((s) => s.id);
                        if (islamicAIds.length > 0 && Array.isArray(prev.group_a_subject_ids)) {
                          next.group_a_subject_ids = prev.group_a_subject_ids.filter((id) => !islamicAIds.includes(id));
                        }
                      }
                      return next;
                    });
                  }}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="islam">ইসলাম (Islam)</option>
                  <option value="hinduism">হিন্দু (Hinduism)</option>
                  <option value="christianity">খ্রিস্টান (Christianity)</option>
                  <option value="buddhism">বৌদ্ধ (Buddhism)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </Select>
              )}
            </>
          )}

          {editingUser && (
            <div className="grid grid-cols-3 gap-3">
              <Input label="ফোন" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Select
                label="লিঙ্গ"
                value={form.gender || ''}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">নির্বাচন করুন</option>
                <option value="male">ছাত্র (Male)</option>
                <option value="female">ছাত্রী (Female)</option>
              </Select>
              <Select label="স্ট্যাটাস" value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
              </Select>
              {editingUser.role === 'student' && (
                <Select
                  label="ধর্ম (Religion)"
                  value={form.religion || ''}
                  onChange={(e) => setForm({ ...form, religion: e.target.value })}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="islam">ইসলাম (Islam)</option>
                  <option value="hinduism">হিন্দু (Hinduism)</option>
                  <option value="christianity">খ্রিস্টান (Christianity)</option>
                  <option value="buddhism">বৌদ্ধ (Buddhism)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </Select>
              )}
            </div>
          )}

          {/* ══ STUDENT FIELDS ══ */}
          {(form.role === 'student' || roleTab === 'student') && !editingUser && (
            <>
              {/* Row 1: Department + Year (1st/2nd) + Section */}
              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="বিভাগ *"
                  required
                  value={form.department_id || ''}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value, semester_id: '', section_id: '', group_a_subject_ids: [], group_b_subject_id: '' })}
                >
                  <option value="">নির্বাচন করুন</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>

                <Select
                  label="বর্ষ (শ্রেণি) *"
                  required
                  value={form.year || '1st'}
                  onChange={(e) => setForm({ ...form, year: e.target.value, semester_id: '', section_id: '',
                    // keep subject selections intact — subjects never change between years
                  })}
                >
                  <option value="1st">১ম বর্ষ (1st Year)</option>
                  <option value="2nd">২য় বর্ষ (2nd Year)</option>
                </Select>

                <Select
                  label="সেকশন *"
                  required
                  value={form.section_id || ''}
                  onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                >
                  <option value="">নির্বাচন করুন</option>
                  {filteredSections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>

              {/* Semester (hidden label — mapped internally from year) */}
                            
              {form.department_id && (
                filteredSemesters.length > 0 ? (
                  <Select
                    label="সেমিস্টার / ক্লাস *"
                    required
                    value={form.semester_id || ''}
                    onChange={(e) => setForm({ ...form, semester_id: e.target.value, section_id: '', group_a_subject_ids: [], group_b_subject_id: '' })}
                  >
                    <option value="">নির্বাচন করুন</option>
              {filteredSemesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    এই বিভাগের জন্য এখনো কোনো বর্ষ/সেমিস্টার তৈরি করা হয়নি। আগে <strong>Academic Setup → বর্ষ</strong> ট্যাব থেকে এই বিভাগের জন্য সেমিস্টার তৈরি করুন, তারপর সেখানে বিষয় ও গুচ্ছ যোগ করুন।
                  </p>
                )
              )}

              {/* Row 2: Roll + Registration + Session */}
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="রোল নং *"
                  required
                  value={form.roll_no || ''}
                  onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                />
                <Input
                  label="রেজিস্ট্রেশন নং *"
                  required
                  value={form.registration_no || ''}
                  onChange={(e) => setForm({ ...form, registration_no: e.target.value })}
                />
                <Input
                  label="সেশন *"
                  required
                  placeholder="2026-27"
                  value={form.session || ''}
                  onChange={(e) => setForm({ ...form, session: e.target.value })}
                />
              </div>

              {/* Guardian */}
              <div className="grid grid-cols-2 gap-3">
                <Input label="অভিভাবকের নাম" value={form.guardian_name || ''} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
                <Input label="অভিভাবকের ফোন" value={form.guardian_phone || ''} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
              </div>

              {/* ══ SUBJECT SELECTION PANEL ══ */}
              {form.department_id && form.semester_id && (
                <div className="rounded-2xl border-2 border-dashed border-navy-900/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-navy-900">📚 বিষয় নির্বাচন</p>
                    {form.year === '2nd' && (
                      <span className="text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-3 py-0.5">
                        🔒 ২য় বর্ষে বিষয় পরিবর্তন করা যাবে না
                      </span>
                    )}
                  </div>

                  {/* 2nd year notice */}
                  {form.year === '2nd' && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      ℹ️ ২য় বর্ষে ১ম বর্ষের নির্বাচিত বিষয়গুলোই বহাল থাকে। নতুন করে বিষয় পরিবর্তনের সুযোগ নেই।
                      নিচে যে বিষয়গুলো নির্বাচন করছেন সেগুলোই ১ম বর্ষের বিষয় হিসেবে সংরক্ষিত হবে।
                    </p>
                  )}

                  {loadingSubjects && (
                    <p className="text-xs text-slate-400 text-center py-4">বিষয় লোড হচ্ছে...</p>
                  )}

                  {!loadingSubjects && subjectOptions && (
                    <>
                      {/* Compulsory — auto assigned, just display */}
                      {subjectOptions.compulsory?.length > 0 && (
                        <SubjectBox
                          label="আবশ্যিক বিষয় (স্বয়ংক্রিয়ভাবে যোগ হবে)"
                          tone="gray"
                          subjects={subjectOptions.compulsory}
                          selected={subjectOptions.compulsory.map((s) => s.id)}
                        />
                      )}

                      {/* Group A — নির্বাচনিক */}
                      {groupA && (
                        <SubjectBox
                          label={form.year === '2nd'
                            ? `${groupA.name} (নির্বাচিত — পরিবর্তন করা যাবে না)`
                            : `${groupA.name} (${groupA.required_count}টি নির্বাচন করুন)`}
                          tone="blue"
                          subjects={groupA.subjects || []}
                          selected={selectedGroupA}
                          max={groupA.required_count}
                          readOnly={form.year === '2nd'}
                          onToggle={form.year === '2nd' ? undefined : toggleGroupA}
                          disabledMap={(() => {
                            const mapA = {};
                            if (form.year === '2nd') {
                              // lock all — show as selected/read-only
                              return mapA;
                            }
                            if (form.group_b_subject_id) mapA[form.group_b_subject_id] = 'খ-গুচ্ছে নির্বাচিত';
                            // ইসলামের ইতিহাস — শুধু মুসলিমদের জন্য
                            (groupA.subjects || []).forEach((s) => {
                              if (isIslamicHistorySubject(s) && form.religion !== 'islam') {
                                mapA[s.id] = 'শুধুমাত্র মুসলিমদের জন্য';
                              }
                            });
                            return mapA;
                          })()}
                        />
                      )}

                      {/* Group B — ঐচ্ছিক */}
                      {groupB && (
                        <SubjectBox
                          label={form.year === '2nd'
                            ? `${groupB.name} (নির্বাচিত — পরিবর্তন করা যাবে না)`
                            : `${groupB.name} (যেকোনো ১টি নির্বাচন করুন)`}
                          tone="green"
                          subjects={groupB.subjects || []}
                          selected={selectedGroupB}
                          max={1}
                          readOnly={form.year === '2nd'}
                          onToggle={form.year === '2nd' ? undefined : toggleGroupB}
                          disabledMap={(() => {
                            const map = {};
                            if (form.year === '2nd') return map; // read-only, no disabled
                            selectedGroupA.forEach((id) => {
                              map[id] = 'ক-গুচ্ছে নির্বাচিত';
                            });
                            (groupB.subjects || []).forEach((s) => {
                              // গার্হস্থ্য বিজ্ঞান — মেয়েদের জন্য
                              const isHomeEco = s.name.includes('গার্হস্থ্য') || (s.code && s.code.includes('273'));
                              if (isHomeEco && form.gender !== 'female') {
                                map[s.id] = 'শুধুমাত্র ছাত্রীদের জন্য';
                              }
                              // ইসলামের ইতিহাস — শুধু মুসলিমদের জন্য
                              if (isIslamicHistorySubject(s) && form.religion !== 'islam') {
                                map[s.id] = 'শুধুমাত্র মুসলিমদের জন্য';
                              }
                            });
                            return map;
                          })()}
                        />
                      )}

                      {!subjectOptions.compulsory?.length && !groupA && !groupB && (
                        <p className="text-xs text-slate-400 text-center py-2">
                          এই বিভাগ ও সেমিস্টারে এখনো বিষয় সেটআপ করা হয়নি।
                          <br />Admin Panel → Academic → Subject থেকে বিষয় যোগ করুন।
                        </p>
                      )}
                    </>
                  )}

                  {!loadingSubjects && !subjectOptions && form.department_id && form.semester_id && (
                    <p className="text-xs text-slate-400 text-center py-2">বিষয় তথ্য পাওয়া যায়নি।</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* ══ STUDENT EDIT FIELDS ══ */}
          {editingUser && editingUser.role === 'student' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Input label="রোল নং" value={form.roll_no || ''} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} />
                <Input label="সেশন" value={form.session || ''} onChange={(e) => setForm({ ...form, session: e.target.value })} />
                <Select
                  label="বর্ষ"
                  value={form.year || '1st'}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                >
                  <option value="1st">১ম বর্ষ</option>
                  <option value="2nd">২য় বর্ষ</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="অভিভাবকের নাম" value={form.guardian_name || ''} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
                <Input label="অভিভাবকের ফোন" value={form.guardian_phone || ''} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} />
              </div>
            </>
          )}

          {/* ══ TEACHER FIELDS ══ */}
          {(form.role === 'teacher' || roleTab === 'teacher') && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="প্রাথমিক বিভাগ"
                  value={form.department_id || ''}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                >
                  <option value="">নির্বাচন করুন</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                {!editingUser && (
                  <Input label="কর্মচারী আইডি *" required value={form.employee_id || ''} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
                )}
                {editingUser && (
                  <Input label="বিশেষজ্ঞতা (Specialty)" value={form.subject_specialty || ''} onChange={(e) => setForm({ ...form, subject_specialty: e.target.value })} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="পদবি" placeholder="সহকারী অধ্যাপক" value={form.designation || ''} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                <Input label="শিক্ষাগত যোগ্যতা" placeholder="M.Sc in Accounting" value={form.qualification || ''} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বায়োগ্রাফি (Bio)</label>
                <textarea
                  rows={3}
                  value={form.bio || ''}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-navy-900"
                />
              </div>
            </>
          )}

          {error && <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full rounded-xl py-3 bg-navy-900 text-white font-bold" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </Button>
        </form>
      </Modal>

      {/* ════════════════════════════════════════════
          MODAL — Details View (বিস্তারিত তথ্য)
      ════════════════════════════════════════════ */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`${viewingUser?.name || 'ব্যবহারকারী'} — বিস্তারিত প্রোফাইল`}
        wide
      >
        {viewingUser && (() => {
          const sp = viewingUser.studentProfile || viewingUser.student_profile;
          const tp = viewingUser.teacherProfile || viewingUser.teacher_profile;
          const isStudent = viewingUser.role === 'student';
          const isTeacher = viewingUser.role === 'teacher';

          return (
            <div className="space-y-5">
              {/* Profile Header Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white shadow-md">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
                  {viewingUser.avatar_url ? (
                    <img src={viewingUser.avatar_url} alt={viewingUser.name} className="w-full h-full object-cover" />
                  ) : (
                    viewingUser.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-bold">{viewingUser.name}</h3>
                    <Badge tone={isStudent ? 'gold' : isTeacher ? 'blue' : 'neutral'}>
                      {isStudent ? 'শিক্ষার্থী' : isTeacher ? 'শিক্ষক' : 'প্রশাসক'}
                    </Badge>
                    <Badge tone={viewingUser.status === 'active' ? 'success' : 'danger'}>
                      {viewingUser.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">
                    {viewingUser.email} {viewingUser.phone && `• ${viewingUser.phone}`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                    {viewingUser.gender && (
                      <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-medium">
                        লিঙ্গ: {viewingUser.gender === 'female' ? 'ছাত্রী (Female)' : viewingUser.gender === 'male' ? 'ছাত্র (Male)' : viewingUser.gender}
                      </span>
                    )}
                    {viewingUser.religion && (
                      <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-medium">
                        ধর্ম: {
                          viewingUser.religion === 'islam' ? 'ইসলাম (Islam)' :
                          viewingUser.religion === 'hinduism' ? 'হিন্দু (Hinduism)' :
                          viewingUser.religion === 'christianity' ? 'খ্রিস্টান' :
                          viewingUser.religion === 'buddhism' ? 'বৌদ্ধ' : viewingUser.religion
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Academic Info */}
              {isStudent && (
                <>
                  <div className="rounded-xl border border-navy-900/10 p-4 bg-slate-50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                      প্রাতিষ্ঠানিক তথ্য (Academic Details)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">রোল নং</span>
                        <span className="font-bold text-navy-900 text-sm font-mono">{sp?.roll_no || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">রেজিস্ট্রেশন নং</span>
                        <span className="font-bold text-navy-900 text-sm font-mono">{sp?.registration_no || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">বিভাগ (Department)</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.department?.name || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">সেমিস্টার / শ্রেণি</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.semester?.name || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">শাখা (Section)</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.section?.name || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">বর্ষ (Year)</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.year === '2nd' ? '২য় বর্ষ' : '১ম বর্ষ'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">শিক্ষাবর্ষ / সেশন</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.session || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">জন্ম তারিখ</span>
                        <span className="font-bold text-navy-900 text-sm">{viewingUser.date_of_birth || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guardian & Contact */}
                  <div className="rounded-xl border border-navy-900/10 p-4 bg-slate-50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                      অভিভাবক ও যোগাযোগ (Guardian & Contact)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">অভিভাবকের নাম</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.guardian_name || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">অভিভাবকের ফোন</span>
                        <span className="font-bold text-navy-900 text-sm">{sp?.guardian_phone || '—'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block font-medium">বর্তমান / স্থায়ী ঠিকানা</span>
                        <span className="font-bold text-navy-900 text-sm">{viewingUser.address || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects list */}
                  <div className="rounded-xl border border-navy-900/10 p-4 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        নির্বাচিত বিষয়সমূহ (Enrolled Subjects)
                      </h4>
                      <span className="text-xs font-bold text-navy-900">
                        মোট বিষয়: {viewingUser.subjects?.length || 0} টি
                      </span>
                    </div>

                    {loadingDetails ? (
                      <p className="text-xs text-slate-400 text-center py-4">বিষয় তালিকা লোড হচ্ছে...</p>
                    ) : viewingUser.subjects && viewingUser.subjects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {viewingUser.subjects.map((sub) => {
                          const isOptional = Boolean(sub.pivot?.is_optional);
                          return (
                            <div
                              key={sub.id}
                              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium ${
                                isOptional
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'bg-white border-slate-200 text-navy-900'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <p className="font-bold">{sub.name}</p>
                                {sub.code && <p className="text-[11px] text-slate-500">কোড: {sub.code}</p>}
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isOptional
                                    ? 'bg-amber-200 text-amber-900'
                                    : sub.subject_category === 'group_a'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isOptional ? '৪র্থ বিষয় / ঐচ্ছিক' : sub.subject_category === 'group_a' ? 'প্রধান / নির্বাচনিক' : 'আবশ্যিক'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-3">কোনো বিষয় নির্বাচন করা নেই</p>
                    )}
                  </div>
                </>
              )}

              {/* Teacher Info */}
              {isTeacher && (
                <div className="rounded-xl border border-navy-900/10 p-4 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                    শিক্ষক তথ্য (Teacher Details)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block font-medium">কর্মচারী আইডি</span>
                      <span className="font-bold text-navy-900 text-sm font-mono">{tp?.employee_id || '—'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block font-medium">পদবি</span>
                      <span className="font-bold text-navy-900 text-sm">{tp?.designation || 'প্রভাষক'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block font-medium">বিভাগ</span>
                      <span className="font-bold text-navy-900 text-sm">{tp?.department?.name || '—'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block font-medium">বিশেষত্ব</span>
                      <span className="font-bold text-navy-900 text-sm">{tp?.subject_specialty || '—'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block font-medium">যোগদানের তারিখ</span>
                      <span className="font-bold text-navy-900 text-sm">{tp?.joining_date || '—'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block font-medium">শিক্ষাগত যোগ্যতা</span>
                      <span className="font-bold text-navy-900 text-sm">{tp?.qualification || '—'}</span>
                    </div>
                  </div>
                  {tp?.bio && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-400 block font-medium mb-1">বায়োগ্রাফি (Bio)</span>
                      <p className="text-slate-700 leading-relaxed">{tp.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setViewModalOpen(false)}
                >
                  বন্ধ করুন
                </Button>
                <Button
                  onClick={() => {
                    const target = viewingUser;
                    setViewModalOpen(false);
                    openModal(target);
                  }}
                  className="bg-navy-900 text-white"
                >
                  <Edit size={14} className="mr-1 inline" /> তথ্য সম্পাদনা করুন
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
