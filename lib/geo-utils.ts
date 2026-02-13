import { ALMACEN_COORDS, RADIO_MAXIMO_METROS } from "./constants";

/**
 * Calcula la distancia entre dos coordenadas GPS usando la fórmula de Haversine.
 * @returns Distancia en metros.
 */
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRadianes(lat2 - lat1);
  const dLon = toRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadianes(lat1)) *
      Math.cos(toRadianes(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

/**
 * Verifica si las coordenadas están dentro del radio permitido del almacén.
 */
export function estaEnAlmacen(latitud: number, longitud: number): {
  valido: boolean;
  distancia: number;
} {
  const distancia = calcularDistancia(
    latitud,
    longitud,
    ALMACEN_COORDS.latitud,
    ALMACEN_COORDS.longitud
  );
  return {
    valido: distancia <= RADIO_MAXIMO_METROS,
    distancia: Math.round(distancia),
  };
}
