'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Modal, Input, Select, Badge, EmptyState } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminTransport() {
  const [tab, setTab] = useState('routes');
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/transport/routes').then((r) => setRoutes(r.data));
    api.get('/transport/vehicles').then((r) => setVehicles(r.data));
    api.get('/transport/assignments').then((r) => setAssignments(r.data));
  };

  useEffect(() => {
    load();
    api.get('/users', { params: { role: 'student', per_page: 200 } }).then((r) => setStudents(r.data.data));
  }, []);

  const openModal = () => {
    setForm({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = tab === 'routes' ? '/transport/routes' : tab === 'vehicles' ? '/transport/vehicles' : '/transport/assign';
      await api.post(endpoint, form);
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    const map = { routes: `/transport/routes/${id}`, vehicles: `/transport/vehicles/${id}`, assignments: `/transport/assignments/${id}` };
    await api.delete(map[type]);
    load();
  };

  return (
    <div>
      <PageHeader
        title="পরিবহন ব্যবস্থাপনা"
        subtitle="রুট, যানবাহন ও শিক্ষার্থী বরাদ্দ পরিচালনা করুন"
        action={<Button onClick={openModal}><Plus size={16} /> নতুন যোগ করুন</Button>}
      />

      <div className="mb-5 flex gap-2 border-b border-navy-900/10">
        {[{ key: 'routes', label: 'রুট' }, { key: 'vehicles', label: 'যানবাহন' }, { key: 'assignments', label: 'শিক্ষার্থী বরাদ্দ' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`border-b-2 px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'border-gold-500 text-navy-900' : 'border-transparent text-ink-400 hover:text-navy-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'routes' && (
        <Card>
          {routes.length === 0 ? <EmptyState title="কোনো রুট নেই" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">রুটের নাম</th><th className="px-4 py-3">স্টপেজ</th><th className="px-4 py-3">ভাড়া</th><th className="px-4 py-3">যানবাহন</th><th className="px-4 py-3">শিক্ষার্থী</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {routes.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{r.name}</td>
                    <td className="px-4 py-3 text-xs text-ink-600">{r.stoppages}</td>
                    <td className="px-4 py-3 font-mono-tab">৳{r.fare_amount}</td>
                    <td className="px-4 py-3 font-mono-tab">{r.vehicles_count}</td>
                    <td className="px-4 py-3 font-mono-tab">{r.students_count}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDelete('routes', r.id)} className="text-danger-600 hover:opacity-70"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'vehicles' && (
        <Card>
          {vehicles.length === 0 ? <EmptyState title="কোনো যানবাহন নেই" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">গাড়ি নং</th><th className="px-4 py-3">চালক</th><th className="px-4 py-3">ফোন</th><th className="px-4 py-3">রুট</th><th className="px-4 py-3">ধারণক্ষমতা</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-mono-tab font-medium text-navy-900">{v.vehicle_number}</td>
                    <td className="px-4 py-3">{v.driver_name}</td>
                    <td className="px-4 py-3 font-mono-tab">{v.driver_phone || '—'}</td>
                    <td className="px-4 py-3">{v.route?.name || <span className="text-ink-400">অনির্ধারিত</span>}</td>
                    <td className="px-4 py-3 font-mono-tab">{v.capacity}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDelete('vehicles', v.id)} className="text-danger-600 hover:opacity-70"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'assignments' && (
        <Card>
          {assignments.length === 0 ? <EmptyState title="কোনো বরাদ্দ নেই" /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 text-xs uppercase text-ink-400">
                <tr><th className="px-4 py-3">শিক্ষার্থী</th><th className="px-4 py-3">রুট</th><th className="px-4 py-3">যানবাহন</th><th className="px-4 py-3">পিকআপ পয়েন্ট</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{a.student?.name}</td>
                    <td className="px-4 py-3">{a.route?.name}</td>
                    <td className="px-4 py-3 font-mono-tab">{a.vehicle?.vehicle_number || '—'}</td>
                    <td className="px-4 py-3">{a.pickup_point || '—'}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDelete('assignments', a.id)} className="text-danger-600 hover:opacity-70"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tab === 'routes' ? 'নতুন রুট' : tab === 'vehicles' ? 'নতুন যানবাহন' : 'শিক্ষার্থী বরাদ্দ করুন'}>
        <form onSubmit={handleSave} className="space-y-3">
          {tab === 'routes' && (
            <>
              <Input label="রুটের নাম" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-600">স্টপেজসমূহ</span>
                <textarea rows={2} className="w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15" onChange={(e) => setForm({ ...form, stoppages: e.target.value })} />
              </label>
              <Input label="ভাড়া (৳)" type="number" required onChange={(e) => setForm({ ...form, fare_amount: e.target.value })} />
            </>
          )}
          {tab === 'vehicles' && (
            <>
              <Input label="গাড়ি নম্বর" required onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
              <Input label="চালকের নাম" required onChange={(e) => setForm({ ...form, driver_name: e.target.value })} />
              <Input label="চালকের ফোন" onChange={(e) => setForm({ ...form, driver_phone: e.target.value })} />
              <Select label="রুট" onChange={(e) => setForm({ ...form, route_id: e.target.value })}>
                <option value="">নির্বাচন করুন</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
              <Input label="ধারণক্ষমতা" type="number" defaultValue={40} required onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </>
          )}
          {tab === 'assignments' && (
            <>
              <Select label="শিক্ষার্থী" required onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                <option value="">নির্বাচন করুন</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Select label="রুট" required onChange={(e) => setForm({ ...form, route_id: e.target.value })}>
                <option value="">নির্বাচন করুন</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.name} — ৳{r.fare_amount}</option>)}
              </Select>
              <Select label="যানবাহন (ঐচ্ছিক)" onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">নির্বাচন করুন</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
              </Select>
              <Input label="পিকআপ পয়েন্ট" onChange={(e) => setForm({ ...form, pickup_point: e.target.value })} />
            </>
          )}
          <Button type="submit" className="w-full" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</Button>
        </form>
      </Modal>
    </div>
  );
}
