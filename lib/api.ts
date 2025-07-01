// lib/api.ts
export interface Class {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  classId: number;
  title: string;
  type: 'LECTURE' | 'QUIZ' | 'EXAM' | 'ASSIGNMENT' | 'PRACTICAL';
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  room?: string;
  lecturer?: string;
  description?: string;
  materialUrl?: string;
  submissionLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleData {
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

export interface UpdateScheduleData extends Partial<CreateScheduleData> {
  scheduleId: number;
}

// Base API function with error handling
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Classes API
export const classApi = {
  // Get all classes
  getAll: (): Promise<Class[]> => {
    return apiRequest<Class[]>('/api/classes');
  },

  // Get a single class by ID
  getById: (id: number): Promise<Class> => {
    return apiRequest<Class>(`/api/classes/${id}`);
  },

  // Create a new class
  create: (data: { name: string; description?: string }): Promise<Class> => {
    return apiRequest<Class>('/api/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a class
  update: (id: number, data: { name?: string; description?: string }): Promise<Class> => {
    return apiRequest<Class>(`/api/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a class
  delete: (id: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/classes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Schedules API
export const schedulesApi = {
  // Get all schedules for a class
  getByClassId: (classId: number): Promise<Schedule[]> => {
    return apiRequest<Schedule[]>(`/api/classes/${classId}/schedules`);
  },

  // Create a new schedule for a class
  create: (classId: number, data: CreateScheduleData): Promise<Schedule> => {
    return apiRequest<Schedule>(`/api/classes/${classId}/schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a schedule
  update: (classId: number, data: UpdateScheduleData): Promise<Schedule> => {
    return apiRequest<Schedule>(`/api/classes/${classId}/schedules`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a schedule
  delete: (classId: number, scheduleId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/classes/${classId}/schedules`, {
      method: 'DELETE',
      body: JSON.stringify({ scheduleId }),
    });
  },
};

// General schedules API (if you need to get all schedules across all classes)
export const allSchedulesApi = {
  // Get all schedules from all classes
  getAll: (): Promise<Schedule[]> => {
    return apiRequest<Schedule[]>('/api/schedules');
  },

  // Get schedules within a date range
  getByDateRange: (startDate: string, endDate: string): Promise<Schedule[]> => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return apiRequest<Schedule[]>(`/api/schedules?${params}`);
  },

  // Get schedules for today
  getToday: (): Promise<Schedule[]> => {
    const today = new Date().toISOString().split('T')[0];
    return allSchedulesApi.getByDateRange(today, today);
  },

  // Get schedules for this week
  getThisWeek: (): Promise<Schedule[]> => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return allSchedulesApi.getByDateRange(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  },
};

// Utility functions
export const utils = {
  // Format date for API
  formatDate: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Format time for API
  formatTime: (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  },

  // Parse API date string to Date object
  parseDate: (dateString: string): Date => {
    return new Date(dateString);
  },

  // Parse API time string to Date object (using today's date)
  parseTime: (timeString: string, baseDate?: Date): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = baseDate ? new Date(baseDate) : new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  // Combine date and time strings into a single Date object
  combineDateTime: (dateString: string, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(dateString);
    date.setHours(hours, minutes, 0, 0);
    return date;
  },

  // Get schedule type color (for UI styling)
  getScheduleTypeColor: (type: Schedule['type']): string => {
    const colors = {
      LECTURE: '#3B82F6', // blue
      QUIZ: '#F59E0B', // amber
      EXAM: '#EF4444', // red
      ASSIGNMENT: '#10B981', // emerald
      PRACTICAL: '#8B5CF6', // violet
    };
    return colors[type] || '#6B7280'; // gray as fallback
  },

  // Get schedule type label
  getScheduleTypeLabel: (type: Schedule['type']): string => {
    const labels = {
      LECTURE: 'Lecture',
      QUIZ: 'Quiz',
      EXAM: 'Exam',
      ASSIGNMENT: 'Assignment',
      PRACTICAL: 'Practical',
    };
    return labels[type] || type;
  },

  // Validate schedule time (end time should be after start time)
  validateScheduleTime: (startTime: string, endTime: string): boolean => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return endMinutes > startMinutes;
  },

  // Check if schedule is today
  isToday: (dateString: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  },

  // Check if schedule is upcoming (in the future)
  isUpcoming: (dateString: string, timeString: string): boolean => {
    const scheduleDateTime = utils.combineDateTime(dateString, timeString);
    return scheduleDateTime > new Date();
  },
};