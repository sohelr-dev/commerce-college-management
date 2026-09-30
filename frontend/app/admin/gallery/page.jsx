'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Badge } from '@/components/ui';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Campus', description: '', sort_order: 0, is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = () => {
    api.get('/gallery').then((r) => setItems(r.data.data || []));
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setForm({
        title: item.title || '',
        category: item.category || 'Campus',
        description: item.description || '',
        sort_order: item.sort_order || 0,
        is_active: item.is_active,
      });
      setImagePreview(item.image_url);
    } else {
      setForm({ title: '', category: 'Campus', description: '', sort_order: 0, is_active: true });
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
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('sort_order', form.sort_order);
      formData.append('is_active', form.is_active ? 1 : 0);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingItem) {
        formData.append('_method', 'PUT');
        await api.post(`/gallery/${editingItem.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('ছবি ও বিবরণ আপডেট সম্পন্ন হয়েছে');
      } else {
        if (!imageFile) {
          showError('একটি ছবি নির্বাচন করুন');
          setSaving(false);
          return;
        }
        await api.post('/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('নতুন ছবি ও বিবরণ যোগ হয়েছে');
      }

      setModal(false);
      loadGallery();
    } catch (err) {
      showError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('ছবিটি গ্যালারি থেকে মুছে ফেলতে চান?');
    if (!confirmed) return;

    try {
      await api.delete(`/gallery/${id}`);
      showSuccess('ছবি মুছে ফেলা হয়েছে');
      loadGallery();
    } catch (err) {
      showError('মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <PageHeader
            title="ফটো গ্যালারি ব্যবস্থাপনা"
            subtitle="ক্যাম্পাস ফটো গ্যালারিতে ছবি যোগ, বিবরণ (Details) সম্পাদনা ও ক্যাটাগরি পরিচালনা করুন"
          />
        </div>
        <Button onClick={() => openModal()} className="rounded-xl bg-gold-500 font-bold text-navy-950">
          <Plus size={18} /> ছবি ও বিবরণ যোগ করুন
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-3xl text-slate-500 border">
            <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold">গ্যালারিতে কোনো ছবি নেই</p>
          </div>
        ) : (
          items.map((g) => (
            <Card key={g.id} className="overflow-hidden flex flex-col justify-between shadow-sm">
              <div>
                <div className="h-48 w-full bg-slate-900 relative">
                  <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-navy-950/80 text-gold-400 text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-md border border-white/20">
                    {g.category}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-base text-navy-950 line-clamp-1">{g.title || 'ক্যাপশন ছাড়া ছবি'}</h4>
                  {g.description && <p className="text-xs text-slate-500 line-clamp-2">{g.description}</p>}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border-t flex justify-between items-center">
                <Badge tone={g.is_active ? 'gold' : 'neutral'}>{g.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge>
                <div className="flex gap-2">
                  <button onClick={() => openModal(g)} className="p-1.5 text-xs font-bold text-navy-900 hover:bg-slate-200 rounded-lg flex items-center gap-1">
                    <Edit size={16} /> সম্পাদনা
                  </button>
                  <button onClick={() => handleDelete(g.id)} className="p-1.5 text-xs text-danger-600 hover:bg-danger-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl text-navy-950 border-b pb-3">
              {editingItem ? 'ছবি ও বিবরণ সম্পাদন' : 'নতুন ছবি ও বিবরণ আপলোড'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ছবি আপলোড *</label>
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
                <div className="mt-3 relative h-40 w-full rounded-2xl overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">শিরোনাম / ক্যাপশন</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                placeholder="যেমন: Campus, Sports, Event, Academic"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ঘটনা / বিবরণ (Details - ছবিতে ক্লিক করলে প্রদর্শিত হবে)</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                placeholder="ঘটনার সংক্ষিপ্ত ইতিহাস বা বিস্তারিত বিবরণ..."
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
                সক্রিয় রাখুন
              </label>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">ক্রম:</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-16 rounded-xl border border-slate-300 p-1.5 text-xs text-center font-bold"
                />
              </div>
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
