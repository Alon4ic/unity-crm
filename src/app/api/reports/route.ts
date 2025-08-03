// // app/api/report/route.ts
// import { NextResponse } from "next/server";
// import { createSupabaseServerClient } from "@/lib/supabase/server";

// export async function GET(req: Request) {
//   const supabase = createSupabaseServerClient();

//   const { searchParams } = new URL(req.url);
//   const from = searchParams.get("from");
//   const to = searchParams.get("to");

//   if (!from || !to) {
//     return NextResponse.json({ error: "from and to are required" }, { status: 400 });
//   }

//   const { data, error } = await supabase.rpc("report_sales_events_summary", {
//     p_from: from,
//     p_to: to,
//   });

//   if (error) {
//     console.error("Supabase RPC error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json({ data });
// }
