'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/app/lib/api';
import {
  Users,
  Search,
  BookOpen,
  HelpCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Award,
} from 'lucide-react';

export default function StudentProgressPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [expandedStudentId, setExpandedStudentId] = useState<string | number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProgressData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const cleanToken = token ? token.replace(/^Bearer\s+/i, '').trim() : '';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (cleanToken) {
          headers['Authorization'] = `Bearer ${cleanToken}`;
        }

        const fetchSafe = async (endpoint: string) => {
          try {
            return await fetchApi(endpoint, { headers: headers as any });
          } catch {
            return { data: [] };
          }
        };

        const [coursesRes, enrollRes, quizRes] = await Promise.all([
          fetchSafe('/courses?populate=lessons'),
          fetchSafe('/enrollments?populate[0]=user&populate[1]=course'),
          fetchSafe('/quiz-results?populate[0]=user&populate[1]=quiz'),
        ]);

        if (!isMounted) return;

        const rawEnrollments = Array.isArray(enrollRes?.data) ? enrollRes.data : Array.isArray(enrollRes) ? enrollRes : [];
        const rawCourses = Array.isArray(coursesRes?.data) ? coursesRes.data : Array.isArray(coursesRes) ? coursesRes : [];
        const rawQuizResults = Array.isArray(quizRes?.data) ? quizRes.data : Array.isArray(quizRes) ? quizRes : [];

        // 🎯 শুধুমাত্র আসল এনরোল্ড স্টুডেন্টদের সংগ্রহ করা (যাদের কোনো কোর্স অ্যাসাইন আছে)
        const studentMap = new Map<string | number, any>();

        rawEnrollments.forEach((enr: any) => {
          const u = enr.user || enr.users_permissions_user;
          if (u) {
            const uid = u.documentId || u.id;
            if (!studentMap.has(uid)) {
              studentMap.set(uid, { ...u });
            }
          }
        });

        setStudents(Array.from(studentMap.values()));
        setCourses(rawCourses);
        setEnrollments(rawEnrollments);
        setQuizResults(rawQuizResults);
      } catch (err) {
        console.error('Failed to load student progress data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProgressData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleExpand = (id: string | number) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  // সার্চ ও কোর্স ফিল্টারিং লজিক
  const filteredStudents = students.filter((s) => {
    const sId = s.documentId || s.id;
    const matchesSearch =
      (s.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCourseFilter !== 'all') {
      return enrollments.some(
        (e) =>
          ((e.user?.id === sId || e.user?.documentId === sId) ||
           (e.users_permissions_user?.id === sId || e.users_permissions_user?.documentId === sId)) &&
          (e.course?.id == selectedCourseFilter || e.course?.documentId == selectedCourseFilter)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs tracking-wide">Loading student analytics & progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" /> Student Progress & Performance
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor course curriculum completion rate and quiz results for each student.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 transition"
        >
          <option value="all">All Enrolled Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.documentId || c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const studentId = student.documentId || student.id;
            const isExpanded = expandedStudentId === studentId;

            // এই নির্দিষ্ট শিক্ষার্থীর সমস্ত Enrollment
            const userEnrollments = enrollments.filter(
              (e) =>
                e.user?.id === studentId ||
                e.user?.documentId === studentId ||
                e.users_permissions_user?.id === studentId ||
                e.users_permissions_user?.documentId === studentId
            );

            // এই শিক্ষার্থীর সমস্ত Quiz Results
            const userQuizzes = quizResults.filter(
              (q) =>
                q.user?.id === studentId ||
                q.user?.documentId === studentId ||
                q.users_permissions_user?.id === studentId ||
                q.users_permissions_user?.documentId === studentId
            );

            // প্রতি কোর্সের প্রগ্রেস ক্যালকুলেশন
            let totalProgressSum = 0;
            const enrollmentDetails = userEnrollments.map((enr) => {
              const matchedCourse =
                courses.find(
                  (c) =>
                    c.id === enr.course?.id ||
                    c.documentId === enr.course?.documentId
                ) || enr.course;

              const totalLessons = matchedCourse?.lessons?.length || 0;
              let completedCount = 0;

              if (Array.isArray(enr.completed_lessons)) {
                completedCount = enr.completed_lessons.length;
              } else if (typeof enr.completed_lessons === 'object' && enr.completed_lessons !== null) {
                completedCount = Object.keys(enr.completed_lessons).length;
              }

              const progressPercent =
                totalLessons > 0
                  ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
                  : (enr.progress || 0);

              totalProgressSum += progressPercent;

              return {
                ...enr,
                matchedCourse,
                totalLessons,
                completedCount,
                progressPercent,
              };
            });

            const overallProgress =
              enrollmentDetails.length > 0
                ? Math.round(totalProgressSum / enrollmentDetails.length)
                : 0;

            return (
              <div
                key={studentId}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition shadow-sm"
              >
                {/* Summary Header */}
                <div
                  onClick={() => toggleExpand(studentId)}
                  className="p-4 sm:px-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                      {student.username?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="truncate mr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">{student.username}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                          Student
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    </div>
                  </div>

                  {/* 🎨 Dual-Tone Pill Progress Bar */}
                  <div className="hidden sm:flex items-center gap-6 mr-4">
                    <div className="w-52 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Overall Progress</span>
                        <span className="text-emerald-400 font-bold">{overallProgress}%</span>
                      </div>
                      <div className="w-full h-3.5 bg-black rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-3 py-1 rounded-lg text-xs font-medium border border-slate-700">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> {userEnrollments.length} Courses
                    </span>
                  </div>

                  <button className="p-1.5 text-slate-400 hover:text-white rounded-lg shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-slate-950/70 border-t border-slate-800/80 space-y-6">
                    
                    {/* Courses Section */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Enrolled Courses & Progress
                      </h4>

                      {enrollmentDetails.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {enrollmentDetails.map((item) => (
                            <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-white truncate max-w-50">
                                  {item.matchedCourse?.title || 'Course'}
                                </span>
                                <span className="text-emerald-400 font-bold">{item.progressPercent}%</span>
                              </div>

                              <div className="w-full h-3.5 bg-black rounded-full overflow-hidden p-0.5 shadow-inner">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${item.progressPercent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Clock className="w-3 h-3" /> Enrolled: {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-emerald-400/90 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> {item.completedCount}/{item.totalLessons} Lessons
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No courses enrolled yet.</p>
                      )}
                    </div>

                    {/* Quiz Results Section */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" /> Quiz Results & Scores
                      </h4>

                      {userQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {userQuizzes.map((q: any) => {
                            const score = q.score || 0;
                            const isPassed = score >= (q.quiz?.passScore || 60);

                            return (
                              <div key={q.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                                <div className="truncate mr-2">
                                  <p className="text-xs font-semibold text-white truncate">
                                    {q.quiz?.title || 'Assessment Test'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    Date: {new Date(q.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`text-xs font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {score}%
                                  </span>
                                  <p className={`text-[10px] font-medium ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {isPassed ? 'Passed' : 'Failed'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No quiz submissions recorded.</p>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No enrolled students found.
          </div>
        )}
      </div>
    </div>
  );
}