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
        // Ambil data class berdasarkan ID
        const classData = await prisma.class.findUnique({
          where: { id: classId },
          include: {
            _count: {
              select: { schedules: true }
            }
          }
        });

        if (!classData) {
          return res.status(404).json({ error: 'Class not found' });
        }

        res.status(200).json(classData);
        break;

      case 'PUT':
        const { name, description } = req.body;
        
        // Cek apakah class exists
        const existingClass = await prisma.class.findUnique({
          where: { id: classId }
        });

        if (!existingClass) {
          return res.status(404).json({ error: 'Class not found' });
        }

        const updatedClass = await prisma.class.update({
          where: { id: classId },
          data: {
            name: name || existingClass.name,
            description: description !== undefined ? description : existingClass.description
          },
          include: {
            _count: {
              select: { schedules: true }
            }
          }
        });

        res.status(200).json(updatedClass);
        break;

      case 'DELETE':
        // Cek apakah class exists
        const classToDelete = await prisma.class.findUnique({
          where: { id: classId }
        });

        if (!classToDelete) {
          return res.status(404).json({ error: 'Class not found' });
        }

        // Hapus semua schedules yang terkait dulu
        await prisma.schedule.deleteMany({
          where: { classId: classId }
        });

        // Kemudian hapus class
        await prisma.class.delete({
          where: { id: classId }
        });

        res.status(200).json({ message: 'Class deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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