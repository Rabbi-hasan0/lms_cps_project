// app/dashboard/student/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/app/lib/api';
import {
  BookOpen,
  GraduationCap,
  Award,
  PlayCircle,
  Clock,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    useEffect(() => {
        let isMounted = true;

        const loadStudentData = async () => {
        try {
            setLoading(true);
            const rawToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const cleanToken = rawToken ? rawToken.replace(/^Bearer\s+/i, '').trim() : null;

            if (!cleanToken) {
            router.push('/login');
            return;
            }

            const headers = { Authorization: `Bearer ${cleanToken}` };

            // ১. সেফ ইউজার ফেচ
            try {
            const me = await fetchApi('/users/me?populate=role', { headers });
            if (isMounted && me) setUser(me);
            } catch (userErr) {
            console.warn('Could not fetch /users/me, reading cached user:', userErr);
            const cached = localStorage.getItem('user');
            if (cached && isMounted) setUser(JSON.parse(cached));
            }

            // ২. সেফ কোর্স ফেচ
            try {
            const res = await fetchApi('/courses?populate=*', { headers });
            if (isMounted) {
                setEnrolledCourses(Array.isArray(res?.data) ? res.data : []);
            }
            } catch (courseErr) {
            console.warn('Courses fetch skipped or empty:', courseErr);
            if (isMounted) setEnrolledCourses([]);
            }

        } catch (err) {
            console.error('Student dashboard loading failed:', err);
        } finally {
            if (isMounted) setLoading(false);
        }
        };

        loadStudentData();

        return () => {
        isMounted = false;
        };
    }, [router]);
    
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
      <div className="flex items-center justify-center py-28 text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span>Loading student workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Student Learning Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.username || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Pick up where you left off, take quizzes, and track your ongoing learning progress.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Enrolled Courses</p>
            <p className="text-2xl font-bold text-white">{enrolledCourses.length}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Completed Lessons</p>
            <p className="text-2xl font-bold text-emerald-400">0</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Certificates Earned</p>
            <p className="text-2xl font-bold text-amber-400">0</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Available Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" /> My Enrolled Courses
          </h2>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((course) => {
              const thumb = getThumbnailUrl(course);
              const targetId = course.documentId || course.id;

              return (
                <div
                  key={course.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    <div className="relative w-full h-40 bg-slate-950 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <BookOpen className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="text-indigo-400 font-medium">
                          {course.instructor?.username || 'Lead Instructor'}
                        </span>
                        <span>{course.lessons?.length || 0} Lessons</span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {course.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      href={`/dashboard/student/courses/${targetId}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Learning</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No enrolled courses found yet.
          </div>
        )}
      </div>
    </div>
  );
}