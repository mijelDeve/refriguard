import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("lecturas_refrigerador")
    .select("dispositivo_id")
    .order("dispositivo_id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dispositivos = [...new Set((data ?? []).map((r: any) => r.dispositivo_id))];

  return NextResponse.json(dispositivos);
}
