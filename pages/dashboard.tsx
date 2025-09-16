import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Calendar from '../components/Calendar';
import ScheduleModal from '../components/ScheduleModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Schedule {
  id: number;
  title: string;
  type: 'LECTURE' | 'QUIZ' | 'EXAM' | 'ASSIGNMENT' | 'PRACTICAL';
  date: string;
  startTime: string;
  endTime: string;
  room?: string;
  lecturer?: string;
  description?: string;
  materialUrl?: string;
  submissionLink?: string;
}

interface Class {
  id: number;
  name: string;
  description: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { class: classId } = router.query;
  
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

   const formatTime = (timeString: string) => {
    try {
        // Untuk format: "2025-09-16 10:00:00"
        if (timeString.includes(' ')) {
          const timePart = timeString.split(' ')[1]; // Ambil "10:00:00"
          return timePart.substring(0, 5); // Ambil "10:00"
        }
        
        // Untuk format: "2025-09-16T10:00:00.000Z"
        if (timeString.includes('T')) {
          const timePart = timeString.split('T')[1]; // Ambil "10:00:00.000Z"
          return timePart.substring(0, 5); // Ambil "10:00"
        }
        
        return timeString;
      } catch (error) {
        console.error('Error formatting time:', error);
        return timeString;
      }
  };

  const fetchClassData = useCallback(async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCurrentClass(data);
    } catch (error) {
      console.error('Error fetching class data:', error);
      throw error;
    }
  }, [classId]);

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/schedules`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }, [classId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchClassData(),
        fetchSchedules()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [fetchClassData, fetchSchedules]);

  useEffect(() => {
    if (classId) {
      fetchData();
    }
  }, [classId, fetchData]);

  const getUpcomingSchedules = () => {
    const today = new Date();
    return schedules
      .filter(schedule => new Date(schedule.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  };

  const getTodaySchedules = () => {
    const today = new Date().toDateString();
    return schedules.filter(schedule => 
      new Date(schedule.date).toDateString() === today
    );
  };

  const getTypeColor = (type: string) => {
    const colors = {
      LECTURE: 'text-blue-600 bg-blue-100',
      QUIZ: 'text-orange-600 bg-orange-100',
      EXAM: 'text-red-600 bg-red-100',
      ASSIGNMENT: 'text-green-600 bg-green-100',
      PRACTICAL: 'text-purple-600 bg-purple-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      LECTURE: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      QUIZ: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      EXAM: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      ASSIGNMENT: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      PRACTICAL: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    };
    return icons[type as keyof typeof icons] || icons.LECTURE;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 font-medium">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Kembali</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kelas {currentClass?.name || 'Loading...'}
                </h1>
                <p className="text-sm text-gray-600">{currentClass?.description || ''}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Hari ini</p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <Calendar
                schedules={schedules}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onScheduleClick={setSelectedSchedule}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Jadwal Hari Ini
              </h3>
              {getTodaySchedules().length > 0 ? (
                <div className="space-y-3">
                  {getTodaySchedules().map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedSchedule(schedule)}
                    >
                      <div className={`p-2 rounded-lg ${getTypeColor(schedule.type)}`}>
                        {getTypeIcon(schedule.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {schedule.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada jadwal hari ini
                </p>
              )}
            </motion.div>

            {/* Upcoming Schedule */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Jadwal Mendatang
              </h3>
              {getUpcomingSchedules().length > 0 ? (
                <div className="space-y-3">
                  {getUpcomingSchedules().map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedSchedule(schedule)}
                    >
                      <div className={`p-2 rounded-lg ${getTypeColor(schedule.type)}`}>
                        {getTypeIcon(schedule.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {schedule.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(schedule.date).toLocaleDateString('id-ID', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada jadwal mendatang
                </p>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-4">Statistik</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.type === 'LECTURE').length}
                  </p>
                  <p className="text-sm opacity-90">Kuliah</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.type === 'ASSIGNMENT').length}
                  </p>
                  <p className="text-sm opacity-90">Tugas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.type === 'QUIZ').length}
                  </p>
                  <p className="text-sm opacity-90">Quiz</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.type === 'EXAM').length}
                  </p>
                  <p className="text-sm opacity-90">Ujian</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      <AnimatePresence>
        {selectedSchedule && (
          <ScheduleModal
            schedule={selectedSchedule}
            onClose={() => setSelectedSchedule(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}