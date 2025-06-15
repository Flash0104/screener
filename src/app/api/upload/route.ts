import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const prisma = new PrismaClient();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    console.log('📝 Form data:', { 
      fileExists: !!file, 
      fileSize: file?.size, 
      title, 
      description 
    });

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate input
    try {
      const validatedData = uploadSchema.parse({ title, description });
      console.log('✅ Validation passed:', validatedData);
    } catch (validationError) {
      console.error('❌ Validation failed:', validationError);
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const validatedData = uploadSchema.parse({ title, description });

    // Convert file to buffer
    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Buffer created, size:', buffer.length);

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'screener-videos',
          format: 'mp4',
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload success:', result?.public_id);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = uploadResult as { secure_url: string; public_id: string; duration: number; bytes: number };

    // Save to database
    console.log('💾 Saving to database...');
    try {
      const video = await prisma.video.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id,
          thumbnail: result.secure_url.replace('/video/upload/', '/video/upload/so_0/'),
          duration: result.duration,
          fileSize: result.bytes,
        },
      });
      console.log('✅ Database save success:', video.id);

      return NextResponse.json({ 
        success: true, 
        video: {
          id: video.id,
          title: video.title,
          url: video.cloudinaryUrl,
          thumbnail: video.thumbnail,
        }
      });
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        { error: 'Database save failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload video', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 