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

export interface RangoAlimento {
  id: number;
  nombre: string;
  temp_min: number;
  temp_max: number;
  humedad_min: number;
  humedad_max: number;
  created_at: string;
}
