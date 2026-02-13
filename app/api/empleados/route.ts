import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Empleado, EmpleadoPayload, ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EmpleadoPayload;
    const { dni, nombre, cargo } = body;

    if (!dni || !nombre || !cargo) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "El DNI debe tener 8 dígitos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const { data: existente } = await supabase
      .from("empleados")
      .select("id")
      .eq("dni", dni)
      .single();

    if (existente) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Ya existe un empleado con ese DNI" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("empleados")
      .insert({ dni, nombre: nombre.toUpperCase(), cargo })
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al registrar empleado" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Empleado>>({
      success: true,
      data,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("empleados")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Error al obtener empleados" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Empleado[]>>({
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
