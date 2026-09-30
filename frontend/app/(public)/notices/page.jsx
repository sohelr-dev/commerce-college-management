'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Pin, ChevronLeft, ChevronRight, Download, Eye, FileText, Calendar, Search } from 'lucide-react';

export default function NoticesPublic() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    api.get('/public/notices', { params: { page, per_page: 10 } }).then((r) => setData(r.data));
  }, [page]);

  const noticesList = data?.data || [];

  const filteredNotices = noticesList.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3.5 py-1 text-xs font-bold text-gold-700 mb-3">
            <FileText size={14} /> নোটিশ বোর্ড
          </span>
          <h1 className="font-display text-4xl font-extrabold text-navy-950">অফিসিয়াল নোটিশ ও নির্দেশিকা</h1>
          <p className="mt-2 text-slate-600">কলেজের একাডেমিক ও প্রশাসনিক খবরাখবর</p>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md mx-auto">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="নোটিশের শিরোনাম বা তথ্য খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 text-sm bg-white shadow-sm outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((n) => (
              <div
                key={n.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-lg transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-navy-900 text-white shrink-0 shadow">
                    <span className="text-[11px] font-medium uppercase">
                      {new Date(n.created_at).toLocaleString('bn-BD', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold">
                      {new Date(n.created_at).getDate()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {n.is_pinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-700">
                          <Pin size={12} /> গুরুত্বপূর্ণ
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(n.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-navy-950 mt-1">{n.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1">{n.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {n.attachment_url && (
                    <a
                      href={n.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-navy-900 hover:bg-slate-100 transition"
                    >
                      <Download size={14} /> ফাইল
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedNotice(n)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-navy-800 transition"
                  >
                    <Eye size={14} /> দেখুন
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center bg-white rounded-3xl text-slate-500 border">
              কোনো নোটিশ পাওয়া যায়নি।
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} /> আগের পেজ
            </button>
            <span className="text-sm font-bold text-slate-600">
              পেজ {data.current_page} / {data.last_page}
            </span>
            <button
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-sm disabled:opacity-40"
            >
              পরের পেজ <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1 rounded-full">
                প্রকাশের তারিখ: {new Date(selectedNotice.created_at).toLocaleDateString('bn-BD')}
              </span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <h3 className="font-display text-xl font-bold text-navy-950">{selectedNotice.title}</h3>
            <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">{selectedNotice.description}</p>
            {selectedNotice.attachment_url && (
              <div className="pt-4 border-t">
                <a
                  href={selectedNotice.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
                >
                  <Download size={16} /> সংযুক্ত নথি ডাউনলোড করুন
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
