import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { classId } = req.query;
        
        // Jika ada classId, ambil schedule untuk class tertentu
        if (classId) {
          const schedules = await prisma.schedule.findMany({
            where: {
              classId: parseInt(classId as string)
            },
            include: {
              class: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: [
              { date: 'asc' },
              { startTime: 'asc' }
            ]
          });
          
          return res.status(200).json(schedules);
        }
        
        // Jika tidak ada classId, ambil semua schedule
        const allSchedules = await prisma.schedule.findMany({
          include: {
            class: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
          ]
        });
        
        res.status(200).json(allSchedules);
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

        // Cek apakah class exists
        const classExists = await prisma.class.findUnique({
          where: { id: parseInt(postClassId) }
        });

        if (!classExists) {
          return res.status(404).json({ error: 'Class not found' });
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
            classId: parseInt(postClassId)
          },
          include: {
            class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
        
        res.status(201).json(newSchedule);
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