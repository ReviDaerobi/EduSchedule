import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, Variants } from 'framer-motion';
import AdSense from '../components/AdSense'; // Sesuaikan path komponen

interface Class {
  id: number;
  name: string;
  description: string;
}

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
  className?: string; // Untuk mengetahui dari kelas mana
  classId?: number;
  class?: {
    id: number;
    name: string;
    description?: string;
  };
}

export default function Home() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
    fetchAllSchedules();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Pastikan data adalah array
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        console.error('Classes data is not an array:', data);
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to fetch classes');
      setClasses([]);
    }
  };

  const fetchAllSchedules = async () => {
    try {
      // Fetch schedules from all classes
      const response = await fetch('/api/schedules/all');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      console.log('Raw schedule data:', data);
      console.log('Is array?', Array.isArray(data));
      
      // Pastikan data adalah array
      if (Array.isArray(data)) {
        // Map data untuk menambahkan className dari relasi class
        const schedulesWithClassName = data.map(schedule => ({
          ...schedule,
          className: schedule.class?.name || 'Unknown Class'
        }));
        setAllSchedules(schedulesWithClassName);
      } else {
        console.error('Schedules data is not an array:', data);
        setAllSchedules([]);
        setError('Invalid schedule data format');
      }
    } catch (error) {
      console.error('Error fetching all schedules:', error);
      setError('Failed to fetch schedules');
      setAllSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classId: number) => {
    setSelectedClass(classId);
    setTimeout(() => {
      router.push(`/dashboard?class=${classId}`);
    }, 300);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      LECTURE: 'bg-blue-100 text-blue-800 border-blue-200',
      QUIZ: 'bg-orange-100 text-orange-800 border-orange-200',
      EXAM: 'bg-red-100 text-red-800 border-red-200',
      ASSIGNMENT: 'bg-green-100 text-green-800 border-green-200',
      PRACTICAL: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      LECTURE: '📚',
      QUIZ: '❓',
      EXAM: '📝',
      ASSIGNMENT: '📋',
      PRACTICAL: '🔬'
    };
    return icons[type as keyof typeof icons] || '📚';
  };

  const getTodaySchedules = () => {
    // Safety check untuk memastikan allSchedules adalah array
    if (!Array.isArray(allSchedules)) {
      console.error('allSchedules is not an array in getTodaySchedules:', allSchedules);
      return [];
    }

    const today = new Date().toDateString();
    return allSchedules.filter(schedule => 
      new Date(schedule.date).toDateString() === today
    );
  };

  const getUpcomingSchedules = () => {
    // Safety check untuk memastikan allSchedules adalah array
    if (!Array.isArray(allSchedules)) {
      console.error('allSchedules is not an array in getUpcomingSchedules:', allSchedules);
      return [];
    }

    const today = new Date();
    return allSchedules
      .filter(schedule => new Date(schedule.date) > today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const renderMiniCalendar = () => {
    // Safety check untuk memastikan allSchedules adalah array
    if (!Array.isArray(allSchedules)) {
      console.error('allSchedules is not an array in renderMiniCalendar:', allSchedules);
      return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center text-red-500">
            Error: Invalid schedule data
          </div>
        </div>
      );
    }

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const daySchedules = allSchedules.filter(schedule => 
        new Date(schedule.date).toDateString() === currentDateObj.toDateString()
      );
      
      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: currentDateObj.toDateString() === today.toDateString(),
        schedules: daySchedules
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                relative p-2 min-h-[60px] border rounded-lg transition-colors cursor-pointer
                ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                ${day.isToday ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100'}
              `}
            >
              <div className={`text-sm font-medium ${day.isToday ? 'text-indigo-600' : ''}`}>
                {day.date.getDate()}
              </div>
              {day.schedules.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="flex flex-wrap gap-1">
                    {day.schedules.slice(0, 2).map((schedule, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          schedule.type === 'LECTURE' ? 'bg-blue-400' :
                          schedule.type === 'QUIZ' ? 'bg-orange-400' :
                          schedule.type === 'EXAM' ? 'bg-red-400' :
                          schedule.type === 'ASSIGNMENT' ? 'bg-green-400' :
                          'bg-purple-400'
                        }`}
                        title={schedule.title}
                      />
                    ))}
                    {day.schedules.length > 2 && (
                      <div className="text-xs text-gray-500 ml-1">
                        +{day.schedules.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 font-medium">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchClasses();
              fetchAllSchedules();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
            Edu<span className="text-indigo-600">Schedule</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Kelola jadwal kuliah Anda dengan mudah, rapi, dan modern. Lihat semua jadwal atau pilih kelas spesifik.
          </p>
        </motion.div>

        {/* Universal Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
              📅 Jadwal Universal Semua Kelas
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                {renderMiniCalendar()}
              </div>

              {/* Sidebar dengan jadwal hari ini dan mendatang */}
              <div className="space-y-6">
                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🌅</span>
                    Jadwal Hari Ini
                  </h3>
                  {getTodaySchedules().length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {getTodaySchedules().map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`p-3 rounded-xl border-l-4 ${getTypeColor(schedule.type)} cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => router.push(`/dashboard?class=${schedule.classId}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{getTypeIcon(schedule.type)}</span>
                              <div>
                                <p className="font-medium text-sm">{schedule.title}</p>
                                <p className="text-xs opacity-75">{schedule.className}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">{schedule.startTime}</p>
                              <p className="text-xs opacity-75">{schedule.room}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>🎉 Tidak ada jadwal hari ini</p>
                      <p className="text-sm">Waktunya santai!</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Schedule */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">⏰</span>
                    Jadwal Mendatang
                  </h3>
                  {getUpcomingSchedules().length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {getUpcomingSchedules().map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`p-3 rounded-xl border ${getTypeColor(schedule.type)} cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => router.push(`/dashboard?class=${schedule.classId}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{getTypeIcon(schedule.type)}</span>
                              <div>
                                <p className="font-medium text-sm">{schedule.title}</p>
                                <p className="text-xs opacity-75">{schedule.className}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">
                                {new Date(schedule.date).toLocaleDateString('id-ID', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs opacity-75">{schedule.startTime}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>📅 Tidak ada jadwal mendatang</p>
                      <p className="text-sm">Semua up to date!</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">📊 Statistik Global</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">
                        {Array.isArray(allSchedules) ? allSchedules.filter(s => s.type === 'LECTURE').length : 0}
                      </p>
                      <p className="text-sm opacity-90">Total Kuliah</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Array.isArray(allSchedules) ? allSchedules.filter(s => s.type === 'ASSIGNMENT').length : 0}
                      </p>
                      <p className="text-sm opacity-90">Total Tugas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Array.isArray(allSchedules) ? allSchedules.filter(s => s.type === 'QUIZ').length : 0}
                      </p>
                      <p className="text-sm opacity-90">Total Quiz</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Array.isArray(allSchedules) ? allSchedules.filter(s => s.type === 'EXAM').length : 0}
                      </p>
                      <p className="text-sm opacity-90">Total Ujian</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Class Selection */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-800 mb-10"
          >
            🎓 Pilih Kelas Spesifik
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {classes.map((classItem, index) => (
              <div key={classItem.id}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                    selectedClass === classItem.id
                      ? 'border-indigo-500 shadow-2xl bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 bg-white hover:shadow-xl'
                  }`}
                  onClick={() => handleClassSelect(classItem.id)}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            {classItem.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Kelas {classItem.name}
                          </h3>
                          <p className="text-sm text-gray-500">Kode #{classItem.id}</p>
                        </div>
                      </div>
                      {selectedClass === classItem.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">
                      {classItem.description || 'Jadwal perkuliahan lengkap dengan materi, tugas, dan ujian.'}
                    </p>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          📅 <span>Jadwal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          📚 <span>Materi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          ✅ <span>Tugas</span>
                        </div>
                      </div>
                      <div className="text-indigo-600 font-medium">Pilih →</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>

               
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-sm text-gray-500">
            Dibuat dengan ❤️ oleh Mahasiswa untuk Mahasiswa
          </p>
        </motion.div>
      </div>
    </div>
  );
}