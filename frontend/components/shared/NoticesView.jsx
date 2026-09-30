'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Pin, Trash2, FileText, Eye, ChevronDown, ChevronUp, Edit, ExternalLink } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';

const AUDIENCE_LABEL = { all: 'সবার জন্য', teachers: 'শিক্ষকদের জন্য', students: 'শিক্ষার্থীদের জন্য' };
const AUDIENCE_TONE  = { all: 'gold', teachers: 'warn', students: 'success' };

export default function NoticesView() {
  const { user } = useAuth();
  const [notices, setNotices]       = useState([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [viewModal, setViewModal]   = useState(null); // notice object for description view
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [form, setForm]             = useState({ audience: 'all', title: '', description: '', is_pinned: false });
  const [file, setFile]             = useState(null);
  const [saving, setSaving]         = useState(false);

  const canPost    = user?.role === 'admin' || user?.role === 'teacher';
  const isAdmin    = user?.role === 'admin';
  const postEndpoint = user?.role === 'teacher' ? '/notices/teacher' : '/notices';

  const load = () => api.get('/notices').then((r) => setNotices(r.data.data || []));

  useEffect(() => { load(); }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ audience: 'all', title: '', description: '', is_pinned: false });
    setFile(null);
    setModalOpen(true);
  };

  const openEditModal = (n) => {
    setEditingId(n.id);
    setForm({ audience: n.audience, title: n.title, description: n.description || '', is_pinned: n.is_pinned });
    setFile(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.description) fd.append('description', form.description);
      fd.append('audience', form.audience);
      if (form.is_pinned) fd.append('is_pinned', '1');
      if (file) fd.append('attachment', file);

      if (editingId) {
        fd.append('_method', 'PUT');
        await api.post(`/notices/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showSuccess('নোটিশ আপডেট হয়েছে');
      } else {
        await api.post(postEndpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showSuccess('নোটিশ পোস্ট সম্পন্ন হয়েছে');
      }

      setModalOpen(false);
      load();
    } catch (err) {
      showError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('নোটিশটি মুছে ফেলতে চান?');
    if (!confirmed) return;
    try {
      await api.delete(`/notices/${id}`);
      showSuccess('নোটিশ মুছে ফেলা হয়েছে');
      load();
    } catch {
      showError('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  const isPdf = (url) => url && (url.toLowerCase().endsWith('.pdf') || url.includes('/notices/'));

  return (
    <div className="space-y-6">
      <PageHeader
        title="নোটিশ বোর্ড"
        subtitle="কলেজের সাম্প্রতিক ঘোষণা ও নোটিশ"
        action={canPost && (
          <Button onClick={openCreateModal} className="rounded-xl bg-gold-500 text-navy-950 font-bold">
            <Plus size={16} /> নোটিশ পোস্ট করুন
          </Button>
        )}
      />

      {notices.length === 0 ? (
        <EmptyState title="কোনো নোটিশ নেই" subtitle="এখানে নোটিশ প্রকাশিত হলে দেখা যাবে" />
      ) : (
        <div className="space-y-3">
          {notices.map((n) => {
            const hasDesc   = n.description && n.description.trim().length > 0;
            const hasAttach = !!n.attachment_url;
            const attachIsPdf = hasAttach && isPdf(n.attachment_url);

            return (
              <Card key={n.id} className={`p-0 overflow-hidden transition-all duration-200 ${n.is_pinned ? 'border-l-4 border-l-gold-500 shadow-md' : ''}`}>
                {/* Notice Header Row */}
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {n.is_pinned && (
                      <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gold-100">
                        <Pin size={14} className="text-gold-600" />
                      </span>
                    )}
                    {!n.is_pinned && (
                      <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-navy-50">
                        <FileText size={14} className="text-navy-600" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-navy-900 text-sm sm:text-base leading-snug truncate">
                        {n.title}
                      </h3>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <Badge tone={AUDIENCE_TONE[n.audience]} className="text-[10px] py-0.5 px-2">
                          {AUDIENCE_LABEL[n.audience]}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {n.postedBy?.name || 'অ্যাডমিন'} • {new Date(n.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View Description Button */}
                    {hasDesc && (
                      <button
                        onClick={() => setViewModal(n)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-800 hover:bg-navy-50 hover:border-navy-400 transition"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye size={13} />
                        <span className="hidden sm:inline">বিস্তারিত</span>
                      </button>
                    )}

                    {/* PDF View Button */}
                    {hasAttach && (
                      <a
                        href={n.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-400 transition"
                        title="PDF দেখুন নতুন ট্যাবে"
                      >
                        <FileText size={13} />
                        <span className="hidden sm:inline">{attachIsPdf ? 'PDF' : 'ফাইল'}</span>
                        <ExternalLink size={11} />
                      </a>
                    )}

                    {/* Admin Edit & Delete */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(n)}
                          className="p-1.5 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition"
                          title="সম্পাদনা"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1.5 text-danger-500 hover:text-danger-700 hover:bg-danger-50 rounded-lg transition"
                          title="মুছুন"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    {user?.role === 'teacher' && n.posted_by === user?.id && (
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 text-danger-500 hover:text-danger-700 hover:bg-danger-50 rounded-lg transition"
                        title="মুছুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Description View Modal */}
      {viewModal && (
        <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={viewModal.title} wide>
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone={AUDIENCE_TONE[viewModal.audience]}>{AUDIENCE_LABEL[viewModal.audience]}</Badge>
              <span className="text-xs text-slate-400">
                প্রকাশক: {viewModal.postedBy?.name || 'অ্যাডমিন'} •{' '}
                {new Date(viewModal.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{viewModal.description}</p>
            </div>
            {viewModal.attachment_url && (
              <div className="pt-1">
                <a
                  href={viewModal.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 transition"
                >
                  <FileText size={16} />
                  সংযুক্ত ফাইল / PDF দেখুন
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create / Edit Notice Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ পোস্ট করুন'}
        wide
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="শিরোনাম *"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="নোটিশের শিরোনাম লিখুন"
          />

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-700">
              বিস্তারিত বিবরণ
              <span className="ml-1 text-slate-400 font-normal">(না দিলে শুধু PDF দিন)</span>
            </span>
            <textarea
              rows={5}
              value={form.description}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-navy-900 transition"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="নোটিশের বিস্তারিত লিখুন (ঐচ্ছিক — PDF upload করলে খালি রাখতে পারেন)"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="দর্শক *"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            >
              <option value="all">সবার জন্য</option>
              <option value="teachers">শুধু শিক্ষকদের জন্য</option>
              <option value="students">শুধু শিক্ষার্থীদের জন্য</option>
            </Select>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PDF / ফাইল সংযুক্ত করুন
                <span className="ml-1 text-slate-400 font-normal">(PDF, DOC, ছবি)</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white hover:file:bg-navy-800 transition"
              />
              {file && (
                <p className="mt-1 text-xs text-emerald-600 font-medium">✓ নির্বাচিত: {file.name}</p>
              )}
              {!file && editingId && (
                <p className="mt-1 text-xs text-slate-400">বর্তমান সংযুক্তি রাখতে খালি রাখুন</p>
              )}
            </div>
          </div>

          {isAdmin && (
            <label className="flex items-center gap-2.5 text-sm font-bold text-slate-700 cursor-pointer bg-gold-50 border border-gold-200 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-navy-900 accent-gold-500"
              />
              📌 পিন করুন — সবার উপরে দেখাবে
            </label>
          )}

          <div className="pt-1">
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              ⚠️ বিবরণ অথবা PDF — যেকোনো একটি দেওয়া বাধ্যতামূলক
            </p>
            <Button
              type="submit"
              className="w-full rounded-xl py-3 bg-navy-900 text-white font-bold"
              disabled={saving}
            >
              {saving ? 'পোস্ট হচ্ছে...' : editingId ? 'আপডেট করুন' : 'নোটিশ পোস্ট করুন'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}