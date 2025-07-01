// components/ClassSelector.tsx
import { useState, useEffect } from 'react'
import { classApi } from '../lib/api'

interface Class {
  id: number
  name: string
  description?: string
}

export default function ClassSelector({ onSelect }: { onSelect: (id: number) => void }) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await classApi.getAll()
      setClasses(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">EduSchedule</h1>
          <p className="text-gray-600">Pilih kelas untuk melihat jadwal</p>
        </div>
        
        <div className="space-y-3">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => onSelect(cls.id)}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                    Kelas {cls.name}
                  </div>
                  {cls.description && (
                    <div className="text-sm text-gray-500 mt-1">{cls.description}</div>
                  )}
                </div>
                <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}