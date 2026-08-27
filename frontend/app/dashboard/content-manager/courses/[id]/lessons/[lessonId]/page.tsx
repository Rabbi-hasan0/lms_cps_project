// app/dashboard/content-manager/courses/[id]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchApi } from '@/app/lib/api';
import {
  ArrowLeft,
  Video,
  FileText,
  Clock,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  Layers,
} from 'lucide-react';

export default function LessonDetailsPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Strapi 5 Blocks / Rich Text রেন্ডারার
  const extractStrapiText = (raw: any): string => {
    if (!raw) return '';
    if (typeof raw === 'string') return raw;

    if (Array.isArray(raw)) {
      return raw
        .map((block: any) => {
          if (block.children && Array.isArray(block.children)) {
            return block.children.map((c: any) => c.text || '').join('');
          }
          if (block.text) return block.text;
          return '';
        })
        .filter(Boolean)
        .join('\n\n');
    }

    if (typeof raw === 'object') {
      if (raw.text) return raw.text;
      if (raw.children) return extractStrapiText(raw.children);
    }

    return String(raw);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        // ১. Fetch Lesson (Numeric ID এবং Strapi 5 DocumentId উভয়টাই হ্যান্ডেল করা হয়েছে)
        const isLessonNumeric = !isNaN(Number(lessonId));
        let lessonQuery = `/lessons?populate=*`;
        if (isLessonNumeric) {
          lessonQuery = `/lessons?filters[$or][0][id][$eq]=${lessonId}&filters[$or][1][documentId][$eq]=${lessonId}&populate=*`;
        } else {
          lessonQuery = `/lessons?filters[documentId][$eq]=${lessonId}&populate=*`;
        }

        const lessonRes = await fetchApi(lessonQuery, authHeader);

        // ২. Fetch Course
        const isCourseNumeric = !isNaN(Number(courseId));
        let courseQuery = `/courses?populate=*`;
        if (isCourseNumeric) {
          courseQuery = `/courses?filters[$or][0][id][$eq]=${courseId}&filters[$or][1][documentId][$eq]=${courseId}&populate=*`;
        } else {
          courseQuery = `/courses?filters[documentId][$eq]=${courseId}&populate=*`;
        }

        const courseRes = await fetchApi(courseQuery, authHeader);

        let foundLesson = null;
        if (lessonRes?.data) {
          if (Array.isArray(lessonRes.data) && lessonRes.data.length > 0) {
            foundLesson = lessonRes.data[0];
          } else if (!Array.isArray(lessonRes.data)) {
            foundLesson = lessonRes.data;
          }
        }

        if (foundLesson) {
          const rawContent =
            foundLesson.content ??
            foundLesson.description ??
            foundLesson.body ??
            foundLesson.details;

          const rawNote = foundLesson.note ?? foundLesson.notes ?? foundLesson.resource;

          setLesson({
            id: foundLesson.id,
            documentId: foundLesson.documentId,
            title: foundLesson.title || 'Untitled Lesson',
            videoUrl: foundLesson.video_url || foundLesson.videoUrl || '',
            description: extractStrapiText(rawContent),
            note: extractStrapiText(rawNote),
            duration: foundLesson.duration || 'Auto',
            createdAt: foundLesson.createdAt,
          });
        }

        if (courseRes?.data) {
          if (Array.isArray(courseRes.data) && courseRes.data.length > 0) {
            setCourse(courseRes.data[0]);
          } else if (!Array.isArray(courseRes.data)) {
            setCourse(courseRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load lesson details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && courseId) loadData();
  }, [lessonId, courseId]);

  // YouTube Embed Parser
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = cleanUrl.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
    }

    if (cleanUrl.includes('youtube.com/embed/')) {
      return cleanUrl;
    }

    return cleanUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28 text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span>Loading lesson details...</span>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Lesson Not Found</h2>
        <Link
          href={`/dashboard/content-manager/courses/${courseId}`}
          className="inline-block mt-2 px-4 py-2 bg-indigo-600 rounded-xl text-xs text-white"
        >
          Back to Course
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/content-manager/courses/${courseId}`}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs text-indigo-400 font-medium">
            {course?.title || 'Course'} / Lessons
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Main Grid: Left Video Player & Notes + Right Info Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Video + Details + Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Video Player */}
          <div className="aspect-video w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Video className="w-12 h-12 stroke-[1.5]" />
                <span className="text-xs">No video URL provided for this lesson</span>
              </div>
            )}
          </div>

          {/* 2. Class Details Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              ক্লাস বিবরণ (Class Details)
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {lesson.description || 'এই ক্লাসের জন্য কোনো বিবরণ এখনো যুক্ত করা হয়নি।'}
            </div>
          </div>

          {/* 3. Class Notes & Resources Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              ক্লাস নোট এবং রিসোর্স (Class Notes & Links)
            </h3>
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm text-slate-300 leading-relaxed whitespace-pre-line wrap-break-word">
                {lesson.note || 'কোনো রিসোর্স বা নোট লিংক সংযুক্ত নেই।'}
            </div>
          </div>
        </div>

        {/* Right Side: ক্লাস তথ্য */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              ক্লাস তথ্য
            </h3>

            <div className="divide-y divide-slate-800/70 text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-xs">ক্লাস নং:</span>
                <span className="font-semibold text-white text-xs">{lesson.title}</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-xs">ইন্সট্রাক্টর:</span>
                <span className="font-medium text-slate-200 text-xs">
                  {course?.instructor?.username || 'Lead Instructor'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-xs">সময়কাল:</span>
                <span className="font-medium text-slate-200 text-xs">
                  {lesson.duration || 'Auto'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-xs">তারিখ:</span>
                <span className="font-medium text-slate-200 text-xs">
                  {lesson.createdAt
                    ? new Date(lesson.createdAt).toLocaleDateString('en-GB')
                    : 'N/A'}
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400 text-xs">কোর্স:</span>
                <span className="font-medium text-indigo-400 text-xs truncate max-w-35">
                  {course?.title || 'General'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}