# Commerce College — Frontend (Next.js + Tailwind CSS)

React (Vite) থেকে সম্পূর্ণভাবে **Next.js 15 (App Router)** এ কনভার্ট করা হয়েছে — ফাইল-বেইজড
রাউটিং, `next/link`, `next/navigation` ব্যবহার করে, প্রোডাকশন বিল্ড টেস্ট করা হয়েছে (৩৫টি রুট,
কোনো error নেই)।

## সেটআপ

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend চলবে: `http://localhost:3000`

`.env` ফাইলে backend এর URL ঠিক আছে কিনা দেখে নিন:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## গঠন (App Router)

```
app/
  layout.jsx              -> root layout (html/body + AuthProvider)
  providers.jsx            -> client wrapper for AuthProvider
  globals.css               -> Tailwind v4 + ডিজাইন টোকেন

  (public)/                 -> পাবলিক ওয়েবসাইট (route group, URL-এ প্রভাব ফেলে না)
    layout.jsx               -> PublicNavbar + PublicFooter
    page.jsx                 -> / (Home)
    about/page.jsx           -> /about
    departments/page.jsx     -> /departments
    faculty/page.jsx         -> /faculty
    admissions/page.jsx      -> /admissions
    notices/page.jsx         -> /notices
    contact/page.jsx         -> /contact

  login/page.jsx             -> /login

  admin/                     -> /admin/* (role="admin" সুরক্ষিত)
    layout.jsx                -> ProtectedPortal দিয়ে র‍্যাপ করা
    page.jsx, academic/, users/, attendance/, exams/, routine/, tabulation/,
    fees/, library/, transport/, payroll/, notices/, website/

  teacher/                   -> /teacher/* (role="teacher" সুরক্ষিত)
    page.jsx, attendance/, results/, library/, payroll/, notices/

  student/                   -> /student/* (role="student" সুরক্ষিত)
    page.jsx, attendance/, results/, routine/, fees/, library/, transport/, notices/

components/
  Layout.jsx                 -> পোর্টাল সাইডবার + টপবার (next/link + usePathname)
  ProtectedPortal.jsx         -> role-check + redirect (next/navigation)
  ui/index.jsx                -> Button, Card, Modal, Input ইত্যাদি (পুনঃব্যবহারযোগ্য)
  public/                     -> PublicNavbar, PublicFooter, ui.jsx (SectionHeading, ইত্যাদি)
  shared/                     -> NoticesView, MyLibraryView (admin/teacher/student সবাই ব্যবহার করে)

context/AuthContext.jsx       -> লগইন/লগআউট/সেশন (client component)
lib/api.js                    -> axios instance (SSR-safe token attach)
```

## রাউটিং নোট

- `/`, `/about`, `/departments`, `/faculty`, `/admissions`, `/notices`, `/contact` — পাবলিক ওয়েবসাইট, কোনো লগইন লাগবে না।
- `/login` থেকে লগইন করে role অনুযায়ী `/admin`, `/teacher`, বা `/student` এ রিডাইরেক্ট হয়।
- প্রতিটি role-এর `layout.jsx` তে `ProtectedPortal` ব্যবহার করা হয়েছে — ভুল role দিয়ে ঢুকতে চাইলে বা লগইন না থাকলে স্বয়ংক্রিয়ভাবে `/login` বা নিজের ড্যাশবোর্ডে পাঠিয়ে দেয়।
- সব ইন্টারেক্টিভ পেজ/কম্পোনেন্টে `'use client'` directive আছে (hooks ব্যবহারের কারণে); route-group লেআউটের মতো pure server অংশগুলো directive ছাড়াই আছে।

## ডেমো লগইন (backend সিড করার পর)

| Role    | Email                              | Password |
|---------|-------------------------------------|----------|
| Admin   | admin@commercecollege.edu.bd        | password |
| Teacher | teacher@commercecollege.edu.bd      | password |
| Student | student1@commercecollege.edu.bd     | password |

লগইন পেজে ডেমো বাটনে ক্লিক করলে ইমেইল/পাসওয়ার্ড অটো-ফিল হয়ে যাবে।

## প্রোডাকশন বিল্ড

```bash
npm run build
npm start
```

অথবা Vercel-এ সরাসরি ডিপ্লয় করা যাবে (Next.js প্রজেক্ট হওয়ায় zero-config সাপোর্ট আছে) — শুধু
`NEXT_PUBLIC_API_URL` env variable সেট করে দিতে হবে।

## ⚠️ backend CORS নোট

Next.js dev server ডিফল্টভাবে পোর্ট **3000**-এ চলে (আগের Vite ছিল 5173)। backend-এর
`config/cors.php` এবং `.env` (`SANCTUM_STATEFUL_DOMAINS`, `FRONTEND_URL`) ইতিমধ্যে পোর্ট
3000-এর জন্য আপডেট করা আছে।
