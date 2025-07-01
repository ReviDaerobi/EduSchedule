import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, Variants } from 'framer-motion';

interface Class {
  id: number;
  name: string;
  description: string;
}

export default function Home() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
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
            Kelola jadwal kuliah Anda dengan mudah, rapi, dan modern. Pilih kelas di bawah untuk memulai.
          </p>
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
            className="text-2xl font-semibold text-center text-gray-800 mb-10"
          >
            Pilih Kelas Anda
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {classes.map((classItem) => (
              <motion.div
                key={classItem.id}
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