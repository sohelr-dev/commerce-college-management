'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { GraduationCap, Mail, Phone, Search, Users } from 'lucide-react';

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    api.get('/public/faculty').then((r) => setFaculty(r.data || []));
  }, []);

  const departments = Array.from(new Set(faculty.map((f) => f.department).filter(Boolean)));

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.designation && f.designation.toLowerCase().includes(search.toLowerCase())) ||
      (f.specialty && f.specialty.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === 'all' || f.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-900/10 px-3.5 py-1 text-xs font-bold text-navy-900 mb-3">
            <Users size={14} /> আমাদের দিকনির্দেশক
          </span>
          <h1 className="font-display text-4xl font-extrabold text-navy-950">অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী</h1>
          <p className="mt-2 text-slate-600">গুণগত শিক্ষা প্রসারে আমাদের নিবেদিত শিক্ষকবৃন্দের পরিচিতি</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="শিক্ষকের নাম বা বিষয় দিয়ে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedDept('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedDept === 'all'
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              সকল বিভাগ
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  selectedDept === dept
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Faculty Grid */}
        {filteredFaculty.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl text-slate-500 border">
            <Users size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold">কোনো শিক্ষকের তথ্য পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFaculty.map((f) => (
              <div
                key={f.id}
                className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-md hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 w-full bg-navy-950 overflow-hidden relative">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <GraduationCap size={64} className="text-gold-400" />
                      </div>
                    )}
                    {f.department && (
                      <span className="absolute top-4 right-4 bg-navy-900/80 backdrop-blur-md text-gold-400 text-xs font-bold px-3 py-1 rounded-full">
                        {f.department}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-navy-950">{f.name}</h3>
                    <p className="text-sm font-semibold text-gold-600 mt-1">{f.designation || 'প্রভাষক'}</p>
                    {f.qualification && (
                      <p className="text-xs text-slate-500 mt-1 font-medium">{f.qualification}</p>
                    )}
                    {f.specialty && (
                      <p className="text-xs text-slate-700 bg-slate-100 p-2.5 rounded-xl mt-3">
                        <span className="font-bold">বিশেষজ্ঞতা:</span> {f.specialty}
                      </p>
                    )}
                    {f.bio && (
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">{f.bio}</p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  {f.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-navy-900" /> {f.email}
                    </span>
                  )}
                  {f.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-navy-900" /> {f.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
