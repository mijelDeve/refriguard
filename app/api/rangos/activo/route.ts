import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { RangoAlimento } from "@/lib/types";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("rangos_alimentos")
    .select("*")
    .eq("activo", true)
    .maybeSingle<RangoAlimento>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}
