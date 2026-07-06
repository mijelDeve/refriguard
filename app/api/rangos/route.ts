import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { RangoAlimento } from "@/lib/types";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("rangos_alimentos")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { nombre, temp_min, temp_max, humedad_min, humedad_max } = body;

    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      typeof temp_min !== "number" ||
      typeof temp_max !== "number" ||
      typeof humedad_min !== "number" ||
      typeof humedad_max !== "number"
    ) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre (string), temp_min (number), temp_max (number), humedad_min (number), humedad_max (number)" },
        { status: 400 }
      );
    }

    if (temp_min >= temp_max) {
      return NextResponse.json(
        { error: "temp_min debe ser menor que temp_max" },
        { status: 400 }
      );
    }

    if (humedad_min >= humedad_max) {
      return NextResponse.json(
        { error: "humedad_min debe ser menor que humedad_max" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rangos_alimentos")
      .insert({ nombre: nombre.trim(), temp_min, temp_max, humedad_min, humedad_max } as never)
      .select()
      .single<RangoAlimento>();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Ya existe un rango para "${nombre}"` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
