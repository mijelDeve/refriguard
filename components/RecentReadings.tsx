"use client";

import { StatusBadge } from "./StatusBadge";
import type { LecturaRefrigerador } from "@/lib/types";
import { ClipboardList } from "lucide-react";

export function RecentReadings({
  lecturas,
}: {
  lecturas: LecturaRefrigerador[];
}) {
  if (lecturas.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-center h-40">
        <p className="text-zinc-500">Sin lecturas registradas</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-4 text-zinc-400" />
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Lecturas Recientes
        </h3>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
        {lecturas.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2"
          >
            <div className="flex items-center gap-4">
              <span className="tabular-nums font-medium text-sm w-16">
                {l.temperatura.toFixed(1)}°C
              </span>
              <span className="tabular-nums text-zinc-500 text-sm w-12">
                {l.humedad.toFixed(1)}%
              </span>
              <span className="text-xs text-zinc-600 w-20 truncate">
                {l.dispositivo_id}
              </span>
            </div>
            <StatusBadge estado={l.estado} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
