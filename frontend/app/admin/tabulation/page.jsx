'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, PageHeader, Select, Badge, EmptyState, Button } from '@/components/ui';
import { Printer, Download } from 'lucide-react';

const GRADE_BG = (g) =>
  g === 'A+' ? 'bg-emerald-600 text-white' :
  g === 'A'  ? 'bg-emerald-500 text-white' :
  g === 'A-' ? 'bg-teal-500 text-white' :
  g === 'B'  ? 'bg-blue-500 text-white' :
  g === 'C'  ? 'bg-yellow-500 text-white' :
  g === 'D'  ? 'bg-orange-400 text-white' :
               'bg-red-600 text-white';

export default function AdminTabulation() {
  const [exams, setExams]         = useState([]);
  const [sections, setSections]   = useState([]);
  const [examId, setExamId]       = useState('');
  const [sectionId, setSectionId] = useState('');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    api.get('/exams').then((r) => setExams(r.data));
    api.get('/sections').then((r) => setSections(r.data));
  }, []);

  useEffect(() => {
    if (examId && sectionId) {
      setLoading(true);
      api.get(`/exams/${examId}/tabulation`, { params: { section_id: sectionId } })
        .then((r) => setData(r.data))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [examId, sectionId]);

  const handlePrint = () => {
    if (!data) return;
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    const selectedExam    = exams.find((e) => String(e.id) === String(examId));
    const selectedSection = sections.find((s) => String(s.id) === String(sectionId));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8" />
        <title>ট্যাবুলেশন শিট — ${selectedExam?.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;900&display=swap');
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Noto Sans Bengali', sans-serif; background: white; color: #0f172a; padding: 30px; font-size: 11px; }
          .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { font-size: 20px; font-weight: 900; color: #1e3a5f; }
          .header h2 { font-size: 13px; font-weight: 700; color: #7c5f00; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 11px; }
          .meta-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 12px; }
          .meta-label { font-weight: 700; color: #64748b; }
          .meta-value { font-weight: 900; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { background: #1e3a5f; color: white; padding: 6px 8px; text-align: center; font-weight: 700; border: 1px solid #1e3a5f; white-space: nowrap; }
          td { padding: 5px 7px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; }
          .name-cell { text-align: left; font-weight: 600; white-space: nowrap; }
          tr:nth-child(even) td { background: #f8fafc; }
          .fail-row td { background: #fff1f2 !important; }
          .pass-badge { background: #d1fae5; color: #065f46; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
          .fail-badge { background: #fee2e2; color: #991b1b; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
          .grade-cell { font-weight: 800; font-size: 11px; }
          .optional-mark { color: #d97706; font-weight: 700; }
          .summary-row td { background: #1e3a5f !important; color: white !important; font-weight: 700; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @page { size: A3 landscape; margin: 15mm; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>নারায়ণগঞ্জ কমার্স কলেজ NCC</h1>
          <h2>ট্যাবুলেশন শিট — ${selectedExam?.name || 'পরীক্ষা'}</h2>
        </div>
        <div class="meta">
          <div class="meta-item"><span class="meta-label">সেকশন: </span><span class="meta-value">${selectedSection?.semester?.department?.name || ''} — ${selectedSection?.semester?.name || ''} — ${selectedSection?.name || ''}</span></div>
          <div class="meta-item"><span class="meta-label">মোট শিক্ষার্থী: </span><span class="meta-value">${data.rows.length} জন</span></div>
          <div class="meta-item"><span class="meta-label">মোট বিষয়: </span><span class="meta-value">${data.subjects.length} টি</span></div>
          <div class="meta-item"><span class="meta-label">মুদ্রণ: </span><span class="meta-value">${new Date().toLocaleDateString('bn-BD', { day:'numeric', month:'long', year:'numeric' })}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:40px">ক্রম</th>
              <th style="width:40px">রোল</th>
              <th style="min-width:110px; text-align:left">নাম</th>
              ${data.subjects.map((s) => `<th>${s.name}<br/><span style="font-size:9px;opacity:.8">(${s.full_marks || 100})</span></th>`).join('')}
              <th>মোট</th>
              <th>%</th>
              <th>GPA</th>
              <th>ফলাফল</th>
            </tr>
          </thead>
          <tbody>
            ${data.rows.map((row, idx) => {
              const totalFull   = data.subjects.length * 100;
              const percentage  = row.total_full > 0 ? Math.round(row.total_obtained / row.total_full * 100) : 0;
              return `
              <tr class="${row.result === 'fail' ? 'fail-row' : ''}">
                <td>${idx + 1}</td>
                <td style="font-weight:700">${row.roll_no}</td>
                <td class="name-cell">${row.name}</td>
                ${data.subjects.map((s) => {
                  const sr = row.subjects?.find((x) => x.subject_id === s.id);
                  if (!sr) return '<td>—</td>';
                  const gradeClass = sr.grade === 'F' ? 'color:#dc2626;font-weight:900' : 'font-weight:700';
                  return `<td style="${gradeClass}">${sr.marks_obtained}${sr.is_optional ? '<sup class="optional-mark">*</sup>' : ''}<br/><span style="font-size:9px;opacity:.7">${sr.grade || ''}/${Number(sr.grade_point || 0).toFixed(1)}</span></td>`;
                }).join('')}
                <td style="font-weight:800">${row.total_obtained}/${row.total_full}</td>
                <td style="font-weight:700">${percentage}%</td>
                <td style="font-weight:800; font-size:13px">${Number(row.gpa).toFixed(2)}</td>
                <td><span class="${row.result === 'pass' ? 'pass-badge' : 'fail-badge'}">${row.result === 'pass' ? 'উত্তীর্ণ' : 'অকৃতকার্য'}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <p style="margin-top:10px; font-size:10px; color:#64748b;">* চিহ্নিত মার্ক ৪র্থ/ঐচ্ছিক বিষয়ের — এতে ফেল করলে সামগ্রিক ফলাফলে প্রভাব পড়ে না।</p>
        <div class="footer">
          <span>পাস: ${data.rows.filter((r) => r.result === 'pass').length} জন | ফেল: ${data.rows.filter((r) => r.result === 'fail').length} জন</span>
          <span>নারায়ণগঞ্জ কমার্স কলেজ NCC — ট্যাবুলেশন শিট</span>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 700);
  };

  const totalPass = data?.rows?.filter((r) => r.result === 'pass').length || 0;
  const totalFail = data?.rows?.filter((r) => r.result === 'fail').length || 0;

  return (
    <div>
      <PageHeader
        title="ট্যাবুলেশন শিট"
        subtitle="পরীক্ষার সব ছাত্রের বিষয়ভিত্তিক নম্বর, গ্রেড, জিপিএ ও ফলাফল একসাথে দেখুন"
        action={
          data && (
            <Button
              onClick={handlePrint}
              className="bg-navy-900 text-white font-bold flex items-center gap-2"
            >
              <Printer size={16} />
              প্রিন্ট / PDF ডাউনলোড
            </Button>
          )
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:w-2/3 print:hidden">
        <Select label="পরীক্ষা" value={examId} onChange={(e) => setExamId(e.target.value)}>
          <option value="">নির্বাচন করুন</option>
          {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </Select>
        <Select label="সেকশন" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          <option value="">নির্বাচন করুন</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.semester?.department?.name} - {s.semester?.name} - {s.name}
            </option>
          ))}
        </Select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-navy-200 border-t-navy-900 animate-spin" />
        </div>
      )}

      {!loading && !data && (
        <EmptyState title="পরীক্ষা ও সেকশন নির্বাচন করুন" subtitle="উপরে পরীক্ষা ও সেকশন বেছে নিলে ট্যাবুলেশন শিট দেখা যাবে" />
      )}

      {!loading && data && data.rows.length === 0 && (
        <EmptyState title="এই সেকশনে কোনো ফলাফল পাওয়া যায়নি" />
      )}

      {!loading && data && data.rows.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 print:hidden">
            {[
              { label: 'মোট শিক্ষার্থী', value: data.rows.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'উত্তীর্ণ', value: totalPass, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'অকৃতকার্য', value: totalFail, color: 'bg-red-50 border-red-200 text-red-700' },
              { label: 'পাসের হার', value: `${Math.round(totalPass / data.rows.length * 100)}%`, color: 'bg-purple-50 border-purple-200 text-purple-700' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl border p-4 text-center ${item.color}`}>
                <p className="text-xs font-medium opacity-70">{item.label}</p>
                <p className="text-2xl font-extrabold mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-navy-900/10 text-[10px] uppercase text-slate-500 font-bold bg-slate-100">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">#</th>
                  <th className="px-3 py-3 w-12 text-center">রোল</th>
                  <th className="px-3 py-3 min-w-[110px]">নাম</th>
                  {data.subjects.map((s) => (
                    <th key={s.id} className="px-2 py-3 text-center whitespace-nowrap">
                      <div>{s.name}</div>
                      <div className="font-normal opacity-60">({s.full_marks || 100})</div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center">মোট</th>
                  <th className="px-3 py-3 text-center">%</th>
                  <th className="px-3 py-3 text-center">GPA</th>
                  <th className="px-3 py-3 text-center">ফলাফল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5">
                {data.rows.map((row, idx) => {
                  const percentage = row.total_full > 0
                    ? Math.round(row.total_obtained / row.total_full * 100)
                    : 0;
                  return (
                    <tr
                      key={row.student_id}
                      className={row.result === 'fail' ? 'bg-red-50/60' : 'hover:bg-slate-50/80'}
                    >
                      <td className="px-3 py-2.5 text-center text-slate-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-navy-900 text-center">{row.roll_no}</td>
                      <td className="px-3 py-2.5 font-semibold text-navy-900">{row.name}</td>
                      {data.subjects.map((s) => {
                        const sr = row.subjects?.find((x) => x.subject_id === s.id);
                        if (!sr) return <td key={s.id} className="px-2 py-2.5 text-center text-slate-300">—</td>;
                        return (
                          <td key={s.id} className="px-2 py-2.5 text-center">
                            <div className={`font-bold ${!sr.is_pass ? 'text-red-600' : 'text-navy-900'}`}>
                              {sr.marks_obtained}
                              {sr.is_optional && <sup className="text-amber-600 font-extrabold ml-0.5">*</sup>}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${GRADE_BG(sr.grade)}`}>
                                {sr.grade}
                              </span>
                              <span className="text-slate-400 text-[9px] font-mono">{Number(sr.grade_point || 0).toFixed(1)}</span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 font-bold text-navy-950 text-center font-mono">
                        {row.total_obtained}<span className="text-slate-400 font-normal">/{row.total_full}</span>
                      </td>
                      <td className="px-3 py-2.5 font-bold text-center">{percentage}%</td>
                      <td className="px-3 py-2.5 font-extrabold text-center text-navy-950 text-sm">{Number(row.gpa).toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          tone={row.result === 'pass' ? 'success' : 'danger'}
                          className={`font-bold text-xs ${row.result === 'pass' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}
                        >
                          {row.result === 'pass' ? 'উত্তীর্ণ' : 'অকৃতকার্য'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-t border-navy-900/10 p-3 text-xs text-slate-400">
              * চিহ্নিত মার্ক ৪র্থ/ঐচ্ছিক বিষয়ের — এতে ফেল করলে সামগ্রিক ফলাফলে প্রভাব পড়ে না।
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
