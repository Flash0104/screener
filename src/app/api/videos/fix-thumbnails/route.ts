import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
  try {
    console.log('🔧 Fixing old video thumbnails...');
    
    // Get all videos with old thumbnail format
    const videos = await prisma.video.findMany({
      where: {
        thumbnail: {
          contains: '/so_0/'
        }
      }
    });

    console.log(`Found ${videos.length} videos with old thumbnails`);

    // Update each video thumbnail
    const updatePromises = videos.map(async (video) => {
      const newThumbnail = video.thumbnail?.replace(
        '/video/upload/so_0/',
        '/video/upload/c_scale,w_400,h_300,f_jpg,so_5/'
      );

      return prisma.video.update({
        where: { id: video.id },
        data: { thumbnail: newThumbnail }
      });
    });

    await Promise.all(updatePromises);

    console.log('✅ All thumbnails updated successfully');

    return NextResponse.json({
      success: true,
      updated: videos.length,
      message: `Updated ${videos.length} video thumbnails`
    });

  } catch (error) {
    console.error('❌ Fix thumbnails error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fix thumbnails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 