import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const classId = parseInt(id as string);

  if (isNaN(classId)) {
    return res.status(400).json({ error: 'Invalid class ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Cek apakah class ada
        const classExists = await prisma.class.findUnique({
          where: { id: classId }
        });

        if (!classExists) {
          return res.status(404).json({ error: 'Class not found' });
        }

        // Ambil semua schedule untuk class ini
        const schedules = await prisma.schedule.findMany({
          where: {
            classId: classId
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

        // Format data untuk frontend
        const formattedSchedules = schedules.map((schedule: { id: any; title: any; type: any; date: { toISOString: () => string; }; startTime: any; endTime: any; room: any; lecturer: any; description: any; materialUrl: any; submissionLink: any; class: any; }) => ({
          id: schedule.id,
          title: schedule.title,
          type: schedule.type,
          date: schedule.date.toISOString().split('T')[0], // Format: YYYY-MM-DD
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
          lecturer: schedule.lecturer,
          description: schedule.description,
          materialUrl: schedule.materialUrl,
          submissionLink: schedule.submissionLink,
          class: schedule.class
        }));
        
        res.status(200).json(formattedSchedules);
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
          submissionLink 
        } = req.body;
        
        // Validasi field yang wajib
        if (!title || !type || !date || !startTime || !endTime) {
          return res.status(400).json({ 
            error: 'Title, type, date, start time, and end time are required' 
          });
        }

        // Validasi tipe schedule
        const validTypes = ['LECTURE', 'QUIZ', 'EXAM', 'ASSIGNMENT', 'PRACTICAL'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ 
            error: 'Invalid schedule type. Must be one of: ' + validTypes.join(', ') 
          });
        }

        // Cek apakah class exists
        const targetClass = await prisma.class.findUnique({
          where: { id: classId }
        });

        if (!targetClass) {
          return res.status(404).json({ error: 'Class not found' });
        }

        // Validasi waktu
        if (startTime >= endTime) {
          return res.status(400).json({ 
            error: 'End time must be after start time' 
          });
        }

        const newSchedule = await prisma.schedule.create({
          data: {
            title,
            type,
            date: new Date(date),
            startTime,
            endTime,
            room: room || null,
            lecturer: lecturer || null,
            description: description || null,
            materialUrl: materialUrl || null,
            submissionLink: submissionLink || null,
            classId: classId
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
        const formattedSchedule = {
          id: newSchedule.id,
          title: newSchedule.title,
          type: newSchedule.type,
          date: newSchedule.date.toISOString().split('T')[0],
          startTime: newSchedule.startTime,
          endTime: newSchedule.endTime,
          room: newSchedule.room,
          lecturer: newSchedule.lecturer,
          description: newSchedule.description,
          materialUrl: newSchedule.materialUrl,
          submissionLink: newSchedule.submissionLink,
          class: newSchedule.class
        };
        
        res.status(201).json(formattedSchedule);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}