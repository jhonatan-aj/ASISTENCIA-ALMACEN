"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ApiResponse, Asistencia, TipoAsistencia } from "@/lib/types";
import { TIPOS_ASISTENCIA } from "@/lib/types";

type Estado =
  | "inicio"
  | "obteniendo_ubicacion"
  | "listo"
  | "registrando"
  | "completado"
  | "error_gps";

export default function AsistenciaPage() {
  const [dni, setDni] = useState("");
  const [estado, setEstado] = useState<Estado>("inicio");
  const [coordenadas, setCoordenadas] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [registroTipo, setRegistroTipo] = useState<TipoAsistencia | null>(null);

  const obtenerUbicacion = () => {
    if (!dni || dni.length !== 8) {
      toast.error("Ingresa un DNI válido de 8 dígitos");
      return;
    }

    setEstado("obteniendo_ubicacion");

    if (!navigator.geolocation) {
      setEstado("error_gps");
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordenadas({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setEstado("listo");
      },
      (error) => {
        setEstado("error_gps");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Debes permitir el acceso a tu ubicación");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("No se pudo obtener tu ubicación");
            break;
          case error.TIMEOUT:
            toast.error("Se agotó el tiempo para obtener ubicación");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const registrarAsistencia = async (tipo: TipoAsistencia) => {
    if (!coordenadas) return;

    setEstado("registrando");
    setRegistroTipo(tipo);

    const etiqueta =
      TIPOS_ASISTENCIA.find((t) => t.valor === tipo)?.etiqueta ?? tipo;

    try {
      const response = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni,
          tipo,
          latitud: coordenadas.lat,
          longitud: coordenadas.lng,
        }),
      });

      const result = (await response.json()) as ApiResponse<Asistencia>;

      if (result.success && result.data) {
        setEstado("completado");
        setMensaje(`✓ ${etiqueta} registrada a las ${result.data.hora}`);
        toast.success(`${etiqueta} registrada correctamente`);
      } else {
        setEstado("listo");
        toast.error(result.error ?? "Error al registrar");
      }
    } catch {
      setEstado("listo");
      toast.error("Error de conexión. Intenta de nuevo.");
    }
  };

  const reiniciar = () => {
    setDni("");
    setEstado("inicio");
    setCoordenadas(null);
    setMensaje("");
    setRegistroTipo(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Asistencia — Almacén
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Registra tu asistencia
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estado: Inicio - Ingresar DNI */}
          {(estado === "inicio" || estado === "error_gps") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="Ingresa tu DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg tracking-widest h-12"
                  autoFocus
                />
              </div>

              {estado === "error_gps" && (
                <p className="text-sm text-destructive text-center">
                  No se pudo obtener tu ubicación. Asegúrate de permitir el
                  acceso GPS.
                </p>
              )}

              <Button
                onClick={obtenerUbicacion}
                className="w-full h-12 text-base"
                disabled={dni.length !== 8}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Estado: Obteniendo ubicación */}
          {estado === "obteniendo_ubicacion" && (
            <div className="text-center space-y-4 py-8">
              <div className="animate-pulse">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
              <p className="text-muted-foreground">
                Obteniendo tu ubicación...
              </p>
              <p className="text-xs text-muted-foreground">
                Acepta el permiso de ubicación en tu navegador
              </p>
            </div>
          )}

          {/* Estado: Listo para registrar */}
          {(estado === "listo" || estado === "registrando") && (
            <div className="space-y-4">
              <div className="text-center space-y-1 py-2">
                <p className="text-sm text-muted-foreground">DNI</p>
                <p className="text-lg font-mono font-semibold">{dni}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TIPOS_ASISTENCIA.map((t) => (
                  <Button
                    key={t.valor}
                    onClick={() => registrarAsistencia(t.valor)}
                    disabled={estado === "registrando"}
                    variant={
                      t.valor === "entrada" || t.valor === "entrada_almuerzo"
                        ? "default"
                        : "outline"
                    }
                    className="h-14 text-sm font-semibold"
                  >
                    {estado === "registrando" && registroTipo === t.valor
                      ? "Registrando..."
                      : t.etiqueta}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={reiniciar}
                className="w-full text-muted-foreground"
                disabled={estado === "registrando"}
              >
                Cambiar DNI
              </Button>
            </div>
          )}

          {/* Estado: Completado */}
          {estado === "completado" && (
            <div className="text-center space-y-6 py-4">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-lg font-semibold">{mensaje}</p>
              </div>

              <Button
                onClick={reiniciar}
                variant="outline"
                className="w-full h-12"
              >
                Registrar otro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
