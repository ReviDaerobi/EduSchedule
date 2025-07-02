import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function untuk mengkonversi waktu string ke DateTime
function timeToDateTime(dateStr: string, timeStr: string): Date {
  // Jika timeStr sudah dalam format lengkap DateTime
  if (timeStr.includes('T') || timeStr.includes('Z')) {
    return new Date(timeStr);
  }
  
  // Jika timeStr dalam format HH:MM atau HH:MM:SS
  const [hours, minutes, seconds = '00'] = timeStr.split(':');
  const date = new Date(dateStr);
  date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
  return date;
}

// Helper function untuk format DateTime ke string waktu
function formatTimeFromDateTime(dateTime: Date): string {
  return dateTime.toTimeString().slice(0, 8); // HH:MM:SS
}

// Helper function untuk format schedule
function formatSchedule(schedule: any) {
  return {
    ...schedule,
    date: schedule.date.toISOString().split('T')[0],
    startTime: typeof schedule.startTime === 'string' ? schedule.startTime : formatTimeFromDateTime(schedule.startTime as Date),
    endTime: typeof schedule.endTime === 'string' ? schedule.endTime : formatTimeFromDateTime(schedule.endTime as Date),
    className: schedule.class?.name || 'Unknown Class'
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { classId } = req.query;
        
        console.log('GET request - classId:', classId);
        
        // Jika ada classId, ambil schedule untuk class tertentu
        if (classId) {
          const classIdNum = parseInt(classId as string);
          
          if (isNaN(classIdNum)) {
            return res.status(400).json({ error: 'Invalid class ID' });
          }

          const schedules = await prisma.schedule.findMany({
            where: {
              classId: classIdNum
            },
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            },
            orderBy: [
              { date: 'asc' },
              { startTime: 'asc' }
            ]
          });
          
          // Format schedules untuk frontend
          const formattedSchedules = schedules.map(formatSchedule);
          
          return res.status(200).json(formattedSchedules);
        }
        
        // Jika tidak ada classId, ambil semua schedule
        const allSchedules = await prisma.schedule.findMany({
          include: {
            class: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          },
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
          ]
        });
        
        console.log('Fetched all schedules count:', allSchedules.length);
        
        // Format schedules untuk frontend
        const formattedAllSchedules = allSchedules.map(formatSchedule);
        
        res.status(200).json(formattedAllSchedules);
        break;

      case 'POST':
        const { 
          title, 
          type, 
          date, 
          startTime, 
          endTime, 
          room, 
          lecturer, 
          description, 
          materialUrl, 
          submissionLink,
          classId: postClassId
        } = req.body;
        
        console.log('POST request body:', req.body);
        
        // Validasi field yang wajib
        if (!title || !type || !date || !startTime || !endTime || !postClassId) {
          return res.status(400).json({ 
            error: 'Title, type, date, start time, end time, and class ID are required' 
          });
        }

        // Validasi tipe schedule
        const validTypes = ['LECTURE', 'QUIZ', 'EXAM', 'ASSIGNMENT', 'PRACTICAL'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ 
            error: 'Invalid schedule type. Must be one of: ' + validTypes.join(', ') 
          });
        }

        // Validasi classId
        const postClassIdNum = parseInt(postClassId);
        if (isNaN(postClassIdNum)) {
          return res.status(400).json({ error: 'Invalid class ID' });
        }

        // Cek apakah class exists
        const classExists = await prisma.class.findUnique({
          where: { id: postClassIdNum }
        });

        if (!classExists) {
          return res.status(404).json({ error: 'Class not found' });
        }

        // Konversi waktu ke DateTime jika diperlukan
        const startDateTime = typeof startTime === 'string' && startTime.match(/^\d{2}:\d{2}/) 
          ? timeToDateTime(date, startTime) 
          : new Date(startTime);
          
        const endDateTime = typeof endTime === 'string' && endTime.match(/^\d{2}:\d{2}/) 
          ? timeToDateTime(date, endTime) 
          : new Date(endTime);

        // Validasi waktu
        if (startDateTime >= endDateTime) {
          return res.status(400).json({ 
            error: 'End time must be after start time' 
          });
        }

        const newSchedule = await prisma.schedule.create({
          data: {
            title,
            type,
            date: new Date(date),
            startTime: startDateTime,
            endTime: endDateTime,
            room: room || null,
            lecturer: lecturer || null,
            description: description || null,
            materialUrl: materialUrl || null,
            submissionLink: submissionLink || null,
            classId: postClassIdNum
          },
          include: {
            class: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        });
        
        // Format response
        const formattedNewSchedule = formatSchedule(newSchedule);
        
        res.status(201).json(formattedNewSchedule);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}