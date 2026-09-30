'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function ProtectedPortal({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(`/${user.role}`);
    }
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <div className="flex min-h-screen items-center justify-center text-ink-600">লোড হচ্ছে...</div>;
  }

  return <Layout>{children}</Layout>;
}
