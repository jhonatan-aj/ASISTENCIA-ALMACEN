"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Empleado, Asistencia, ApiResponse } from "@/lib/types";
import { ETIQUETA_TIPO } from "@/lib/types";
import Link from "next/link";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function AdminPage() {
  const [tab, setTab] = useState<"asistencias" | "empleados">("asistencias");

  // Estado asistencias
  const [mesSeleccionado, setMesSeleccionado] = useState(
    String(new Date().getMonth() + 1),
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    String(new Date().getFullYear()),
  );
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(false);

  // Estado empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [nuevoDni, setNuevoDni] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [registrandoEmpleado, setRegistrandoEmpleado] = useState(false);

  const cargarAsistencias = useCallback(async () => {
    setCargandoAsistencias(true);
    try {
      const res = await fetch(
        `/api/asistencia?mes=${mesSeleccionado}&anio=${anioSeleccionado}`,
      );
      const result = (await res.json()) as ApiResponse<Asistencia[]>;
      if (result.success && result.data) {
        setAsistencias(result.data);
      }
    } catch {
      toast.error("Error al cargar asistencias");
    } finally {
      setCargandoAsistencias(false);
    }
  }, [mesSeleccionado, anioSeleccionado]);

  const cargarEmpleados = useCallback(async () => {
    try {
      const res = await fetch("/api/empleados");
      const result = (await res.json()) as ApiResponse<Empleado[]>;
      if (result.success && result.data) {
        setEmpleados(result.data);
      }
    } catch {
      toast.error("Error al cargar empleados");
    }
  }, []);

  useEffect(() => {
    cargarAsistencias();
  }, [cargarAsistencias]);

  useEffect(() => {
    if (tab === "empleados") {
      cargarEmpleados();
    }
  }, [tab, cargarEmpleados]);

  const descargarExcel = () => {
    const url = `/api/asistencia/excel?mes=${mesSeleccionado}&anio=${anioSeleccionado}`;
    window.open(url, "_blank");
  };

  const registrarEmpleado = async () => {
    if (!nuevoDni || !nuevoNombre || !nuevoCargo) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setRegistrandoEmpleado(true);
    try {
      const res = await fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: nuevoDni,
          nombre: nuevoNombre,
          cargo: nuevoCargo,
        }),
      });
      const result = (await res.json()) as ApiResponse<Empleado>;
      if (result.success) {
        toast.success("Empleado registrado");
        setNuevoDni("");
        setNuevoNombre("");
        setNuevoCargo("");
        cargarEmpleados();
      } else {
        toast.error(result.error ?? "Error al registrar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setRegistrandoEmpleado(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-sm text-muted-foreground">
              Gestiona asistencias y empleados
            </p>
          </div>
          <Link href="/admin/qr">
            <Button variant="outline">Ver QR</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={tab === "asistencias" ? "default" : "ghost"}
            onClick={() => setTab("asistencias")}
            size="sm"
          >
            Asistencias
          </Button>
          <Button
            variant={tab === "empleados" ? "default" : "ghost"}
            onClick={() => setTab("empleados")}
            size="sm"
          >
            Empleados
          </Button>
        </div>

        {/* Tab: Asistencias */}
        {tab === "asistencias" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-1">
                    <Label>Mes</Label>
                    <Select
                      value={mesSeleccionado}
                      onValueChange={setMesSeleccionado}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MESES.map((mes, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {mes}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Año</Label>
                    <Select
                      value={anioSeleccionado}
                      onValueChange={setAnioSeleccionado}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2025, 2026, 2027].map((a) => (
                          <SelectItem key={a} value={String(a)}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={cargarAsistencias} variant="outline">
                    Buscar
                  </Button>
                  <Button onClick={descargarExcel}>Descargar Excel</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {cargandoAsistencias ? (
                  <p className="text-center text-muted-foreground py-8">
                    Cargando...
                  </p>
                ) : asistencias.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay registros para este mes
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>DNI</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {asistencias.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-mono">{a.dni}</TableCell>
                            <TableCell>{a.nombre}</TableCell>
                            <TableCell>{a.fecha}</TableCell>
                            <TableCell>{a.hora}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  a.tipo === "entrada" ||
                                  a.tipo === "entrada_almuerzo"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {ETIQUETA_TIPO[a.tipo]}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {asistencias.length} registro(s)
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Empleados */}
        {tab === "empleados" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registrar Empleado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor="emp-dni">DNI</Label>
                    <Input
                      id="emp-dni"
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="12345678"
                      value={nuevoDni}
                      onChange={(e) =>
                        setNuevoDni(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-48">
                    <Label htmlFor="emp-nombre">Nombre Completo</Label>
                    <Input
                      id="emp-nombre"
                      placeholder="Juan Pérez López"
                      value={nuevoNombre}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="emp-cargo">Cargo</Label>
                    <Input
                      id="emp-cargo"
                      placeholder="Almacenero"
                      value={nuevoCargo}
                      onChange={(e) => setNuevoCargo(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button
                    onClick={registrarEmpleado}
                    disabled={registrandoEmpleado}
                  >
                    {registrandoEmpleado ? "Registrando..." : "Registrar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                {empleados.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay empleados registrados
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>DNI</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cargo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empleados.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-mono">{emp.dni}</TableCell>
                          <TableCell>{emp.nombre}</TableCell>
                          <TableCell>{emp.cargo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {empleados.length} empleado(s)
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
