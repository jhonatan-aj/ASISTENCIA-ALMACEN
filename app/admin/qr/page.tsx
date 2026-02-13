"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "qrcode";
import Link from "next/link";

function useAsistenciaUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/asistencia`;
}

export default function QRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = useAsistenciaUrl();

  const generarQR = useCallback((canvas: HTMLCanvasElement, qrUrl: string) => {
    QRCode.toCanvas(
      canvas,
      qrUrl,
      {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      (error) => {
        if (error) console.error("Error generando QR:", error);
      },
    );
  }, []);

  useEffect(() => {
    if (canvasRef.current && url) {
      generarQR(canvasRef.current, url);
    }
  }, [url, generarQR]);

  const imprimir = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            QR de Asistencia
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Imprime este QR y pégalo en el almacén
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center bg-white p-6 rounded-lg border">
            <canvas ref={canvasRef} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">URL codificada:</p>
            <p className="text-sm font-mono break-all">{url}</p>
          </div>

          <div className="space-y-3 print:hidden">
            <p className="text-sm text-muted-foreground text-center">
              Los empleados escanean este QR con su celular para registrar su
              asistencia.
            </p>

            <div className="flex gap-3">
              <Button onClick={imprimir} className="flex-1">
                Imprimir QR
              </Button>
              <Link href="/admin" className="flex-1">
                <Button variant="outline" className="w-full">
                  Volver al Panel
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
