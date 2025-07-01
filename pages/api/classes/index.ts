import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const classes = await prisma.class.findMany({
          include: {
            _count: {
              select: { schedules: true }
            }
          },
          orderBy: {
            name: 'asc'
          }
        });
        
        res.status(200).json(classes);
        break;

      case 'POST':
        const { name, description } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const newClass = await prisma.class.create({
          data: {
            name,
            description: description || ''
          }
        });
        
        res.status(201).json(newClass);
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