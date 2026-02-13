import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Asistencia, ApiResponse } from "@/lib/types";
import { ETIQUETA_TIPO } from "@/lib/types";
import * as XLSX from "xlsx";

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
        { success: false, error: "Error al generar Excel" },
        { status: 500 }
      );
    }

    const registros = (data ?? []) as Asistencia[];

    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];

    // Crear datos para Excel
    const datosExcel = registros.map((r) => ({
      DNI: r.dni,
      Nombre: r.nombre,
      Fecha: r.fecha,
      Hora: r.hora,
      Tipo: ETIQUETA_TIPO[r.tipo],
      Latitud: r.latitud,
      Longitud: r.longitud,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);

    // Ajustar anchos de columna
    worksheet["!cols"] = [
      { wch: 12 },  // DNI
      { wch: 30 },  // Nombre
      { wch: 12 },  // Fecha
      { wch: 10 },  // Hora
      { wch: 18 },  // Tipo
      { wch: 14 },  // Latitud
      { wch: 14 },  // Longitud
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Asistencia ${meses[mesNum - 1]} ${anioNum}`
    );

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="asistencia_${meses[mesNum - 1]}_${anioNum}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Error al generar Excel" },
      { status: 500 }
    );
  }
}
