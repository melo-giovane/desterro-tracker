import type { Coord } from "@/types";

const R = 6371; // raio da Terra em km

export function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** Distância em km entre duas coordenadas (Haversine). */
export function haversine(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rumo (bearing) em graus de a para b. */
export function bearing(a: Coord, b: Coord): number {
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Interpolação linear entre dois pontos. */
export function lerpCoord(a: Coord, b: Coord, t: number): Coord {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

/** Comprimento total de uma polilinha em km. */
export function pathLength(path: Coord[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += haversine(path[i - 1], path[i]);
  }
  return total;
}

/**
 * Posição ao longo de uma polilinha dado um progresso 0..1.
 * Retorna a coordenada e o rumo naquele ponto.
 */
export function pointOnPath(
  path: Coord[],
  t: number
): { pos: Coord; rumo: number } {
  if (path.length === 1) return { pos: path[0], rumo: 0 };
  const clamped = Math.max(0, Math.min(1, t));
  const total = pathLength(path);
  const target = total * clamped;
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const seg = haversine(path[i - 1], path[i]);
    if (acc + seg >= target || i === path.length - 1) {
      const localT = seg === 0 ? 0 : (target - acc) / seg;
      return {
        pos: lerpCoord(path[i - 1], path[i], Math.min(1, localT)),
        rumo: bearing(path[i - 1], path[i]),
      };
    }
    acc += seg;
  }
  return { pos: path[path.length - 1], rumo: 0 };
}

/**
 * Gera uma rota "curvada" entre origem e destino com pontos intermediários,
 * simulando o traçado de uma rodovia (não em linha reta perfeita).
 */
export function gerarRota(origem: Coord, destino: Coord, seed = 1): Coord[] {
  const pontos: Coord[] = [origem];
  const segmentos = 6;
  const rand = mulberry32(Math.floor(seed * 100000) + 7);
  for (let i = 1; i < segmentos; i++) {
    const t = i / segmentos;
    const base = lerpCoord(origem, destino, t);
    // desvio perpendicular para simular curva de estrada
    const desvio = (rand() - 0.5) * 1.6 * Math.sin(Math.PI * t);
    const dx = destino.lng - origem.lng;
    const dy = destino.lat - origem.lat;
    const len = Math.hypot(dx, dy) || 1;
    pontos.push({
      lat: base.lat + (dx / len) * desvio * 0.4,
      lng: base.lng - (dy / len) * desvio * 0.4,
    });
  }
  pontos.push(destino);
  return pontos;
}

/** PRNG determinístico para dados de demonstração reproduzíveis. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
