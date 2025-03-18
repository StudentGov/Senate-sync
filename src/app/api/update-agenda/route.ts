import { supabase } from '../../../supabase/main'
import { NextResponse } from 'next/server'


  export async function POST(request) {
      try {
  
          const { id, visible } = await request.json()
      
          const { data, error } = await supabase
          .from('Agendas')
          .update({ is_visible: visible })
          .eq('id', id);
          if (error) {
            // Return a 500 status if something went wrong
            return NextResponse.json({ error: error.message }, { status: 500 })
          }
          // 4) Return the newly inserted row(s)
          return NextResponse.json({ data: data }, { status: 200 })
          } catch (error) {
          // 5) Handle any errors
          return NextResponse.json({ error: error.message }, { status: 500 })
          }
    }