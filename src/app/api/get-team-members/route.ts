import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'team-members.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const teamMembers = JSON.parse(fileContents);
    
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error reading team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
