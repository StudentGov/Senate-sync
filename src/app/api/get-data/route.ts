
import { NextResponse } from "next/server";
// import { createClient } from '@supabase/supabase-js'
// import 'dotenv/config'
import { supabase } from '../../../supabase/main'

export async function GET() {


    try {
        // return NextResponse.json(['userList']);
        // const supabase_url = process.env.SUPABASE_URL
        // const supabase_key = process.env.SUPABASE_KEY

        // const supabase = createClient(supabase_url, supabase_key)
            // Perform the "select *" from your Agendas table
        const { data, error } = await supabase
            .from('Agendas')
            .select('*')
    
        if (error) {
            // Return a 500 status if something went wrong
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
    
        // If there’s data, respond with a 200 status and the data
        return NextResponse.json({ data }, { status: 200 })
        } catch (err) {
        console.error('Error fetching data:', err)
        return NextResponse.json({ error: (err as Error).message }, { status: 500 })
        }
}
