import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
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

    // Debug log
    console.log('Fetched schedules count:', allSchedules.length);
    console.log('Is array?', Array.isArray(allSchedules));

    // PASTIKAN selalu return array
    res.status(200).json(allSchedules || []);
  } catch (error) {
    console.error('API Error:', error);
    // Return array kosong jika error
    res.status(500).json({ 
      error: 'Failed to fetch schedules',
      schedules: [] // Tambahkan fallback array
    });
  } finally {
    await prisma.$disconnect();
  }
}