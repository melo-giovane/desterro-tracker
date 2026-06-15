import L from "leaflet";

const cores: Record<string, string> = {
  movimento: "#34D399",
  parado: "#FBBF24",
  ocioso: "#5B6B85",
  manutencao: "#F87171",
  brand: "#F97316",
};

export function truckIcon(rumo: number, status: string, ativo = false) {
  const cor =
    status === "Em movimento"
      ? cores.movimento
      : status === "Parado"
      ? cores.parado
      : status === "Manutenção"
      ? cores.manutencao
      : cores.ocioso;
  const ring = ativo
    ? `<span style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid ${cores.brand};animation:pulse-ring 1.8s ease-out infinite;"></span>`
    : "";
  return L.divIcon({
    className: "truck-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <div style="position:relative;width:28px;height:28px;">
        ${ring}
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          background:#0B1220;border:2px solid ${cor};border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,.5);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            style="transform:rotate(${rumo}deg);transition:transform .6s ease;">
            <path d="M12 3l5 8h-3v7h-4v-7H7l5-8z" fill="${cor}"/>
          </svg>
        </div>
      </div>`,
  });
}

export function pinIcon(cor: string, letra: string) {
  return L.divIcon({
    className: "truck-marker",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;
      background:${cor};border:2px solid #0B1220;border-radius:9999px;color:#0B1220;font:700 11px Inter;
      box-shadow:0 2px 8px rgba(0,0,0,.5);">${letra}</div>`,
  });
}

export function dotIcon(cor: string) {
  return L.divIcon({
    className: "truck-marker",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="width:14px;height:14px;background:${cor};border:2px solid #0B1220;border-radius:9999px;box-shadow:0 0 0 3px ${cor}33;"></div>`,
  });
}
