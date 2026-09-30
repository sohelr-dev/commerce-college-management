'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Trash2, Edit, Image as ImageIcon, CheckSquare, Square, ChevronDown } from 'lucide-react';
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

/* ── Subject Selection Box ── */
function SubjectBox({ label, tone = 'blue', subjects = [], selected = [], max, onToggle }) {
  const colors = {
    blue: { wrap: 'border-blue-200 bg-blue-50', head: 'bg-blue-600 text-white', chip: 'bg-blue-100 border-blue-300 text-blue-800', active: 'bg-blue-600 text-white border-blue-600' },
    green: { wrap: 'border-green-200 bg-green-50', head: 'bg-green-600 text-white', chip: 'bg-green-100 border-green-300 text-green-800', active: 'bg-green-600 text-white border-green-600' },
    gray: { wrap: 'border-slate-200 bg-slate-50', head: 'bg-slate-500 text-white', chip: 'bg-white border-slate-200 text-slate-600', active: '' },
  };
  const c = colors[tone] || colors.blue;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${c.wrap}`}>
      <div className={`px-3 py-2 text-xs font-bold ${c.head}`}>
        {label} {max && <span className="opacity-75">({selected.length}/{max} নির্বাচিত)</span>}
      </div>
      <div className="p-3 flex flex-wrap gap-2">
        {subjects.length === 0 && <p className="text-xs text-slate-400 w-full text-center py-2">কোনো বিষয় নেই</p>}
        {subjects.map((s) => {
          const isSelected = selected.includes(s.id);
          const isDisabled = !isSelected && max && selected.length >= max;
          return (
            <button
              key={s.id}
              type="button"
              disabled={isDisabled && tone !== 'gray'}
              onClick={() => onToggle && onToggle(s.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition
                ${tone === 'gray' ? c.chip : isSelected ? c.active : `${c.chip} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}`}
            >
              {tone !== 'gray' && (isSelected ? <CheckSquare size={12} /> : <Square size={12} />)}
              <span>{s.name}</span>
              {s.code && <span className="opacity-60">({s.code})</span>}
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
    setForm((f) => {
      const cur = f.group_a_subject_ids || [];
      if (cur.includes(id)) return { ...f, group_a_subject_ids: cur.filter((x) => x !== id) };
      if (groupA && cur.length >= groupA.required_count) return f; // max reached
      return { ...f, group_a_subject_ids: [...cur, id] };
    });
  };

  const toggleGroupB = (id) => {
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
      setForm({
        name:     user.name || '',
        email:    user.email || '',
        phone:    user.phone || '',
        address:  user.address || '',
        status:   user.status || 'active',
        role:     user.role,

        // Teacher fields
        designation:       user.teacherProfile?.designation || '',
        qualification:     user.teacherProfile?.qualification || '',
        bio:               user.teacherProfile?.bio || '',
        subject_specialty: user.teacherProfile?.subject_specialty || '',
        department_id:     user.teacherProfile?.department_id || '',

        // Student fields
        roll_no:        user.studentProfile?.roll_no || '',
        registration_no:user.studentProfile?.registration_no || '',
        session:        user.studentProfile?.session || '',
        year:           user.studentProfile?.year || '1st',
        semester_id:    user.studentProfile?.semester_id || '',
        guardian_name:  user.studentProfile?.guardian_name || '',
        guardian_phone: user.studentProfile?.guardian_phone || '',
      });
      setAvatarPreview(user.avatar_url);
    } else {
      // New user defaults
      setForm({
        role:    roleTab,
        status:  'active',
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
                {users.map((u) => (
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
                        <p className="font-bold text-navy-900">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{u.email}</p>
                      {u.phone && <p className="text-xs text-slate-400">{u.phone}</p>}
                    </td>
                    {roleTab === 'student' && (
                      <>
                        <td className="px-4 py-3 font-mono font-bold text-navy-900">{u.studentProfile?.roll_no || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {u.studentProfile?.department?.name || '—'} / {u.studentProfile?.section?.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={u.studentProfile?.year === '2nd' ? 'gold' : 'neutral'}>
                            {u.studentProfile?.year === '2nd' ? '২য় বর্ষ' : '১ম বর্ষ'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{u.studentProfile?.session || '—'}</td>
                      </>
                    )}
                    {roleTab === 'teacher' && (
                      <>
                        <td className="px-4 py-3 font-mono font-bold text-navy-900">{u.teacherProfile?.employee_id || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {u.teacherProfile?.designation || 'প্রভাষক'} ({u.teacherProfile?.department?.name || 'সাধারণ'})
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <Badge tone={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(u)} className="p-1.5 text-navy-900 hover:bg-slate-200 rounded-lg">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <div className="grid grid-cols-2 gap-3">
              <Input label="পাসওয়ার্ড *" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Input label="ফোন" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}

          {editingUser && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="ফোন" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Select label="স্ট্যাটাস" value={form.status || 'active'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
              </Select>
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
                  onChange={(e) => setForm({ ...form, year: e.target.value, semester_id: '', section_id: '' })}
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
                  <p className="text-sm font-bold text-navy-900">📚 বিষয় নির্বাচন</p>

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
                          label={`${groupA.name} (${groupA.required_count}টি নির্বাচন করুন)`}
                          tone="blue"
                          subjects={groupA.subjects || []}
                          selected={selectedGroupA}
                          max={groupA.required_count}
                          onToggle={toggleGroupA}
                        />
                      )}

                      {/* Group B — ঐচ্ছিক */}
                      {groupB && (
                        <SubjectBox
                          label={`${groupB.name} (যেকোনো ১টি নির্বাচন করুন)`}
                          tone="green"
                          subjects={groupB.subjects || []}
                          selected={selectedGroupB}
                          max={1}
                          onToggle={toggleGroupB}
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
    </div>
  );
}
