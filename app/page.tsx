import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Almacén UGEL
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sistema de Control de Asistencia
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/asistencia" className="block">
            <Button className="w-full h-12 text-base">
              Registrar Asistencia
            </Button>
          </Link>
          <Link href="/admin" className="block">
            <Button variant="outline" className="w-full h-12 text-base">
              Panel Administrador
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
