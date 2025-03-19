// app/api/votes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../supabase/main'

export async function POST(request: NextRequest) {
  try {
    // 1) Extract POST body
    const { voter_id, agenda_id, vote } = await request.json();

    // 2) Update the option_text in votes table 
    //    matching voter_id AND agenda_id
    const { data, error } = await supabase
      .from('Votes')
      .update({ option_text: vote })
      .eq('voter_id', voter_id)
      .eq('agenda_id', agenda_id)
      .single();

    // 3) Handle potential errors
    if (error) {
      
      throw new Error(error.message);
    }

    // 4) Return updated row
    return NextResponse.json({
      success: true,
      data,
      message: `Updated vote with voter_id=${voter_id}, agenda_id=${agenda_id}.`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
