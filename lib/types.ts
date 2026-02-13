export type TipoAsistencia =
  | "entrada"
  | "salida_almuerzo"
  | "entrada_almuerzo"
  | "salida";

export const TIPOS_ASISTENCIA: { valor: TipoAsistencia; etiqueta: string }[] = [
  { valor: "entrada", etiqueta: "Entrada" },
  { valor: "salida_almuerzo", etiqueta: "Salida Almuerzo" },
  { valor: "entrada_almuerzo", etiqueta: "Entrada Almuerzo" },
  { valor: "salida", etiqueta: "Salida" },
];

export const ETIQUETA_TIPO: Record<TipoAsistencia, string> = {
  entrada: "Entrada",
  salida_almuerzo: "Salida Almuerzo",
  entrada_almuerzo: "Entrada Almuerzo",
  salida: "Salida",
};

export interface Empleado {
  id: string;
  dni: string;
  nombre: string;
  cargo: string;
  created_at: string;
}

export interface Asistencia {
  id: string;
  empleado_id: string;
  dni: string;
  nombre: string;
  fecha: string;
  hora: string;
  tipo: TipoAsistencia;
  latitud: number;
  longitud: number;
  created_at: string;
}

export interface RegistroAsistenciaPayload {
  dni: string;
  tipo: TipoAsistencia;
  latitud: number;
  longitud: number;
}

export interface EmpleadoPayload {
  dni: string;
  nombre: string;
  cargo: string;
}

export interface AsistenciaConEmpleado extends Asistencia {
  empleado: Empleado | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
