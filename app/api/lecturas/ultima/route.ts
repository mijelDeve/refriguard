import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { LecturaRefrigerador } from "@/lib/types";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("lecturas_refrigerador")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<LecturaRefrigerador | null>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}
