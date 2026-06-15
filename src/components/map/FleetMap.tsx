import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import { truckIcon, pinIcon, dotIcon } from "./icons";
import type { Carga, Veiculo } from "@/types";
import { CENTRO_BRASIL } from "@/data/cidades";
import { fmtHora } from "@/lib/format";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function FitBounds({ bounds }: { bounds?: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
      } catch {
        /* ignore */
      }
    }
  }, [bounds, map]);
  return null;
}

interface FleetMapProps {
  veiculos: Veiculo[];
  cargas: Carga[];
  veiculoAtivoId?: string | null;
  onSelecionar?: (veiculoId: string) => void;
  mostrarRotas?: boolean;
  bounds?: LatLngBoundsExpression;
  className?: string;
  zoom?: number;
}

export function FleetMap({
  veiculos,
  cargas,
  veiculoAtivoId,
  onSelecionar,
  mostrarRotas = false,
  bounds,
  className,
  zoom = 4,
}: FleetMapProps) {
  const cargaPorVeiculo = new Map(
    cargas.filter((c) => c.veiculoId).map((c) => [c.veiculoId!, c])
  );

  return (
    <div className={className}>
      <MapContainer
        center={[CENTRO_BRASIL.lat, CENTRO_BRASIL.lng]}
        zoom={zoom}
        minZoom={3}
        maxZoom={13}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} subdomains="abcd" />
        {bounds && <FitBounds bounds={bounds} />}

        {mostrarRotas &&
          cargas.map((c) => (
            <Polyline
              key={`rota-${c.id}`}
              positions={c.rota.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: c.id === undefined ? "#F97316" : "#F97316",
                weight: 2.5,
                opacity: c.veiculoId === veiculoAtivoId ? 0.9 : 0.55,
                dashArray: "1 8",
                lineCap: "round",
              }}
            />
          ))}

        {cargas.map((c) => (
          <Marker
            key={`origem-${c.id}`}
            position={[c.origem.lat, c.origem.lng]}
            icon={dotIcon("#38BDF8")}
          >
            <Popup>
              <b>Origem · {c.codigo}</b>
              <br />
              {c.origem.nome}/{c.origem.uf}
            </Popup>
          </Marker>
        ))}
        {cargas.map((c) => (
          <Marker
            key={`destino-${c.id}`}
            position={[c.destino.lat, c.destino.lng]}
            icon={pinIcon("#34D399", "•")}
          >
            <Popup>
              <b>Destino · {c.codigo}</b>
              <br />
              {c.destino.nome}/{c.destino.uf}
            </Popup>
          </Marker>
        ))}

        {veiculos.map((v) => {
          const carga = cargaPorVeiculo.get(v.id);
          return (
            <Marker
              key={v.id}
              position={[v.pos.lat, v.pos.lng]}
              icon={truckIcon(v.rumo, v.status, v.id === veiculoAtivoId)}
              eventHandlers={{ click: () => onSelecionar?.(v.id) }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <b style={{ color: "#F97316" }}>{v.placa}</b> · {v.modelo}
                  <br />
                  <span style={{ color: "#8A9BB4" }}>Status:</span> {v.status}
                  <br />
                  <span style={{ color: "#8A9BB4" }}>Velocidade:</span> {v.velocidade} km/h
                  <br />
                  {carga && (
                    <>
                      <span style={{ color: "#8A9BB4" }}>Carga:</span> {carga.codigo} →{" "}
                      {carga.destino.nome}
                      <br />
                    </>
                  )}
                  <span style={{ color: "#8A9BB4" }}>Atualizado:</span>{" "}
                  {fmtHora(v.ultimaAtualizacao)}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
