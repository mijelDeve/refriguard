"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { LecturaRefrigerador } from "@/lib/types";
import { Activity } from "lucide-react";

export function TemperatureChart({
  lecturas,
}: {
  lecturas: LecturaRefrigerador[];
}) {
  if (lecturas.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-center h-64">
        <p className="text-zinc-500">Sin datos para mostrar</p>
      </div>
    );
  }

  const data = [...lecturas].reverse().map((l) => ({
    hora: new Date(l.created_at).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperatura: l.temperatura,
    humedad: l.humedad,
  }));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-zinc-400" />
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Temperatura / Humedad
        </h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="hora"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 13,
                color: "#e4e4e7",
              }}
            />
            <Line
              type="monotone"
              dataKey="temperatura"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e" }}
              name="Temp °C"
            />
            <Line
              type="monotone"
              dataKey="humedad"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
              name="Humedad %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
