"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { TemperatureCard } from "./TemperatureCard";
import { TemperatureChart } from "./TemperatureChart";
import { RecentReadings } from "./RecentReadings";
import { AlertHistory } from "./AlertHistory";
import { MaintenanceButton } from "./MaintenanceButton";
import { RangeManager } from "./RangeManager";
import type { LecturaRefrigerador, RangoAlimento } from "@/lib/types";
import { Snowflake } from "lucide-react";

interface Alerta {
  id: number;
  created_at: string;
  lectura_id: number;
  temperatura: number;
  humedad: number;
  dispositivo_id: string;
  mensaje: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export function DashboardClient() {
  const [ultima, setUltima] = useState<LecturaRefrigerador | null>(null);
  const [lecturas, setLecturas] = useState<LecturaRefrigerador[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [rangoActivo, setRangoActivo] = useState<RangoAlimento | null>(null);

  const fetchAll = useCallback(async () => {
    const [ultimaRes, lecturasRes, alertasRes, rangoRes] = await Promise.all([
      fetch("/api/lecturas/ultima"),
      fetch("/api/lecturas?limit=50"),
      fetch("/api/historial-alertas"),
      fetch("/api/rangos/activo"),
    ]);

    if (ultimaRes.ok) {
      const data = await ultimaRes.json();
      if (data && !data.error) setUltima(data);
    }
    if (lecturasRes.ok) {
      const data = await lecturasRes.json();
      if (Array.isArray(data)) setLecturas(data);
    }
    if (alertasRes.ok) {
      const data = await alertasRes.json();
      if (Array.isArray(data)) setAlertas(data);
    }
    if (rangoRes.ok) {
      const data = await rangoRes.json();
      if (data && !data.error) setRangoActivo(data);
      else setRangoActivo(null);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchAll(), 0);

    const channel = supabase
      .channel("lecturas_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lecturas_refrigerador" },
        (payload) => {
          const nueva = payload.new as LecturaRefrigerador;
          setUltima(nueva);
          setLecturas((prev) => [nueva, ...prev].slice(0, 50));

          if (nueva.estado === "alerta") {
            setAlertas((prev) => [
              {
                id: Date.now() + Math.random(),
                created_at: nueva.created_at,
                lectura_id: nueva.id,
                temperatura: nueva.temperatura,
                humedad: nueva.humedad,
                dispositivo_id: nueva.dispositivo_id,
                mensaje: nueva.mensaje_estado,
              },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(id);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600">
            <Snowflake className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Monitoreo de Refrigeradores</h1>
            <p className="text-sm text-zinc-500">Sistema de control de temperatura y humedad</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rangoActivo && (
            <div className="hidden items-center gap-2 rounded-lg border border-green-800/40 bg-green-950/20 px-3 py-2 sm:flex">
              <span className="size-2 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-400">{rangoActivo.nombre}</span>
            </div>
          )}
          <RangeManager />
          {ultima && (
            <MaintenanceButton
              lecturaId={ultima.id}
              estado={ultima.estado}
              onSuccess={fetchAll}
            />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TemperatureCard lectura={ultima} />
        </div>
        <div className="lg:col-span-2">
          <TemperatureChart lecturas={lecturas} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentReadings lecturas={lecturas} />
        <AlertHistory alertas={alertas} />
      </div>
    </div>
  );
}
