'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Button, Badge, EmptyState } from '@/components/ui';
import { Save, Trash2, Mail, Plus, Edit, Image as ImageIcon, CheckCircle, Eye, Sliders, Layers } from 'lucide-react';
import { showSuccess, showError, showConfirm } from '@/lib/swal';

export default function AdminWebsite() {
  const [tab, setTab] = useState('settings');

  // Site Settings state
  const [settingsForm, setSettingsForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [principalImgFile, setPrincipalImgFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [principalImgPreview, setPrincipalImgPreview] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Banners state
  const [banners, setBanners] = useState([]);
  const [bannerModal, setBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', button_text: '', button_link: '', is_active: true, sort_order: 0 });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);

  // Sections state
  const [sections, setSections] = useState([]);
  const [savingSections, setSavingSections] = useState(false);

  // Contact Messages state
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadSettings();
    loadBanners();
    loadSections();
    loadMessages();
  }, []);

  const loadSettings = () => {
    api.get('/settings').then((r) => {
      setSettingsForm(r.data || {});
      setLogoPreview(r.data?.logo_url || null);
      setFaviconPreview(r.data?.favicon_url || null);
      setPrincipalImgPreview(r.data?.principal_image_url || null);
    });
  };

  const loadBanners = () => {
    api.get('/banners').then((r) => setBanners(r.data.data || []));
  };

  const loadSections = () => {
    api.get('/homepage-sections').then((r) => setSections(r.data.data || []));
  };

  const loadMessages = () => {
    api.get('/contact-messages').then((r) => setMessages(r.data.data || []));
  };

  // --- SAVE SITE SETTINGS ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const formData = new FormData();
      Object.keys(settingsForm).forEach((key) => {
        if (settingsForm[key] !== null && settingsForm[key] !== undefined) {
          formData.append(key, settingsForm[key]);
        }
      });

      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon_file', faviconFile);
      if (principalImgFile) formData.append('principal_img', principalImgFile);

      // PUT spoofing for multipart/form-data in Laravel
      formData.append('_method', 'PUT');

      const res = await api.post('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSettingsForm(res.data);
      setLogoPreview(res.data.logo_url);
      setFaviconPreview(res.data.favicon_url);
      setPrincipalImgPreview(res.data.principal_image_url);

      showSuccess('সাইট তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (err) {
      showError(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- BANNERS CRUD ---
  const openBannerModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) {
      setBannerForm({
        title: banner.title || '',
        description: banner.description || '',
        button_text: banner.button_text || '',
        button_link: banner.button_link || '',
        is_active: banner.is_active,
        sort_order: banner.sort_order || 0,
      });
      setBannerImagePreview(banner.image_url);
    } else {
      setBannerForm({ title: '', description: '', button_text: '', button_link: '', is_active: true, sort_order: 0 });
      setBannerImagePreview(null);
    }
    setBannerImageFile(null);
    setBannerModal(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);

    try {
      const formData = new FormData();
      formData.append('title', bannerForm.title);
      formData.append('description', bannerForm.description);
      formData.append('button_text', bannerForm.button_text);
      formData.append('button_link', bannerForm.button_link);
      formData.append('is_active', bannerForm.is_active ? 1 : 0);
      formData.append('sort_order', bannerForm.sort_order);

      if (bannerImageFile) {
        formData.append('image', bannerImageFile);
      }

      if (editingBanner) {
        formData.append('_method', 'PUT');
        await api.post(`/banners/${editingBanner.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('ব্যানার আপডেট সম্পন্ন হয়েছে');
      } else {
        if (!bannerImageFile) {
          showError('অনুগ্রহ করে ব্যানারের একটি ছবি নির্বাচন করুন');
          setSavingBanner(false);
          return;
        }
        await api.post('/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showSuccess('নতুন ব্যানার তৈরি হয়েছে');
      }

      setBannerModal(false);
      loadBanners();
    } catch (err) {
      showError(err.response?.data?.message || 'ব্যানার সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    const confirmed = await showConfirm('ব্যানারটি মুছে ফেলতে চান?', 'এই ব্যানারটি হোমপেজ থেকে মুছে যাবে');
    if (!confirmed) return;

    try {
      await api.delete(`/banners/${id}`);
      showSuccess('ব্যানার মুছে ফেলা হয়েছে');
      loadBanners();
    } catch (err) {
      showError('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  // --- SECTIONS UPDATE ---
  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleSaveSections = async () => {
    setSavingSections(true);
    try {
      await api.put('/homepage-sections', { sections });
      showSuccess('হোমপেজের সেকশন বিন্যাস সংরক্ষণ করা হয়েছে!');
    } catch (err) {
      showError('সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSavingSections(false);
    }
  };

  // --- MESSAGES ---
  const handleMarkRead = async (id) => {
    await api.put(`/contact-messages/${id}/read`);
    loadMessages();
  };

  const handleDeleteMessage = async (id) => {
    const confirmed = await showConfirm('বার্তাটি মুছে ফেলতে চান?');
    if (!confirmed) return;
    await api.delete(`/contact-messages/${id}`);
    showSuccess('বার্তা মুছে ফেলা হয়েছে');
    loadMessages();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ওয়েবসাইট কন্টেন্ট ও সিএমএস"
        subtitle="পাবলিক ওয়েবসাইটের সকল টেক্সট, লোগো, ব্যানার, অধ্যক্ষের বাণী ও সেকশন পরিচালনা করুন"
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-navy-900/10">
        {[
          { key: 'settings', label: 'সাইট তথ্য ও লোগো' },
          { key: 'banners', label: 'হিরো ব্যানার স্লাইডার' },
          { key: 'principal', label: 'অধ্যক্ষের বাণী ও ছবি' },
          { key: 'sections', label: 'হোমপেজ সেকশন হাইড/শো' },
          {
            key: 'messages',
            label: `যোগাযোগের বার্তা ${messages.filter((m) => !m.is_read).length > 0 ? `(${messages.filter((m) => !m.is_read).length})` : ''}`,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-5 py-3 text-sm font-bold transition ${
              tab === t.key
                ? 'border-gold-500 text-navy-950 font-extrabold bg-white shadow-sm rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-navy-900 hover:bg-slate-100/60 rounded-t-xl'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SITE SETTINGS */}
      {tab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 font-display text-base font-bold text-navy-900 border-b pb-2">কলেজের মূল পরিচয় ও লোগো</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কলেজের নাম *</label>
                <input
                  type="text"
                  required
                  value={settingsForm.college_name || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, college_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ট্যাগলাইন (Tagline)</label>
                <input
                  type="text"
                  value={settingsForm.tagline || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠা সাল</label>
                <input
                  type="number"
                  value={settingsForm.established_year || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, established_year: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">হেডার টপ বার মেসেজ</label>
                <input
                  type="text"
                  value={settingsForm.header_info || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, header_info: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              {/* Logo Upload */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কলেজ লোগো (Image Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
                  />
                  {logoPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={logoPreview} alt="Logo Preview" className="h-12 w-12 object-contain rounded-lg border bg-white p-1" />
                      <span className="text-xs text-slate-500">বর্তমান লোগো</span>
                    </div>
                  )}
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ফেভিকন (Favicon Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFaviconFile(file);
                        setFaviconPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
                  />
                  {faviconPreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={faviconPreview} alt="Favicon Preview" className="h-8 w-8 object-contain rounded-md border bg-white p-1" />
                      <span className="text-xs text-slate-500">বর্তমান ফেভিকন</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-display text-base font-bold text-navy-900 border-b pb-2">যোগাযোগ ও সোশ্যাল মিডিয়া</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ফোন নম্বর</label>
                <input
                  type="text"
                  value={settingsForm.phone || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল এড্রেস</label>
                <input
                  type="email"
                  value={settingsForm.email || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">কলেজের ঠিকানা</label>
                <input
                  type="text"
                  value={settingsForm.address || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">ফেসবুক পেজ লিংক (Facebook URL)</label>
                <input
                  type="text"
                  value={settingsForm.facebook_url || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-display text-base font-bold text-navy-900 border-b pb-2">হোমপেজ ও ফুটরের বিস্তারিত কন্টেন্ট</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">হিরো সেকশনের বিবরণ (Hero Text)</label>
                <textarea
                  rows={3}
                  value={settingsForm.hero_text || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, hero_text: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কলেজ পরিচিতি (About Text)</label>
                <textarea
                  rows={4}
                  value={settingsForm.about_text || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, about_text: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">লক্ষ্য (Mission Text)</label>
                  <textarea
                    rows={3}
                    value={settingsForm.mission_text || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mission_text: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">দৃষ্টিভঙ্গি (Vision Text)</label>
                  <textarea
                    rows={3}
                    value={settingsForm.vision_text || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vision_text: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ফুটরের সংক্ষিপ্ত বর্ণনা (Footer Text)</label>
                <textarea
                  rows={2}
                  value={settingsForm.footer_info || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_info: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>
            </div>
          </Card>

          <Button type="submit" disabled={savingSettings} className="rounded-xl px-8 py-3 bg-navy-900 text-white font-bold">
            <Save size={18} /> {savingSettings ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
          </Button>
        </form>
      )}

      {/* TAB 2: HERO BANNERS */}
      {tab === 'banners' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
            <div>
              <h3 className="font-bold text-base text-navy-900">হোমপেজ ব্যানার স্লাইডার মডিউল</h3>
              <p className="text-xs text-slate-500">একাধিক আকর্ষণীয় ছবি ও টেক্সট সহ স্লাইড ব্যানার যোগ করুন</p>
            </div>
            <Button onClick={() => openBannerModal()} className="rounded-xl bg-gold-500 font-bold text-white-950">
              <Plus size={18} /> নতুন ব্যানার যোগ করুন
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white rounded-2xl text-slate-500 border">
                কোনো ব্যানার যুক্ত করা হয়নি। "নতুন ব্যানার যোগ করুন" বাটনে ক্লিক করুন।
              </div>
            ) : (
              banners.map((b) => (
                <Card key={b.id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-48 w-full relative bg-slate-900">
                      <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <Badge tone={b.is_active ? 'gold' : 'neutral'}>
                          {b.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-navy-950">{b.title || 'শিরোনাম ছাড়া ব্যানার'}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{b.description}</p>
                      {b.button_text && (
                        <p className="text-xs font-bold text-gold-600 mt-3 bg-slate-100 p-2 rounded-lg inline-block">
                          বাটন: {b.button_text} ({b.button_link || '#'})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">ক্রম: {b.sort_order}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openBannerModal(b)}
                        className="p-2 text-xs font-bold text-navy-900 bg-white border rounded-lg hover:bg-slate-100 flex items-center gap-1"
                      >
                        <Edit size={14} /> সম্পাদনা
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-2 text-xs font-bold text-danger-600 bg-white border border-danger-200 rounded-lg hover:bg-danger-50 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> মুছুন
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRINCIPAL INFO */}
      {tab === 'principal' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 font-display text-base font-bold text-navy-900 border-b pb-2">অধ্যক্ষের তথ্য ও বাণী</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যক্ষের নাম</label>
                <input
                  type="text"
                  value={settingsForm.principal_name || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, principal_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পদবী / টাইটেল</label>
                <input
                  type="text"
                  value={settingsForm.principal_title || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, principal_title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                  placeholder="যেমন: অধ্যক্ষ, কমার্স কলেজ"
                />
              </div>

              {/* Principal Photo Upload */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-5">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center shrink-0">
                  {principalImgPreview ? (
                    <img src={principalImgPreview} alt="Principal Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যক্ষের ছবি আপলোড (Image Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPrincipalImgFile(file);
                        setPrincipalImgPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">পাসপোর্ট সাইজ বা স্কয়ার ফরম্যাটের স্পষ্ট ছবি ব্যবহার করুন</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যক্ষের প্রধান বাণী (Message)</label>
                <textarea
                  rows={5}
                  value={settingsForm.principal_message || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, principal_message: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                  placeholder="হোমপেজে প্রদর্শিত অধ্যক্ষের বাণী..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যক্ষের বিস্তারিত বায়োগ্রাফি (Biography)</label>
                <textarea
                  rows={4}
                  value={settingsForm.principal_bio || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, principal_bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                  placeholder="অধ্যক্ষ স্যারের শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ও কর্মজীবন..."
                />
              </div>
            </div>
          </Card>

          <Button type="submit" disabled={savingSettings} className="rounded-xl px-8 py-3 bg-navy-900 text-white font-bold">
            <Save size={18} /> {savingSettings ? 'সংরক্ষণ হচ্ছে...' : 'অধ্যক্ষের তথ্য আপডেট করুন'}
          </Button>
        </form>
      )}

      {/* TAB 4: HOMEPAGE SECTIONS VISIBILITY */}
      {tab === 'sections' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h3 className="font-bold text-base text-navy-900">হোমপেজ সেকশন নিয়ন্ত্রণ</h3>
                <p className="text-xs text-slate-500">হোমপেজের কোন সেকশন চালু/বন্ধ থাকবে এবং তাদের শিরোনাম পরিবর্তন করুন</p>
              </div>
              <Button onClick={handleSaveSections} disabled={savingSections} className="rounded-xl bg-gold-500 text-navy-950 font-bold">
                <Save size={18} /> {savingSections ? 'সংরক্ষণ হচ্ছে...' : 'সেকশন সেটিং ওর্ডার সেভ করুন'}
              </Button>
            </div>

            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div key={sec.section_key} className="p-4 rounded-2xl bg-slate-50 border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={sec.is_enabled}
                      onChange={(e) => handleSectionChange(idx, 'is_enabled', e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-navy-900 focus:ring-navy-900 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">[{sec.section_key}]</span>
                      <p className="font-bold text-sm text-navy-950">{sec.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                      placeholder="সেকশন শিরোনাম"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-navy-900"
                    />
                    <input
                      type="text"
                      value={sec.subtitle || ''}
                      onChange={(e) => handleSectionChange(idx, 'subtitle', e.target.value)}
                      placeholder="সাবটাইটেল"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-navy-900"
                    />
                    <input
                      type="number"
                      value={sec.sort_order}
                      onChange={(e) => handleSectionChange(idx, 'sort_order', parseInt(e.target.value) || 0)}
                      placeholder="ক্রম"
                      className="w-16 rounded-xl border border-slate-300 px-2 py-1.5 text-xs text-center font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: MESSAGES */}
      {tab === 'messages' && (
        <Card>
          {messages.length === 0 ? (
            <EmptyState title="কোনো যোগাযোগ বার্তা নেই" />
          ) : (
            <div className="divide-y divide-navy-900/5">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-3 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-navy-900/5 p-2 text-navy-700">
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-navy-900">{m.name}</p>
                        {!m.is_read && <Badge tone="gold">নতুন</Badge>}
                      </div>
                      <p className="text-xs text-slate-500">
                        {m.email} {m.phone ? `• ${m.phone}` : ''}
                      </p>
                      {m.subject && <p className="mt-1 text-sm font-medium text-slate-700">বিষয়: {m.subject}</p>}
                      <p className="mt-1 text-sm text-slate-600">{m.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(m.created_at).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!m.is_read && (
                      <button onClick={() => handleMarkRead(m.id)} className="text-xs text-navy-700 hover:underline">
                        পঠিত হিসেবে চিহ্নিত
                      </button>
                    )}
                    <button onClick={() => handleDeleteMessage(m.id)} className="text-danger-600 hover:opacity-70">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Banner Create/Edit Modal */}
      {bannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveBanner} className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl text-navy-950 border-b pb-3">
              {editingBanner ? 'ব্যানার সম্পাদন করুন' : 'নতুন ব্যানার যোগ করুন'}
            </h3>

            {/* Banner Image Preview & Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ব্যানার ছবি (Upload Banner Image) *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setBannerImageFile(file);
                    setBannerImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-white"
              />
              {bannerImagePreview && (
                <div className="mt-3 relative h-40 w-full rounded-2xl overflow-hidden border">
                  <img src={bannerImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ব্যানার শিরোনাম</label>
              <input
                type="text"
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ব্যানার বিবরণ</label>
              <textarea
                rows={3}
                value={bannerForm.description}
                onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বাটন টেক্সট</label>
                <input
                  type="text"
                  placeholder="যেমন: ভর্তি সম্পর্কে জানুন"
                  value={bannerForm.button_text}
                  onChange={(e) => setBannerForm({ ...bannerForm, button_text: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বাটন লিংক (URL)</label>
                <input
                  type="text"
                  placeholder="যেমন: /admissions"
                  value={bannerForm.button_link}
                  onChange={(e) => setBannerForm({ ...bannerForm, button_link: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-navy-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={bannerForm.is_active}
                  onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-navy-900"
                />
                ব্যানারটি সক্রিয় রাখুন
              </label>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">ক্রম:</label>
                <input
                  type="number"
                  value={bannerForm.sort_order}
                  onChange={(e) => setBannerForm({ ...bannerForm, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-16 rounded-xl border border-slate-300 p-1.5 text-xs text-center font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setBannerModal(false)}
                className="px-5 py-2.5 rounded-xl border text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={savingBanner}
                className="px-6 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-800"
              >
                {savingBanner ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
