import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { LecturaRefrigerador } from "@/lib/types";

type Estado = "normal" | "pre-alerta" | "alerta" | "mantenimiento";

function calcularEstado(temperatura: number): {
  estado: Estado;
  mensaje_estado: string;
} {
  if (temperatura < 2) {
    return {
      estado: "alerta",
      mensaje_estado: "Temperatura crítica: bajo cero",
    };
  }
  if (temperatura >= 2 && temperatura < 4) {
    return {
      estado: "pre-alerta",
      mensaje_estado: "Temperatura baja, acercándose a límite crítico",
    };
  }
  if (temperatura >= 4 && temperatura <= 10) {
    return {
      estado: "normal",
      mensaje_estado: "Temperatura dentro del rango óptimo",
    };
  }
  if (temperatura > 10 && temperatura <= 12) {
    return {
      estado: "pre-alerta",
      mensaje_estado: "Temperatura elevada, acercándose a límite crítico",
    };
  }
  return {
    estado: "alerta",
    mensaje_estado: "Temperatura crítica: sobrecalentamiento",
  };
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  const { data, error } = await supabase
    .from("lecturas_refrigerador")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { temperatura, humedad, dispositivo_id } = body;

    if (
      typeof temperatura !== "number" ||
      typeof humedad !== "number" ||
      typeof dispositivo_id !== "string" ||
      !dispositivo_id
    ) {
      return NextResponse.json(
        { error: "Campos requeridos: temperatura (number), humedad (number), dispositivo_id (string)" },
        { status: 400 }
      );
    }

    const { estado, mensaje_estado } = calcularEstado(temperatura);

    const { data: lectura, error: insertError } = await supabase
      .from("lecturas_refrigerador")
      .insert({ temperatura, humedad, dispositivo_id, estado, mensaje_estado } as never)
      .select()
      .single<LecturaRefrigerador>();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (estado === "alerta") {
      const { error: alertaError } = await supabase
        .from("historial_alertas")
        .insert({
          lectura_id: lectura.id,
          temperatura,
          humedad,
          dispositivo_id,
          mensaje: mensaje_estado,
        } as never);

      if (alertaError) {
        console.error("Error al guardar en historial_alertas:", alertaError.message);
      }
    }

    return NextResponse.json(lectura, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
