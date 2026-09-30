'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, PageHeader, Badge, EmptyState, Button } from '@/components/ui';
import { Download, Printer } from 'lucide-react';

const GRADE_COLOR = (g) =>
  g === 'A+' ? 'bg-emerald-600 text-white' :
  g === 'A'  ? 'bg-emerald-500 text-white' :
  g === 'A-' ? 'bg-teal-500 text-white' :
  g === 'B'  ? 'bg-blue-500 text-white' :
  g === 'C'  ? 'bg-yellow-500 text-white' :
  g === 'D'  ? 'bg-orange-500 text-white' :
               'bg-red-600 text-white';

export default function StudentResults() {
  const { user }       = useAuth();
  const [results, setResults] = useState([]);
  const printRef       = useRef(null);

  useEffect(() => {
    api.get('/my/results').then((r) => setResults(r.data));
  }, []);

  const handlePrint = (examResult) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const content = document.getElementById(`marksheet-${examResult.exam?.id}`);
    if (!content || !printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8" />
        <title>মার্কশিট — ${examResult.exam?.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Sans Bengali', sans-serif; background: white; color: #1e293b; padding: 40px; font-size: 13px; }
          .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 16px; margin-bottom: 20px; }
          .header h1 { font-size: 22px; font-weight: 900; color: #1e3a5f; }
          .header h2 { font-size: 16px; font-weight: 700; color: #7c5f00; margin-top: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
          .info-row { display: flex; gap: 6px; font-size: 12px; }
          .info-label { font-weight: 700; color: #475569; min-width: 110px; }
          .info-value { font-weight: 600; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th { background: #1e3a5f; color: white; padding: 8px 10px; text-align: center; font-weight: 700; font-size: 11px; }
          td { padding: 7px 10px; border: 1px solid #e2e8f0; text-align: center; }
          tr:nth-child(even) td { background: #f8fafc; }
          .fail-row td { background: #fef2f2 !important; color: #991b1b; }
          .optional-label { font-size: 10px; color: #92400e; background: #fef3c7; padding: 1px 5px; border-radius: 4px; margin-left: 4px; }
          .grade-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-weight: 900; font-size: 13px; }
          .grade-A\\\\+ { background: #059669; color: white; }
          .grade-A { background: #10b981; color: white; }
          .grade-A- { background: #14b8a6; color: white; }
          .grade-B { background: #3b82f6; color: white; }
          .grade-C { background: #eab308; color: white; }
          .grade-D { background: #f97316; color: white; }
          .grade-F { background: #dc2626; color: white; }
          .summary { background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 8px; padding: 14px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 11px; color: #64748b; font-weight: 600; }
          .summary-value { font-size: 20px; font-weight: 900; color: #0f172a; }
          .result-badge { text-align: center; padding: 10px; margin-top: 12px; font-size: 18px; font-weight: 900; border-radius: 8px; }
          .result-pass { background: #d1fae5; color: #065f46; border: 2px solid #6ee7b7; }
          .result-fail { background: #fee2e2; color: #991b1b; border: 2px solid #fca5a5; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>নারায়ণগঞ্জ কমার্স কলেজ NCC</h1>
          <h2>ব্যক্তিগত মার্কশিট — ${examResult.exam?.name}</h2>
        </div>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">শিক্ষার্থীর নাম:</span><span class="info-value">${user?.name || '—'}</span></div>
          <div class="info-row"><span class="info-label">পরীক্ষা:</span><span class="info-value">${examResult.exam?.name}</span></div>
          <div class="info-row"><span class="info-label">মোট বিষয়:</span><span class="info-value">${examResult.total_subjects || examResult.subjects?.length}</span></div>
          <div class="info-row"><span class="info-label">পরীক্ষার তারিখ:</span><span class="info-value">${examResult.exam?.start_date || '—'} — ${examResult.exam?.end_date || '—'}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>বিষয়</th>
              <th>CQ/লিখিত</th>
              <th>MCQ</th>
              <th>Practical</th>
              <th>মোট</th>
              <th>পূর্ণমান</th>
              <th>গ্রেড</th>
              <th>GP</th>
              <th>ফলাফল</th>
            </tr>
          </thead>
          <tbody>
            ${examResult.subjects?.map((sub) => `
              <tr class="${!sub.is_pass ? 'fail-row' : ''}">
                <td style="text-align:left; font-weight:600;">${sub.subject?.name}${sub.is_optional ? '<span class="optional-label">৪র্থ বিষয়</span>' : ''}</td>
                <td>${sub.marks_written !== null && sub.marks_written !== undefined ? sub.marks_written : '—'}</td>
                <td>${sub.marks_mcq !== null && sub.marks_mcq !== undefined ? sub.marks_mcq : '—'}</td>
                <td>${sub.marks_practical !== null && sub.marks_practical !== undefined ? sub.marks_practical : '—'}</td>
                <td style="font-weight:700;">${sub.marks_obtained}</td>
                <td>${sub.full_marks}</td>
                <td><span class="grade-badge grade-${sub.grade?.replace('+', '\\\\+') || 'F'}">${sub.grade}</span></td>
                <td style="font-weight:700;">${Number(sub.grade_point).toFixed(2)}</td>
                <td style="font-weight:700; color:${sub.is_pass ? '#065f46' : '#991b1b'}">${sub.is_pass ? 'PASS' : 'FAIL'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-item"><div class="summary-label">মোট প্রাপ্ত</div><div class="summary-value">${examResult.total_obtained}/${examResult.total_full}</div></div>
          <div class="summary-item"><div class="summary-label">শতকরা</div><div class="summary-value">${examResult.percentage}%</div></div>
          <div class="summary-item"><div class="summary-label">GPA</div><div class="summary-value">${Number(examResult.gpa).toFixed(2)}</div></div>
          <div class="summary-item"><div class="summary-label">পাস বিষয়</div><div class="summary-value">${examResult.passed_subjects}/${examResult.total_subjects}</div></div>
        </div>
        <div class="result-badge ${examResult.overall_result === 'PASS' ? 'result-pass' : 'result-fail'}">
          ${examResult.overall_result === 'PASS' ? '✓ উত্তীর্ণ (PASS)' : '✗ অকৃতকার্য (FAIL)'}
          — GPA: ${Number(examResult.gpa).toFixed(2)}
        </div>
        <div class="footer">
          <span>মুদ্রণের তারিখ: ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>নারায়ণগঞ্জ কমার্স কলেজ — গোপনীয় নথি</span>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="আমার ফলাফল ও মার্কশিট"
        subtitle="বিষয়ভিত্তিক লিখিত, MCQ, প্র্যাকটিক্যাল নম্বর, গ্রেড, GPA ও ডাউনলোড"
      />

      {results.length === 0 ? (
        <EmptyState
          title="কোনো ফলাফল প্রকাশিত হয়নি"
          subtitle="পরীক্ষার ফলাফল প্রকাশিত হলে এখানে প্রদর্শিত হবে"
        />
      ) : (
        <div className="space-y-6">
          {results.map((r, i) => (
            <div key={i} id={`marksheet-${r.exam?.id}`}>
              <Card className="p-6 space-y-6 shadow-sm border border-slate-200">
                {/* Exam Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-navy-950">{r.exam?.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.exam?.start_date} থেকে {r.exam?.end_date}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={r.overall_result === 'PASS' ? 'gold' : 'neutral'}
                      className={r.overall_result === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800 text-sm py-1 px-3 font-bold'
                        : 'bg-red-100 text-red-700 text-sm py-1 px-3 font-bold'}
                    >
                      {r.overall_result === 'PASS' ? '✓ উত্তীর্ণ (PASS)' : '✗ অকৃতকার্য (FAIL)'}
                    </Badge>
                    <Badge tone="gold" className="text-sm font-bold py-1 px-3">
                      GPA {r.gpa !== undefined ? Number(r.gpa).toFixed(2) : '0.00'}
                    </Badge>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1.5 text-xs font-bold rounded-xl"
                      onClick={() => handlePrint(r)}
                    >
                      <Printer size={14} />
                      মার্কশিট প্রিন্ট / ডাউনলোড
                    </Button>
                  </div>
                </div>

                {/* Subject Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="border-b text-xs uppercase text-slate-500 font-bold bg-slate-50">
                      <tr>
                        <th className="px-4 py-3">বিষয়</th>
                        <th className="px-4 py-3 text-center">CQ / লিখিত</th>
                        <th className="px-4 py-3 text-center">MCQ</th>
                        <th className="px-4 py-3 text-center">Practical</th>
                        <th className="px-4 py-3 text-center">মোট</th>
                        <th className="px-4 py-3 text-center">গ্রেড</th>
                        <th className="px-4 py-3 text-center">GP</th>
                        <th className="px-4 py-3 text-center">ফলাফল</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {r.subjects.map((sub) => {
                        const isFailed = !sub.is_pass;
                        return (
                          <tr key={sub.id} className={isFailed ? 'bg-red-50/60' : 'hover:bg-slate-50'}>
                            <td className="px-4 py-3 font-bold text-navy-950">
                              {sub.subject?.name}
                              {sub.is_optional && (
                                <span className="ml-2 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">৪র্থ বিষয়</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-center">
                              {sub.marks_written !== null && sub.marks_written !== undefined ? sub.marks_written : '—'}
                            </td>
                            <td className="px-4 py-3 font-mono text-center">
                              {sub.marks_mcq !== null && sub.marks_mcq !== undefined ? sub.marks_mcq : '—'}
                            </td>
                            <td className="px-4 py-3 font-mono text-center">
                              {sub.marks_practical !== null && sub.marks_practical !== undefined ? sub.marks_practical : '—'}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-navy-900 text-center">
                              {sub.marks_obtained} / {sub.full_marks}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${GRADE_COLOR(sub.grade)}`}>
                                {sub.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-center">
                              {Number(sub.grade_point).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-xs text-center">
                              {sub.is_pass ? (
                                <span className="font-bold text-emerald-700">PASS</span>
                              ) : (
                                <div>
                                  <span className="font-bold text-red-600">FAIL</span>
                                  {sub.fail_reason && (
                                    <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{sub.fail_reason}</p>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Result Summary */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-navy-950 uppercase tracking-wider border-b pb-2">
                    ফলাফল সামারি
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: 'মোট বিষয়', value: r.total_subjects || r.subjects.length, className: '' },
                      { label: 'পাস করেছে', value: r.passed_subjects, className: 'text-emerald-700' },
                      { label: 'ফেল করেছে', value: r.failed_subjects, className: r.failed_subjects > 0 ? 'text-red-600' : '' },
                      { label: 'GPA', value: Number(r.gpa).toFixed(2), className: 'text-navy-900' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-3 rounded-xl border text-center">
                        <p className="text-slate-500 font-medium">{item.label}</p>
                        <p className={`text-lg font-extrabold mt-0.5 ${item.className}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>মোট প্রাপ্ত: <strong className="text-navy-900">{r.total_obtained} / {r.total_full}</strong></span>
                    <span>শতকরা: <strong className="text-navy-900">{r.percentage}%</strong></span>
                  </div>

                  {r.failed_subjects > 0 && r.failed_subject_names?.length > 0 && (
                    <div className="p-3 bg-red-100/70 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                      ⚠️ অকৃতকার্য বিষয়: <strong className="font-bold">{r.failed_subject_names.join(', ')}</strong>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
