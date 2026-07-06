import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { Dispositivo } from "@/lib/types";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("dispositivos")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as Dispositivo[]);
}
