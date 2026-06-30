"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import type { EstadoLectura } from "@/lib/types";

export function MaintenanceButton({
  lecturaId,
  estado,
  onSuccess,
}: {
  lecturaId: number;
  estado: EstadoLectura;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  if (estado !== "alerta") return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lecturas/${lecturaId}/mantenimiento`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al cambiar estado");
        return;
      }
      onSuccess();
    } catch {
      alert("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
    >
      <Wrench className={`size-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Procesando..." : "Pasar a Mantenimiento"}
    </button>
  );
}
