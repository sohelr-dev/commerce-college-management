'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Camera, Image as ImageIcon, X, Calendar, Info, Tag } from 'lucide-react';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadGallery();
  }, [category]);

  const loadGallery = () => {
    api.get('/public/gallery', { params: { category } }).then((r) => {
      const data = r.data.data || [];
      setItems(data);

      if (category === 'all') {
        const cats = Array.from(new Set(data.map((i) => i.category || 'General')));
        setCategories(['all', ...cats]);
      }
    });
  };

  return (
    <div className="bg-cream-50 min-h-screen py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-900/10 px-4 py-1.5 text-xs font-bold text-navy-900 mb-3 border border-navy-900/20">
            <Camera size={14} className="text-gold-500" /> ফটো গ্যালারি ও ইভেন্ট মেমোরি
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-950">ক্যাম্পাস ফটো গ্যালারি</h1>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">আমাদের কলেজের ঐতিহাসিক, একাডেমিক ও নানাবিধ অনুষ্ঠানের চিত্রমালা</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                category === cat
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'সকল ফটো' : cat}
            </button>
          ))}
        </div>

        {/* Image Card Grid */}
        {items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl text-slate-500 border shadow-sm max-w-xl mx-auto">
            <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-navy-900">গ্যালারিতে কোনো ছবি পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelectedImage(g)}
                className="group flex flex-col justify-between rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-slate-200 hover:-translate-y-1"
              >
                {/* Image top container */}
                <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={g.image_url}
                    alt={g.title || 'Gallery Item'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-lg bg-navy-950/80 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-gold-400 border border-white/20">
                      {g.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* Card Title & Info below image */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-navy-950 group-hover:text-navy-900 transition line-clamp-1">
                      {g.title || 'শিরোনাম ছাড়া ছবি'}
                    </h4>
                    {g.description && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {g.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(g.created_at).toLocaleDateString('bn-BD')}</span>
                    <span className="text-navy-900 font-bold group-hover:underline flex items-center gap-1">
                      <Info size={12} /> বিস্তারিত
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal Popup */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black transition"
            >
              <X size={20} />
            </button>

            {/* Modal Image */}
            <div className="bg-slate-950 relative max-h-[55vh] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Gallery'}
                className="max-h-[55vh] w-full object-contain"
              />
            </div>

            {/* Modal Content Details */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-navy-900/10 px-3 py-1 text-xs font-bold text-navy-900">
                  <Tag size={12} className="text-gold-500" /> {selectedImage.category || 'General'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Calendar size={13} /> {new Date(selectedImage.created_at).toLocaleDateString('bn-BD')}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-navy-950">
                {selectedImage.title || 'ছবি সম্পর্কে বিস্তারিত'}
              </h3>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ঘটনা / বিবরণ (Event Details)</h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {selectedImage.description || 'এই ছবিটির অতিরিক্ত কোনো বিবরণ যুক্ত করা হয়নি।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
