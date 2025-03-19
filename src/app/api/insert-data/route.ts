import { NextResponse } from 'next/server'
import { supabase } from '../../../supabase/main';

import { SupabaseClient } from '@supabase/supabase-js';

async function insertData<T extends Record<string, unknown>>(supabase: SupabaseClient, table: string, newRow: T) {

    const { data, error } = await supabase
        .from(table)        
        .insert([newRow]);

    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log('Insert successful:', data);
    }
}
export async function POST(request: Request) {
    try {

        const { table, newRow } = await request.json()
    
        // 2) Check if we got the required fields
        if (!table || !newRow) {
            return NextResponse.json({ error: 'Missing table or newRow' }, { status: 400 })
        }
    
        // 3) Insert the data
        const insertedData = await insertData(supabase, table, newRow)
    
        // 4) Return the newly inserted row(s)
        return NextResponse.json({ data: insertedData }, { status: 200 })
        } catch (error) {
        // 5) Handle any errors
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
        }
  }