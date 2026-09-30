'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Badge } from '@/components/ui';
import { Plus, Edit, Trash2, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '', is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    api.get('/events').then((r) => setEvents(r.data.data || []));
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setForm({
        title: item.title || '',
        description: item.description || '',
        event_date: item.event_date ? item.event_date.split('T')[0] : '',
        location: item.location || '',
        is_active: item.is_active,
      });
      setImagePreview(item.image_url);
    } else {
      setForm({ title: '', description: '', event_date: '', location: '', is_active: true });
      setImagePreview(null);
    }
    setImageFile(null);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('event_date', form.event_date);
      formData.append('location', form.location);
      formData.append('is_active', form.is_active ? 1 : 0);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingItem) {
        formData.append('_method', 'PUT');
        await api.post(`/events/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('ইভেন্ট আপডেট সম্পন্ন হয়েছে');
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('নতুন ইভেন্ট যোগ হয়েছে');
      }

      setModal(false);
      loadEvents();
    } catch (err) {
      showError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('ইভেন্টটি মুছে ফেলতে চান?');
    if (!confirmed) return;

    try {
      await api.delete(`/events/${id}`);
      showSuccess('ইভেন্ট মুছে ফেলা হয়েছে');
      loadEvents();
    } catch (err) {
      showError('মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <PageHeader
            title="ইভেন্ট ও প্রোগ্রাম ব্যবস্থাপনা"
            subtitle="ক্যাম্পাসের সকল ইভেন্ট, তারিখ ও ছবি নিয়ন্ত্রণ করুন"
          />
        </div>
        <Button onClick={() => openModal()} className="rounded-xl bg-gold-500 font-bold text-navy-950">
          <Plus size={18} /> নতুন ইভেন্ট যোগ করুন
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-3xl text-slate-500 border">
            কোনো ইভেন্ট নেই।
          </div>
        ) : (
          events.map((ev) => (
            <Card key={ev.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                {ev.image_url && (
                  <div className="h-44 w-full bg-slate-900">
                    <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone={ev.is_active ? 'gold' : 'neutral'}>{ev.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge>
                    {ev.event_date && (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Calendar size={13} /> {new Date(ev.event_date).toLocaleDateString('bn-BD')}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-navy-950">{ev.title}</h4>
                  {ev.location && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={13} /> {ev.location}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">{ev.description}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-t flex justify-end gap-2">
                <button onClick={() => openModal(ev)} className="p-1.5 text-xs text-navy-900 hover:bg-slate-200 rounded">
                  <Edit size={16} /> সম্পাদনা
                </button>
                <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-xs text-danger-600 hover:bg-danger-50 rounded">
                  <Trash2 size={16} /> মুছুন
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-xl text-navy-950 border-b pb-3">
              {editingItem ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট তৈরি'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইভেন্টের ছবি</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white"
              />
              {imagePreview && (
                <div className="mt-3 relative h-36 w-full rounded-2xl overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইভেন্ট শিরোনাম *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্থান / ভেন্যু</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">বিবরণ</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-navy-900"
                />
                ইভেন্ট সক্রিয় রাখুন
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="px-5 py-2.5 rounded-xl border text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-800"
              >
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
