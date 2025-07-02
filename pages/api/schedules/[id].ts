import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  // Debug logging untuk melihat nilai id yang diterima
  console.log('Received id parameter:', id);
  console.log('Type of id:', typeof id);
  console.log('Query object:', req.query);

  // Validasi id parameter
  if (!id) {
    return res.status(400).json({ error: 'Schedule ID is required' });
  }

  // Handle jika id adalah array (Next.js query bisa jadi array)
  const idString = Array.isArray(id) ? id[0] : id;
  
  // Validasi apakah id adalah string yang bisa dikonversi ke number
  if (typeof idString !== 'string' || idString.trim() === '') {
    return res.status(400).json({ error: 'Invalid schedule ID format' });
  }

  const scheduleId = parseInt(idString, 10);

  // Validasi hasil parsing
  if (isNaN(scheduleId) || scheduleId <= 0) {
    return res.status(400).json({ 
      error: 'Invalid schedule ID', 
      received: idString,
      parsed: scheduleId 
    });
  }

  console.log('Parsed schedule ID:', scheduleId);

  try {
    switch (req.method) {
      case 'GET':
        const schedule = await prisma.schedule.findUnique({
          where: {
            id: scheduleId
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

        if (!schedule) {
          return res.status(404).json({ error: 'Schedule not found' });
        }

        // Format data untuk frontend
        const formattedSchedule = {
          id: schedule.id,
          title: schedule.title,
          type: schedule.type,
          date: schedule.date.toISOString().split('T')[0],
          startTime: schedule.startTime.toISOString().split('T')[1].slice(0, 8), // Format HH:MM:SS
          endTime: schedule.endTime.toISOString().split('T')[1].slice(0, 8),
          room: schedule.room,
          lecturer: schedule.lecturer,
          description: schedule.description,
          materialUrl: schedule.materialUrl,
          submissionLink: schedule.submissionLink,
          class: schedule.class
        };

        res.status(200).json(formattedSchedule);
        break;

      case 'PUT':
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

        // Cek apakah schedule exists
        const existingSchedule = await prisma.schedule.findUnique({
          where: { id: scheduleId }
        });

        if (!existingSchedule) {
          return res.status(404).json({ error: 'Schedule not found' });
        }

        // Validasi tipe schedule jika diberikan
        if (type) {
          const validTypes = ['LECTURE', 'QUIZ', 'EXAM', 'ASSIGNMENT', 'PRACTICAL'];
          if (!validTypes.includes(type)) {
            return res.status(400).json({ 
              error: 'Invalid schedule type. Must be one of: ' + validTypes.join(', ') 
            });
          }
        }

        // Validasi dan konversi waktu
        let newStartTime = existingSchedule.startTime;
        let newEndTime = existingSchedule.endTime;

        if (startTime) {
          // Jika startTime adalah string format HH:MM, gabungkan dengan tanggal
          if (typeof startTime === 'string' && startTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
            const dateStr = date || existingSchedule.date.toISOString().split('T')[0];
            newStartTime = new Date(`${dateStr}T${startTime}`);
          } else {
            newStartTime = new Date(startTime);
          }
        }

        if (endTime) {
          // Jika endTime adalah string format HH:MM, gabungkan dengan tanggal
          if (typeof endTime === 'string' && endTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
            const dateStr = date || existingSchedule.date.toISOString().split('T')[0];
            newEndTime = new Date(`${dateStr}T${endTime}`);
          } else {
            newEndTime = new Date(endTime);
          }
        }
        
        if (newStartTime >= newEndTime) {
          return res.status(400).json({ 
            error: 'End time must be after start time' 
          });
        }

        const updatedSchedule = await prisma.schedule.update({
          where: {
            id: scheduleId
          },
          data: {
            title: title || existingSchedule.title,
            type: type || existingSchedule.type,
            date: date ? new Date(date) : existingSchedule.date,
            startTime: newStartTime,
            endTime: newEndTime,
            room: room !== undefined ? room : existingSchedule.room,
            lecturer: lecturer !== undefined ? lecturer : existingSchedule.lecturer,
            description: description !== undefined ? description : existingSchedule.description,
            materialUrl: materialUrl !== undefined ? materialUrl : existingSchedule.materialUrl,
            submissionLink: submissionLink !== undefined ? submissionLink : existingSchedule.submissionLink
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
        const formattedUpdatedSchedule = {
          id: updatedSchedule.id,
          title: updatedSchedule.title,
          type: updatedSchedule.type,
          date: updatedSchedule.date.toISOString().split('T')[0],
          startTime: updatedSchedule.startTime.toISOString().split('T')[1].slice(0, 8),
          endTime: updatedSchedule.endTime.toISOString().split('T')[1].slice(0, 8),
          room: updatedSchedule.room,
          lecturer: updatedSchedule.lecturer,
          description: updatedSchedule.description,
          materialUrl: updatedSchedule.materialUrl,
          submissionLink: updatedSchedule.submissionLink,
          class: updatedSchedule.class
        };

        res.status(200).json(formattedUpdatedSchedule);
        break;

      case 'DELETE':
        // Cek apakah schedule exists
        const scheduleToDelete = await prisma.schedule.findUnique({
          where: { id: scheduleId }
        });

        if (!scheduleToDelete) {
          return res.status(404).json({ error: 'Schedule not found' });
        }

        await prisma.schedule.delete({
          where: {
            id: scheduleId
          }
        });

        res.status(200).json({ message: 'Schedule deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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