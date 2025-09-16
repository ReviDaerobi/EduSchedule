import { motion } from 'framer-motion';

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

interface ScheduleModalProps {
  schedule: Schedule;
  onClose: () => void;
}

export default function ScheduleModal({ schedule, onClose }: ScheduleModalProps) {

  const getTypeConfig = (type: string) => {
    const configs = {
      LECTURE: {
        label: 'Kuliah',
        color: 'text-blue-600 bg-blue-100 border-blue-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      },
      QUIZ: {
        label: 'Quiz',
        color: 'text-orange-600 bg-orange-100 border-orange-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      EXAM: {
        label: 'Ujian',
        color: 'text-red-600 bg-red-100 border-red-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      },
      ASSIGNMENT: {
        label: 'Tugas',
        color: 'text-green-600 bg-green-100 border-green-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      PRACTICAL: {
        label: 'Praktikum',
        color: 'text-purple-600 bg-purple-100 border-purple-200',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      }
    };
    return configs[type as keyof typeof configs] || configs.LECTURE;
  };

  const typeConfig = getTypeConfig(schedule.type);

  // Format

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl border ${typeConfig.color}`}>
                {typeConfig.icon}
              </div>
              <div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${typeConfig.color} mb-2`}>
                  {typeConfig.label}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {schedule.title}
                </h2>
                <p className="text-gray-600">
                  {formatDate(schedule.date)}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Time and Location */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waktu</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </p>
              </div>
            </div>

            {schedule.room && (
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ruangan</p>
                  <p className="font-semibold text-gray-900">{schedule.room}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lecturer */}
          {schedule.lecturer && (
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dosen/Pengajar</p>
                <p className="font-semibold text-gray-900">{schedule.lecturer}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {schedule.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {schedule.description}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(schedule.materialUrl || schedule.submissionLink) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Aksi</h3>
              
              <div className="grid gap-3">
                {schedule.materialUrl && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(schedule.materialUrl!, `${schedule.title}-materi`)}
                    className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-blue-900">Download Materi</p>
                        <p className="text-sm text-blue-700">Klik untuk mengunduh materi pembelajaran</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                )}

                {schedule.submissionLink && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={schedule.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-green-900">Link Pengumpulan</p>
                        <p className="text-sm text-green-700">Klik untuk membuka link pengumpulan tugas</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </motion.a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}