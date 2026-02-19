import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { estaEnAlmacen } from "@/lib/geo-utils";
import { RADIO_MAXIMO_METROS } from "@/lib/constants";
import type { RegistroAsistenciaPayload, ApiResponse, Asistencia, TipoAsistencia } from "@/lib/types";
import { ETIQUETA_TIPO } from "@/lib/types";

// Tipos válidos de asistencia
const TIPOS_VALIDOS: TipoAsistencia[] = [
  "entrada",
  "salida_almuerzo",
  "entrada_almuerzo",
  "salida",
];


export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegistroAsistenciaPayload;
    const { dni, tipo, latitud, longitud } = body;

    if (!dni || !tipo || latitud === undefined || longitud === undefined) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar que el tipo sea válido
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Tipo de asistencia no válido" },
        { status: 400 }
      );
    }

    // Validar GPS
    const ubicacion = estaEnAlmacen(latitud, longitud);
    if (!ubicacion.valido) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `No estás dentro del rango del almacén. Distancia: ${ubicacion.distancia}m (máximo: ${RADIO_MAXIMO_METROS}m)`,
        },
        { status: 403 }
      );
    }

    // Buscar empleado por DNI
    const { data: empleado, error: empError } = await supabase
      .from("empleados")
      .select("*")
      .eq("dni", dni)
      .single();

    if (empError || !empleado) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "DNI no registrado. Contacte al administrador." },
        { status: 404 }
      );
    }

    // Obtener fecha y hora actual en zona horaria de Perú
    const ahora = new Date();
    const fechaPeru = ahora.toLocaleDateString("en-CA", {
      timeZone: "America/Lima",
    });
    const horaPeru = ahora.toLocaleTimeString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Verificar si ya tiene registro del mismo tipo hoy
    const { data: registroExistente } = await supabase
      .from("asistencias")
      .select("id")
      .eq("dni", dni)
      .eq("fecha", fechaPeru)
      .eq("tipo", tipo)
      .single();

    if (registroExistente) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Ya registraste tu ${ETIQUETA_TIPO[tipo]} hoy.`,
        },
        { status: 409 }
      );
    }

    // Registrar asistencia
    const { data: asistencia, error: asistError } = await supabase
      .from("asistencias")
      .insert({
        empleado_id: empleado.id,
        dni,
        nombre: empleado.nombre,
        fecha: fechaPeru,
        hora: horaPeru,
        tipo,
        latitud,
        longitud,
      })
      .select()
      .single();

    if (asistError) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al registrar asistencia" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Asistencia>>({
      success: true,
      data: asistencia,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");

    if (!mes || !anio) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Se requieren mes y año" },
        { status: 400 }
      );
    }

    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt(anio, 10);
    const fechaInicio = `${anioNum}-${String(mesNum).padStart(2, "0")}-01`;
    const ultimoDia = new Date(anioNum, mesNum, 0).getDate();
    const fechaFin = `${anioNum}-${String(mesNum).padStart(2, "0")}-${ultimoDia}`;

    const { data, error } = await supabase
      .from("asistencias")
      .select("*")
      .gte("fecha", fechaInicio)
      .lte("fecha", fechaFin)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al obtener asistencias" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Asistencia[]>>({
      success: true,
      data: data ?? [],
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
