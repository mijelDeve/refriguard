"use client";

import { Monitor } from "lucide-react";
import type { Dispositivo } from "@/lib/types";

interface DeviceFilterProps {
  dispositivos: Dispositivo[];
  selected: string;
  onChange: (value: string) => void;
}

export function DeviceFilter({ dispositivos, selected, onChange }: DeviceFilterProps) {
  if (dispositivos.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Monitor className="size-4 text-zinc-500" />
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-blue-500"
      >
        <option value="all">Todos los dispositivos</option>
        {dispositivos.map((d) => (
          <option key={d.nombre} value={d.nombre}>
            {d.nombre}{d.ubicacion ? ` — ${d.ubicacion}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
