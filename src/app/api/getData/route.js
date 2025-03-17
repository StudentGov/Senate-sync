
// async function getTableData(supabase) {
//     const { data, error } = await supabase
//       .from('Agendas')
//       .select('*'); // '*' fetches all columns

//     if (error) {
//       console.error('Error fetching data:', error);
//     } else {
//       console.log('Data from table:', data);
//       console.log(data[0].options.options)
//       return data;
//     }
//   }
import supabase from '../../../supabase/main'
import { NextResponse } from "next/server";
// Our API endpoint – handles GET requests
export async function GET() {
  console.log("in get api function")
  try {
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
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}