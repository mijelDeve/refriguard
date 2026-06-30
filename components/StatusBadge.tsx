import type { EstadoLectura } from "@/lib/types";

const config: Record<EstadoLectura, { label: string; bg: string; dot: string }> = {
  normal: {
    label: "Normal",
    bg: "bg-green-900/40 text-green-400 border-green-800",
    dot: "bg-green-500",
  },
  "pre-alerta": {
    label: "Pre-alerta",
    bg: "bg-amber-900/40 text-amber-400 border-amber-800",
    dot: "bg-amber-500",
  },
  alerta: {
    label: "Alerta",
    bg: "bg-red-900/40 text-red-400 border-red-800",
    dot: "bg-red-500",
  },
  mantenimiento: {
    label: "Mantenimiento",
    bg: "bg-blue-900/40 text-blue-400 border-blue-800",
    dot: "bg-blue-500",
  },
};

export function StatusBadge({
  estado,
  size = "md",
}: {
  estado: EstadoLectura;
  size?: "sm" | "md" | "lg";
}) {
  const c = config[estado];
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs gap-1.5" : size === "lg" ? "px-4 py-1.5 text-sm gap-2" : "px-3 py-1 text-sm gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${c.bg} ${sizeClass}`}>
      <span className={`size-1.5 rounded-full ${c.dot} animate-pulse`} />
      {c.label}
    </span>
  );
}
