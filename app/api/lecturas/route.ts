import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { LecturaRefrigerador, RangoAlimento } from "@/lib/types";

type Estado = "normal" | "pre-alerta" | "alerta" | "mantenimiento";

const MARGEN_TEMP = 2.0;
const MARGEN_HUM = 5.0;

function calcularEstado(
  temperatura: number,
  humedad: number,
  rango: RangoAlimento | null
): {
  estado: Estado;
  mensaje_estado: string;
} {
  // Fallback: sin rango activo, usar lógica hardcodeada original
  if (!rango) {
    if (temperatura < 2) {
      return { estado: "alerta", mensaje_estado: "Temperatura crítica: bajo cero" };
    }
    if (temperatura < 4) {
      return { estado: "pre-alerta", mensaje_estado: "Temperatura baja, acercándose a límite crítico" };
    }
    if (temperatura <= 10) {
      return { estado: "normal", mensaje_estado: "Temperatura dentro del rango óptimo" };
    }
    if (temperatura <= 12) {
      return { estado: "pre-alerta", mensaje_estado: "Temperatura elevada, acercándose a límite crítico" };
    }
    return { estado: "alerta", mensaje_estado: "Temperatura crítica: sobrecalentamiento" };
  }

  const { temp_min, temp_max, humedad_min, humedad_max } = rango;

  const tempOk = temperatura >= temp_min && temperatura <= temp_max;
  const humOk = humedad >= humedad_min && humedad <= humedad_max;

  if (tempOk && humOk) {
    return { estado: "normal", mensaje_estado: "Condiciones dentro del rango óptimo" };
  }

  const tempBaja = temperatura < temp_min && temperatura >= temp_min - MARGEN_TEMP;
  const tempAlta = temperatura > temp_max && temperatura <= temp_max + MARGEN_TEMP;
  const humBaja = humedad < humedad_min && humedad >= Math.max(0, humedad_min - MARGEN_HUM);
  const humAlta = humedad > humedad_max && humedad <= Math.min(100, humedad_max + MARGEN_HUM);

  if (tempBaja || tempAlta || humBaja || humAlta) {
    return { estado: "pre-alerta", mensaje_estado: "Lectura se acerca al límite del rango" };
  }

  return { estado: "alerta", mensaje_estado: "Lectura fuera del rango crítico" };
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

    const { data: rangoActivo } = await supabase
      .from("rangos_alimentos")
      .select("*")
      .eq("activo", true)
      .maybeSingle<RangoAlimento>();

    const { estado, mensaje_estado } = calcularEstado(temperatura, humedad, rangoActivo);

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
