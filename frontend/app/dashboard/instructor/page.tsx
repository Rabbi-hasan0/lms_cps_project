// frontend/app/dashboard/instructor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/app/lib/api';
import {
  BookOpen,
  Plus,
  Users,
  Video,
  FileQuestion,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function InstructorCoursesPage() {
  const [user, setUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

  useEffect(() => {
    const loadInstructorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // ১. নিজের তথ্য ফেচ
        const me = await fetchApi('/users/me?populate=role', { headers });
        setUser(me);

        // ২. শুধুমাত্র নিজের তৈরি বা অ্যাসাইন করা কোর্সগুলো ফেচ করা
        const res = await fetchApi(`/courses?filters[instructor][id][$eq]=${me.id}&populate=*`, { headers }).catch(() => null);

        if (res?.data && res.data.length > 0) {
          setMyCourses(res.data);
        } else {
          // ফলব্যাক: যদি ফিল্টারে না মিলে সব কোর্স থেকে ফিল্টার করা
          const allRes = await fetchApi('/courses?populate=*', { headers }).catch(() => ({ data: [] }));
          const filtered = (allRes?.data || []).filter(
            (c: any) => c.instructor?.id === me.id || c.instructor?.username === me.username
          );
          setMyCourses(filtered);
        }
      } catch (err) {
        console.error('Failed to load instructor data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInstructorData();
  }, []);

  const getThumbnailUrl = (course: any) => {
    const rawUrl =
      course.thumbnail?.url ||
      course.thumbnail?.data?.attributes?.url ||
      course.thumbnail?.[0]?.url;

    if (!rawUrl) return null;
    return rawUrl.startsWith('http') ? rawUrl : `${STRAPI_URL}${rawUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="text-xs">Loading assigned courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3 h-3" /> Author Workspace
          </div>
          <h1 className="text-xl font-bold text-white">Welcome back, {user?.username}!</h1>
          <p className="text-xs text-slate-400 mt-1">Manage lessons, curriculum, and quizzes for your assigned courses.</p>
        </div>
        <div>
          <Link
            href="/dashboard/instructor/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          My Authored Courses ({myCourses.length})
        </h2>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myCourses.map((course) => {
              const thumb = getThumbnailUrl(course);
              const targetId = course.documentId || course.id;

              return (
                <div
                  key={course.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full h-36 bg-slate-950">
                      {thumb ? (
                        <img src={thumb} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-white line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{course.description || 'No description provided.'}</p>
                      
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-indigo-400" /> {course.lessons?.length || 0} Lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <FileQuestion className="w-3.5 h-3.5 text-amber-400" /> {course.quizzes?.length || 0} Quizzes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/dashboard/instructor/courses/${targetId}`}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Manage Lessons & Quizzes
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No courses assigned to your account yet.
          </div>
        )}
      </div>
    </div>
  );
}