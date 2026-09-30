'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, BookPlus, Undo2, Trash2 } from 'lucide-react';

const STATUS_TONE = { issued: 'warn', returned: 'success', overdue: 'danger' };
const STATUS_LABEL = { issued: 'ইস্যুকৃত', returned: 'ফেরত দেওয়া', overdue: 'মেয়াদোত্তীর্ণ' };

export default function AdminLibrary() {
  const [tab, setTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookModal, setBookModal] = useState(false);
  const [issueModal, setIssueModal] = useState(false);
  const [bookForm, setBookForm] = useState({});
  const [issueForm, setIssueForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/library/books').then((r) => setBooks(r.data));
    api.get('/library/issues').then((r) => setIssues(r.data.data));
  };

  useEffect(() => {
    load();
    Promise.all([
      api.get('/users', { params: { role: 'student', per_page: 200 } }),
      api.get('/users', { params: { role: 'teacher', per_page: 200 } }),
    ]).then(([s, t]) => setUsers([...s.data.data, ...t.data.data]));
  }, []);

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/library/books', bookForm);
      setBookModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('বইটি মুছে ফেলতে চান?')) return;
    await api.delete(`/library/books/${id}`);
    load();
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/library/issue', issueForm);
      setIssueModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'ইস্যু করা ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (id) => {
    await api.post(`/library/issues/${id}/return`);
    load();
  };

  return (
    <div>
      <PageHeader
        title="লাইব্রেরি ব্যবস্থাপনা"
        subtitle="বই, ইস্যু ও ফেরত ব্যবস্থাপনা করুন"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setIssueForm({}); setIssueModal(true); }}><BookPlus size={16} /> বই ইস্যু করুন</Button>
            <Button onClick={() => { setBookForm({ total_copies: 1 }); setBookModal(true); }}><Plus size={16} /> নতুন বই</Button>
          </div>
        }
      />

      <div className="mb-5 flex gap-2 border-b border-navy-900/10">
        {[{ key: 'books', label: 'বই তালিকা' }, { key: 'issues', label: 'ইস্যু রিপোর্ট' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`border-b-2 px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'border-gold-500 text-navy-900' : 'border-transparent text-ink-400 hover:text-navy-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'books' && (
        <Card>
          {books.length === 0 ? (
            <EmptyState title="কোনো বই নেই" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">শিরোনাম</th><th className="px-4 py-3">লেখক</th><th className="px-4 py-3">ক্যাটাগরি</th><th className="px-4 py-3">শেলফ</th><th className="px-4 py-3">উপলব্ধ / মোট</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {books.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{b.title}</td>
                    <td className="px-4 py-3">{b.author}</td>
                    <td className="px-4 py-3"><Badge>{b.category || '—'}</Badge></td>
                    <td className="px-4 py-3 font-mono-tab">{b.shelf_no || '—'}</td>
                    <td className="px-4 py-3 font-mono-tab">{b.available_copies} / {b.total_copies}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteBook(b.id)} className="text-danger-600 hover:opacity-70"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'issues' && (
        <Card>
          {issues.length === 0 ? (
            <EmptyState title="কোনো ইস্যু রেকর্ড নেই" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">বই</th><th className="px-4 py-3">গ্রহীতা</th><th className="px-4 py-3">ইস্যু তারিখ</th><th className="px-4 py-3">শেষ তারিখ</th><th className="px-4 py-3">জরিমানা</th><th className="px-4 py-3">স্ট্যাটাস</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {issues.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{i.book?.title}</td>
                    <td className="px-4 py-3">{i.user?.name}</td>
                    <td className="px-4 py-3 font-mono-tab">{i.issue_date}</td>
                    <td className="px-4 py-3 font-mono-tab">{i.due_date}</td>
                    <td className="px-4 py-3 font-mono-tab">{i.fine_amount > 0 ? `৳${i.fine_amount}` : '—'}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {i.status === 'issued' && (
                        <button onClick={() => handleReturn(i.id)} className="text-navy-700 hover:opacity-70" title="ফেরত নিন"><Undo2 size={16} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={bookModal} onClose={() => setBookModal(false)} title="নতুন বই যোগ করুন">
        <form onSubmit={handleSaveBook} className="space-y-3">
          <Input label="শিরোনাম" required onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
          <Input label="লেখক" required onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ISBN" onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
            <Input label="ক্যাটাগরি" onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="প্রকাশক" onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} />
            <Input label="শেলফ নং" onChange={(e) => setBookForm({ ...bookForm, shelf_no: e.target.value })} />
          </div>
          <Input label="মোট কপি" type="number" defaultValue={1} required onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
        </form>
      </Modal>

      <Modal open={issueModal} onClose={() => setIssueModal(false)} title="বই ইস্যু করুন">
        <form onSubmit={handleIssue} className="space-y-3">
          <Select label="বই" required onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {books.filter((b) => b.available_copies > 0).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.available_copies} টি উপলব্ধ)</option>)}
          </Select>
          <Select label="শিক্ষার্থী / শিক্ষক" required onChange={(e) => setIssueForm({ ...issueForm, user_id: e.target.value })}>
            <option value="">নির্বাচন করুন</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role === 'student' ? 'শিক্ষার্থী' : 'শিক্ষক'})</option>)}
          </Select>
          <Input label="ফেরতের শেষ তারিখ" type="date" required onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} />
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'ইস্যু হচ্ছে...' : 'ইস্যু করুন'}</Button>
        </form>
      </Modal>
    </div>
  );
}
