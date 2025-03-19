// app/api/votes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabase/main'

export async function POST(request: NextRequest) {
  try {
    // return NextResponse.json(763427);
    const { agendaId, user } = await request.json();

    // 1) Attempt to select a single vote row
    //    If there are 0 rows, it returns an error with code 406
    //    If there are multiple rows (which can't happen with unique constraint), also 406
    const { data: existingVote } = await supabase
      .from('Votes')
      .select('*')
      .eq('agenda_id', agendaId)
      .eq('voter_id', user.id)
      .single(); // ensures only 1 row or throws an error
    //   return NextResponse.json(user)
    if (!existingVote){
        const newRow = {
            voter_id:user.id,
            agenda_id: agendaId,
            option_text: 'N/A',
            name:`${user.firstName} ${user.lastName}`
        }
        
        const { data: insertedVote, error: insertError } = await supabase
          .from('Votes')
          .insert([newRow])
          .single();
        if (insertError) {

          throw new Error(insertError.message);
        }

        // Return newly inserted vote
        return NextResponse.json({
          success: true,
          data: insertedVote,
          message: 'Created new vote row.',
        });
    }

    else{
        return NextResponse.json({
            success: true,
            data: existingVote,
            message: 'Found existing vote row.',
          });
    }

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
