import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { RangoAlimento } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, temp_min, temp_max, humedad_min, humedad_max } = body;

    const updates: Record<string, string | number> = {};
    if (nombre !== undefined) {
      if (typeof nombre !== "string" || !nombre.trim()) {
        return NextResponse.json({ error: "nombre inválido" }, { status: 400 });
      }
      updates.nombre = nombre.trim();
    }
    if (temp_min !== undefined) {
      if (typeof temp_min !== "number") {
        return NextResponse.json({ error: "temp_min inválido" }, { status: 400 });
      }
      updates.temp_min = temp_min;
    }
    if (temp_max !== undefined) {
      if (typeof temp_max !== "number") {
        return NextResponse.json({ error: "temp_max inválido" }, { status: 400 });
      }
      updates.temp_max = temp_max;
    }
    if (humedad_min !== undefined) {
      if (typeof humedad_min !== "number") {
        return NextResponse.json({ error: "humedad_min inválido" }, { status: 400 });
      }
      updates.humedad_min = humedad_min;
    }
    if (humedad_max !== undefined) {
      if (typeof humedad_max !== "number") {
        return NextResponse.json({ error: "humedad_max inválido" }, { status: 400 });
      }
      updates.humedad_max = humedad_max;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    if (
      updates.temp_min !== undefined &&
      updates.temp_max !== undefined &&
      updates.temp_min >= updates.temp_max
    ) {
      return NextResponse.json(
        { error: "temp_min debe ser menor que temp_max" },
        { status: 400 }
      );
    }

    if (
      updates.humedad_min !== undefined &&
      updates.humedad_max !== undefined &&
      updates.humedad_min >= updates.humedad_max
    ) {
      return NextResponse.json(
        { error: "humedad_min debe ser menor que humedad_max" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("rangos_alimentos")
      .update(updates as never)
      .eq("id", idNum)
      .select()
      .single<RangoAlimento>();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Ya existe un rango con ese nombre` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Rango no encontrado" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("rangos_alimentos")
      .delete()
      .eq("id", idNum)
      .select()
      .single<RangoAlimento>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Rango no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Rango eliminado", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
