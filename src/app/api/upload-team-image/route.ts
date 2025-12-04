import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const { sessionClaims } = await auth();
    const userRole = sessionClaims?.role as string;

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const position = formData.get('position') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!position) {
      return NextResponse.json(
        { error: 'Position is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate filename based on position and timestamp
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const filename = `${position}_${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/images directory
    const publicDir = path.join(process.cwd(), 'public', 'images');
    
    // Ensure directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filepath = path.join(publicDir, filename);
    await writeFile(filepath, buffer);

    // Return the path that can be used in the image src
    const imagePath = `/images/${filename}`;

    return NextResponse.json({
      success: true,
      imagePath,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
