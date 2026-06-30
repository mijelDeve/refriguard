"use client";

import { AlertTriangle } from "lucide-react";

interface Alerta {
  id: number;
  created_at: string;
  lectura_id: number;
  temperatura: number;
  humedad: number;
  dispositivo_id: string;
  mensaje: string | null;
}

export function AlertHistory({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-center h-40">
        <p className="text-zinc-500">Sin alertas registradas</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-red-400" />
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Historial de Alertas
        </h3>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
        {alertas.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="tabular-nums font-medium text-sm text-red-400">
                  {a.temperatura.toFixed(1)}°C
                </span>
                <span className="tabular-nums text-zinc-500 text-sm">
                  {a.humedad.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-600">{a.dispositivo_id}</span>
              </div>
              {a.mensaje && (
                <p className="text-xs text-zinc-500 mt-1">{a.mensaje}</p>
              )}
            </div>
            <span className="text-xs text-zinc-600 shrink-0">
              {new Date(a.created_at).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
