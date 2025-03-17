import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
// Create a single supabase client for interacting with your database

const supabase_url = process.env.SUPABASE_URL
const supabase_key = process.env.SUPABASE_KEY

export default () => createClient(supabase_url, supabase_key)

// getTableData(supabase);

// // Run the insertion
// insertData(supabase);



