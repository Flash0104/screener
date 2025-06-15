import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        cloudinaryUrl: true,
        thumbnail: true,
        duration: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Fetch videos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
} 