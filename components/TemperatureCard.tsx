"use client";

import { StatusBadge } from "./StatusBadge";
import type { LecturaRefrigerador } from "@/lib/types";
import { Thermometer, Droplets, Clock } from "lucide-react";

export function TemperatureCard({
  lectura,
}: {
  lectura: LecturaRefrigerador | null;
}) {
  if (!lectura) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-center h-48">
        <p className="text-zinc-500">Esperando datos...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Estado Actual
        </h3>
        <StatusBadge estado={lectura.estado} size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Thermometer className="size-4" />
            Temperatura
          </div>
          <p className="text-4xl font-bold tabular-nums">
            {lectura.temperatura.toFixed(1)}
            <span className="text-lg text-zinc-500">°C</span>
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Droplets className="size-4" />
            Humedad
          </div>
          <p className="text-4xl font-bold tabular-nums">
            {lectura.humedad.toFixed(1)}
            <span className="text-lg text-zinc-500">%</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Clock className="size-3" />
        {new Date(lectura.created_at).toLocaleString("es-PE", {
          dateStyle: "medium",
          timeStyle: "medium",
        })}
      </div>
    </div>
  );
}
