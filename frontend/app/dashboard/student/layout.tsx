// app/dashboard/student/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/app/lib/api';
import { Loader2 } from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return;
        }

        const me = await fetchApi('/users/me?populate=role', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roleName = (me?.role?.name || me?.role?.type || '').toLowerCase();

        // ⚠️ যদি সে Content Manager বা Admin হয়, তবে Student প্যানেলে থাকতে দেবে না
        if (roleName.includes('admin')) {
          router.replace('/dashboard/admin');
          return;
        }
        if (roleName.includes('content') || roleName.includes('manager')) {
          router.replace('/dashboard/content-manager');
          return;
        }
        if (roleName.includes('instructor')) {
          router.replace('/dashboard/instructor');
          return;
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return <>{children}</>;
}