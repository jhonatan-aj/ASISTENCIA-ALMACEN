-- ============================================
-- SQL para crear las tablas en Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dni VARCHAR(8) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  dni VARCHAR(8) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida_almuerzo', 'entrada_almuerzo', 'salida')),
  latitud DOUBLE PRECISION NOT NULL,
  longitud DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencias_dni ON asistencias(dni);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha_tipo ON asistencias(fecha, tipo);

-- Evitar duplicados de entrada/salida por día
CREATE UNIQUE INDEX IF NOT EXISTS idx_asistencia_unica 
  ON asistencias(dni, fecha, tipo);

-- ============================================
-- Políticas RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública de empleados (para buscar por DNI)
CREATE POLICY "Lectura pública empleados"
  ON empleados FOR SELECT
  USING (true);

-- Política: Permitir inserción pública de asistencias (los empleados no tienen auth)
CREATE POLICY "Inserción pública asistencias"
  ON asistencias FOR INSERT
  WITH CHECK (true);

-- Política: Permitir lectura pública de asistencias (para el admin)
CREATE POLICY "Lectura pública asistencias"
  ON asistencias FOR SELECT
  USING (true);

-- Política: Permitir inserción de empleados (admin)
CREATE POLICY "Inserción empleados"
  ON empleados FOR INSERT
  WITH CHECK (true);
