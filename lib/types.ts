export type EstadoLectura = "normal" | "pre-alerta" | "alerta" | "mantenimiento";

export interface LecturaRefrigerador {
  id: number;
  created_at: string;
  temperatura: number;
  humedad: number;
  dispositivo_id: string;
  estado: EstadoLectura;
  mensaje_estado: string | null;
}
