import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { LecturaRefrigerador } from "@/lib/types";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase();
    const { id } = await params;
    const lecturaId = Number(id);

    if (isNaN(lecturaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { data: lectura, error: findError } = await supabase
      .from("lecturas_refrigerador")
      .select("*")
      .eq("id", lecturaId)
      .single<LecturaRefrigerador>();

    if (findError || !lectura) {
      return NextResponse.json(
        { error: "Lectura no encontrada" },
        { status: 404 }
      );
    }

    if (lectura.estado === "mantenimiento") {
      return NextResponse.json(
        { error: "La lectura ya está en estado mantenimiento" },
        { status: 409 }
      );
    }

    const mensaje = "Equipo en pausa para revisión técnica";

    const { data: actualizada, error: updateError } = await supabase
      .from("lecturas_refrigerador")
      .update({ estado: "mantenimiento", mensaje_estado: mensaje } as never)
      .eq("id", lecturaId)
      .select()
      .single<LecturaRefrigerador>();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { error: alertaError } = await supabase
      .from("historial_alertas")
      .insert({
        lectura_id: lecturaId,
        temperatura: lectura.temperatura,
        humedad: lectura.humedad,
        dispositivo_id: lectura.dispositivo_id,
        mensaje: `Mantenimiento manual activado — ${mensaje}`,
      } as never);

    if (alertaError) {
      console.error("Error al registrar mantenimiento en historial:", alertaError.message);
    }

    return NextResponse.json(actualizada, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
