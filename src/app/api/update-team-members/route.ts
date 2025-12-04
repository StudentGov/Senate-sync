import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { position, name, image } = body;

    if (!position || !name || !image) {
      return NextResponse.json(
        { error: 'Missing required fields: position, name, image' },
        { status: 400 }
      );
    }

    // Validate position
    const validPositions = ['president', 'vicePresident', 'speaker'];
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { error: 'Invalid position. Must be president, vicePresident, or speaker' },
        { status: 400 }
      );
    }

    // Read current team members
    const filePath = path.join(process.cwd(), 'src', 'app', 'team-members.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const teamMembers = JSON.parse(fileContents);

    // Update the specific position
    teamMembers[position] = {
      ...teamMembers[position],
      name,
      image
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(teamMembers, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Team member updated successfully',
      teamMembers 
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}
