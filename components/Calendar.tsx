import { useState, useMemo } from 'react';
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

interface CalendarProps {
  schedules: Schedule[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

export default function Calendar({ schedules, currentDate, onDateChange, onScheduleClick }: CalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSchedulesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return schedules.filter(schedule => 
      new Date(schedule.date).toDateString() === dateStr
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === currentDate.toDateString();
  };

  const getTypeColor = (type: string) => {
    const colors = {
      LECTURE: 'bg-blue-500',
      QUIZ: 'bg-orange-500',
      EXAM: 'bg-red-500',
      ASSIGNMENT: 'bg-green-500',
      PRACTICAL: 'bg-purple-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const days = useMemo(() => getDaysInMonth(viewDate), [viewDate]);

  return (
    <div className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <button
          onClick={() => {
            const today = new Date();
            setViewDate(today);
            onDateChange(today);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Hari Ini
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map((day) => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-semibold text-gray-600">{day}</span>
          </div>
        ))}
        
        {/* Calendar Days */}
        <AnimatePresence mode="wait">
          {days.map((date, index) => {
            const daySchedules = getSchedulesForDate(date);
            const hasSchedules = daySchedules.length > 0;
            
            return (
              <motion.div
                key={date ? date.toISOString() : `empty-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.01,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className={`min-h-[120px] p-2 border border-gray-100 rounded-lg transition-all duration-200 ${
                  date 
                    ? `cursor-pointer hover:bg-gray-50 ${
                        isSelected(date) 
                          ? 'bg-indigo-50 border-indigo-200 shadow-md' 
                          : isToday(date)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white hover:shadow-sm'
                      }`
                    : 'bg-gray-25'
                }`}
                onClick={() => date && onDateChange(date)}
              >
                {date && (
                  <>
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${
                        isToday(date) 
                          ? 'text-blue-600' 
                          : isSelected(date)
                          ? 'text-indigo-600'
                          : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </span>
                      {isToday(date) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Schedule Items */}
                    {hasSchedules && (
                      <div className="space-y-1">
                        {daySchedules.slice(0, 3).map((schedule) => (
                          <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`px-2 py-1 rounded text-xs font-medium text-white cursor-pointer ${getTypeColor(schedule.type)} hover:opacity-80 transition-opacity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleClick(schedule);
                            }}
                            title={schedule.title}
                          >
                            <div className="truncate">
                              {schedule.title}
                            </div>
                            <div className="text-xs opacity-90">
                              {schedule.startTime}
                            </div>
                          </motion.div>
                        ))}
                        
                        {daySchedules.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            +{daySchedules.length - 3} lainnya
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Kuliah</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Quiz</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Ujian</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Tugas</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-gray-600">Praktikum</span>
        </div>
      </div>
    </div>
  );
}